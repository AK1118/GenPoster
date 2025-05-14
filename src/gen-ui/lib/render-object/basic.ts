import Painter from "@/lib/painting/painter";
import Alignment from "@/lib/painting/alignment";
import Rect, { Offset, Size } from "@/lib/basic/rect";
import Constraints, { BoxConstraints } from "@/lib/rendering/constraints";
import Vector from "@/lib/math/vector";
import { TextPainter, TextSpan } from "../painting/text-painter";
import { PipelineOwner, RendererBinding } from "../basic/binding";
import { Widget } from "../basic/framework";
import {
  HitTestEntry,
  HitTestResult,
  HitTestTarget,
} from "../gesture/hit_test";
import {
  CancelPointerEvent,
  DownPointerEvent,
  MovePointerEvent,
  PointerEvent,
  SignalPointerEvent,
  UpPointerEvent,
} from "../gesture/events";
import { Matrix, Matrix4 } from "../math/matrix";
import MatrixUtils from "../utils/matrixUtils";
import { BoxDecoration } from "../painting/decoration";
import {
  ImageDecoration,
  ImageDecorationArguments,
  ImageDecorationPainter,
} from "../painting/image";
import { ChangeNotifier } from "../core/change-notifier";
import {
  LayerHandler,
  OffsetLayer,
  ParentData,
  RenderView,
} from "./render-object";
import { ScrollPosition, ViewPortOffset } from "./viewport";
import {
  Axis,
  Clip,
  CrossAxisAlignment,
  MainAxisAlignment,
  MainAxisSize,
  Radius,
  StackFit,
  TextOverflow,
  WrapAlignment,
  WrapCrossAlignment,
} from "../core/base-types";
import { CustomClipper, CustomPainter } from "../rendering/custom";
import { Path2D } from "../rendering/path-2D";
import { Color } from "../painting/color";
import { BorderRadius } from "../painting/radius";
import { GenPlatformConfig } from "../core/platform";
import { EdgeInsets, EdgeInsetsGeometry } from "../painting/edge-insets";
import { AssertionError, LayoutAssertion } from "../core/errors";

export interface RenderViewOption {
  child: RenderBox;
}

export interface SingleChildRenderViewArguments<ChildType = RenderBox> {
  child: ChildType;
}

export interface MultiChildRenderViewOption {
  children: RenderBox[];
}


export interface BoundsRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoundsRRect extends BoundsRect {
  radii: number | Iterable<number>;
}

export interface ClipRectArguments {
  clipBehavior: Clip;
}

export interface ClipRRectArguments extends ClipRectArguments {
  borderRadius: BorderRadius;
}

export interface FlexOption {
  direction: Axis;
  mainAxisAlignment: MainAxisAlignment;
  crossAxisAlignment: CrossAxisAlignment;
  spacing: number;
  mainAxisSize: MainAxisSize;
}

export interface LayoutSizes {
  mainSize: number;
  crossSize: number;
  allocatedSize: number;
}

export interface ExpandedArguments {
  flex: number;
}
export interface StackOption {
  fit: StackFit;
  alignment: Alignment;
}
export interface RectTLRB<T = number> {
  left: T;
  right: T;
  top: T;
  bottom: T;
}


export interface WrapOption {
  direction: Axis;
  spacing: number;
  runSpacing: number;
  alignment: WrapAlignment;
  runAlignment: WrapAlignment;
  crossAxisAlignment: WrapCrossAlignment;
}

export class BoxParentData extends ParentData {
  offset: Vector = Vector.zero;
}

export class ContainerRenderViewParentData<
  ChildType extends RenderView = RenderView
> extends BoxParentData {
  previousSibling?: ChildType;
  nextSibling?: ChildType;
}

export class FlexParentData extends ContainerRenderViewParentData<RenderView> {
  private _flex: number;
  public node: any;
  get flex(): number {
    return this._flex;
  }
  set flex(value: number) {
    this._flex = value;
  }
  constructor() {
    super();
  }
}

