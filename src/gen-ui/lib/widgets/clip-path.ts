import { BuildContext } from "../basic/elements";
import {
  SingleChildRenderObjectWidget,
  SingleChildRenderObjectWidgetArguments,
} from "../basic/framework";
import { Clip } from "../core/base-types";
import Vector from "../math/vector";
import { PaintingContext, SingleChildRenderView } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";
import { CustomClipper } from "../rendering/custom";
import { Path2D } from "../rendering/path-2D";
export interface CustomClipperArguments {
  clipper: CustomClipper;
  clipBehavior: Clip;
}
export class ClipPath extends SingleChildRenderObjectWidget {
  private clipper: CustomClipper;
  private clipBehavior: Clip;
  constructor(
    args: Partial<
      CustomClipperArguments & SingleChildRenderObjectWidgetArguments
    >
  ) {
    super(args?.child, args?.key);
    this.clipper = args?.clipper;
    this.clipBehavior = args?.clipBehavior;
  }
  createRenderObject(): RenderView {
    return new ClipPathRenderView({
      clipper: this.clipper,
      clipBehavior: this.clipBehavior,
    });
  }
  updateRenderObject(
    context: BuildContext,
    renderView: ClipPathRenderView
  ): void {
    renderView.clipper = this.clipper;
    renderView.clipBehavior = this.clipBehavior;
  }
}

export abstract class CustomClipperRenderView extends SingleChildRenderView {
  protected clip: Path2D;
  private _clipper?: CustomClipper;
  private _clipBehavior: Clip = Clip.antiAlias;
  private markNeedsRePaintBind: VoidFunction;
  constructor(args: Partial<CustomClipperArguments>) {
    super();
    this.clipper = args?.clipper;
    this._clipBehavior = args?.clipBehavior;
    this.markNeedsRePaintBind = this.markNeedsPaint.bind(this);
  }
  set clipper(value: CustomClipper) {
    this._clipper?.removeListener(this.markNeedsRePaintBind);
    this._clipper = value;
    this._clipper?.addListener(this.markNeedsRePaintBind);
    this.markNeedsPaint();
  }
  get clipBehavior() {
    return this._clipBehavior;
  }
  get defaultPath() {
    return null;
  }
  protected updateClip(offset: Vector) {
    if (!this._clipper) {
      this.clip = this.defaultPath;
    }
    this.clip = this._clipper?.getClip(offset, this.size);
  }
  set clipBehavior(value: Clip) {
    this._clipBehavior = value;
    this.markNeedsPaint();
  }
}

export class ClipPathRenderView extends CustomClipperRenderView {
  get defaultPath(): Path2D {
    const path = new Path2D();
    path.rect(0, 0, this.size.width, this.size.height);
    return path;
  }
  render(context: PaintingContext, offset?: Vector): void {
    if (this.child) {
      this.updateClip(offset);
      const paint = context.paint;
      context.clipPath(
        this.clipBehavior,
        {
          x: offset?.x ?? 0,
          y: offset?.y ?? 0,
          width: this.size.width,
          height: this.size.height,
        },
        this.clip ?? this.defaultPath,
        () => {
          super.render(context, offset);
        }
      );
    }
  }
}
