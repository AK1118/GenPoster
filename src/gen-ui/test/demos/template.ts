import { runApp } from "@/lib/widgets/basic";
import {
  SingleChildRenderObjectWidget,
  State,
  StatefulWidget,
  Widget,
} from "@/lib/basic/framework";
import { Listener } from "@/lib/widgets/listener";
import { Column, Container, LayoutBuilder, Row } from "@/lib/widgets/index";
import { GenPlatformConfig } from "@/lib/core/platform";
import { Color, Colors } from "@/lib/painting/color";
import {
  EventListenType,
  GenPointerEvent,
  GenUnifiedPointerEvent,
  NativeEventsBindingHandler,
} from "@/lib/native/events";
import { NativeTextInputHandler } from "@/lib/native/text-input";
//@ts-ignore
import eruda from "eruda";
import Stream from "@/lib/core/stream";
import { NativeInputStream, TextNativeInputAdapter } from "./text-input-stream";
import { DefaultNativeStrategies } from "@/lib/native/native-strategies";
import Vector, { Offset } from "@/lib/math/vector";
import Alignment from "@/lib/painting/alignment";
import { RenderView } from "@/lib/render-object/render-object";
import { RenderBox, SingleChildRenderView } from "@/lib/render-object/basic";
import { PointerEvent, SignalPointerEvent } from "@/lib/gesture/events";
import { HitTestEntry, HitTestResult } from "@/lib/gesture/hit_test";
import DefaultBrowserNativeEventsBindingHandler from "@/lib/native/defaults/pointer-event-handler";
import BoxShadow from "@/lib/painting/shadow";
import { EdgeInsets } from "@/lib/painting/edge-insets";
import { Image as ImageWidget } from "@/lib/widgets/image";
import { Align, Center } from "@/lib/widgets/align";
import { RepaintBoundary } from "@/lib/widgets/repaint-boundary";
import { Text, TextRich } from "@/lib/widgets/paragraph";
import { GestureDetector } from "@/lib/widgets/gesture-detector";
import { Positioned, Stack } from "@/lib/widgets/stack";
import { NetWorkImageProvider } from "@/lib/painting/image-provider";
import { BorderRadius } from "@/lib/painting/radius";
import { BoxDecoration } from "@/lib/painting/decoration";
import { BuildContext } from "@/lib/basic/elements";
import { AnimationController, Curves } from "@/lib/core/animation";
import { Duration } from "@/lib/core/duration";
import { TextSpan, TextStyle } from "@/lib/painting/text-painter";
import { Clip, FontStyle, FontWeight, MainAxisSize, TextDecoration, TextDecorationStyle } from "@/lib/core/base-types";

// console.log(a)
const canvas = document.createElement("canvas");
const dev = 1; //window.devicePixelRatio;
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width * dev;
canvas.height = height * dev;
canvas.style.width = width + "px";
canvas.style.height = height + "px";
document.body.appendChild(canvas);
const g = canvas.getContext("2d", {
  // willReadFrequently: true,
});

GenPlatformConfig.InitInstance({
  screenWidth: width,
  screenHeight: height,
  devicePixelRatio: dev,
  debug: false,
  canvas: canvas,
  renderContext: g,
  strategies: new DefaultNativeStrategies(),
  showBanner: true,
});

// const nativeTextInputHandler = new NativeTextInputHandler();
// const inputBar = document.querySelector("#inputbar") as HTMLInputElement;
// inputBar.value = `123`;
// nativeTextInputHandler.blurHandler(() => {
//   inputBar.blur();
// });
// nativeTextInputHandler.focusHandler(() => {
//   setTimeout(() => {
//     inputBar.focus();
//   }, 100)
// });

// const syncStream = Stream.withAsync<string>(NativeInputStream());
// const handler: TextNativeInputAdapter = new TextNativeInputAdapter(syncStream, inputBar.value);

// handler.addListener(() => {
//   // console.log("handler",handler.payload)
//   const payload = handler.payload;
//   nativeTextInputHandler.updateEditingValue(
//     payload.value,
//     payload.selectionStart,
//     payload.selectionEnd
//   );
// });
// nativeTextInputHandler.selectionHandler((newSelection) => {
//   handler.updateSelection(newSelection.baseOffset, newSelection.extentOffset);
// });

// export const screenUtil = new ScreenUtils({
//   canvasWidth: canvas.width,
//   canvasHeight: canvas.height,
//   devicePixelRatio: dev,
// });

class Test extends StatefulWidget {
  createState(): State<Test> {
    return new TestState();
  }
}
const networkImageProvider = new NetWorkImageProvider({
  url: "https://picsum.photos/100",
});
class TestState extends State<Test> {
  private scale: number = 1;
  private angle: number = 0;

