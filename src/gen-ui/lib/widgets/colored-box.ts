import { BuildContext } from "../basic/elements";
import { SingleChildRenderObjectWidget, SingleChildRenderObjectWidgetArguments } from "../basic/framework";
import Vector from "../math/vector";
import { Color } from "../painting/color";
import { PaintingContext, RenderBox, SingleChildRenderView } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";

export interface ColoredBoxOption {
  color: Color;
}
export class ColoredBox extends SingleChildRenderObjectWidget {
  private color: Color;
  constructor(
    option: Partial<ColoredBoxOption & SingleChildRenderObjectWidgetArguments>
  ) {
    super(option?.child, option.key);
    this.color = option?.color;
  }
  createRenderObject(): RenderView {
    return new ColoredRender(this.color);
  }
  updateRenderObject(context: BuildContext, renderView: RenderView) {
    (renderView as ColoredRender).color = this.color;
  }
}


export class ColoredRender extends SingleChildRenderView {
    public _color: Color;
  
    constructor(color?: Color, child?: RenderBox) {
      super(child);
      this.color = color;
    }
    set color(color: Color) {
      if (!color || this._color === color) return;
      this._color = color;
      this.markNeedsPaint();
    }
    get color(): Color {
      return this._color;
    }
    // performLayout(): void {
    //   // super.performLayout();
    //   // this.child?.layout(this.constraints);
    //   // if (!this.child) {
    //   //   this.size = Size.zero;
    //   //   return;
    //   // }
    //   // this.size = this.child?.size??Size.zero;
    //   if(this.child){
    //     this.child.layout()
    //   }
    // }
    performResize(): void {
      this.size = this.child?.getDryLayout(this.constraints);
    }
    render(context: PaintingContext, offset?: Vector): void {
      const paint = context.paint;
      paint.save();
      paint.beginPath();
      paint.fillStyle = this.color.rgba;
      paint.fillRect(
        offset?.x ?? 0,
        offset?.y ?? 0,
        this.size.width,
        this.size.height
      );
      paint.closePath();
      paint.restore();
      super.render(context, offset);
    }
    debugRender(context: PaintingContext, offset?: Vector): void {
      super.debugRender(context, offset);
    }
  }
  