export abstract class RenderBox extends RenderView {
  protected _renderOffset: Offset = Offset.zero;
  get renderBounds(): Rect {
    return Rect.compose(this._renderOffset, this.size);
  }
  protected constraints: BoxConstraints = BoxConstraints.zero;
  layout(constraints: BoxConstraints, parentUseSize?: boolean): void {
    this.constraints = constraints;
    if (this.needsReLayout || parentUseSize) {
      this.performLayout();
    }
    this.needsReLayout = false;
    this.markNeedsPaint();
  }
  attach(owner: Object): void {
    super.attach(owner);
    if (!owner) return;
    this.needsReLayout = false;
    this.markNeedsLayout();
  }
  protected setupParentData(child: RenderView): void {
    child.parentData = new BoxParentData();
  }
  performResize(): void {
    this.performLayout();
  }
  computeDryLayout(constrains: BoxConstraints): Size {
    return Size.zero;
  }
  getDryLayout(constrains: BoxConstraints): Size {
    return this.computeDryLayout(constrains);
  }
  public hitTest(result: HitTestResult, position: Vector): boolean {
    if (this.hitTestSelf(result, position)) {
      const isHit =
        this.hitTestChildren(result, position) ||
        this.hitTestSelf(result, position);
      if (isHit) {
        result.add(new HitTestEntry(this));
        return true;
      }
    }
    return false;
  }
  public hitTestChildren(result: HitTestResult, position: Vector): boolean {
    // 调用默认方法处理子对象的碰撞检测
    return this.defaultHitTestChildren(result, position);
  }
  public hitTestSelf(result: HitTestResult, position: Vector): boolean {
    return this.size.contains(position);
  }
  protected defaultHitTestChildren(
    result: HitTestResult,
    position: Vector,
    transform: Matrix4 = Matrix4.zero.identity()
  ): boolean {
    let child = this.child;
    while (child != null) {
      const parentData =
        child.parentData as ContainerRenderViewParentData<RenderView>;
      let transformed = Vector.sub(position, parentData.offset);
      transformed = MatrixUtils.transformPoint(transform, transformed);
      const isHit = child.hitTest(result, transformed);
      if (isHit) {
        return true;
        // result.add(new HitTestEntry(child));
      }
      child = parentData?.nextSibling;
    }
    return false;
  }
  applyPaintTransform(child: RenderView, transform: Matrix4): void {
    const childParentData = child?.parentData as BoxParentData;
    const offset: Vector = childParentData.offset;
    transform.translate(offset.x, offset.y);
  }
}

//parentData设置
export abstract class ParentDataRenderView<
  P extends ParentData = ParentData
> extends RenderBox {
  public parentData: P;
  constructor(child?: RenderBox) {
    super();
    this.child = child;
  }
  abstract applyParentData(renderObject: RenderView): void;
  updateParentData() {
    if (this.parentData) {
      this.applyParentData(this);
    }
  }
  layout(constraints: BoxConstraints, parentUseSize?: boolean): void {
    super.layout(constraints, parentUseSize);
    if (this.child) {
      this.child.layout(constraints, parentUseSize);
      this.size = (this.child as unknown as SingleChildRenderView).size;
    } else {
      this.size = constraints.constrain(Size.zero);
    }
    this.performLayout();
  }
  /**
   * @mustCallSuper
   */
  performLayout(): void {}
  render(context: PaintingContext, offset?: Vector) {
    context.paintChild(this.child!, offset);
  }
  debugRender(context: PaintingContext, offset?: Vector): void {
    context.paintChildDebug(this.child!, offset);
    context.paintDefaultDebugBoundary(offset, this.child?.size ?? Size.zero);
  }
}

