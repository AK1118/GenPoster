import { BuildContext } from "../basic/elements";
import { MultiChildRenderObjectWidget, MultiChildRenderObjectWidgetArguments, SingleChildRenderObjectWidget, SingleChildRenderObjectWidgetArguments } from "../basic/framework";
import { AxisDirection } from "../core/base-types";
import { RenderView } from "../render-object/render-object";
import { RenderSliverBoxAdapter } from "../render-object/slivers";
import { RenderViewPort, RenderViewPortArguments, ViewPortOffset } from "../render-object/viewport";
export {RenderViewPortArguments} from "../render-object/viewport";
export class ViewPort extends MultiChildRenderObjectWidget {
    private offset: ViewPortOffset;
    private axisDirection: AxisDirection;
    constructor(
      option: Partial<
        RenderViewPortArguments & MultiChildRenderObjectWidgetArguments
      >
    ) {
      super(option?.children, option?.key);
      this.offset = option?.offset;
      this.axisDirection = option?.axisDirection;
    }
  
    updateRenderObject(context: BuildContext, renderView: RenderViewPort): void {
      renderView.offset = this.offset;
      renderView.axisDirection = this.axisDirection;
    }
    createRenderObject(): RenderView {
      return new RenderViewPort({
        offset: this.offset,
        axisDirection: this.axisDirection,
      });
    }
  }
  
  export class WidgetToSliverAdapter extends SingleChildRenderObjectWidget {
    constructor(option: Partial<SingleChildRenderObjectWidgetArguments>) {
      super(option?.child, option?.key);
    }
    updateRenderObject(context: BuildContext, renderView: RenderView): void {}
  
    createRenderObject(): RenderView {
      return new RenderSliverBoxAdapter();
    }
  }
  