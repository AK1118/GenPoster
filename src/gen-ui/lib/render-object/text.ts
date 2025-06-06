import Rect, { Size } from "../basic/rect";
import { AnimationController } from "../core/animation";
import { Clip, TextOverflow } from "../core/base-types";
import { Duration } from "../core/duration";
import { DownPointerEvent, PanZoomEndPointerEvent, PanZoomStartPointerEvent, PanZoomUpdatePointerEvent, PointerEvent } from "../gesture/events";
import { HitTestEntry, HitTestResult } from "../gesture/hit_test";
import PanDragGestureRecognizer from "../gesture/recognizers/pan-drag";
import TapGestureRecognizer from "../gesture/recognizers/tap";
import { Matrix4 } from "../math/matrix";
import Vector, { Offset } from "../math/vector";
import { Color, Colors } from "../painting/color";
import {Painter} from "../painting/painter";
import { TextPainter, TextSpan, TextStyle } from "../painting/text-painter";
import { CustomPainter } from "../rendering/custom";
import {
  TextEditingConnection,
  TextRange,
  TextSelection,
} from "../services/text-editing";
import MatrixUtils from "../utils/matrixUtils";
import { EditTextIndicatorPainter } from "../widgets/text";
import { BoxParentData, PaintingContext, SingleChildRenderView } from "./basic";
import { AbstractNode, RenderView } from "./render-object";

export class EditTextRenderView extends SingleChildRenderView {
  private _textPainter: TextPainter;
  private hightLightPainter: EditTextHightLightPainter;
  private indicatorPainter: EditTextIndicatorPainter;
  private _editingConnection: TextEditingConnection;
  private needClip: boolean;
  private onTap: TapGestureRecognizer;
  private onDrag: PanDragGestureRecognizer;
  private selection: TextSelection = TextSelection.empty;
  get textPainter(): TextPainter {
    return this._textPainter;
  }

  set textPainter(value: TextPainter) {
    this._textPainter = value;
    super.markNeedsLayout();
  }
  constructor(_editingConnection: TextEditingConnection, indicatorPainter: EditTextIndicatorPainter, textPainter: TextPainter) {
    super();
    this._editingConnection = _editingConnection;
    this.indicatorPainter = indicatorPainter;
    this.textPainter = textPainter;
  }
  protected dropChild(child: AbstractNode): void {
    super.dropChild(child);
    this.onTap = new TapGestureRecognizer();
    this.onTap.onTapDown = this.handleTapDown.bind(this);
    this.onDrag = new PanDragGestureRecognizer();
    // this.onDrag.onPanStart = this.handleDragStart.bind(this);
    // this.onDrag.onPanUpdate = this.handleDragUpdate.bind(this);
    // this.onDrag.onPanEnd = this.handleDragEnd.bind(this);
  }
  private handleDragStart(event: PanZoomStartPointerEvent) {
  }
  private handleDragUpdate(event: PanZoomUpdatePointerEvent) {
    const pointer_position = event.position;
    const currently_textPoint = this.textPainter.getTextPointForOffset(pointer_position);
    if (!currently_textPoint) return;
    let selectionIndex = currently_textPoint.parentData.index;
    this.selection = TextSelection.fromPosition(new Offset(this.selection.baseOffset, selectionIndex))
  }
  private handleDragEnd(event: PanZoomEndPointerEvent) {

  }
  get isRepaintBoundary(): boolean {
    return false;
  }
  private handleTapDown(event: DownPointerEvent) {
    const parentData: BoxParentData = this.parentData as BoxParentData;
    if (!parentData) return;
    const tapPosition: Vector = event.position;
    const transform: Matrix4 = this.getTransformTo().inverted();
    const transformedPosition = MatrixUtils.transformPoint(transform, tapPosition);
    const textPoint = this.textPainter.getTextPointForOffset(transformedPosition);

    if (!textPoint) return;
    let selectionIndex = textPoint.parentData.index;
    this._editingConnection.show();

    const textGeometry = textPoint.parentData.box;
    const isRightIndicator = this.isRightIndicator(textGeometry, transformedPosition);
    if (!isRightIndicator) {
      selectionIndex = Math.max(0, selectionIndex - 1);
    }
    const selection = new TextSelection(selectionIndex, selectionIndex);
    this._editingConnection.setSelection(selection);
    const [box] = this.textPainter.getTextBoxesForRange(selection);
    if (box) {
      this.handleUpdateIndicatorPositionByRect(box, transformedPosition);
    }
  }
  //指示器是否在文字右边
  private isRightIndicator(rect: Rect, position: Offset): boolean {
    const boxWidth = rect.width * .5;
    return position.x - rect.x > boxWidth;
  }
  private handleUpdateIndicatorPositionByRect(rect: Rect, position: Offset) {
    const boxWidth = rect.width * 0.5;
    const offset = rect.offset;

    // 判断偏移逻辑
    if (position.x - rect.x > boxWidth) {
      offset.x = rect.right;
    }

    this.indicatorPainter.offset = offset;// finalOffset;
    this.indicatorPainter.height = rect.height;
  }

