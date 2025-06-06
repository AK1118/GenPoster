/*
 * @Author: AK1118
 * @Date: 2024-09-16 09:49:49
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2025-04-03 11:58:27
 * @Description: 组合类组件
 */
import { BuildContext, Element } from "../basic/elements";
import {
    MultiChildRenderObjectWidgetArguments,
    SingleChildRenderObjectWidget,
    SingleChildRenderObjectWidgetArguments,
    State,
    StatefulWidget,
    StatelessWidget,
    Widget,
} from "../basic/framework";
import { Key } from "../basic/key";
import { Offset } from "../basic/rect";
import {
    AnimationController,
    FrictionSimulation,
    Simulation,
} from "../core/animation";
import {
    Axis,
    AxisDirection,
    Clip,
    CrossAxisAlignment,
    MainAxisAlignment,
} from "../core/base-types";
import { Duration } from "../core/duration";
import { SimpleScrollPhysics, ScrollPhysics } from "../core/scroll-physics";
import {
    MovePointerEvent,
    PanZoomEndPointerEvent,
    PanZoomStartPointerEvent,
    PanZoomUpdatePointerEvent,
} from "../gesture/events";
import { min } from "../math/math";
import Alignment from "../painting/alignment";
import { BoxDecoration } from "../painting/decoration";
import { FlexOption, RectTLRB } from "../render-object/basic";
import {
    axisDirectionIsReversed,
    axisDirectionToAxis,
    RenderSliver,
} from "../render-object/slivers";
import { BoxConstraints } from "../rendering/constraints";
import {
    ScrollPosition,
    ScrollPositionWithSingleContext,
    ViewPortOffset,
} from "../render-object/viewport";
import VelocityTracker from "../utils/velocity-ticker";
import { Color } from "../painting/color";
import { ScrollController } from "./scroll";
import { Scrollable } from "./scrollable";
import { ViewPort } from "./view-port";

export interface ScrollViewArguments {
    controller: ScrollController;
    axisDirection: AxisDirection;
    physics: ScrollPhysics;
}

export abstract class ScrollView extends StatelessWidget {
    private controller: ScrollController;
    private axisDirection: AxisDirection;
    private physics: ScrollPhysics;
    private children: Array<Widget>;
    constructor(
        args: Partial<
            ScrollViewArguments & MultiChildRenderObjectWidgetArguments
        >
    ) {
        super(args.key);
        this.controller = args?.controller ?? new ScrollController();
        this.axisDirection = args?.axisDirection ?? AxisDirection.down;
        this.physics = args?.physics ?? new SimpleScrollPhysics();
        this.children = args?.children;
    }
    abstract buildSlivers(context: BuildContext): Array<Widget>;
    protected viewportBuilder(
        context: BuildContext,
        offset: ViewPortOffset,
        axisDirection: AxisDirection,
        slivers: Array<Widget>
    ): ViewPort {
        return new ViewPort({
            offset: offset,
            axisDirection: axisDirection,
            children: slivers,
        });
    }
    build(context: BuildContext): Widget {
        const slivers = this.buildSlivers(context);
        return new Scrollable({
            controller: this.controller,
            axisDirection: this.axisDirection,
            physics: this.physics,
            viewportBuilder: (context: BuildContext, offset: ViewPortOffset) => {
                return this.viewportBuilder(
                    context,
                    offset,
                    this.axisDirection,
                    slivers
                );
            },
        });
    }
}