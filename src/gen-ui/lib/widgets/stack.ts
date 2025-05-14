import { BuildContext } from "../basic/elements";
import {
  MultiChildRenderObjectWidget,
  MultiChildRenderObjectWidgetArguments,
  ParentDataWidget,
  SingleChildRenderObjectWidgetArguments,
} from "../basic/framework";
import Rect, { Size } from "../basic/rect";
import { Clip, StackFit } from "../core/base-types";
import Vector from "../math/vector";
import Alignment from "../painting/alignment";
import {
  ContainerRenderViewParentData,
  MultiChildRenderView,
  MultiChildRenderViewOption,
  PaintingContext,
  ParentDataRenderView,
} from "../render-object/basic";
import { RenderView } from "../render-object/render-object";
import { BoxConstraints } from "../rendering/constraints";

export interface StackOption {
  /**
   * # 子控件的填充方式
   */
  fit: StackFit;
  /**
   * # 子控件的对齐位置
   */
  alignment: Alignment;
  /**
   * # 超出边界裁剪行为
   */
  clipBehavior: Clip;
}

export class Stack extends MultiChildRenderObjectWidget {
  private _fit: StackFit = StackFit.loose;
  private _alignment: Alignment = Alignment.topLeft;
  private _clipBehavior: Clip = Clip.none;
  constructor(
    option: Partial<StackOption & MultiChildRenderObjectWidgetArguments>
  ) {
    super(option?.children, option.key);
    this._fit = option?.fit ?? StackFit.loose;
    this._alignment = option?.alignment ?? Alignment.topLeft;
    this._clipBehavior = option?.clipBehavior ?? Clip.none;
  }
  createRenderObject(): RenderView {
    return new StackRenderView({
      fit: this._fit,
      alignment: this._alignment,
      clipBehavior: this._clipBehavior,
    });
  }
  updateRenderObject(context: BuildContext, renderView: StackRenderView): void {
    renderView.fit = this._fit;
    renderView.alignment = this._alignment;
    renderView.clipBehavior = this._clipBehavior;
  }
}

export class StackRenderView extends MultiChildRenderView {
  private _fit: StackFit = StackFit.loose;
  private _alignment: Alignment = Alignment.topLeft;
  private _clipBehavior: Clip = Clip.none;
  constructor(option: Partial<StackOption & MultiChildRenderViewOption>) {
    const { children, alignment, fit, clipBehavior } = option;
    super(children);
    this.alignment = alignment ?? this.alignment;
    this.fit = fit ?? this.fit;
    this.clipBehavior = clipBehavior ?? this._clipBehavior;
  }
  get alignment(): Alignment {
    return this._alignment;
  }
  set alignment(value: Alignment) {
    if (value === this._alignment) return;
    this._alignment = value;
    this.markNeedsLayout();
  }
  set clipBehavior(value: Clip) {
    if (value === this._clipBehavior) return;
    this._clipBehavior = value;
    this.markNeedsLayout();
  }
  get fit(): StackFit {
    return this._fit;
  }
  get clipBehavior(): Clip {
    return this._clipBehavior;
  }
  set fit(value: StackFit) {
    if (value === this._fit) return;
    this._fit = value;
    this.markNeedsLayout();
  }

