import { BuildContext } from "../basic/elements";
import { MultiChildRenderObjectWidget, MultiChildRenderObjectWidgetArguments } from "../basic/framework";
import { Size } from "../basic/rect";
import { Axis, WrapAlignment, WrapCrossAlignment } from "../core/base-types";
import Vector from "../math/vector";
import { ContainerRenderViewParentData, MultiChildRenderView } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";
import { BoxConstraints } from "../rendering/constraints";
export interface WrapOption {
    direction: Axis;
    spacing: number;
    runSpacing: number;
    alignment: WrapAlignment;
    runAlignment: WrapAlignment;
    crossAxisAlignment: WrapCrossAlignment;
  }
export class Wrap extends MultiChildRenderObjectWidget {
  direction: Axis = Axis.horizontal;
  spacing: number = 0;
  runSpacing: number = 0;
  alignment: WrapAlignment = WrapAlignment.start;
  runAlignment: WrapAlignment = WrapAlignment.start;
  crossAxisAlignment: WrapCrossAlignment = WrapCrossAlignment.start;
  constructor(
    option: Partial<WrapOption & MultiChildRenderObjectWidgetArguments>
  ) {
    super(option?.children, option.key);
    this.direction = option?.direction ?? Axis.horizontal;
    this.spacing = option?.spacing ?? 0;
    this.runSpacing = option?.runSpacing ?? 0;
    this.alignment = option?.alignment ?? WrapAlignment.start;
    this.runAlignment = option?.runAlignment ?? WrapAlignment.start;
    this.crossAxisAlignment =
      option?.crossAxisAlignment ?? WrapCrossAlignment.start;
  }
  createRenderObject(): RenderView {
    return new WrapRenderView({
      direction: this.direction,
      spacing: this.spacing,
      runSpacing: this.runSpacing,
      alignment: this.alignment,
      runAlignment: this.runAlignment,
      crossAxisAlignment: this.crossAxisAlignment,
    });
  }
  updateRenderObject(context: BuildContext, renderView: WrapRenderView): void {
    renderView.direction = this.direction;
    renderView.spacing = this.spacing;
    renderView.runSpacing = this.runSpacing;
    renderView.alignment = this.alignment;
    renderView.runAlignment = this.runAlignment;
    renderView.crossAxisAlignment = this.crossAxisAlignment;
  }
}

/**
 * # @WrapRenderView 布局几何数据
 *   - 存储每一行的高度和宽度，以及子元素数量等信息，用于后续的布局计算。
 */
class RunMetrics {
  constructor(
    mainAxisExtent: number,
    crossAxisExtent: number,
    childCount: number
  ) {
    this.mainAxisExtent = mainAxisExtent;
    this.crossAxisExtent = crossAxisExtent;
    this.childCount = childCount;
  }
  mainAxisExtent: number = 0;
  crossAxisExtent: number = 0;
  childCount: number = 0;
}

class WrapParentData extends ContainerRenderViewParentData {
    runIndex: number = 0;
  }
export class WrapRenderView extends MultiChildRenderView {
    private _direction: Axis = Axis.horizontal;
    private _spacing: number = 0;
    private _runSpacing: number = 0;
    private _alignment: WrapAlignment = WrapAlignment.start;
    private _runAlignment: WrapAlignment = WrapAlignment.start;
    private _crossAxisAlignment: WrapCrossAlignment = WrapCrossAlignment.start;
  
    constructor(option: Partial<WrapOption>) {
      super();
      this.direction = option?.direction ?? Axis.horizontal;
      this.spacing = option?.spacing ?? 0;
      this.runSpacing = option?.runSpacing ?? 0;
      this.alignment = option?.alignment ?? WrapAlignment.start;
      this.runAlignment = option?.runAlignment ?? WrapAlignment.start;
      this.crossAxisAlignment =
        option?.crossAxisAlignment ?? WrapCrossAlignment.start;
    }
  
    get direction(): Axis {
      return this._direction;
    }
    set direction(value: Axis) {
      if (this._direction === value) {
        return;
      }
      this._direction = value;
      this.markNeedsLayout();
    }
    get spacing(): number {
      return this._spacing;
    }
    set spacing(value: number) {
      if (this._spacing === value) {
        return;
      }
      this._spacing = value;
      this.markNeedsLayout();
    }
    get runSpacing(): number {
      return this._runSpacing;
    }
    set runSpacing(value: number) {
      if (this._runSpacing === value) {
        return;
      }
      this._runSpacing = value;
      this.markNeedsLayout();
    }
    get alignment(): WrapAlignment {
      return this._alignment;
    }
    set alignment(value: WrapAlignment) {
      if (this._alignment === value) {
        return;
      }
      this._alignment = value;
      this.markNeedsLayout();
    }
    get runAlignment(): WrapAlignment {
      return this._runAlignment;
    }
    set runAlignment(value: WrapAlignment) {
      if (this._runAlignment === value) {
        return;
      }
      this._runAlignment = value;
      this.markNeedsLayout();
    }
    get crossAxisAlignment(): WrapCrossAlignment {
      return this._crossAxisAlignment;
    }
    set crossAxisAlignment(value: WrapCrossAlignment) {
      if (this._crossAxisAlignment === value) {
        return;
      }
      this._crossAxisAlignment = value;
      this.markNeedsLayout();
    }
  