  handleEvent(event: PointerEvent, entry: HitTestEntry): void {
    super.handleEvent(event, entry);
    if (event instanceof DownPointerEvent) {
      this.onTap.addPointer(event);
      this.onDrag.addPointer(event);
    }
  }
  performLayout(): void {
    if (!this.hightLightPainter) {
      this.hightLightPainter = new EditTextHightLightPainter(this.textPainter);
      this.hightLightPainter.addListener(() => {
        this.markNeedsPaint();
      });
      this.indicatorPainter.addListener(() => {
        this.markNeedsPaint();
      });
    }
    this.textPainter.layout(
      this.constraints.minWidth,
      this.constraints.maxWidth
    );
    const textSize = this.textPainter.size;
    this.size = this.constraints.constrain(textSize);
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
          this.hightLightPainter.render(context?.paint, this.size);
          this.textPainter.paint(context?.paint, offset);
          this.indicatorPainter.render(context?.paint, this.size);
        }
      );
    } else {
      this.hightLightPainter.render(context?.paint, this.size);
      this.textPainter.paint(context?.paint, offset);
      this.indicatorPainter.parentOffset = offset;
      this.indicatorPainter.render(context?.paint, this.size);
    }
    super.render(context, offset);
  }
  debugRender(context: PaintingContext, offset?: Offset): void {
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
          this.hightLightPainter.render(context?.paint, this.size);
          this.textPainter.paint(context?.paint, offset, true);
          this.indicatorPainter.render(context?.paint, this.size);
        }
      );
    } else {
      this.hightLightPainter.render(context?.paint, this.size);
      this.textPainter.paint(context?.paint, offset, true);
      this.indicatorPainter.parentOffset = offset;
      this.indicatorPainter.render(context?.paint, this.size);
    }
  }
}

class EditTextHightLightPainter extends CustomPainter {
  private textPainter: TextPainter;
  private _textRange: TextRange = TextRange.zero;
  private _hightLightColor: Color = Colors.blue.withOpacity(0.5);
  constructor(textPainter: TextPainter) {
    super();
    this.textPainter = textPainter;
  }
  set textRange(value: TextRange) {
    this._textRange = value;
    this.notifyListeners();
  }
  get textRange(): TextRange {
    return this._textRange;
  }
  render(painter: Painter, size: Size): void {
    const boxes = this.textPainter.getTextBoxesForRange(new TextSelection(
      this.textRange.start,
      this.textRange.end
    ));
    painter.save();
    painter.fillStyle = this._hightLightColor.rgba;
    boxes.forEach((box) => {
      const rect = box;
      painter.fillRect(rect.x, rect.y, rect.width, rect.height);
    });
    painter.restore();
  }
}

