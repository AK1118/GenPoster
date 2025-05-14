import { BuildContext } from "../basic/elements";
import { SingleChildRenderObjectWidget, SingleChildRenderObjectWidgetArguments } from "../basic/framework";
import { Size } from "../basic/rect";
import Vector from "../math/vector";
import { PaintingContext, SingleChildRenderView, SingleChildRenderViewArguments } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";
import { BoxConstraints } from "../rendering/constraints";

export interface ConstrainedBoxRenderArguments {
    additionalConstraints: BoxConstraints;
  }
  
  //尺寸约束 不负责渲染
  export class ConstrainedBoxRender extends SingleChildRenderView {
    public _width: number;
    public _height: number;
    private _additionalConstraints: BoxConstraints;
    constructor(
      option: Partial<
        ConstrainedBoxRenderArguments & SingleChildRenderViewArguments
      >
    ) {
      super(option?.child);
      this.additionalConstraints =
        option?.additionalConstraints || BoxConstraints.zero;
    }
    get additionalConstraints(): BoxConstraints {
      return this._additionalConstraints;
    }
    set additionalConstraints(constraints: BoxConstraints) {
      if (this._additionalConstraints === constraints) return;
      this._additionalConstraints = constraints;
      this.markNeedsLayout();
    }
    computeDryLayout(constrains: BoxConstraints): Size {
      if (this.child) {
        this.child.layout(this.additionalConstraints.enforce(constrains), true);
        return this.child.size;
      } else {
        return this.additionalConstraints
          .enforce(this.constraints)
          .constrain(Size.zero);
      }
    }
    set width(width: number) {
      this._width = width;
    }
    set height(height: number) {
      this._height = height;
    }
    get width(): number {
      return this._width;
    }
    get height(): number {
      return this._height;
    }
    performUpdateAdditional(
      width: number = this.width,
      height: number = this.height
    ): void {
      this.additionalConstraints = new BoxConstraints({
        maxWidth: width,
        maxHeight: height,
        minWidth: width,
        minHeight: height,
      });
      this.markNeedsLayout();
      // this.markNeedsPaint();
    }
  
    performLayout(): void {
      this.size = this.computeDryLayout(this.constraints);
    }
    debugRender(context: PaintingContext, offset?: Vector): void {
      context.paintDefaultDebugBoundary(offset, this.size);
      super.debugRender(context, offset);
    }
  }

  export class ConstrainedBox extends SingleChildRenderObjectWidget {
    private additionalConstraints: BoxConstraints;
    constructor(
      option: Partial<
        ConstrainedBoxRenderArguments & SingleChildRenderObjectWidgetArguments
      >
    ) {
      super(option?.child, option.key);
      this.additionalConstraints =
        option?.additionalConstraints ?? BoxConstraints.tightFor();
    }
  
    createRenderObject(): RenderView {
      return new ConstrainedBoxRender({
        additionalConstraints: this.additionalConstraints,
      });
    }
    updateRenderObject(
      context: BuildContext,
      renderView: ConstrainedBoxRender
    ): void {
      renderView.additionalConstraints = this.additionalConstraints;
    }
  }