export abstract class SingleChildRenderView extends RenderBox {
  constructor(child?: RenderBox) {
    super();
    this.child = child;
  }
  debugRender(context: PaintingContext, offset?: Vector): void {
    if (this.child) {
      const parentData: BoxParentData = this.child?.parentData as BoxParentData;
      let resultOffset = Vector.zero;
      if (offset && parentData) {
        resultOffset = Vector.add(offset, parentData.offset);
      }
      context.paintChildDebug(this.child!, resultOffset);
    }
    this.checkRenderBoundary(context, offset);
  }
  render(context: PaintingContext, offset?: Vector) {
    this._renderOffset = offset;
    if (this.child) {
      const parentData: BoxParentData = this.child?.parentData as BoxParentData;
      let resultOffset = Vector.zero;
      if (offset && parentData) {
        resultOffset = Vector.add(offset, parentData.offset);
      }
      context.paintChild(this.child!, resultOffset);
    }
    this.checkRenderBoundary(context, offset);
  }
  /**
   * # 检查边界溢出情况，并绘制超出部分
   *   - 绘制超出父容器部分的背景色域，并绘制条纹效果
   *   - 检测范围 [RenderBox] ,它不具备滚动特性。
   * @param context
   * @param offset
   * @returns
   */
  private checkRenderBoundary(context: PaintingContext, offset: Offset) {
    if (!this.parent || !(this.parent instanceof RenderBox)) return;
    const parentSize = this.parent.renderBounds;
    const { x, y } = offset;
    const { width, height } = this.size;
    const {
      width: maxWidth,
      height: maxHeight,
      x: parentX,
      y: parentY,
    } = parentSize;
    const paint = context.paint;

    paint.save();
    paint.fillStyle = "yellow";
    // 下方溢出 (Bottom Overflow)
    const bottomOverflow = height - maxHeight;
    if (bottomOverflow > 0) {
      const paintAlertOffset = y + height - bottomOverflow - 20;
      paint.fillRect(x, paintAlertOffset, width, 20);
      this.drawSkewedStripes(
        paint,
        x,
        paintAlertOffset,
        width,
        bottomOverflow,
        "vertical"
      );
    }

    // 上方溢出 (Top Overflow)
    // if (y < 0) {
    //   console.log("上方溢出", this);
    //   paint.fillRect(x, y, width, Math.abs(y));
    //   this.drawSkewedStripes(paint, x, y, width, Math.abs(y), "vertical");
    // }

    // 左侧溢出 (Left Overflow)
    // console.log(x)
    // if (x < 0) {
    //   console.log("左侧溢出", this);
    //   paint.fillRect(x, y, Math.abs(x), height);
    //   this.drawSkewedStripes(paint, x, y, Math.abs(x), height, "horizontal");
    // }

    // 右侧溢出 (Right Overflow)
    const rightOverflow = width - maxWidth;
    if (rightOverflow > 0) {
      const paintAlertOffset = x + width - rightOverflow - 20;
      paint.fillRect(paintAlertOffset, y, 20, height);
      this.drawSkewedStripes(
        paint,
        paintAlertOffset,
        y,
        rightOverflow,
        height,
        "horizontal"
      );
    }
    paint.restore();
  }

  /**
   * 绘制倾斜的条纹用于警示溢出区域
   * @param paint 画笔对象
   * @param x 溢出矩形的 x 坐标
   * @param y 溢出矩形的 y 坐标
   * @param width 溢出区域宽度
   * @param height 溢出区域高度
   * @param direction "horizontal" | "vertical"
   */
  private drawSkewedStripes(
    paint: Painter,
    x: number,
    y: number,
    width: number,
    height: number,
    direction: "horizontal" | "vertical"
  ) {
    paint.save();
    paint.rect(x, y, width, height);
    paint.clip();
    paint.fillStyle = "black";
    const translate = new Matrix4();
    if (direction === "vertical") {
      translate.translate(0, y).skewX(-0.8);
      paint.transform(translate.matrix);
      for (let i = 0; i < width / 10 + 1; i++) {
        paint.fillRect(x, 0, 10, 20);
        paint.translate(20, 0);
      }
    } else {
      translate.translate(x, 0).skewY(-0.8);
      paint.transform(translate.matrix);
      for (let i = 0; i < height / 10 + 1; i++) {
        paint.save();
        paint.fillRect(0, y, 20, 10);
        paint.restore();
        paint.translate(0, 20);
      }
    }
    paint.restore();
  }

