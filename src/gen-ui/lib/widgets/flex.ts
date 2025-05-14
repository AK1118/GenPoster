/*
 * @Author: AK1118
 * @Date: 2024-09-16 09:49:49
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2025-05-08 15:23:01
 * @Description: 组合类组件
 */
import { BuildContext, Element } from "../basic/elements";
import {
  MultiChildRenderObjectWidget,
  MultiChildRenderObjectWidgetArguments,
  ParentDataWidget,
  SingleChildRenderObjectWidget,
  SingleChildRenderObjectWidgetArguments,
  State,
  StatefulWidget,
  StatelessWidget,
  Widget,
} from "../basic/framework";
import { Key } from "../basic/key";
import { Offset, Size } from "../basic/rect";
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
  MainAxisSize,
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
import {
  ContainerRenderViewParentData,
  ExpandedArguments,
  FlexOption,
  FlexParentData,
  LayoutSizes,
  MultiChildRenderView,
  MultiChildRenderViewOption,
  ParentDataRenderView,
  RectTLRB,
  RenderBox,
} from "../render-object/basic";
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
import { ScrollController } from "./scroll";
import { Color } from "../painting/color";
import { RenderView } from "../render-object/render-object";
import Vector from "../math/vector";
import { ArgumentError, AssertionError, LayoutAssertion } from "../core/errors";

export class FlexRenderView extends MultiChildRenderView<
  RenderView,
  ContainerRenderViewParentData<RenderView>
