import { Size } from "../basic/rect";
import { Color } from "../painting/color";

export enum Axis {
  horizontal = "horizontal",
  vertical = "vertical",
}

export enum Clip {
  none = "none",
  /**
   * # 使用硬边裁剪
   */
  hardEdge = "hardEdge",
  /**
   * # 使用抗锯齿裁剪
   */
  antiAlias = "antiAlias",
}
export enum MainAxisAlignment {
  start = "start",
  end = "end",
  center = "center",
  spaceBetween = "spaceBetween",
  spaceAround = "spaceAround",
  spaceEvenly = "spaceEvenly",
}

export enum CrossAxisAlignment {
  start = "start",
  end = "end",
  center = "center",
  stretch = "stretch",
  baseline = "baseline",
}

export enum StackFit {
  /**
   * 这表示 Stack 组件会放宽传递给它的约束。换句话说，非定位子组件可以根据自己的需要在 Stack 区域内自由调整大小。举个例子，如果 Stack 的约束要求它的大小是 350x600，那么非定位子组件可以在宽度和高度上都在 0 到 350 和 0 到 600 的范围内调整
   */
  loose = "loose",
  /**
   * 这表示 Stack 组件会将传递给它的约束放大到允许的最大尺寸。举个例子，如果 Stack 的约束是宽度在 10 到 100 的范围内，高度在 0 到 600 的范围内，那么非定位子组件都会被调整为 100 像素宽和 600 像素高。
   */
  expand = "expand",
  /**
   * 这表示 Stack 组件会将从父组件传递给它的约束不加修改地传递给非定位子组件。举个例子，如果一个 Stack 作为 Row 的 Expanded 子组件，那么水平约束会是紧密的，而垂直约束会是松散的。
   */
  passthrough = "passthrough",
}

export enum TextDirection {
  /// The text flows from right to left (e.g. Arabic, Hebrew).
  rtl = "rtl",
  /// The text flows from left to right (e.g., English, French).
  ltr = "ltr",
}
export enum WrapAlignment {
  start = "start",
  end = "end",
  center = "center",
  spaceBetween = "spaceBetween",
  spaceAround = "spaceAround",
  spaceEvenly = "spaceEvenly",
}
export enum WrapCrossAlignment {
  start = "start",
  end = "end",
  center = "center",
}

export enum AxisDirection {
  up = "up",
  down = "down",
  left = "left",
  right = "right",
}

export enum GrowthDirection {
  forward = "forward",
  reverse = "reverse",
}

export enum ScrollDirection {
  idle = "idle",
  forward = "forward",
  reverse = "reverse",
}

export enum FontWeight {
  normal = "normal",
  bold = "bold",
}

export enum FontStyle {
  normal = "normal",
  italic = "italic",
}

export enum TextDecoration {
  none = "none",
  underline = "underline",
  overline = "overline",
  lineThrough = "line-through",
}
export enum TextDecorationStyle {
  solid = "solid",
  dashed = "dashed",
}
export enum TextOverflow {
  /**
   * # 裁剪溢出的文本。
   */
  clip = "clip",
  /**
   * # 显示省略号来表示溢出的文本
   *  - 例如，"abc..."。
   */
  ellipsis = "ellipsis",
  /**
   * # 不做任何操作
   */
  visible = "visible",
}

export enum TextAlign {
  left = "left",
  right = "right",
  center = "center",
  justify = "justify",
  start = "start",
  end = "end",
  unset = "unset",
  none = "none",
}
/**
 * # 阴影配置
 */
export interface Shadow {
  /**
   * # 阴影颜色
   */
  shadowColor?: Color;
  /**
   * # 阴影模糊大小
   */
  shadowBlur?: number;
  /**
   * # 阴影偏移量 X
   */
  shadowOffsetX?: number;
  /**
   * # 阴影偏移量 Y
   */
  shadowOffsetY?: number;
}

export enum TextBaseline {
  /**
   * # 字母基线
   *  - 默认值，拉丁字母等文字的基线对齐给定 y 坐标
   */
  alphabetic = "alphabetic",
  /**
   * # 表意基线
   *  - 适用于中文、日文等表意文字，与 alphabetic 类似，但略有差别
   */
  ideographic = "ideographic",
  /**
   * # 顶部对齐
   *  - 文字的顶部会对齐到给定的 y 坐标处
   */
  top = "top",
  /**
   * # 中线对齐
   *  - 文字的中线（视觉居中线，不是 baseline）对齐到给定 y 坐标
   */
  middle = "middle",
  /**
   * # 底部对齐
   *  - 整个文字的最底部会对齐到 y 坐标
   */
  bottom = "bottom",
}

/**
 * # 主轴尺寸
 */
export enum MainAxisSize {
  /**
   * # 最大尺寸
   */
  max = "max",
  /**
   * # 最小尺寸
   */
  min = "min",
}

/**
 * # 边框样式
 */
export enum BorderStyle {
  /**
   * # 无边框样式
   */
  none="none",
  /**
   * # 实线边框样式
   */
  solid="solid",
  /**
   * # 虚线边框样式
   */
  dashed="dashed",
}

export type Radius = number | Iterable<number>;

export interface ImageStreamPayload<T = Uint8Array> {
  value: T;
  total: number;
  error: any;
  progress: number;
  done: boolean;
}
export type ImageLoadPayload = {
  size: Size;
  image: any;
};

export interface ImageProviderLoadConfiguration {
  url: string;
  headers?: Record<string, string>;
  lifecycle?: Partial<ImageProviderLifecycle>;
}

export interface ImageProviderLifecycle {
  onLoadStart: () => void;
  onProgress: (progress: number) => void;
  onLoadEnd: (imagePayLoad: ImageLoadPayload) => void;
  onError: (error: any) => void;
}