  performLayout(): void {
    if (this.child) {
      this.child.layout(this.constraints, true);
      this.size = (this.child as unknown as SingleChildRenderView).size;
    } else {
      this.size = this.constraints.constrain(Size.zero);
    }
    if (!this.layerHandler) {
      this.layerHandler = new LayerHandler<OffsetLayer>();
      this.layerHandler.layer = new OffsetLayer(Vector.zero);
    }
    const parentData = this
      .parentData as ContainerRenderViewParentData<RenderView>;
    if (parentData) {
      const offset = parentData?.offset;
      this.layerHandler.layer.offset = offset || Vector.zero;
    }
  }
  layout(constraints: BoxConstraints, parentUseSize?: boolean): void {
    super.layout(constraints, parentUseSize);
  }
}

export class LimitedBoxRender extends SingleChildRenderView {
  private _maxWidth: number;
  private _maxHeight: number;
  constructor(maxWidth?: number, maxHeight?: number, child?: RenderBox) {
    super(child);
    this._maxWidth = maxWidth;
    this._maxHeight = maxHeight;
  }
  get maxWidth(): number {
    return this._maxWidth;
  }
  get maxHeight(): number {
    return this._maxHeight;
  }
  setMaxSize(maxWidth: number, maxHeight: number) {
    this._maxWidth = maxWidth;
    this._maxHeight = maxHeight;
    this.markNeedsLayout();
    this.markNeedsPaint();
  }
  performLayout(): void {
    if (this.child) {
      const constrain = this.constraints.enforce(
        BoxConstraints.tightFor(this.maxWidth, this.maxHeight)
      );
      this.child.layout(constrain);
      this.size = this.child.size;
    } else {
      this.size = BoxConstraints.tightFor(this.maxWidth, this.maxHeight)
        .enforce(this.constraints.loosen())
        .constrain(Size.zero);
    }
  }
}


export abstract class ClipContext {
  private _paint: Painter;
  constructor(paint: Painter) {
    this._paint = paint;
  }
  get paint(): Painter {
    return this._paint;
  }
  private clipAndPaint(
    clipCall: VoidFunction,
    clipBehavior: Clip,
    paintClipPath: VoidFunction,
    painter: VoidFunction,
    bounds: BoundsRect
  ) {
    this.paint.save();
    if (clipBehavior != Clip.none) {
      paintClipPath();
      clipCall();
    }
    painter();
    this.paint.restore();
  }

  public clipRRectAndPaint(
    clipBehavior: Clip,
    bounds: BoundsRRect,
    painter: VoidFunction
  ) {
    this.clipAndPaint(
      () => this.paint.clip(),
      clipBehavior,
      () => {
        const { x, y, width, height, radii } = bounds;
        this.paint.roundRect(x, y, width, height, radii);
      },
      painter,
      bounds
    );
  }

  public clipRectAndPaint(
    clipBehavior: Clip,
    bounds: BoundsRect,
    painter: VoidFunction
  ) {
    this.clipAndPaint(
      () => this.paint.clip(),
      clipBehavior,
      () => {
        const { x, y, width, height } = bounds;
        this.paint.rect(x, y, width, height);
      },
      painter,
      bounds
    );
  }

  public clipPath(
    clipBehavior: Clip,
    bounds: BoundsRect,
    clipPath: Path2D,
    painter: VoidFunction
  ) {
    this.clipAndPaint(
      () => this.paint.clip(),
      clipBehavior,
      () => {
        clipPath.render(this.paint, new Size(bounds.width, bounds.height));
      },
      painter,
      bounds
    );
  }
}

