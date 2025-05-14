import { Binding, PipelineOwner, RendererBinding } from "../basic/binding";
import { BuildContext, Element } from "../basic/elements";
import { RootRenderObjectElement, SingleChildRenderObjectWidget, Widget } from "../basic/framework";
import { RootRenderView } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";

export class RootWidget extends SingleChildRenderObjectWidget {
  createRenderObject(): RenderView {
    return new RootRenderView();
  }
  createElement(): Element {
    return new RootRenderObjectElement(this);
  }
  updateRenderObject(context: BuildContext, renderView: RenderView) {}
}


export const runApp = (rootWidget: Widget) => {
  const binding = Binding.getInstance();
  binding.elementBinding.attachRootWidget(rootWidget);
};