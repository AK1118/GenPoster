import  {runApp, DefaultNativeStrategies, GenPlatformConfig } from "../index";
import { Container } from "../index";
import {Colors} from "../index";

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


runApp(Container({
    width:300,
    height:300,
    color:Colors.gray,
}))