import { BuildContext } from "../basic/elements";
import { SingleChildRenderObjectWidget, SingleChildRenderObjectWidgetArguments } from "../basic/framework";
import Vector from "../math/vector";
import Painter from "../painting/painter";
import { PaintingContext, SingleChildRenderView } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";
import { CustomPainter } from "../rendering/custom";

export class CustomPaint extends SingleChildRenderObjectWidget {
    private painter: CustomPainter;
    private foregroundPainter: CustomPainter;
    constructor(
      option: Partial<
        SingleChildRenderObjectWidgetArguments & CustomPaintArguments
      >
    ) {
      super(option?.child, option?.key);
      this.painter = option?.painter;
      this.foregroundPainter = option?.foregroundPainter;
    }
    createRenderObject(): RenderView {
      return new CustomPaintRenderView({
        painter: this.painter,
        foregroundPainter: this.foregroundPainter,
      });
    }
    updateRenderObject(context: BuildContext, renderView: RenderView): void {}
  }
  
  
export interface CustomPaintArguments {
    painter: CustomPainter;
    foregroundPainter: CustomPainter;
  }
  
  export class CustomPaintRenderView extends SingleChildRenderView {
    private _painter: CustomPainter;
    private _foregroundPainter: CustomPainter;
    constructor(args: Partial<CustomPaintArguments>) {
      super();
      this._painter = args?.painter;
      this._foregroundPainter = args?.foregroundPainter;
    }
    set painter(value: CustomPainter) {
      this._painter = value;
      this.markNeedsPaint();
    }
    set foregroundPainter(value: CustomPainter) {
      this._foregroundPainter = value;
      this.markNeedsPaint();
    }
  
    render(context: PaintingContext, offset?: Vector): void {
      if (this._painter) {
        this.renderWidthPainter(context.paint, this._painter, offset);
      }
      super.render(context, offset);
      if (this._foregroundPainter) {
        this.renderWidthPainter(context.paint, this._foregroundPainter, offset);
      }
    }
    private renderWidthPainter(
      paint: Painter,
      painter: CustomPainter,
      offset: Vector = Vector.zero
    ) {
      paint.save();
      paint.translate(offset.x, offset.y);
      painter.render(paint, this.size);
      paint.restore();
    }
  }