> {
  private overflow: number = 0;
  public _direction: Axis = Axis.horizontal;
  public _mainAxisAlignment: MainAxisAlignment = MainAxisAlignment.start;
  public _crossAxisAlignment: CrossAxisAlignment = CrossAxisAlignment.start;
  private _spacing: number = 0;
  private _mainAxisSize: MainAxisSize;
  constructor(option: Partial<FlexOption & MultiChildRenderViewOption>) {
    const {
      direction,
      children,
      mainAxisAlignment,
      crossAxisAlignment,
      spacing,
      mainAxisSize = MainAxisSize.max,
    } = option;
    super(children);
    this.direction = direction;
    this.mainAxisAlignment = mainAxisAlignment;
    this.crossAxisAlignment = crossAxisAlignment;
    this.spacing = spacing ?? 0;
    this._mainAxisSize = mainAxisSize;
  }
  set direction(value: Axis) {
    if (!value || this._direction === value) return;
    this._direction = value;
    this.markNeedsLayout();
  }
  set mainAxisSize(value: MainAxisSize) {
    if (!value || this._mainAxisSize === value) return;
    this._mainAxisSize = value;
    this.markNeedsLayout();
  }
  set mainAxisAlignment(value: MainAxisAlignment) {
    if (!value || this._mainAxisAlignment === value) return;
    this._mainAxisAlignment = value;
    this.markNeedsLayout();
  }
  set crossAxisAlignment(value: CrossAxisAlignment) {
    if (!value || this._crossAxisAlignment === value) return;
    this._crossAxisAlignment = value;
    this.markNeedsLayout();
  }
  set spacing(value: number) {
    if (value == undefined || value == this.spacing) return;
    this._spacing = value;
    this.markNeedsLayout();
  }
  get direction(): Axis {
    return this._direction;
  }
  get mainAxisAlignment(): MainAxisAlignment {
    return this._mainAxisAlignment;
  }
  get crossAxisAlignment(): CrossAxisAlignment {
    return this._crossAxisAlignment;
  }
  get spacing(): number {
    return this._spacing;
  }
  performLayout(): void {
    const computeSize: LayoutSizes = this.computeSize(this.constraints);

    if (this.direction === Axis.horizontal) {
      this.size = this.constraints.constrain(
        new Size(computeSize.mainSize, computeSize.crossSize)
      );
    } else if (this.direction === Axis.vertical) {
      this.size = this.constraints.constrain(
        new Size(computeSize.crossSize, computeSize.mainSize)
      );
    }

    //实际剩余大小
    const actualSizeDetail: number =
      computeSize.mainSize - computeSize.allocatedSize;
    //当实际剩余大小为负数时判断为溢出
    this.overflow = Math.max(0, actualSizeDetail * -1);
    //剩余空间
    const remainingSpace: number = Math.max(0, actualSizeDetail);
    let leadingSpace: number = 0;
    let betweenSpace: number = 0;
    /**
     * 根据剩余空间计算leading 和 between
     * 例如总宽度为 200，元素50有1个，实际剩余等于200-50=150;
     * 假设为center,算法为  leadingSpace = remainingSpace *.5;也就是 75开始布局
     */
    switch (this.mainAxisAlignment) {
      case MainAxisAlignment.start:
        break;
      case MainAxisAlignment.end:
        leadingSpace = remainingSpace;
        break;
      case MainAxisAlignment.center:
        leadingSpace = remainingSpace * 0.5;
        break;
      case MainAxisAlignment.spaceBetween:
        betweenSpace = remainingSpace / (this.childCount - 1);
        break;
      case MainAxisAlignment.spaceAround:
        betweenSpace = remainingSpace / this.childCount;
        leadingSpace = betweenSpace * 0.5;
        break;
      case MainAxisAlignment.spaceEvenly:
        betweenSpace = remainingSpace / (this.childCount + 1);
        leadingSpace = betweenSpace;
    }
    // 每个子元素之间的间距加上间距
    betweenSpace += this.spacing;
    let child = this.firstChild;
    let childMainPosition: number = leadingSpace,
      childCrossPosition: number = 0;
    let childCount = 0;
    while (child != null) {
      const parentData = child.parentData as ContainerRenderViewParentData;
      childCount += 1;
      const childMainSize = this.getMainSize(child.size),
        childCrossSize = this.getCrossSize(child.size);
      const crossSize = this.getCrossSize(this.size);
      switch (this.crossAxisAlignment) {
        case CrossAxisAlignment.start:
          break;
        case CrossAxisAlignment.end:
          childCrossPosition = crossSize - childCrossSize;
          break;
        case CrossAxisAlignment.center:
          childCrossPosition = crossSize * 0.5 - childCrossSize * 0.5;
          break;
        case CrossAxisAlignment.stretch:
          childCrossPosition = 0;
          break;
        case CrossAxisAlignment.baseline:
          childCrossPosition =
            computeSize.crossSize * 0.5 - childCrossSize * 0.5;
      }
      if (this.direction === Axis.horizontal) {
        parentData.offset = new Vector(childMainPosition, childCrossPosition);
      } else if (this.direction === Axis.vertical) {
        parentData.offset = new Vector(childCrossPosition, childMainPosition);
      }
      if (typeof betweenSpace !== "number") {
        throw new AssertionError("betweenSpace is not a number");
      }

      childMainPosition += childMainSize + betweenSpace;
      child = parentData?.nextSibling;
    }
  }

  private computeSize(constraints: BoxConstraints): LayoutSizes {
    let totalFlex: number = 0,
      maxMainSize: number = 0,
      canFlex: boolean,
      child = this.firstChild,
      crossSize: number = 0,
      allocatedSize: number = 0,
      spacing = this.spacing;
    maxMainSize =
      this.direction === Axis.horizontal
        ? constraints.maxWidth
        : constraints.maxHeight;
    //盒子主轴值无限时不能被flex布局
    canFlex = maxMainSize < Infinity;

    let currentChildNdx: number = 0;
    while (child != null) {
      const parentData =
        child.parentData as ContainerRenderViewParentData<RenderView>;
      let innerConstraint: BoxConstraints = BoxConstraints.zero;
      const flex = this.getFlex(child);
      if (flex > 0) {
        totalFlex += flex;
      } else {
        //当设置了cross方向也需要拉伸时,子盒子约束需要设置为max = min = parent.max
        if (this.crossAxisAlignment === CrossAxisAlignment.stretch) {
          if (this.direction === Axis.horizontal) {
            innerConstraint = BoxConstraints.tightFor(
              null,
              constraints.maxHeight
            );
          } else if (this.direction === Axis.vertical) {
            innerConstraint = BoxConstraints.tightFor(
              constraints.maxWidth,
              null
            );
          }
        } else {
          //cross未设置拉伸，仅设置子盒子 max
          if (this.direction === Axis.horizontal) {
            innerConstraint = new BoxConstraints({
              maxHeight: constraints.maxHeight,
            });
          } else if (this.direction === Axis.vertical) {
            innerConstraint = new BoxConstraints({
              maxWidth: constraints.maxWidth,
            });
          }
        }
        child.layout(innerConstraint);
        const childSize = child?.size || Size.zero;
        allocatedSize += this.getMainSize(childSize);
        // 子盒子间距处理
        // 间距的累加次数应该始终保持为childCount-1，因为最后一个不需要累加间距
        if (currentChildNdx > 0) {
          allocatedSize += spacing;
        }
        crossSize = Math.max(crossSize, this.getCrossSize(childSize));
        currentChildNdx += 1;
      }

      child = parentData?.nextSibling;
    }
    //弹性布局计算
    if (totalFlex > 0) {
      const spacingSize = spacing * (this.childCount - 1);
      //剩余空间
      //除去间距所占空间后，剩余空间分配给弹性盒子，且剩余空间必须不等于0
      const freeSpace = Math.max(
        0,
        Math.max(0, canFlex ? maxMainSize : 0) - allocatedSize - spacingSize
      );
      //弹性盒子平均值
      const freePerSpace: number = freeSpace / totalFlex;
      child = this.firstChild;
      while (child != null) {
        const flex = this.getFlex(child);
        if (flex > 0) {
          //子盒子最大约束
          const maxChildExtent: number = canFlex
            ? flex * freePerSpace
            : Infinity;
          //最小约束
          const minChildExtend: number = maxChildExtent;
          let innerConstraint: BoxConstraints = BoxConstraints.zero;
          //交叉方向填满
          if (this.crossAxisAlignment === CrossAxisAlignment.stretch) {
            if (this.direction === Axis.horizontal) {
              innerConstraint = new BoxConstraints({
                maxWidth: maxChildExtent,
                minWidth: minChildExtend,
                minHeight: constraints.maxHeight,
                maxHeight: constraints.maxHeight,
              });
            } else if (this.direction === Axis.vertical) {
              innerConstraint = new BoxConstraints({
                maxWidth: constraints.maxWidth,
                minWidth: constraints.maxWidth,
                minHeight: minChildExtend,
                maxHeight: maxChildExtent,
              });
            }
          } else {
            if (this.direction === Axis.horizontal) {
              innerConstraint = new BoxConstraints({
                minWidth: minChildExtend,
                maxWidth: maxChildExtent,
                maxHeight: constraints.maxHeight,
                minHeight: 0,
              });
            } else if (this.direction === Axis.vertical) {
              innerConstraint = new BoxConstraints({
                minHeight: minChildExtend,
                maxHeight: maxChildExtent,
                maxWidth: constraints.minWidth,
                minWidth: 0,
              });
            }
          }
          if (
            innerConstraint.hasInfiniteWidth ||
            innerConstraint.hasInfiniteHeight
          ) {
            LayoutAssertion.assertValidConstraints(
              innerConstraint,
              child as RenderBox,
              "Infinite constraints in layout."
            );
          }
          child.layout(innerConstraint);
        }
        //刷新布局后子盒子大小
        allocatedSize += this.getMainSize(child.size);
        crossSize = Math.max(crossSize, this.getCrossSize(child.size));
        const parentData =
          child.parentData as ContainerRenderViewParentData<RenderView>;
        child = parentData.nextSibling;
      }
    }

    const idealSize: number =
      canFlex && this._mainAxisSize === MainAxisSize.max
        ? maxMainSize
        : allocatedSize;
    return {
      mainSize: idealSize,
      crossSize: crossSize,
      allocatedSize: allocatedSize,
    };
  }
  private getFlex(child: RenderView): number {
    if (child.parentData instanceof FlexParentData) {
      return child.parentData.flex ?? 0;
    }
    return 0;
  }
  protected setupParentData(child: RenderView): void {
    const parentData = new FlexParentData();
    parentData.node = child;
    child.parentData = parentData;
  }

  private getCrossSize(size: Size) {
    switch (this.direction) {
      case Axis.horizontal:
        return size.height;
      case Axis.vertical:
        return size.width;
    }
  }

  private getMainSize(size: Size) {
    switch (this.direction) {
      case Axis.horizontal:
        return size.width;
      case Axis.vertical:
        return size.height;
    }
  }
}

