import LayerStyle from '../../layers/layer-style';
export class Shape {

  public visible: boolean;
  public style: LayerStyle;
  public role: string;
  private _class: string;

  constructor(className: string) {
    this.visible = true;
    this.style = null;
    this.role = null;
    this._class = className;
  }

  public accept(visitor) {
    return visitor(this);
  }

  public draw(viewer) {
  }
  protected drawSelf(viewer) { }
}
