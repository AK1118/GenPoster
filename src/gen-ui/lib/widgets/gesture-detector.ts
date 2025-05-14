
import { BuildContext, } from "../basic/elements";
import {
  SingleChildRenderObjectWidgetArguments,
  State,
  StatefulWidget,
  StatelessWidget,
  Widget,
} from "../basic/framework";
import {
  CancelPointerEvent,
  DownPointerEvent,
  MovePointerEvent,
  PanZoomEndPointerEvent,
  PanZoomStartPointerEvent,
  PanZoomUpdatePointerEvent,
  PointerEvent,
  UpPointerEvent,
} from "../gesture/events";
import {
  GestureRecognizer,
  GestureRecognizerFactory,
} from "../gesture/recognizers/gesture-recognizer";
import TapGestureRecognizer, {
  EventCallback,
  TapGestureRecognizerArguments,
} from "../gesture/recognizers/tap";
import DoubleTapGestureRecognizer, {
  DoubleTapGestureRecognizerArguments,
} from "../gesture/recognizers/double-tap";
import LongPressGestureRecognizer, {
  LongPressGestureRecognizerArguments,
} from "../gesture/recognizers/long-press";
import PanDragGestureRecognizer, {
  PanDragGestureRecognizerArguments,
} from "../gesture/recognizers/pan-drag";
import {
  PanZoomGestureRecognizer,
  PanZoomGestureRecognizerArguments,
} from "../gesture/recognizers/pan-zoom";
import { Listener } from "./listener";

interface GestureDetectorArguments
  extends TapGestureRecognizerArguments,
    DoubleTapGestureRecognizerArguments,
    LongPressGestureRecognizerArguments,
    PanDragGestureRecognizerArguments,
    PanZoomGestureRecognizerArguments {}

export class GestureDetector
  extends StatelessWidget
  implements GestureDetectorArguments
{
  private gestureRecognizers: Map<any, GestureRecognizer> = new Map();
  private child: Widget;
  onDoubleTap: VoidFunction;
  onLongPress: VoidFunction;
  onPanZoomStart: (event: PanZoomStartPointerEvent) => void;
  onPanZoomUpdate: (event: PanZoomUpdatePointerEvent) => void;
  onPanZoomEnd: (event: PanZoomEndPointerEvent) => void;
  onTap: EventCallback<PointerEvent>;
  onTapDown: EventCallback<DownPointerEvent>;
  onTapUp: EventCallback<UpPointerEvent>;
  onTapCancel: VoidFunction;
  onLongPressUpdate: (event: UpPointerEvent) => void;
  onLongPressStart: (event: UpPointerEvent) => void;
  onLongPressEnd: (event: UpPointerEvent) => void;

  constructor(
    option?: Partial<
      GestureDetectorArguments & SingleChildRenderObjectWidgetArguments
    >
  ) {
    super(option?.key);
    this.child = option?.child;
    this.onTap = option?.onTap;
    this.onTapDown = option?.onTapDown;
    this.onTapUp = option?.onTapUp;
    this.onTapCancel = option?.onTapCancel;
    this.onDoubleTap = option?.onDoubleTap;
    this.onLongPress = option?.onLongPress;
    this.onDragStart = option?.onDragStart;
    this.onDragUpdate = option?.onDragUpdate;
    this.onDragEnd = option?.onDragEnd;
    this.onPanZoomStart = option?.onPanZoomStart;
    this.onPanZoomUpdate = option?.onPanZoomUpdate;
    this.onPanZoomEnd = option?.onPanZoomEnd;
  }
  onDragStart: (event: DownPointerEvent) => void;
  onDragUpdate: (event: MovePointerEvent) => void;
  onDragEnd: (event: UpPointerEvent) => void;

  build(context: BuildContext): Widget {
    const gestures: Map<
      any,
      GestureRecognizerFactory<GestureRecognizer>
    > = new Map();
    gestures.set(
      TapGestureRecognizer,
      new GestureRecognizerFactory(
        () => new TapGestureRecognizer(),
        (instance) => {
          instance.onTap = this.onTap;
          instance.onTapDown = this.onTapDown;
          instance.onTapUp = this.onTapUp;
          instance.onTapCancel = this.onTapCancel;
        }
      )
    );
    gestures.set(
      DoubleTapGestureRecognizer,
      new GestureRecognizerFactory(
        () => new DoubleTapGestureRecognizer(),
        (instance) => {
          instance.onDoubleTap = this.onDoubleTap;
        }
      )
    );
    gestures.set(
      LongPressGestureRecognizer,
      new GestureRecognizerFactory(
        () => new LongPressGestureRecognizer(),
        (instance) => {
          instance.onLongPress = this.onLongPress;
        }
      )
    );
    gestures.set(
      PanDragGestureRecognizer,
      new GestureRecognizerFactory(
        () => new PanDragGestureRecognizer(),
        (instance) => {
          instance.onDragEnd = this.onDragEnd;
          instance.onDragStart = this.onDragStart;
          instance.onDragUpdate = this.onDragUpdate;
        }
      )
    );
    gestures.set(
      PanZoomGestureRecognizer,
      new GestureRecognizerFactory(
        () => new PanZoomGestureRecognizer(),
        (instance) => {
          instance.onPanZoomStart = this.onPanZoomStart;
          instance.onPanZoomUpdate = this.onPanZoomUpdate;
          instance.onPanZoomEnd = this.onPanZoomEnd;
        }
      )
    );

    return new RawGestureDetector({
      gestures: gestures,
      child: this.child,
    });
  }
}

interface RawGestureDetectorArguments {
  gestures: Map<any, GestureRecognizerFactory<GestureRecognizer>>;
}

export class RawGestureDetector extends StatefulWidget {
  public gestures: Map<any, GestureRecognizerFactory<GestureRecognizer>> =
    new Map();
  public child: Widget;
  constructor(
    option: Partial<
      RawGestureDetectorArguments & SingleChildRenderObjectWidgetArguments
    >
  ) {
    super();
    this.gestures = option?.gestures;
    this.child = option?.child;
  }
  createState(): State {
    return new _RawGestureDetectorState();
  }
}

class _RawGestureDetectorState extends State<RawGestureDetector> {
  public gestureRecognizers: Map<any, GestureRecognizer> = new Map();

  public initState(): void {
    super.initState();
    this.handleInitGestures(this.widget.gestures);
  }

  build(context: BuildContext): Widget {
    return new Listener({
      child: this.widget.child,
      onPointerDown: this.handlePointerDown.bind(this),
    });
  }
  private handlePointerDown(event: DownPointerEvent) {
    for (const gesture of this.gestureRecognizers.values()) {
      gesture.addPointer(event);
    }
  }
  private handleInitGestures(
    gestures: Map<any, GestureRecognizerFactory<GestureRecognizer>>
  ) {
    for (const [key, gesture] of gestures) {
      const gesture_ = gesture._constructor();
      gesture._initializer(gesture_);
      this.gestureRecognizers.set(key, gesture_);
    }
  }
}