  public initState(): void {
    super.initState();
  }
  private x: number = 0;
  private y: number = 0;
  build(context: BuildContext): Widget {
    return new GestureDetector({
      onPanZoomStart(event) {
        // console.log("开始缩放", event)
      },
      onPanZoomUpdate: (event) => {
        // console.log(event)
        this.setState(() => {
          this.angle += event.deltaRotationAngle;
          this.scale += event.deltaScale;
        });
        // console.log("缩放中", event)
      },
      onPanZoomEnd(event) {
        this.preAngle = 0;
        // console.log("缩放结束", event)
      },
      onTapDown() {
        console.log("点击");
      },
      onDragUpdate(event) {
        // console.log(event.position)
      },
      onTapUp() {
        // console.log("抬起")
      },

      child: new Listener({
        onPointerMove: () => {
          //  this.setState(()=>{
          //   this.angle +=.1;
          //  })
        },
        onSignalPointer: (event) => {
          this.setState(() => {
            this.scale += event.deltaY > 0 ? -0.1 : 0.1;
          });
        },
        child: new Container({
          width: canvas.width,
          height: canvas.height,
          color: Colors.gray.withAlpha(10),
          child: new Center({
            child: new Container({
              child: new Column({
                mainAxisSize: MainAxisSize.max,
                children: Array.from({
                  length: 10,
                }).map((_, index) => new Text(`${index}${this.scale}`)),
              }),
              color: Colors.orange,
            }),
          }),
        }),
      }),
    });
  }
}

class Animate extends StatefulWidget {
  createState(): State {
    return new AnimateState();
  }
}

class AnimateState extends State<Animate> {
  controller = new AnimationController({
    duration: new Duration({
      second: 1,
    }),
    curve: Curves.easeIn,
  });
  initState(): void {
    super.initState();
    this.controller.forward();
    this.controller.addListener(() => {
      this.setState(() => {});
      if (this.controller.isCompleted) {
        this.controller.reverse();
      }
      if (this.controller.isDismissed) {
        this.controller.forward();
      }
    });
  }
  build(context: BuildContext): Widget {
    return new Container({
      width: Math.max(1, this.controller.value * 100),
      height: Math.max(1, this.controller.value * 100),
      decoration: new BoxDecoration({
        backgroundColor: Colors.gray,
        borderRadius: BorderRadius.all(100),
      }),
      child: new Container({
        child: new Column({
          mainAxisSize: MainAxisSize.min,
          children: [new Text("1"), new Text("2"), new Text("3")],
        }),
        color: Colors.orange,
      }),
    });
  }
}
class Box extends StatefulWidget {
  createState(): State {
    return new BoxState();
  }
}

class BoxState extends State<Box> {
  private x: number = 0;
  private y: number = 0;
  build(context: BuildContext): Widget {
    return new Positioned({
      left: this.x,
      top: this.y,
      child: new Container({
        color: Colors.orange,
        width: 100,
        height: 100,
      }),
    });
  }
}
runApp(
  new Container({
    width: 300,
    height: canvas.height,
    // child:new Text(`GenPoster FrameWork power`)
    child: new Stack({
      children: [
        // new Positioned({
        //   bottom:0,
        //   right:-10,
        //   child:new Container({
        //     width:30,
        //     height:30,
        //     color:Colors.orange,
        //   })
        // }),
        new TextRich({
          textSpan: new TextSpan({
            text: "Super",
            textStyle: new TextStyle({
              height: 100,
              fontSize: 20,
              color: Colors.green,
            }),
            children: [
              new TextSpan({
                text: "愛浢",
                textStyle: new TextStyle({
                  fontSize: 10,
                  color: Colors.orange,
                }),
                children: [],
              }),
              new TextSpan({
                text: "の",
                textStyle: new TextStyle({
                  fontSize: 30,
                  color: Colors.orange,
                }),
                children: [],
              }),
              new TextSpan({
                text: "笑容",
                textStyle: new TextStyle({
                  fontSize: 30,
                  color: Colors.pink,
                  fontWeight:FontWeight.bold,
                  decoration:TextDecoration.underline,
                  decorationStyle:TextDecorationStyle.dashed,
                  decorationColor:Colors.red,
                  fontStyle:FontStyle.italic
                }),
                children: [
                  new TextSpan({
                    text: "都没沵的恬",
                    textStyle: new TextStyle({
                      fontSize: 15,
                      color: Colors.orange,
                    }),
                    children: [],
                  }),
                ],
              }),
            ],
          }),
        }),
      ],
    }),
  })
);
