import { Offset } from "../basic/rect";
import { GenPlatformConfig } from "../core/platform";

// export abstract class Gradient {
//   static get painterInstance() {
//     return GenPlatformConfig.instance.strategies.getGradientStrategy();
//   }
//   /** 创建一个线性渐变 */
//   static linear(begin: Offset, end: Offset): CanvasGradient {
//     const linearGradient = Gradient.painterInstance.createLinearGradient(
//       begin.x,
//       begin.y,
//       end.x,
//       end.y
//     );
//     return linearGradient;
//   }
//   /** 创建一个径向渐变 */
//   static radial(center: Offset, radius: number): CanvasGradient {
//     const radialGradient = Gradient.painterInstance.createRadialGradient(
//       center.x,
//       center.y,
//       0,
//       center.x,
//       center.y,
//       radius
//     );
//     return radialGradient;
//   }
//   /**
//    * 创建一个扫描式渐变
//    */
//   static sweep(center: Offset, startAngle: number): CanvasGradient {
//     const sweepGradient = Gradient.painterInstance.createConicGradient(
//       startAngle,
//       center.x,
//       center.y
//     );
//     return sweepGradient;
//   }
// }
