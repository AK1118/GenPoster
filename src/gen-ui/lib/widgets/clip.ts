import { BuildContext } from "../basic/elements";
import { SingleChildRenderObjectWidget, SingleChildRenderObjectWidgetArguments } from "../basic/framework";
import { Clip } from "../core/base-types";
import Vector from "../math/vector";
import { BorderRadius } from "../painting/radius";
import { PaintingContext, SingleChildRenderViewArguments } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";
import { ConstrainedBoxRender, ConstrainedBoxRenderArguments } from "./constrained-box";
import { SizedBox, SizedBoxOption } from "./sized-box";

export interface ClipRectArguments {
  clipBehavior: Clip;
}

export interface ClipRRectArguments extends ClipRectArguments {
  borderRadius: BorderRadius;
}

export class ClipRect extends SizedBox {
  protected clipBehavior: Clip = Clip.hardEdge;
  constructor(
    option: Partial<
      ClipRectArguments &
        SizedBoxOption &
        SingleChildRenderObjectWidgetArguments
    >
  ) {
    super(option);
    this.clipBehavior = option?.clipBehavior ?? this.clipBehavior;
  }
  createRenderObject(): RenderView {
    return new ClipRectRenderView({
      clipBehavior: this.clipBehavior,
      additionalConstraints: this.additionalConstraints,
    });
  }
  updateRenderObject(
    context: BuildContext,
    renderView: ClipRectRenderView
  ): void {
    renderView.clipBehavior = this.clipBehavior;
  }
}
export class ClipRRect extends ClipRect {
  private borderRadius: BorderRadius = BorderRadius.zero;
  constructor(
    option: Partial<
      ClipRRectArguments & SizedBoxOption & SingleChildRenderObjectWidget
    >
  ) {
    super(option);
    this.borderRadius = option?.borderRadius ?? BorderRadius.zero;
  }
  createRenderObject(): RenderView {
    return new ClipRRectRenderView({
      borderRadius: this.borderRadius,
      width: this.width,
      height: this.height,
      clipBehavior: this.clipBehavior,
    });
  }
  updateRenderObject(
    context: BuildContext,
    renderView: ClipRRectRenderView
  ): void {
    renderView.borderRadius = this.borderRadius;
  }
}



export class ClipRectRenderView extends ConstrainedBoxRender {
    protected _clipBehavior: Clip = Clip.hardEdge;
    constructor(
      option: Partial<
        ClipRectArguments &
          ConstrainedBoxRenderArguments &
          SingleChildRenderViewArguments
      >
    ) {
      super(option);
      this.clipBehavior = option?.clipBehavior;
    }
  
    set clipBehavior(value: Clip) {
      this._clipBehavior = value;
      this.markNeedsPaint();
    }
  
    get clipBehavior(): Clip {
      return this._clipBehavior;
    }
  
    performLayout(): void {
      if (this.width === undefined && this.height === undefined) {
        this.child.layout(this.constraints);
        this.size = this.child.size;
      } else {
        this.child.layout(this.constraints);
        super.performLayout();
      }
    }
    render(context: PaintingContext, offset?: Vector): void {
      context.clipRectAndPaint(
        this._clipBehavior,
        {
          x: offset?.x ?? 0,
          y: offset?.y ?? 0,
          width: this.size.width,
          height: this.size.height,
        },
        () => {
          super.render(context, offset);
        }
      );
    }
  }
  
  
  export class ClipRRectRenderView extends ClipRectRenderView {
    private _borderRadius: BorderRadius;
    constructor(
      option: Partial<
        SizedBoxOption & ClipRRectArguments & SingleChildRenderViewArguments
      >
    ) {
      const { borderRadius } = option;
      super(option);
      this.borderRadius = borderRadius;
    }
    get borderRadius(): BorderRadius {
      return this._borderRadius;
    }
    set borderRadius(borderRadius: BorderRadius) {
      this._borderRadius = borderRadius;
      this.markNeedsPaint();
    }
    performLayout(): void {
      super.performLayout();
    }
    render(context: PaintingContext, offset?: Vector): void {
      context.clipRRectAndPaint(
        this._clipBehavior,
        {
          x: offset?.x ?? 0,
          y: offset?.y ?? 0,
          width: this.size.width,
          height: this.size.height,
          radii: this.borderRadius.radius,
        },
        () => {
          super.render(context, offset);
        }
      );
    }
  }