export class PaintingContext extends ClipContext {
  private estimatedBounds: Rect;
  constructor(paint: Painter, estimatedBounds: Rect) {
    super(paint);
    this.estimatedBounds = estimatedBounds;
  }
  paintChildDebug(child: RenderView, offset: Vector = Vector.zero): void {
    child?.debugRender(this, offset);
  }
  paintChild(child: RenderView, offset: Vector = Vector.zero): void {
    child?.paintWidthContext(this, offset);
  }
  /**
   * 使用该方法将child矩形矩阵转换
   * @effectiveTransform 矩阵来自偏移矩阵+效果矩阵，原点为(0,0)，这意味着在使用
   * transform 之前需要将原点移动到 @offset 位置，并在变换完毕后将原点移动回来
   */
  pushTransform(offset: Vector, transform: Matrix4, render: VoidFunction) {
    const effectiveTransform = Matrix4.zero
      .identity()
      .translate(offset.x, offset.y)
      .multiply(transform)
      .translate(-offset.x, -offset.y);
    let matrix = effectiveTransform.matrix;
    this.paint.save();
    this.paint.beginPath();
    this.paint.transform(matrix);
    render();
    this.paint.closePath();
    this.paint.restore();
  }
  paintDefaultDebugBoundary(offset: Vector, size: Size) {
    this.paint.strokeStyle = "orange";
    this.paint.strokeRect(offset.x, offset.y, size.width, size.height);
  }
  paintEmptyDebugBoundary(offset: Vector, size: Size) {
    const space = 30;
    const count = ~~(size.width / space);
    for (let i = 0; i < count + 1; i++) {
      this.paint.strokeStyle = "rgba(31, 137, 219,.01)";
      this.paint.moveTo(i * space, offset.y);
      this.paint.lineTo(i * space, offset.y + size.height);
      this.paint.moveTo(offset.x, i * space);
      this.paint.lineTo(offset.x + size.width, i * space);
      this.paint.stroke();
    }
  }
}

export abstract class ContainerRenderViewDelegate<
  ChildType extends RenderView,
  ParentDataType extends ContainerRenderViewParentData<ChildType>
> extends RenderBox {
  protected lastChild: ChildType;
  protected firstChild: ChildType;
  protected childCount: number = 0;
  constructor(children?: ChildType[]) {
    super();
    if (children) {
      this.addAll(children);
    }
  }
  protected defaultHitTestChildren(
    result: HitTestResult,
    position: Vector,
    transform: Matrix4 = Matrix4.zero.identity()
  ): boolean {
    let child = this.lastChild;
    while (child != null) {
      const parentData = child.parentData as ParentDataType;
      let transformed = Vector.sub(position, parentData.offset);
      transformed = MatrixUtils.transformPoint(transform, transformed);
      const isHit = child.hitTest(result, transformed);
      if (isHit) {
        return true;
      }
      child = parentData?.previousSibling;
    }
    return false;
  }
  public addAll(value: ChildType[]) {
    value?.forEach((_) => this.insert(_, this.lastChild));
  }
  public insert(renderView: ChildType, after?: ChildType) {
    //设置父节点
    this.adoptChild(renderView);
    //插入兄弟列表
    this.insertIntoList(renderView, after);
    this.childCount += 1;
  }
  remove(child: RenderView) {
    this.removeFromChildList(child);
    this.dropChild(child);
  }
  private removeFromChildList(child: RenderView) {
    const childParentData = child.parentData! as ParentDataType;
    if (this.childCount <= 0) return;
    if (childParentData.previousSibling == null) {
      this.firstChild = childParentData.nextSibling;
    } else {
      const childPreviousSiblingParentData = childParentData.previousSibling!
        .parentData! as ParentDataType;
      childPreviousSiblingParentData.nextSibling = childParentData.nextSibling;
    }
    if (childParentData.nextSibling == null) {
      this.lastChild = childParentData.previousSibling;
    } else {
      const childNextSiblingParentData = childParentData.nextSibling!
        .parentData! as ParentDataType;
      childNextSiblingParentData.previousSibling =
        childParentData.previousSibling;
    }
    childParentData.previousSibling = null;
    childParentData.nextSibling = null;
    this.childCount -= 1;
  }
  private insertIntoList(child: ChildType, after?: ChildType) {
    let currentParentData = child.parentData as ParentDataType;
    let firstChildParentData = this.firstChild?.parentData as ParentDataType;
    let afterParentData = after?.parentData as ParentDataType;
    if (after == null) {
      this.firstChild = child;
      this.lastChild = child;
    } else {
      if (!firstChildParentData?.nextSibling && this.firstChild) {
        firstChildParentData.nextSibling = child;
        this.firstChild.parentData = firstChildParentData!;
      }
      afterParentData.nextSibling = child;
      after.parentData = afterParentData;
      currentParentData.previousSibling = after;
      child.parentData = currentParentData;
      this.lastChild = child;
    }
  }
  protected parentDataOf(child: RenderView): ParentDataType {
    return child.parentData as ParentDataType;
  }
  visitChildren(visitor: (child: RenderView) => void): void {
    let child = this.firstChild;
    while (child != null) {
      const parentData = child.parentData as ParentDataType;
      visitor(child);
      child = parentData?.nextSibling;
    }
  }
}

