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
  Padding as PaddingWidget,
  PaddingOption,
  Expanded as ExpandedWidget,
  Align as AlignWidget,
  AlignArguments,
  Center as CenterWidget,
  Alignment,
} from "../gen-ui";

type P<T> = Partial<Omit<T, "key">>;

const _WidgetFactory = <W extends Widget, Args>(
  args: P<Args>,
  widgetClass: new (...args: any[]) => W
): W => {
  return Reflect.construct(widgetClass, [args]);
};

const _WidgetFunctionFactory = <W, Args>(
  args: P<Args>,
  builder: (...args: any[]) => W
): W => {
  return builder(args);
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
  _WidgetFunctionFactory<TransformWidget, TranslateArgs>(
    args,
    (args: P<TranslateArgs>) => TransformWidget.translate(args)
  );

export type ScaleArgs = TransformScaleArguments &
  SingleChildRenderObjectWidgetArguments;

/**
 * # 变换组件中的缩放
 * - 用于对子组件进行缩放。
 */
export const Scale = (args: P<ScaleArgs>) =>
  _WidgetFunctionFactory<TransformWidget, ScaleArgs>(
    args,
    (args: P<ScaleArgs>) => TransformWidget.scale(args)
  );
export type RotateArgs = TransformRotateArguments &
  SingleChildRenderObjectWidgetArguments;

/**
 * # 变换组件中的旋转
 * - 用于对子组件进行旋转。
 */
export const Rotate = (args: P<RotateArgs>) =>
  _WidgetFunctionFactory<TransformWidget, RotateArgs>(
    args,
    (args: P<RotateArgs>) => TransformWidget.rotate(args)
  );

export type SkewArgs = TransformSkewArguments &
  SingleChildRenderObjectWidgetArguments;

/**
 * # 变换组件中的倾斜
 * - 用于对子组件进行倾斜。
 */
export const Skew = (args: P<SkewArgs>) =>
  _WidgetFunctionFactory<TransformWidget, SkewArgs>(args, (args: P<SkewArgs>) =>
    TransformWidget.skew(args)
  );
export type TextArgs = TextArguments;
/**
 * # 文本组件
 * - 支持文本样式等配置。
 */
export const Text = (text: string, option: P<TextArgs>) => {
  const args = {
    text: text,
    option: option,
  };
  return _WidgetFunctionFactory<TextWidget, TextArgs & { text: string }>(
    args,
    ({ text, option }) => new TextWidget(text, option)
  );
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
export const TextSpan = (args: Partial<TextSpanArgs>) => _WidgetFunctionFactory(args,(args)=>new TextInlineSpan(args))

export type LayoutWidgetBuilder = (
  context: BuildContext,
  constrain: BoxConstraints
) => Widget;

/**
 * # 布局构建器
 */
export const LayoutBuilder = (args: P<{ builder: LayoutWidgetBuilder }>) =>
  _WidgetFactory(args, LayoutBuilderWidget);

export type PaddingArgs = PaddingOption &
  SingleChildRenderObjectWidgetArguments;
/**
 * # 内边距组件
 */
export const Padding = (
  args: P<PaddingArgs & SingleChildRenderObjectWidgetArguments>
) => _WidgetFactory(args, PaddingWidget);

export type ExpandedArgs = {
  flex: number;
} & SingleChildRenderObjectWidgetArguments;
/**
 * # 弹性布局组件
 */
export const Expanded = (args: P<ExpandedArgs>) =>
  _WidgetFactory(args, ExpandedWidget);

export type AlignArgs = AlignArguments & SingleChildRenderObjectWidgetArguments;
/**
 * # 对齐组件
 */
export const Align = (args: P<AlignArgs>) =>
  _WidgetFactory(args, AlignWidget);

export type CenterArgs = SingleChildRenderObjectWidgetArguments;
/**
 * # 居中组件
 */
export const Center = (args: P<CenterArgs>) => _WidgetFactory(args, CenterWidget);