  private computeSize(constraints: BoxConstraints): Size {
    //未被定位子组件约束盒子
    let nonPositionedConstraints: BoxConstraints = BoxConstraints.zero;
    //是否有未定位的组件
    let hasNonPositionChild: boolean = false;
    switch (this.fit) {
      case StackFit.loose:
        nonPositionedConstraints = new BoxConstraints({
          maxWidth: constraints.maxWidth,
          maxHeight: constraints.maxHeight,
        });
        break;
      case StackFit.expand:
        //子盒子填充父盒子100%
        nonPositionedConstraints = new BoxConstraints({
          minWidth: constraints.minWidth,
          minHeight: constraints.minHeight,
          maxWidth: constraints.minWidth,
          maxHeight: constraints.minHeight,
        });
      case StackFit.passthrough:
        nonPositionedConstraints = constraints;
    }

    //记录stack内child的最大值
    let width = constraints.minWidth,
      height = constraints.minHeight;
    let child = this.firstChild;
    while (child != null) {
      const parentData = child.parentData as StackParentData;
      if (!parentData.isPositioned) {
        hasNonPositionChild = true;
        child.layout(nonPositionedConstraints, true);
        const childSize = child.size;
        width = Math.max(width, childSize.width);
        height = Math.max(height, childSize.height);
      }
      child = parentData.nextSibling;
    }

    if (hasNonPositionChild) {
      return new Size(width, height);
    }

    return constraints.constrain(Size.zero);
  }
  /**
   * 未定位的组件随align 对其布局
   *
   */
  performLayout(): void {
    this.size = this.computeSize(this.constraints);
    let child = this.firstChild;
    while (child != null) {
      const parentData = child.parentData as StackParentData;
      if (!parentData.isPositioned) {
        parentData.offset = this.alignment.inscribe(child.size, this.size);
      } else {
        this.layoutPositionedChild(
          child,
          parentData,
          this.size,
          this.alignment
        );
      }
      child = parentData.nextSibling;
    }
  }
  private layoutPositionedChild(
    child: RenderView,
    parentData: StackParentData,
    size: Size,
    alignment: Alignment
  ) {
    let childConstraints = BoxConstraints.zero;

    if (parentData.left != null && parentData.right != null) {
      childConstraints = childConstraints.tighten(
        size.width - parentData.right - parentData.left
      );
    } else if (parentData.width != null) {
      childConstraints = childConstraints.tighten(parentData.width);
    }

    if (parentData.top != null && parentData.bottom != null) {
      childConstraints = childConstraints.tighten(
        null,
        size.height - parentData.top - parentData.bottom
      );
    } else if (parentData.height != null) {
      childConstraints = childConstraints.tighten(null, parentData.height);
    }

    child.layout(childConstraints, true);

    let x: number = 0;
    if (parentData.left != null) {
      x = parentData.left;
    } else if (parentData.right != null) {
      x = size.width - parentData.right - child.size.width;
    } else {
      x = alignment.inscribe(child.size, size).x;
    }

    let y: number = 0;
    if (parentData.top != null) {
      y = parentData.top;
    } else if (parentData.bottom != null) {
      y = size.height - parentData.bottom - child.size.height;
    } else {
      y = alignment.inscribe(child.size, size).y;
    }

    parentData.offset = new Vector(x, y);
  }
  protected setupParentData(child: RenderView): void {
    child.parentData = new StackParentData();
  }
  render(context: PaintingContext, offset?: Vector): void {
    if (this.clipBehavior !== Clip.none) {
      context.clipRectAndPaint(
        this.clipBehavior,
        Rect.merge(offset, this.size),
        () => super.render(context, offset)
      );
    } else super.render(context, offset);
  }
  debugRender(context: PaintingContext, offset?: Vector): void {
    if (this.clipBehavior !== Clip.none) {
      context.clipRectAndPaint(
        this.clipBehavior,
        Rect.merge(offset, this.size),
        () => super.debugRender(context, offset)
      );
    } else super.debugRender(context, offset);
  }
}

export class StackParentData extends ContainerRenderViewParentData<RenderView> {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;

  get isPositioned(): boolean {
    return (
      this.top != null ||
      this.right != null ||
      this.bottom != null ||
      this.left != null ||
      this.width != null ||
      this.height != null
    );
  }
}

export interface PositionedArguments {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export class Positioned extends ParentDataWidget<StackParentData> {
  private top: number;
  private left: number;
  private right: number;
  private bottom: number;
  private width: number;
  private height: number;
  constructor(
    option: Partial<
      PositionedArguments & SingleChildRenderObjectWidgetArguments
    >
  ) {
    const { child, top, bottom, left, right, width, height } = option;
    super(child, option.key);
    this.top = top;
    this.bottom = bottom;
    this.left = left;
    this.right = right;
    this.width = width;
    this.height = height;
  }
  applyParentData(child: ParentDataRenderView<StackParentData>): void {
    const parentData = child.parentData;
    parentData.bottom = this.bottom;
    parentData.top = this.top;
    parentData.left = this.left;
    parentData.right = this.right;
    parentData.width = this.width;
    parentData.height = this.height;
    if (child?.parent instanceof RenderView) {
      child.parent.markNeedsLayout();
    }
  }
}