export abstract class MultiChildRenderView<
  ChildType extends RenderView = RenderView,
  ParentDataType extends ContainerRenderViewParentData<ChildType> = ContainerRenderViewParentData<ChildType>
> extends ContainerRenderViewDelegate<ChildType, ParentDataType> {
  render(context: PaintingContext, offset?: Vector): void {
    this.defaultRenderChild(context, offset);
  }

  debugRender(context: PaintingContext, offset?: Vector): void {
    this.defaultRenderChildDebug(context, offset);
  }
  layout(constraints: BoxConstraints): void {
    super.layout(constraints);
    this.performLayout();
  }
  performLayout(): void {
    this.size = this.constraints.constrain(Size.zero);
    let child = this.firstChild;
    while (child != null) {
      const parentData = this.parentDataOf(child);
      this.performLayoutChild(child, this.constraints);
      child = parentData?.nextSibling;
    }
  }
  performLayoutChild(child: RenderView, constraints: BoxConstraints): void {
    child.layout(constraints);
  }
  protected getChildList(): RenderView[] {
    const children: RenderView[] = [];
    let child = this.firstChild;
    while (child != null) {
      const parentData = this.parentDataOf(child);
      children.push(child);
      child = parentData?.nextSibling;
    }
    return children;
  }
  protected defaultRenderChild(context: PaintingContext, offset?: Vector) {
    let child = this.firstChild;
    while (child != null) {
      const parentData = this.parentDataOf(child);
      context.paintChild(
        child,
        Vector.add(parentData.offset ?? Vector.zero, offset ?? Vector.zero)
      );
      child = parentData?.nextSibling;
    }
  }

  protected defaultRenderChildDebug(context: PaintingContext, offset?: Vector) {
    let child = this.firstChild;
    while (child != null) {
      const parentData = this.parentDataOf(child);
      context.paintChildDebug(
        child,
        Vector.add(parentData.offset ?? Vector.zero, offset ?? Vector.zero)
      );
      child = parentData?.nextSibling;
    }
  }
  public hitTest(result: HitTestResult, position: Vector): boolean {
    return super.hitTest(result, position);
  }
}
export interface ParagraphViewOption {
  text: TextSpan;
}

export class ParagraphView extends SingleChildRenderView {
  private textPainter: TextPainter;
  private _text: TextSpan;
  private needClip: boolean;
  constructor(option?: ParagraphViewOption) {
    super();
    const { text } = option;
    this.text = text;
  }
  set text(text: TextSpan) {
    if (this._text === text) return;
    if (this._text?.text === text?.text) return;

    this._text = text;
    this.markNeedsLayout();
    this.markNeedsPaint();
  }

