import { BuildContext } from "../basic/elements";
import { SingleChildRenderObjectWidget, SingleChildRenderObjectWidgetArguments } from "../basic/framework";
import { Size } from "../basic/rect";
import Vector from "../math/vector";
import { EdgeInsets, EdgeInsetsGeometry } from "../painting/edge-insets";
import {  BoxParentData, PaintingContext, SingleChildRenderView, SingleChildRenderViewArguments } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";
import { BoxConstraints } from "../rendering/constraints";

export class PaddingRenderView extends SingleChildRenderView {
    private _padding: EdgeInsetsGeometry = EdgeInsets.zero;
    get padding() {
      return this._padding;
    }
    set padding(padding) {
      this._padding = padding;
      this.markNeedsLayout();
    }
    constructor(
      option?: Partial<PaddingOption & SingleChildRenderViewArguments>
    ) {
      super(option?.child);
      this.padding = option?.padding;
    }
  
    performLayout(): void {
      const horizontal = (this.padding?.left || 0) + (this.padding?.right || 0);
      const vertical = (this.padding?.top || 0) + (this.padding?.bottom || 0);
      if (!this.child) {
        this.size = new Size(
          Math.max(this.constraints.maxWidth, horizontal),
          vertical
        );
        return;
      }
      const innerConstraint: BoxConstraints = this.constraints.deflate(
        new Vector(horizontal, vertical)
      );
      const childParent: BoxParentData = this.child.parentData as BoxParentData;
      this.child.layout(innerConstraint, true);
  
      childParent.offset = new Vector(
        this.padding?.left || 0,
        this.padding?.top || 0
      );
  
      this.size = this.constraints.constrain(
        new Size(
          horizontal + this.child.size.width,
          vertical + this.child.size.height
        )
      );
    }
    computeDryLayout(constrains: BoxConstraints): Size {
      return this.size;
    }
    render(context: PaintingContext, offset?: Vector): void {
      super.render(context, offset);
    }
    debugRender(context: PaintingContext, offset?: Vector): void {
      super.debugRender(context, offset);
    }
  }
  export interface PaddingOption {
    padding: EdgeInsetsGeometry;
  }
  export class Padding extends SingleChildRenderObjectWidget {
    private padding: EdgeInsetsGeometry;
    constructor(
      option: Partial<PaddingOption & SingleChildRenderObjectWidgetArguments>
    ) {
      super(option.child, option.key);
      this.padding = option?.padding;
    }
    createRenderObject(): RenderView {
      return new PaddingRenderView({
        padding: this.padding,
      });
    }
    updateRenderObject(
      context: BuildContext,
      renderView: PaddingRenderView
    ): void {
      renderView.padding = this.padding;
    }
  }
  