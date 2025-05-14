import { BuildContext, Element } from "../basic/elements";
import {
  SingleChildRenderObjectElement,
  SingleChildRenderObjectWidget,
  Widget,
} from "../basic/framework";
import { Key } from "../basic/key";
import { Size } from "../basic/rect";
import Vector from "../math/vector";
import Alignment from "../painting/alignment";
import { BoxFit } from "../painting/box-fit";
import {
  ImageDecoration,
  ImageDecorationArguments,
  ImageDecorationPainter,
} from "../painting/image";
import {
  AssetsImageProvider,
  AssetsImageUrlBuilder,
  ImageProvider,
  NetWorkImageProvider,
} from "../painting/image-provider";
import { PaintingContext, SingleChildRenderView } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";
import { BoxConstraints } from "../rendering/constraints";

export type ImagePlaceholderBuilder = (context: BuildContext) => Widget;

export type ImageArguments = Partial<
  Omit<ImageDecorationArguments, "imageProvider"> & {
    key: Key;
    placeholderBuilder: ImagePlaceholderBuilder;
  }
> &
  Required<{
    imageProvider: ImageProvider;
  }>;

export class Image
  extends SingleChildRenderObjectWidget
  implements ImageDecorationArguments
{
  imageProvider: ImageProvider;
  fit: BoxFit;
  alignment: Alignment;
  width: number;
  height: number;
  placeholderBuilder: ImagePlaceholderBuilder;
  constructor(option: ImageArguments) {
    super(null, option?.key);
    this.fit = option?.fit ?? BoxFit.contain;
    this.alignment = option?.alignment ?? Alignment.center;
    this.width = option?.width;
    this.height = option?.height;
    this.imageProvider = option?.imageProvider;
    this.placeholderBuilder = option?.placeholderBuilder;
  }

  createRenderObject(): RenderView {
    return new ImageRenderView(this.imageDecorationArgs);
  }
  get imageDecorationArgs(): Partial<ImageDecorationArguments> {
    return {
      imageProvider: this.imageProvider,
      fit: this.fit,
      alignment: this.alignment,
      width: this.width,
      height: this.height,
    };
  }
  updateRenderObject(context: BuildContext, renderView: ImageRenderView): void {
    renderView.width = this.width;
    renderView.height = this.height;
  }

  createElement(): Element {
    return new ImageElement(this);
  }

  static netWork(
    netWorkImageUrl: string,
    option?: Partial<ImageArguments>
  ): Image {
    return new Image({
      ...option,
      imageProvider: new NetWorkImageProvider({
        url: netWorkImageUrl,
      }),
    });
  }

  static assets(
    assetsImageUrl: AssetsImageUrlBuilder,
    option?: Partial<ImageArguments>
  ): Image {
    return new Image({
      ...option,
      imageProvider: new AssetsImageProvider({
        assetsImageUrl,
      }),
    });
  }
}
class ImageElement extends SingleChildRenderObjectElement {
  private imageSource: Partial<ImageDecorationArguments>;
  private _placeholderBuilder?: ImagePlaceholderBuilder;
  private _imageLoaded = false;
  private _decorationPainter: ImageDecorationPainter;

  constructor(widget: Image) {
    super(widget);
    this.imageSource = widget.imageDecorationArgs;
    this._placeholderBuilder = widget.placeholderBuilder;
  }

  public mount(parent?: Element, newSlot?: Object): void {
    super.mount(parent, newSlot);
    this._renderPlaceholder();
    this._loadImage();
  }

  private _renderPlaceholder() {
    if (this._placeholderBuilder) {
      const placeholder = this._placeholderBuilder(this);
      this.updateChild(null, placeholder);
    }
  }
  private onLoadImageChanged(painter: ImageDecorationPainter) {
    if (!this.mounted) return;
    this._imageLoaded = true;
    this._decorationPainter = painter;
    (this.renderView as ImageRenderView).decorationPainter = painter;
    // placeholder 不再需要，移除它
    this.updateChild(this.child, null);
    this.renderView.markNeedsLayout();
  }
  private async _loadImage() {
    const decoration = new ImageDecoration(this.imageSource);
    const painter = new ImageDecorationPainter(decoration, () => this.onLoadImageChanged(painter));
  }
}

export class ImageRenderView extends SingleChildRenderView {
  private _decorationPainter: ImageDecorationPainter;
  private _width: number;
  private _height: number;
  constructor(args: Partial<ImageDecorationArguments>) {
    super();
    this.width = args?.width;
    this.height = args?.height;
  }

  set width(value: number) {
    if (value === this._width) return;
    this._width = value;
    this.markNeedsLayout();
  }

  set height(value: number) {
    if (value === this._height) return;
    this._height = value;
    this.markNeedsLayout();
  }

  set decorationPainter(value: ImageDecorationPainter) {
    this._decorationPainter = value;
    this.markNeedsLayout();
  }

  get decorationPainter(): ImageDecorationPainter {
    return this._decorationPainter;
  }

  performLayout(): void {
    super.performLayout();

    if (this.decorationPainter) {
      const imageSize = new Size(
        this._width ?? this.decorationPainter.width ?? 0,
        this._height ?? this.decorationPainter.height ?? 0
      );
      this.size = this.constraints
        .tighten(this._width, this._height)
        .constrainSizeAndAttemptToPreserveAspectRatio(imageSize);
      this.decorationPainter.layout(this.size);
    } else if (this.child) {
      this.child.layout(this.constraints, true);
      this.size = this.child.size;
    } else {
      this.size = this.constraints.constrain(Size.zero);
    }
  }

  render(context: PaintingContext, offset?: Vector): void {
    this.decorationPainter?.paint(context.paint, offset, this.size);
    if (!this.decorationPainter) super.render(context, offset);
  }
  debugRender(context: PaintingContext, offset?: Vector): void {
    this.decorationPainter?.debugPaint(context.paint, offset, this.size);
    super.debugRender(context, offset);
  }
}
