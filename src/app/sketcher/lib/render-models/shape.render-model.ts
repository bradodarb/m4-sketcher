import LayerStyle from '../layers/layer-style';
export class Shape {

  public visible: boolean;
  public style: LayerStyle;
  public role: string;

  constructor() {
    this.visible = true;
    this.style = null;
    this.role = null;
  }

  public accept(visitor) {
    return visitor(this);
  }

  public draw(viewer) {
  }
  protected drawSelf(viewer) { }
}
