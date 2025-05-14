import { BuildContext } from "../basic/elements";
import {
  SingleChildRenderObjectWidget,
  SingleChildRenderObjectWidgetArguments,
} from "../basic/framework";
import Vector from "../math/vector";
import { BoxDecoration } from "../painting/decoration";
import {PaintingContext, SingleChildRenderView } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";

interface DecoratedBoxArguments {
  decoration: BoxDecoration;
}

export class DecoratedBox extends SingleChildRenderObjectWidget {
  private decoration: BoxDecoration;
  constructor(
    option?: Partial<
      DecoratedBoxArguments & SingleChildRenderObjectWidgetArguments
    >
  ) {
    super(option?.child, option?.key);
    this.decoration = option?.decoration;
  }
  createRenderObject(): RenderView {
    return new BoxDecorationRenderView(this.decoration);
  }
  updateRenderObject(
    context: BuildContext,
    renderView: BoxDecorationRenderView
  ): void {
    renderView.decoration = this.decoration;
  }
}


export class BoxDecorationRenderView extends SingleChildRenderView {
    private _decoration: BoxDecoration;
    constructor(decoration: BoxDecoration) {
      super();
      this._decoration = decoration;
    }
    set decoration(value: BoxDecoration) {
      this._decoration = value;
      this.markNeedsPaint();
    }
    get decoration(): BoxDecoration {
      return this._decoration;
    }
    render(context: PaintingContext, offset?: Vector): void {
      const boxPainter = this.decoration?.createBoxPainter(
        this.markNeedsPaint.bind(this)
      );
      if (boxPainter) {
        boxPainter.paint(context.paint, offset, this.size);
      }
      super.render(context, offset);
    }
    debugRender(context: PaintingContext, offset?: Vector): void {
      const boxPainter = this.decoration?.createBoxPainter(
        this.markNeedsPaint.bind(this)
      );
      if (boxPainter) {
        boxPainter.debugPaint(context.paint, offset, this.size);
      }
      super.debugRender(context, offset);
    }
  }
  
  
  