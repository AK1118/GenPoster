export class Performance {
  static now(): number {
    if (typeof performance !== "undefined" && performance?.now) {
      return performance.now();
    }
    return Performance.customNow();
  }

  private static startTime = Date.now();

  private static customNow(): number {
    if (typeof performance !== "undefined" && performance.now) {
      return performance.now();
    }
    return Date.now() - Performance.startTime;
  }
}
