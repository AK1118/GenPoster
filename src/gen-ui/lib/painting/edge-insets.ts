import { RectTLRB } from "../render-object/basic";

export abstract class EdgeInsetsGeometry {
    public readonly left: number = 0;
  public readonly right: number = 0;
  public readonly top: number = 0;
  public readonly bottom: number = 0;
  private readonly start: number;
  private readonly end: number;

  constructor(option?: Partial<RectTLRB<number>>) {
    const { left = 0, right = 0, top = 0, bottom = 0 } = option ?? {};
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  get isZero(): boolean {
    return (
      this.left === 0 && this.right === 0 && this.top === 0 && this.bottom === 0
    );
  }
}

export class EdgeInsets extends EdgeInsetsGeometry {
  static get zero(): EdgeInsets {
    return new EdgeInsets();
  }

  /**
   * # 根据左上右下创建EdgeInsets对象
   * @param tlrb 
   * @returns 
   */
  static fromLTRB(tlrb: RectTLRB<number>): EdgeInsets {
    return new EdgeInsets(tlrb);
  }

  /**
   * # 只设置部分值创建EdgeInsets对象
   * @param tlrb 
   * @returns 
   */
  static only(tlrb: Partial<RectTLRB<number>>) {
    return new EdgeInsets(tlrb);
  }

  /**
   * # 设置所有值创建EdgeInsets对象
   * @param value 
   * @returns 
   */
  static all(value: number): EdgeInsets {
    return new EdgeInsets({
      left: value,
      right: value,
      top: value,
      bottom: value,
    });
  }

  /**
   * # 设置对称值创建EdgeInsets对象
   * @param symmetric 
   * @returns 
   */
  static symmetric(
    symmetric: Partial<{
      vertical: number;
      horizontal: number;
    }>
  ): EdgeInsets {
    const { vertical = 0, horizontal = 0 } = symmetric;
    return new EdgeInsets({
      left: horizontal,
      right: horizontal,
      top: vertical,
      bottom: vertical,
    });
  }
}
