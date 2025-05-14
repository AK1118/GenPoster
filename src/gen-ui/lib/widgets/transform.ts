import { BuildContext } from "../basic/elements";
import {
  SingleChildRenderObjectWidget,
  SingleChildRenderObjectWidgetArguments,
} from "../basic/framework";
import { HitTestResult } from "../gesture/hit_test";
import { Matrix4 } from "../math/matrix";
import Vector from "../math/vector";
import Alignment from "../painting/alignment";
import {
  ContainerRenderViewParentData,
  PaintingContext,
  SingleChildRenderView,
  SingleChildRenderViewArguments,
} from "../render-object/basic";
import { RenderView } from "../render-object/render-object";
import MatrixUtils from "../utils/matrixUtils";

export interface TransformRotateArguments {
  angle: number;
  origin: Vector;
  alignment: Alignment;
  angleX: number;
  angleY: number;
}

export interface TransformScaleArguments {
  scale: number;
  scaleX: number;
  scaleY: number;
  alignment: Alignment;
  origin: Vector;
}

export interface TransformSkewArguments {
  skewX: number;
  skewY: number;
}

export interface TransformTranslateArguments {
  x: number;
  y: number;
}
export class Transform extends SingleChildRenderObjectWidget {
  private _transform: Matrix4;
  private origin: Vector;
  private alignment: Alignment;
  constructor(
    option: Partial<RenderTransformArguments & SingleChildRenderObjectWidget>
  ) {
    super(option?.child, option.key);
    this._transform = option.transform ?? Matrix4.zero;
    this.origin = option.origin;
    this.alignment = option.alignment;
  }
  createRenderObject(): RenderView {
    return new RenderTransformBox({
      transform: this._transform,
      origin: this.origin,
      alignment: this.alignment,
    });
  }
  updateRenderObject(
    context: BuildContext,
    renderView: RenderTransformBox
  ): void {
    renderView.transform = this._transform;
    renderView.origin = this.origin;
    renderView.alignment = this.alignment;
  }

  static rotate(
    option: Partial<
      TransformRotateArguments & SingleChildRenderObjectWidgetArguments
    >
  ): Transform {
    const { angleX, angleY, angle } = option;
    const transform: Matrix4 = Matrix4.zero.identity();
    if (angle) {
      transform.rotateZ(angle);
    }
    if (angleY) {
      transform.rotateY(angleY);
    }
    if (angleX) {
      transform.rotateX(angleX);
    }
    return new Transform({
      child: option?.child,
      transform: transform,
      alignment: option?.alignment,
      origin: option?.origin,
    });
  }
  static translate(
    option: Partial<
      TransformTranslateArguments & SingleChildRenderObjectWidgetArguments
    >
  ): Transform {
    const { x, y } = option;
    const transform = Matrix4.zero.identity();
    transform.translate(x, y);
    return new Transform({
      transform,
      child: option?.child,
    });
  }
  static skew(
    option: Partial<
      TransformSkewArguments & SingleChildRenderObjectWidgetArguments
    >
  ): Transform {
    const { skewX = 0, skewY = 0 } = option;
    const transform = Matrix4.skew(skewX, skewY);
    return new Transform({
      child: option?.child,
      transform: transform,
    });
  }
  static scale(
    option: Partial<
      TransformScaleArguments & SingleChildRenderObjectWidgetArguments
    >
  ): Transform {
    const { scaleX = 1, scaleY = 1, scale, origin, alignment } = option;
    const transform: Matrix4 = Matrix4.zero;
    transform.scale(scaleX, scaleY);
    if (scale) {
      transform.scale(scale, scale);
    }
    transform.setValue(15, 1);
    return new Transform({
      child: option?.child,
      transform,
      alignment,
      origin,
    });
  }
}

export interface RenderTransformArguments {
  transform: Matrix4;
  origin: Vector;
  alignment: Alignment;
}

export class RenderTransformBox extends SingleChildRenderView {
  private _transform: Matrix4 = Matrix4.zero;
  private _origin: Vector;
  private _alignment: Alignment;
  set alignment(value: Alignment) {
    this._alignment = value;
    this.markNeedsPaint();
  }
  get alignment(): Alignment {
    return this._alignment;
  }
  set origin(value: Vector) {
    this._origin = value;
    this.markNeedsPaint();
  }
  get origin(): Vector {
    return this._origin;
  }
  set transform(value: Matrix4) {
    this._transform = value;
    this.markNeedsPaint();
  }
  get transform(): Matrix4 {
    return this._transform;
  }
  constructor(
    option: Partial<RenderTransformArguments & SingleChildRenderViewArguments>
  ) {
    super(option?.child);
    this.transform = option?.transform;
  }

  render(context: PaintingContext, offset?: Vector): void {
    if (this.child) {
      const childOffset = MatrixUtils.getAsTranslation(this.effectiveTransform);
      //检测是否只是平移
      if (childOffset == null || Vector.zero.equals(childOffset)) {
        context.pushTransform(offset, this.effectiveTransform, () => {
          context.paintChild(this.child, offset);
        });
      } else {
        super.render(context, childOffset.add(offset));
      }
    }
  }
  public hitTest(result: HitTestResult, position: Vector): boolean {
    return this.hitTestChildren(result, position);
  }
  /**
   */
  public hitTestChildren(result: HitTestResult, position: Vector): boolean {
    const childParentData = this.child
      ?.parentData as ContainerRenderViewParentData;
    const invertedTransform = this.effectiveTransform.inverted();
    if (childParentData) {
      const transformedPosition = MatrixUtils.transformPoint(
        invertedTransform,
        position
      );
      return this.child.hitTest(result, transformedPosition);
    }
    return false;
  }

  get originTransform(): Matrix4 {
    const result = Matrix4.zero.identity() as Matrix4;
    const alignment = this.alignment;
    const origin = this.origin;
    let translation = Vector.zero;
    if (!origin && !alignment) {
      return result;
    }
    if (origin) {
      result.translate(origin.x, origin.y);
    }
    if (alignment) {
      translation = alignment.alongSize(this.size).toVector();
      result.translate(translation.x, translation.y);
    }
    return result;
  }
  get effectiveTransform(): Matrix4 {
    const result = Matrix4.zero.identity() as Matrix4;
    const transform = Matrix4.zero.setMatrix([
      ...this.transform.matrix,
    ]) as Matrix4;

    const alignment = this.alignment;
    const origin = this.origin;
    let translation = Vector.zero;
    if (!origin && !alignment) {
      return transform;
    }
    if (origin) {
      result.translate(origin.x, origin.y);
    }
    if (alignment) {
      translation = alignment.alongSize(this.size).toVector();
      result.translate(translation.x, translation.y);
    }
    result.multiply(transform);
    if (alignment) {
      result.translate(-translation.x, -translation.y);
    }
    if (origin) {
      result.translate(-origin.x, -origin.y);
    }
    return result;
  }

  applyPaintTransform(child: RenderView, transform: Matrix4): void {
    transform.multiply(this.effectiveTransform);
  }
}
