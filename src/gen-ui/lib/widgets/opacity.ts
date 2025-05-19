import { BuildContext } from "../basic/elements";
import {
  SingleChildRenderObjectWidget,
  SingleChildRenderObjectWidgetArguments,
} from "../basic/framework";
import Vector from "../math/vector";
import { PaintingContext, SingleChildRenderView } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";

export interface OpacityArguments {
    /**
     * # 不透明度
     *  - 取值范围 [0,1]
     */
  opacity: number;
}

export class Opacity extends SingleChildRenderObjectWidget {
  public opacity: number;
  constructor(
    option: Partial<OpacityArguments & SingleChildRenderObjectWidgetArguments>
  ) {
    super(option?.child);
    this.opacity = option.opacity;
  }
  createRenderObject(context?: BuildContext): RenderView {
    return new OpacityRenderView({
      opacity: this.opacity,
    });
  }
  updateRenderObject(
    context: BuildContext,
    renderView: OpacityRenderView
  ): void {
    renderView.opacity = this.opacity;
  }
}

class OpacityRenderView extends SingleChildRenderView {
  private _opacity: number;
  constructor(option: OpacityArguments) {
    super();
    this._opacity = option.opacity;
  }
  set opacity(value: number) {
    if (this.opacity == value) return;
    this._opacity = value;
    this.markNeedsPaint();
  }
  get opacity(): number {
    return this._opacity;
  }
  render(context: PaintingContext, offset?: Vector): void {
    context.paint.save();
    context.paint.globalAlpha = this.opacity;
    super.render(context, offset);
    context.paint.restore();
  }
}
