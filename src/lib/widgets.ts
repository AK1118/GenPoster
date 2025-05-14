import {
  ContainerArguments,
  Container as ContainerWidget,
  MultiChildRenderObjectWidgetArguments,
  RowArguments,
  Row as RowWidget,
  Column as ColumnWidget,
  Widget,
  ColumnArguments,
  Wrap as WrapWidget,
  Image as ImageWidget,
  AssetsImageUrlBuilder,
  ImageArguments,
  StatelessWidget,
  BuildContext,
  Stack as StackWidget,
  StackOption,
  WrapOption,
  Positioned as PositionedWidget,
  SingleChildRenderObjectWidgetArguments,
  Transform as TransformWidget,
  PositionedArguments,
  RenderTransformArguments,
  SingleChildRenderObjectWidget,
  TransformTranslateArguments,
  TransformScaleArguments,
  TransformRotateArguments,
  TransformSkewArguments,
  Text as TextWidget,
  TextArguments,
  SizedBox as SizedBoxWidget,
  SizedBoxOption,
  ClipRect as ClipRectWidget,
  ClipRectArguments,
  ClipRRect as ClipRRectWidget,
  ClipRRectArguments,
  TextRich as TextRichWidget,
  TextSpan as TextInlineSpan,
  TextRichArguments,
  TextSpanOption,
  LayoutBuilder as LayoutBuilderWidget,
  BoxConstraints,
} from "./gen-ui";

type P<T> = Partial<Omit<T, "key">>;

const _WidgetFactory = <W extends Widget, Args>(
  args: P<Args>,
  widgetClass: new (...args: any[]) => W
): W => {
  return Reflect.construct(widgetClass, [args]);
};

/**
 * # 创建一个可视化盒子组件，并根据参数选择使用对应的组件包裹，包裹顺序由底至高。
 *   - 即返回一颗 @type {Widget} 树，返回Widget层数取决于创建Container时传入的参数。
 *   - 例如：Container 包裹了DecoratedBox,ConstrainedBox,Padding,所以返回层级为4层。
 */
export const Container = (args: P<ContainerArguments>) =>
  _WidgetFactory<ContainerWidget, ContainerArguments>(args, ContainerWidget);

export type RowArgs = RowArguments & MultiChildRenderObjectWidgetArguments;
/**
 * # 横向Flex布局
 * - 将子组件横向排列，并支持对齐方式等配置。
 */
export const Row = (args: P<RowArgs>) =>
  _WidgetFactory<RowWidget, RowArgs>(args, RowWidget);

export type ColumnArgs = ColumnArguments &
  MultiChildRenderObjectWidgetArguments;
/**
 * # 纵向Flex布局
 * - 将子组件纵向排列，并支持对齐方式等配置。
 */
export const Column = (args: P<ColumnArgs>) =>
  _WidgetFactory<ColumnWidget, ColumnArgs>(args, ColumnWidget);

export type WrapArgs = WrapOption & MultiChildRenderObjectWidgetArguments;
/**
 * # 流式布局
 * - 将子组件横向排列，超出父盒子约束宽度时换行。
 */
export const Wrap = (args: P<WrapArgs>) =>
  _WidgetFactory<WrapWidget, WrapArgs>(args, WrapWidget);

type GenPosterImageOption = {
  assetsImageUrl: AssetsImageUrlBuilder;
  option?: Partial<ImageArguments>;
};
class GenPosterImageWidget extends StatelessWidget {
  constructor(protected option: GenPosterImageOption) {
    super();
  }
  build(context: BuildContext): Widget {
    return ImageWidget.assets(this.option.assetsImageUrl, this.option.option);
  }
}

/**
 * # 图片组件
 *  - 支持本地和网络图片。
 */
export const GenPosterImage = (
  assetsImageUrl: AssetsImageUrlBuilder,
  option?: Partial<ImageArguments>
) => {
  return _WidgetFactory<
    GenPosterImageWidget,
    {
      assetsImageUrl: AssetsImageUrlBuilder;
      option?: Partial<ImageArguments>;
    }
  >({ assetsImageUrl, option }, GenPosterImageWidget);
};

export type StackArgs = StackOption & MultiChildRenderObjectWidgetArguments;
/**
 * # 堆叠布局
 * - 将子组件堆叠在一起，并支持对齐方式等配置。
 */