export class Flex extends MultiChildRenderObjectWidget {
  public direction: Axis = Axis.horizontal;
  public mainAxisAlignment: MainAxisAlignment = MainAxisAlignment.start;
  public crossAxisAlignment: CrossAxisAlignment = CrossAxisAlignment.center;
  public spacing: number = 0;
  public mainAxisSize: MainAxisSize = MainAxisSize.max;
  constructor(
    option: Partial<FlexOption & MultiChildRenderObjectWidgetArguments>
  ) {
    const {
      direction,
      children,
      mainAxisAlignment,
      crossAxisAlignment,
      spacing,
      mainAxisSize,
    } = option;
    super(children, option.key);
    this.direction = direction ?? this.direction;
    this.mainAxisAlignment = mainAxisAlignment ?? this.mainAxisAlignment;
    this.crossAxisAlignment = crossAxisAlignment ?? this.crossAxisAlignment;
    this.spacing = spacing;
    this.mainAxisSize = mainAxisSize;
  }
  createRenderObject(): RenderView {
    return new FlexRenderView({
      direction: this.direction,
      mainAxisAlignment: this.mainAxisAlignment,
      crossAxisAlignment: this.crossAxisAlignment,
      spacing: this.spacing,
      mainAxisSize: this.mainAxisSize,
    });
  }
  updateRenderObject(context: BuildContext, renderView: FlexRenderView): void {
    renderView.direction = this.direction;
    renderView.mainAxisAlignment = this.mainAxisAlignment;
    renderView.crossAxisAlignment = this.crossAxisAlignment;
    renderView.spacing = this.spacing;
    renderView.mainAxisSize = this.mainAxisSize;
  }
}

export type RowArguments = Omit<FlexOption, "direction">;

export class Row extends Flex {
  constructor(
    args: Partial<RowArguments & MultiChildRenderObjectWidgetArguments>
  ) {
    super({
      ...args,
      direction: Axis.horizontal,
    });
  }
}

export type ColumnArguments = Omit<FlexOption, "direction">;

export class Column extends Flex {
  constructor(
    args: Partial<ColumnArguments & MultiChildRenderObjectWidgetArguments>
  ) {
    super({
      ...args,
      direction: Axis.vertical,
    });
  }
}


export class Expanded extends ParentDataWidget<FlexParentData> {
  private flex: number = 0;
  constructor(
    option: Partial<ExpandedArguments & SingleChildRenderObjectWidgetArguments>
  ) {
    super(option?.child, option.key);
    this.flex = option?.flex ?? 1;
  }
  applyParentData(renderView: ParentDataRenderView<FlexParentData>): void {
    if (!(renderView.parentData instanceof FlexParentData)) return;
    const flexParentData = renderView?.parentData as FlexParentData;
    flexParentData.flex = this.flex;
    renderView.parentData = flexParentData;
    if (renderView.parent instanceof RenderView) {
      renderView.parent.markNeedsLayout();
    }
  }
}