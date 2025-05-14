import { BuildContext, Element } from "../basic/elements";
import {
  SingleChildRenderObjectWidget,
  SingleChildRenderObjectWidgetArguments,
} from "../basic/framework";
import Rect from "../basic/rect";
import Vector, { Offset } from "../math/vector";
import Painter from "../painting/painter";
import { PaintingContext, SingleChildRenderView } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";

class RepaintingContext extends PaintingContext {}

export class RepaintBoundaryRenderView extends SingleChildRenderView {
  get isRepaintBoundary(): boolean {
    return true;
  }

  private _context: RepaintingContext;
  private _layer: OffscreenCanvas;
  private _needsRepaint = true;

  markNeedsRepaint(): void {
    this._needsRepaint = true;
  }

  performLayout(): void {
    super.performLayout();
    if (!this._layer || this._layer.width !== this.size.width || this._layer.height !== this.size.height) {
      this._layer = new OffscreenCanvas(this.size.width, this.size.height);
      const ctx = this._layer.getContext("2d")!;
      this._context = new RepaintingContext(
        new Painter(ctx),
        Rect.merge(Offset.zero, this.size)
      );
      this._needsRepaint = true;
    }
  }

  render(context: PaintingContext, offset: Vector): void {
    if (this._needsRepaint) {
      this._context.paint.clearRect(0, 0, this._layer.width, this._layer.height);
      this._context.paintChild(this.child!);
      this._needsRepaint = false;
    }

    context.paint.drawImage(
      this._layer,
      0, 0,
      this._layer.width,
      this._layer.height,
      offset.x,
      offset.y,
      this._layer.width,
      this._layer.height
    );

    // Debug stroke, optional
    if (context) {
      context.paint.strokeStyle = 'red';
      context.paint.strokeRect(offset.x, offset.y, this.size.width, this.size.height);
    }
  }

}


export class RepaintBoundary extends SingleChildRenderObjectWidget {
  constructor(option: Partial<SingleChildRenderObjectWidgetArguments>) {
    super(option?.child, option?.key);
  }
  createRenderObject(context?: BuildContext): RenderView {
    return new RepaintBoundaryRenderView();
  }
}