    private getMainAxisExtent(size: Size): number {
      if (this.direction === Axis.horizontal) {
        return size.width;
      } else if (this.direction === Axis.vertical) {
        return size.height;
      }
    }
    private getOffset(mainAxisOffset: number, crossAxisOffset: number): Vector {
      switch (this.direction) {
        case Axis.horizontal:
          return new Vector(mainAxisOffset, crossAxisOffset);
        case Axis.vertical:
          return new Vector(crossAxisOffset, mainAxisOffset);
      }
    }
    private getCrossAxisExtent(size: Size): number {
      if (this.direction === Axis.horizontal) {
        return size.height;
      } else if (this.direction === Axis.vertical) {
        return size.width;
      }
    }
    private getChildCrossAxisOffset(
      runCrossAxisExtent: number,
      childCrossAxisExtent: number
    ): number {
      const freeSpace: number = runCrossAxisExtent - childCrossAxisExtent;
      switch (this.crossAxisAlignment) {
        case WrapCrossAlignment.start:
          return 0.0;
        case WrapCrossAlignment.end:
          return freeSpace;
        case WrapCrossAlignment.center:
          return freeSpace / 2.0;
      }
    }
    performLayout(): void {
      const constraints = this.constraints;
      let childConstraints: BoxConstraints = BoxConstraints.zero;
      let mainAxisLimit: number = 0;
      switch (this.direction) {
        case Axis.horizontal:
          childConstraints = new BoxConstraints({
            maxWidth: constraints.maxWidth,
          });
          mainAxisLimit = constraints.maxWidth;
          break;
        case Axis.vertical:
          childConstraints = new BoxConstraints({
            maxHeight: constraints.maxHeight,
          });
          mainAxisLimit = constraints.maxHeight;
          break;
      }
  
      let child: RenderView = this.firstChild;
      /**
       * 存储children的大小，用于计算axis=horizontal时，@mainAxisExtent 记录的是children的宽度之和，
       * 用于计算axis=vertical时，@mainAxisExtent 记录的是children的高度之和。
       * @crossAxisExtent 是 @mainAxisExtent 的交叉方向轴和，即axis=horizontal时，@crossAxisExtent 记录的是children的高度之和。
       */
      let mainAxisExtent: number = 0;
      let crossAxisExtent: number = 0;
      /**
       * 运行时宽度，用于判断是否超出宽度，超出则换行
       * 用于计算axis=horizontal时，@runMainAxisExtent 记录的是当前行的宽度之和，与 @mainAxisExtent 不同的是，@runMainAxisExtent 记录的是当前行宽度之和，在换行
       * 后会被归零，
       */
      let runMainAxisExtent: number = 0;
      let runCrossAxisExtent: number = 0;
      //当前处理main序列索引,每换行后重置为0;每处理一个元素，currentChildNdx+1;
      let currentChildNdx: number = 0;
      /**
       * 对于处理的一个单位（即不同方向时的不同列|行），记录其大小，用于计算每个单元的偏移量，并需要记录每个单元的个数，用于计算每行|列的宽度
       */
      const runMetrics: Array<RunMetrics> = [];
      while (child) {
        child.layout(childConstraints, true);
        const childSize = child.size;
        const childMainAxisExtent = this.getMainAxisExtent(childSize);
        const childCrossAxisExtent = this.getCrossAxisExtent(childSize);
        // 换行处理
        if (
          currentChildNdx > 0 &&
          runMainAxisExtent + childMainAxisExtent + this.spacing > mainAxisLimit
        ) {
          mainAxisExtent += runMainAxisExtent;
          crossAxisExtent += runCrossAxisExtent + this.runSpacing;
          runMetrics.push(
            new RunMetrics(runMainAxisExtent, runCrossAxisExtent, currentChildNdx)
          );
          runMainAxisExtent = 0;
          runCrossAxisExtent = 0;
          currentChildNdx = 0;
        }
        runMainAxisExtent += childMainAxisExtent;
        runCrossAxisExtent = Math.max(runCrossAxisExtent, childCrossAxisExtent);
        // 如果不是第一个元素，则需要加上间距
        if (currentChildNdx > 0) {
          runMainAxisExtent += this.spacing;
        }
        currentChildNdx += 1;
        const parentData = child.parentData as WrapParentData;
        parentData.runIndex = runMetrics.length;
        child = parentData.nextSibling;
      }
  
      //最后一行,如果currentChildNdx不为0，说明最新的一行
      if (currentChildNdx > 0) {
        mainAxisExtent += runMainAxisExtent;
        crossAxisExtent += runCrossAxisExtent;
        runMetrics.push(
          new RunMetrics(runMainAxisExtent, runCrossAxisExtent, currentChildNdx)
        );
      }
  
      let containerMainAxisExtent: number = 0;
      let containerCrossAxisExtent: number = 0;
      if (this.direction === Axis.horizontal) {
        this.size = constraints.constrain(
          new Size(mainAxisExtent, crossAxisExtent)
        );
        containerMainAxisExtent = this.size.width;
        containerCrossAxisExtent = this.size.height;
      } else if (this.direction === Axis.vertical) {
        this.size = constraints.constrain(
          new Size(crossAxisExtent, mainAxisExtent)
        );
        containerMainAxisExtent = this.size.height;
        containerCrossAxisExtent = this.size.width;
      }
      const runLen = runMetrics.length;
      const crossAxisFreeSpace = Math.max(
        0,
        containerCrossAxisExtent - crossAxisExtent
      );
  
      let runLeading: number = 0;
      let runBetween: number = 0;
      switch (this.runAlignment) {
        case WrapAlignment.start:
          break;
        case WrapAlignment.end:
          runLeading = crossAxisFreeSpace;
          break;
        case WrapAlignment.center:
          runLeading = crossAxisFreeSpace * 0.5;
          break;
        case WrapAlignment.spaceBetween:
          runBetween = crossAxisFreeSpace / (runLen - 1);
          break;
        case WrapAlignment.spaceAround:
          runBetween = crossAxisFreeSpace / runLen;
          runLeading = runBetween * 0.5;
          break;
        case WrapAlignment.spaceEvenly:
          runBetween = crossAxisFreeSpace / (runLen + 1);
          runLeading = runBetween;
          break;
      }
      runBetween += this.runSpacing;
      let crossAxisOffset: number = runLeading;
      child = this.firstChild;
      for (let i = 0; i < runLen; i++) {
        const run: RunMetrics = runMetrics[i];
        const runMainAxisExtent = run.mainAxisExtent;
        const runCrossAxisExtent = run.crossAxisExtent;
        const runChildCount = run.childCount;
        const mainAxisFreeSpace = Math.max(
          0,
          containerMainAxisExtent - runMainAxisExtent
        );
        let runMainLeading: number = 0;
        let runMainBetween: number = 0;
        switch (this.alignment) {
          case WrapAlignment.start:
            break;
          case WrapAlignment.end:
            runMainLeading = mainAxisFreeSpace;
            break;
          case WrapAlignment.center:
            runMainLeading = mainAxisFreeSpace * 0.5;
            break;
          case WrapAlignment.spaceBetween:
            runMainBetween = mainAxisFreeSpace / (runChildCount - 1);
            break;
          case WrapAlignment.spaceAround:
            runMainBetween = mainAxisFreeSpace / runChildCount;
            runMainLeading = runMainBetween * 0.5;
            break;
          case WrapAlignment.spaceEvenly:
            runMainBetween = mainAxisFreeSpace / (runChildCount + 1);
            runMainLeading = runMainBetween;
            break;
        }
        runMainBetween += this.spacing;
  
        let childMainPosition: number = runMainLeading;
        while (child) {
          const parentData = child.parentData as WrapParentData;
          if (parentData.runIndex !== i) {
            break;
          }
          const childSize = child.size;
          const childMainAxisExtent = this.getMainAxisExtent(childSize);
          const childCrossAxisExtent = this.getCrossAxisExtent(childSize);
          const crossOffset = this.getChildCrossAxisOffset(
            runCrossAxisExtent,
            childCrossAxisExtent
          );
          const offset = this.getOffset(
            childMainPosition,
            crossAxisOffset + crossOffset
          );
          childMainPosition += childMainAxisExtent;
          childMainPosition += runMainBetween;
          parentData.offset = offset;
          child = parentData.nextSibling;
        }
        crossAxisOffset += runCrossAxisExtent + runBetween;
      }
    }
    private applyPerformChild(): Size {
      return Size.zero;
    }
    protected setupParentData(child: RenderView): void {
      child.parentData = new WrapParentData();
    }
  }