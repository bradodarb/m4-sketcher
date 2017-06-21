import LayerStyle from '../../layers/layer-style';
import { Viewport2d } from '../../viewport';

export class Shape {

  public visible: boolean;
  public style: LayerStyle;
  public role: string;
  private _className: string;

  constructor(className: string) {
    this.visible = true;
    this.style = null;
    this.role = null;
    this._className = className;
  }

  public accept(visitor) {
    return visitor(this);
  }

  public draw(viewer: Viewport2d) {
  }
  protected drawSelf(viewer: Viewport2d) { }

  public get className(): string {
    return this._className;
  }
  protected setClassName(className: string) {
    this._className = className;
  }
}