  get text(): TextSpan {
    return this._text;
  }
  performLayout(): void {
    this.textPainter = new TextPainter(this.text);
    this.textPainter.layout(
      this.constraints.minWidth,
      this.constraints.maxWidth
    );
    const textSize = this.textPainter.size;
    this.size = this.constraints.constrain(textSize);

    switch (this.text.style.getTextStyle().overflow) {
      case TextOverflow.clip:
        this.needClip =
          textSize.height > this.size.height ||
          textSize.width > this.size.width;
        break;
      case TextOverflow.ellipsis:
      case TextOverflow.visible:
    }
  }
  render(context: PaintingContext, offset?: Vector): void {
    if (!context.paint) return;
    if (this.needClip) {
      context.clipRectAndPaint(
        Clip.antiAlias,
        {
          x: offset?.x ?? 0,
          y: offset?.y ?? 0,
          width: this.size.width,
          height: this.size.height,
        },
        () => {
          this.textPainter.paint(context?.paint, offset);
        }
      );
    } else {
      this.textPainter.paint(context?.paint, offset);
    }
  }
  debugRender(context: PaintingContext, offset?: Vector): void {
    if (this.needClip) {
      context.clipRectAndPaint(
        Clip.antiAlias,
        {
          x: offset?.x ?? 0,
          y: offset?.y ?? 0,
          width: this.size.width,
          height: this.size.height,
        },
        () => {
          this.textPainter.paint(context.paint, offset, true);
          context.paintDefaultDebugBoundary(offset, this.size);
        }
      );
    } else {
      this.textPainter.paint(context.paint, offset, true);
    }
    super.debugRender(context, offset);
  }
}

export class RootRenderView extends SingleChildRenderView {
  get isRepaintBoundary(): boolean {
    return true;
  }
  scheduleFirstFrame() {
    this.markNeedsLayout();
    this.markNeedsPaint();
  }
}

export class StatefulRenderView extends SingleChildRenderView {
  get isRepaintBoundary(): boolean {
    return true;
  }
}

export class StatelessRenderView extends SingleChildRenderView {
  get isRepaintBoundary(): boolean {
    return true;
  }
  public markRepaint() {
    this.markNeedsPaint();
  }
}

export class PlaceholderRenderView extends SingleChildRenderView {}


export type onPointerDownCallback = (event: DownPointerEvent) => void;
export type onPointerMoveCallback = (event: MovePointerEvent) => void;
export type onPointerUpCallback = (event: UpPointerEvent) => void;
export type onPointerCancelCallback = (event: UpPointerEvent) => void;
export type onSignalPointerCallback = (event: SignalPointerEvent) => void;

export interface RenderPointerListenerArguments {
  onPointerDown: onPointerDownCallback;
  onPointerMove: onPointerMoveCallback;
  onPointerUp: onPointerUpCallback;
  onPointerCancel: onPointerCancelCallback;
  onSignalPointer: onSignalPointerCallback;
}

export class RenderPointerListener extends SingleChildRenderView {
  private _onPointerDown: onPointerDownCallback;
  private _onPointerMove: onPointerMoveCallback;
  private _onPointerUp: onPointerUpCallback;
  private _onPointerCancel: onPointerCancelCallback;
  private _onSignalPointer: onSignalPointerCallback;

  set onSignalPointer(value: onSignalPointerCallback) {
    this._onSignalPointer = value;
  }

  set onPointerDown(value: onPointerDownCallback) {
    this._onPointerDown = value;
  }
  set onPointerMove(value: onPointerMoveCallback) {
    this._onPointerMove = value;
  }
  set onPointerUp(value: onPointerUpCallback) {
    this._onPointerUp = value;
  }
  set onPointerCancel(value: onPointerCancelCallback) {
    this._onPointerCancel = value;
  }

  constructor(
    option: Partial<
      RenderPointerListenerArguments & SingleChildRenderViewArguments
    >
  ) {
    super(option?.child);
    this._onPointerDown = option?.onPointerDown;
    this._onPointerMove = option?.onPointerMove;
    this._onPointerUp = option?.onPointerUp;
    this._onPointerCancel = option?.onPointerCancel;
    this._onSignalPointer = option?.onSignalPointer;
  }
  handleEvent(event: PointerEvent, entry: HitTestEntry): void {
    if (event instanceof DownPointerEvent) {
      this._onPointerDown?.(event);
    } else if (event instanceof MovePointerEvent) {
      this._onPointerMove?.(event);
    } else if (event instanceof UpPointerEvent) {
      this._onPointerUp?.(event);
    } else if (event instanceof CancelPointerEvent) {
      this._onPointerCancel?.(event);
    } else if (event instanceof SignalPointerEvent) {
      this._onSignalPointer?.(event);
    }
  }
  public hitTestSelf(result: HitTestResult, position: Vector): boolean {
    return this.hitTestChildren(result, position);
  }
}