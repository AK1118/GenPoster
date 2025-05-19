import { GenPlatformConfig } from "../core/platform";
import { AsyncStream } from "../core/stream";
import { Size } from "../basic/rect";
import {
  ImageLoadPayload,
  ImageProviderLifecycle,
  ImageProviderLoadConfiguration,
  ImageStreamPayload,
} from "../core/base-types";

abstract class ImageProviderLifecycleMethods implements ImageProviderLifecycle {
  private lifecycle?: ImageProviderLifecycle;
  constructor(lifecycle?: ImageProviderLifecycle) {
    this.lifecycle = lifecycle;
  }
  public onLoadStart() {
    this.lifecycle?.onLoadStart?.();
  }
  public onLoadEnd(imageLoadPayload: ImageLoadPayload) {
    this.lifecycle?.onLoadEnd?.(imageLoadPayload);
  }
  public onError(error: any) {
    this.lifecycle?.onError?.(error);
  }

  public onProgress(progress: number) {
    this.lifecycle?.onProgress?.(progress);
  }
}

export abstract class ImageProvider extends ImageProviderLifecycleMethods {
  private _cachedImagePayload: ImageLoadPayload | null = null;
  private loadingPromise: Promise<ImageLoadPayload>;
  constructor(
    protected readonly configuration?: Partial<ImageProviderLoadConfiguration>
  ) {
    super(configuration?.lifecycle as ImageProviderLifecycle);
  }

  /**
   * # 获取网络图片加载策略
   */
  protected get loadStrategy() {
    return GenPlatformConfig.instance.strategies.getImageStrategy();
  }

  /**
   * # 获取本地图片加载策略
   */
  protected get loadAssetsStrategy() {
    return GenPlatformConfig.instance.strategies.getAssetsImageStrategy();
  }

  createStream() {
    return this.loadStrategy.loadBuffer(this.configuration);
  }
  /**
   * # 执行加载图片操作
   *  - 该方法一般不会由开发者调用，框架会在合适的时候调用该方法进行图片加载操作。
   *  - 当一个 @type {ImageProvider} 实例被多次使用时，它始终返回同一个值。
   */
  async load(): Promise<ImageLoadPayload> {
    // 考虑到会存在一个实例在图片加载完成之前被多次load的情况，使用异步懒加载缓存机制。
    // 这里挂起一个Promise,短时间内的load都会返回首次的Promise对象
    if (this.loadingPromise) return this.loadingPromise;
    this.loadingPromise = new Promise<ImageLoadPayload>(
      async (resolve, reject) => {
        try {
          if (this._cachedImagePayload)
            return resolve(this._cachedImagePayload);
          this.onLoadStart();
          const imageLoadPayload = await this.performLoad();
          this.onLoadEnd(imageLoadPayload);
          this._cachedImagePayload = imageLoadPayload;
          resolve(imageLoadPayload);
        } catch (error) {
          this.onError(error);
          reject(null);
        }
      }
    );
    return this.loadingPromise;
  }

  abstract performLoad(): Promise<ImageLoadPayload>;

  loadBuffer(): AsyncStream<ImageStreamPayload> {
    return this.createStream();
  }
  getImageSize(arrayBuffer: Uint8Array): Promise<Size> {
    return this.loadStrategy.getImageSize(arrayBuffer, this.configuration);
  }
}

export class NetWorkImageProvider extends ImageProvider {
  async performLoad(): Promise<ImageLoadPayload> {
    const bufferLoader = this.loadBuffer();
    let total: number = 0;
    const chunks = [];
    await bufferLoader.forEach((payload) => {
      const value = payload.value;
      if (!value || payload.done) {
        if (payload.error) {
          this.onError(payload.error);
        }
        return;
      }
      total += value.length;
      this.onProgress(payload.progress);
      chunks.push(value);
    });
    const uint8Array = new Uint8Array(total);
    let position = 0;
    for (const chunk of chunks) {
      uint8Array.set(chunk, position);
      position += chunk.length;
    }
    const size = await this.getImageSize(uint8Array);
    const image = await this.loadStrategy.load(this.configuration, uint8Array);
    return {
      size,
      image,
    };
  }
}

export type AssetsImageUrlBuilder = (() => Promise<string> | string) | string;
export type AssetsImageLifecycle =  Omit<Partial<ImageProviderLifecycle>, "onProgress">;
export class AssetsImageProvider extends ImageProvider {
  private _assetsImageUrl: AssetsImageUrlBuilder;
  constructor({
    assetsImageUrl,
    lifecycle,
  }: {
    assetsImageUrl: AssetsImageUrlBuilder;
    lifecycle?: AssetsImageLifecycle;
  }) {
    super({ lifecycle });
    this._assetsImageUrl = assetsImageUrl;
  }
  async performLoad(): Promise<ImageLoadPayload> {
    const urlBuilt =
      typeof this._assetsImageUrl === "function"
        ? this._assetsImageUrl()
        : this._assetsImageUrl;
    const url = urlBuilt instanceof Promise ? await urlBuilt : urlBuilt;
    const image = await this.loadAssetsStrategy.load({
      url: url,
    });
    const size = await this.loadAssetsStrategy.getImageSize(image, {
      url: url,
    });
    return {
      size,
      image,
    };
  }
}
