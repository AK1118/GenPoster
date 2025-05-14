import { BuildContext } from "../basic/elements";
import {
  SingleChildRenderObjectWidget,
  SingleChildRenderObjectWidgetArguments,
} from "../basic/framework";
import { Size } from "../basic/rect";
import Vector from "../math/vector";
import Alignment from "../painting/alignment";
import { ContainerRenderViewParentData, PaintingContext, SingleChildRenderView, SingleChildRenderViewArguments } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";

export class Align extends SingleChildRenderObjectWidget {
  private alignment: Alignment;
  constructor(
    option: Partial<AlignArguments & SingleChildRenderObjectWidgetArguments>
  ) {
    super(option?.child, option.key);
    this.alignment = option?.alignment ?? Alignment.center;
  }
  createRenderObject(): RenderView {
    return new AlignRenderView({
      alignment: this.alignment,
    });
  }
  updateRenderObject(context: BuildContext, renderView: RenderView): void {
    (renderView as AlignRenderView).alignment = this.alignment;
  }
}



export interface AlignArguments {
  alignment: Alignment;
}
export class AlignRenderView extends SingleChildRenderView {
  private _alignment: Alignment = Alignment.center;
  constructor(
    option: Partial<AlignArguments & SingleChildRenderViewArguments>
  ) {
    super(option?.child);
    this.alignment = option?.alignment;
  }
  set alignment(alignment: Alignment) {
    this._alignment = alignment ?? this._alignment;
    this.markNeedsLayout();
  }
  get alignment(): Alignment {
    return this._alignment;
  }
  performLayout(): void {
    const constrain = this.constraints;
    if (this.child) {
      this.child.layout(constrain.loosen(), true);
      this.size = constrain.constrain(
        new Size(this.child.size.width, this.child.size.height)
      );
      this.alignChild();
    } else {
      this.size = constrain.constrain(new Size(Infinity, Infinity));
    }
  }
  private alignChild() {
    const parentSize = this.constraints.constrain(Size.zero);
    const parentData = this.child?.parentData as ContainerRenderViewParentData;
    const offset = this.alignment.inscribe(this.child.size, parentSize);
    offset.clampX(0, parentSize.width);
    offset.clampY(0, parentSize.height);
    parentData.offset = offset;
    this.child.parentData = parentData;
  }
  render(context: PaintingContext, offset?: Vector): void {
    super.render(context, offset);
  }
  debugRender(context: PaintingContext, offset?: Vector): void {
    context.paintEmptyDebugBoundary(offset, this.size);
    super.debugRender(context, offset);
  }
}



export class Center extends Align {
  constructor(option: Partial<SingleChildRenderObjectWidgetArguments>) {
    super({ ...option, alignment: Alignment.center });
  }
}
