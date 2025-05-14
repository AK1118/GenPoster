
import { BuildContext } from "../basic/elements";
import { SingleChildRenderObjectWidget } from "../basic/framework";
import { SingleChildRenderObjectWidgetArguments } from "../basic/framework";
import { CancelPointerEvent, DownPointerEvent, MovePointerEvent, PointerEvent, SignalPointerEvent, UpPointerEvent } from "../gesture/events";
import { HitTestEntry, HitTestResult } from "../gesture/hit_test";
import Vector from "../math/vector";
import { SingleChildRenderView, SingleChildRenderViewArguments } from "../render-object/basic";
import { RenderView } from "../render-object/render-object";
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


export class Listener extends SingleChildRenderObjectWidget {
  private _onPointerDown: onPointerDownCallback;
  private _onPointerMove: onPointerMoveCallback;
  private _onPointerUp: onPointerUpCallback;
  private _onPointerCancel: onPointerCancelCallback;
  private _onSignalPointer: onSignalPointerCallback;
  constructor(
    option: Partial<
      RenderPointerListenerArguments & SingleChildRenderObjectWidgetArguments
    >
  ) {
    super(option?.child, option.key);
    this._onPointerDown = option.onPointerDown;
    this._onPointerMove = option.onPointerMove;
    this._onPointerUp = option.onPointerUp;
    this._onPointerCancel = option.onPointerCancel;
    this._onSignalPointer = option.onSignalPointer;
  }
  createRenderObject(): RenderView {
    return new RenderPointerListener({
      onPointerDown: this._onPointerDown,
      onPointerMove: this._onPointerMove,
      onPointerUp: this._onPointerUp,
      onPointerCancel: this._onPointerCancel,
      onSignalPointer: this._onSignalPointer,
    });
  }
  updateRenderObject(
    context: BuildContext,
    renderView: RenderPointerListener
  ): void {
    renderView.onPointerDown = this._onPointerDown;
    renderView.onPointerMove = this._onPointerMove;
    renderView.onPointerUp = this._onPointerUp;
    renderView.onPointerCancel = this._onPointerCancel;
    renderView.onSignalPointer = this._onSignalPointer;
  }
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
