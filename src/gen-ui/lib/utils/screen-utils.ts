/**
 * - 设计稿大小，默认 750*750
 */
export interface DesignSizeOption {
  /**
   * # 设计稿宽度
   */
  designWidth: number;
  /**
   * # 设计稿高度
   */
  designHeight: number;
}
/**
 * - 屏幕(画布大小)
 */
export interface CanvasSizeOption {
  /**
   * # 画布宽度
   */
  canvasWidth: number;
  /**
   * # 画布高度
   */
  canvasHeight: number;
}

export interface ScreenUtilOption
  extends Partial<DesignSizeOption>,
    Partial<CanvasSizeOption> {
  /**
   * # 设备像素比

   */
  devicePixelRatio?: number;
  /**
   * # 设备与画布比值
   */
  deviceCanvasRatio?: {
    widthRatio: number;
    heightRatio: number;
  };
  /**
   * # 是否使用宽高中的最小值计算文字大小，默认 true
   */
  minTextAdapt?: boolean;
}

/**
 * # 提供基本的屏幕适配工具类
 *  - 该类提供简单的屏幕适配能力
 *  -
 */
export class ScreenUtils {
  private readonly scaleWidth: number;
  private readonly scaleHeight: number;
  private readonly scaleText: number;
  private readonly designWidth: number;
  private readonly designHeight: number;
  private readonly _deviceCanvasRatio: {
    widthRatio: number;
    heightRatio: number;
  };
  private _devScale: number = 1;
  private _devicePixelRatio: number = 1;
  constructor(option?: ScreenUtilOption) {
    if (!option) return;
    const {
      designWidth = 750,
      designHeight = 1334,
      devicePixelRatio = 1,
      canvasWidth,
      canvasHeight,
      minTextAdapt = false,
    } = option;
    this.scaleWidth = canvasWidth / designWidth;
    this.scaleHeight = canvasHeight / designHeight;
    this.designWidth = designWidth;
    this.designHeight = designHeight;
    this.scaleText = minTextAdapt
      ? Math.min(this.scaleWidth, this.scaleHeight)
      : this.scaleWidth;
    this._deviceCanvasRatio = option.deviceCanvasRatio || {
      widthRatio: 1,
      heightRatio: 1,
    };
    this.computeDevicePixelRatio(devicePixelRatio);
  }
  /**
   * 计算缩放因子的倒数控制画布缩放
   */
  private computeDevicePixelRatio(devicePixelRatio: number): void {
    this._devicePixelRatio = devicePixelRatio;
    this._devScale = 1 / this._devicePixelRatio;
  }
  public get deviceCanvasRatio(): {
    widthRatio: number;
    heightRatio: number;
  } {
    return this._deviceCanvasRatio;
  }
  public get devScale(): number {
    return this._devScale;
  }
  public get devicePixelRatio(): number {
    return this._devicePixelRatio;
  }

  public setSp(fontSize: number): number {
    return this.scaleText * fontSize;
  }
  public setWidth(width: number): number {
    return this.scaleWidth * width;
  }
  public setHeight(height: number): number {
    return this.scaleHeight * height;
  }
  public get fullWidth(): number {
    return this.setWidth(this.designWidth);
  }
  public get fullHeight(): number {
    return this.setHeight(this.designHeight);
  }
  public restoreFromFactorWidthWidth(width: number): number {
    return width / this.scaleWidth;
  }
  public restoreFromFactorWidthHeight(height: number): number {
    return height / this.scaleHeight;
  }
  public restoreFromFactorWidthText(fontSize: number): number {
    return fontSize / this.scaleText;
  }

  public setDevicePixelRatio(devicePixelRatio: number): void {
    this._devicePixelRatio = devicePixelRatio;
    // this.computeDevicePixelRatio(devicePixelRatio);
  }
}
export default ScreenUtils;
