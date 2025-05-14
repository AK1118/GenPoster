import { BuildContext } from "../basic/elements";
import { SingleChildRenderObjectWidget } from "../basic/framework";
import { RenderView } from "../render-object/render-object";
import { BoxConstraints } from "../rendering/constraints";
import { ConstrainedBoxRender } from "./constrained-box";

export interface SizedBoxOption {
    width: number;
    height: number;
  }
  
  

export class SizedBox extends SingleChildRenderObjectWidget {
  protected width: number;
  protected height: number;
  protected additionalConstraints: BoxConstraints = BoxConstraints.zero;
  constructor(option: Partial<SizedBoxOption & SingleChildRenderObjectWidget>) {
    super(option?.child, option.key);
    const { width, height } = option;
    this.width = width;
    this.height = height;
    this.additionalConstraints = BoxConstraints.tightFor(width, height);
  }
  createRenderObject(): RenderView {
    return new ConstrainedBoxRender({
      additionalConstraints: this.additionalConstraints,
    });
  }
  updateRenderObject(context: BuildContext, renderView: ConstrainedBoxRender) {
    renderView.additionalConstraints = this.additionalConstraints;
  }
}