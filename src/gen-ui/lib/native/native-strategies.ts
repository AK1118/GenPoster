import DefaultBrowserNativeEventsBindingHandler from "./defaults/pointer-event-handler";
import { Offset, Size } from "../basic/rect";
import { AsyncStream } from "../core/stream";
import { NativeEventsBindingHandler } from "./events";
import {
  ImageProviderLoadConfiguration,
  ImageStreamPayload,
} from "../core/base-types";
import { GenPainter, Painter } from "../painting/painter";
import { GenPlatformConfig } from "../core/platform";

export abstract class Strategy {}
/**
 * # 获取网络图片策略
 *   - 各个平台获取网络图片的策略都不一样，将所有的平台相似处抽取出来，封装成策略类。
 *   - 不论使用什么方法，只返回一个Uint8Array即可渲染图片。
 */
export abstract class NativeNetWorkImageStrategy extends Strategy {
  abstract loadBuffer(
    configuration?: Partial<ImageProviderLoadConfiguration>
  ): AsyncStream<ImageStreamPayload>;
  abstract getImageSize(
    arrayBuffer: Uint8Array,
    configuration?: Partial<ImageProviderLoadConfiguration>
  ): Promise<Size>;
  abstract load(
    configuration: Partial<ImageProviderLoadConfiguration>,
    arrayBuffer: Uint8Array
  ): Promise<any>;
}

/**
 * # 渐变策略
 */
export abstract class NativeGradientStrategy extends Strategy {
  protected get painterInstance() {
    return GenPlatformConfig.instance.painter;
  }
  abstract createLinearGradient(begin: Offset, end: Offset): CanvasGradient;
  abstract createRadialGradient(center: Offset, radius: number): CanvasGradient;
  abstract createConicGradient(
    center: Offset,
    startAngle: number
  ): CanvasGradient;
}

export class DefaultNativeGradientStrategy extends NativeGradientStrategy {
  createLinearGradient(begin: Offset, end: Offset): CanvasGradient {
    const linearGradient = this.painterInstance.createLinearGradient(
      begin.x,
      begin.y,
      end.x,
      end.y
    );
    return linearGradient;
  }
  createRadialGradient(center: Offset, radius: number): CanvasGradient {
    const radialGradient = this.painterInstance.createRadialGradient(
      center.x,
      center.y,
      0,
      center.x,
      center.y,
      radius
    );
    return radialGradient;
  }
  createConicGradient(center: Offset, startAngle: number): CanvasGradient {
    const sweepGradient = this.painterInstance.createConicGradient(
      startAngle,
      center.x,
      center.y
    );
    return sweepGradient;
  }
}

/**
 * # 获取本地图片策略
 */
export abstract class NativeAssetsImageStrategy extends Strategy {
  abstract load(
    configuration: Partial<ImageProviderLoadConfiguration>
  ): Promise<any>;
  abstract getImageSize(
    image: any,
    configuration?: ImageProviderLoadConfiguration
  ): Promise<Size>;
}
/**
 * # 事件绑定策略
 */
export abstract class NativeEventsBindingStrategy extends Strategy {
  abstract createHandler(): NativeEventsBindingHandler;
}

/**
 * # 绘制画布策略
 */
export abstract class NativePainterStrategy extends Strategy {
  abstract getPainter(
    canvasContext2D:
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | OffscreenRenderingContext
  ): Painter;
}

class DefaultNativeNetWorkImageStrategy extends NativeNetWorkImageStrategy {
  async load(
    configuration: ImageProviderLoadConfiguration,
    arrayBuffer: Uint8Array
  ): Promise<any> {
    return await await createImageBitmap(new Blob([arrayBuffer]));
  }
  loadBuffer(
    configuration: ImageProviderLoadConfiguration
  ): AsyncStream<ImageStreamPayload> {
    async function* readStream(
      reader: ReadableStreamDefaultReader,
      total: number
    ): AsyncGenerator<ImageStreamPayload> {
      let current: number = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const progress = (current += value.length) / total;
        const payload: ImageStreamPayload = {
          value,
          total,
          error: null,
          progress,
          done: done,
        };
        yield payload;
      }
    }
    return new AsyncStream<ImageStreamPayload>(
      (async function* (): AsyncGenerator<ImageStreamPayload> {
        const controller = new AbortController();
        const signal = controller.signal;
        try {
          const res = await fetch(configuration.url, {
            headers: configuration.headers,
            signal,
          });
          const total = parseInt(res.headers.get("content-length") ?? "-1");
          const reader = res.body.getReader();
          yield* readStream(reader, total);
        } catch (e) {
          controller.abort();
          yield {
            value: null,
            total: 0,
            error: e,
            progress: 0,
            done: true,
          };
        }
      })()
    );
  }
  getImageSize(arrayBuffer: Uint8Array): Promise<Size> {
    const img = new Image();
    return new Promise((resolve) => {
      img.onload = () => resolve(new Size(img.width, img.height));
      const blob = new Blob([arrayBuffer]);
      const url = URL.createObjectURL(blob);
      img.src = url;
    });
  }
}

/**
 * # 默认本地图片策略实现类
 */
export class DefaultNativeAssetsImageStrategy extends NativeAssetsImageStrategy {
  async load(configuration: ImageProviderLoadConfiguration): Promise<any> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = configuration.url;
      image.crossOrigin = "anonymous";
      image.onload = () => {
        resolve(image);
      };
      image.onerror = (err) => {
        reject(null);
      };
    });
  }
  getImageSize(
    image: any,
    configuration?: ImageProviderLoadConfiguration
  ): Promise<Size> {
    return new Promise((resolve) =>
      resolve(new Size(image.width, image.height))
    );
  }
}

/**
 * # 跨平台适配器
 *   - 将各个适配器模块封装到一起，便于管理。
 */
export abstract class NativeStrategies {
  constructor() {
    this.initialization();
  }
  initialization() {
    this.handleBindEventsHandler();
  }
  /**
   * # 获取网络图片策略
   */
  abstract getImageStrategy(): NativeNetWorkImageStrategy;

  /**
   * # 获取本地图片策略
   */
  abstract getAssetsImageStrategy(): NativeAssetsImageStrategy;
  /**
   * # 获取绘制画布策略
   */
  abstract getPainterStrategy(): NativePainterStrategy;

  /**
   * # 获取渐变策略
   */
  abstract getGradientStrategy(): NativeGradientStrategy;

  /**
   * # 绑定事件处理程序
   */
  abstract handleBindEventsHandler(): void;
}
class DefaultNativePainterStrategy extends NativePainterStrategy {
  getPainter(
    canvasContext2D:
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
  ): Painter {
    return new GenPainter(canvasContext2D);
  }
}

export class DefaultNativeStrategies extends NativeStrategies {
  getGradientStrategy(): NativeGradientStrategy {
    return new DefaultNativeGradientStrategy();
  }
  getAssetsImageStrategy(): NativeAssetsImageStrategy {
    return new DefaultNativeAssetsImageStrategy();
  }
  getImageStrategy(): NativeNetWorkImageStrategy {
    return new DefaultNativeNetWorkImageStrategy();
  }
  getPainterStrategy(): NativePainterStrategy {
    return new DefaultNativePainterStrategy();
  }
  handleBindEventsHandler() {
    new DefaultBrowserNativeEventsBindingHandler();
  }
}