export const Stack = (args: P<StackArgs>) =>
  _WidgetFactory<StackWidget, StackArgs>(args, StackWidget);

export type PositionedArgs = PositionedArguments &
  SingleChildRenderObjectWidgetArguments;

/**
 * # 堆叠布局中的定位组件
 * - 用于在堆叠布局中定位子组件。
 */
export const Positioned = (args: P<PositionedArgs>) =>
  _WidgetFactory<PositionedWidget, PositionedArgs>(args, PositionedWidget);

export type TransformArgs = RenderTransformArguments &
  SingleChildRenderObjectWidget;

/**
 * # 变换组件
 * - 用于对子组件进行变换。
 * - 传入一个三维变换矩阵和一个对齐方式，即可对子组件进行变换。
 */
export const Transform = (args: P<TransformArgs>) =>
  _WidgetFactory<TransformWidget, TransformArgs>(args, TransformWidget);

export type TranslateArgs = TransformTranslateArguments &
  SingleChildRenderObjectWidgetArguments;
/**
 * # 变换组件中的平移
 * - 用于对子组件进行平移。
 */
export const Translate = (args: P<TranslateArgs>) =>
  _WidgetFactory(args, TransformWidget);

export type ScaleArgs = TransformScaleArguments &
  SingleChildRenderObjectWidgetArguments;
/**
 * # 变换组件中的缩放
 * - 用于对子组件进行缩放。
 */
export const Scale = (args: P<ScaleArgs>) =>
  _WidgetFactory(args, TransformWidget);

export type RotateArgs = TransformRotateArguments &
  SingleChildRenderObjectWidgetArguments;
/**
 * # 变换组件中的旋转
 * - 用于对子组件进行旋转。
 */
export const Rotate = (args: P<RotateArgs>) =>
  _WidgetFactory(args, TransformWidget);

export type SkewArgs = TransformSkewArguments &
  SingleChildRenderObjectWidgetArguments;
/**
 * # 变换组件中的倾斜
 * - 用于对子组件进行倾斜。
 */
export const Skew = (args: P<SkewArgs>) =>
  _WidgetFactory(args, TransformWidget);

export type TextArgs = TextArguments & SingleChildRenderObjectWidgetArguments;

type __ = { text: string; option?: P<TextArguments> };
class GenPosterText extends StatelessWidget {
  constructor(private _option: __) {
    super();
  }
  build(context: BuildContext): Widget {
    return new TextWidget(this._option.text, this._option.option);
  }
}
/**
 * # 文本组件
 * - 支持文本样式等配置。
 */
export const Text = (text: string, option: P<TextArguments>) => {
  return _WidgetFactory({ text, option }, GenPosterText);
};

export type SizedBoxArgs = SizedBoxOption &
  SingleChildRenderObjectWidgetArguments;
/**
 * # 盒子组件
 *  - 用于约束子组件的大小，它只会被布局，不会被渲染，需要搭配其他可渲染组件使用。
 */
export const SizedBox = (args: P<SizedBoxArgs>) =>
  _WidgetFactory(args, SizedBoxWidget);

export type ClipRectArgs = ClipRectArguments &
  SingleChildRenderObjectWidgetArguments;
/**
 * # 裁剪矩形组件
 */
export const ClipRect = (args: P<ClipRectArgs>) =>
  _WidgetFactory(args, ClipRectWidget);

export type ClipRRectArgs = ClipRRectArguments &
  SingleChildRenderObjectWidgetArguments;
/**
 * # 裁剪圆角矩形组件
 */
export const ClipRRect = (args: P<ClipRRectArgs>) =>
  _WidgetFactory(args, ClipRRectWidget);

export type TextRichArgs = TextRichArguments &
  SingleChildRenderObjectWidgetArguments;
/**
 * # 富文本组件
 */
export const TextRich = (args: P<TextRichArgs>) =>
  _WidgetFactory(args, TextRichWidget);

export type TextSpanArgs = TextSpanOption;
/**
 * # 文本片段组件
 */
export const TextSpan = (args: Partial<TextSpanArgs>) =>
  new TextInlineSpan(args);

export type LayoutWidgetBuilder = (
  context: BuildContext,
  constrain: BoxConstraints
) => Widget;

/**
 * # 布局构建器
 */
export const LayoutBuilder = (args: P<{ builder: LayoutWidgetBuilder }>) =>
  _WidgetFactory(args, LayoutBuilderWidget);
