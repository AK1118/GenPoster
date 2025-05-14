import { BuildContext } from "../basic/elements";
import {
  SingleChildRenderObjectWidget,
  SingleChildRenderObjectWidgetArguments,
} from "../basic/framework";
import { Clip, TextOverflow } from "../core/base-types";
import Vector from "../math/vector";
import { TextPainter, TextSpan, TextStyle } from "../painting/text-painter";
import { PaintingContext, SingleChildRenderView } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";

export interface TextArguments {
  style: TextStyle;
}

export class Text extends SingleChildRenderObjectWidget {
  private text: string;
  private style: TextStyle = new TextStyle({
    fontSize: 14,
  });
  constructor(
    text: string,
    option?: Partial<TextArguments & SingleChildRenderObjectWidgetArguments>
  ) {
    super(option?.child, option?.key);
    this.text = text;
    this.style = option?.style ?? this.style;
  }
  createRenderObject(): RenderView {
    return new ParagraphView({
      text: new TextSpan({
        text: this.text,
        textStyle: this.style,
      }),
    });
  }
  updateRenderObject(context: BuildContext, renderView: ParagraphView): void {
    renderView.text = new TextSpan({
      text: this.text,
      textStyle: this.style,
    });
  }
}

export interface TextRichArguments {
  textSpan: TextSpan;
}

export class TextRich extends SingleChildRenderObjectWidget {
  private textSpan: TextSpan;
  constructor(
    args: Partial<
      TextRichArguments & Omit<SingleChildRenderObjectWidgetArguments, "child">
    >
  ) {
    super(null, args.key);
    this.textSpan = args?.textSpan;
  }
  createRenderObject(): RenderView {
    return new ParagraphView({
      text: this.textSpan,
    });
  }
  updateRenderObject(context: BuildContext, renderView: ParagraphView): void {
    renderView.text = this.textSpan;
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
