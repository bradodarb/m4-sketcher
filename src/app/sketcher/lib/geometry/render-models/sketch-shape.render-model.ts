import { Generator } from '../../util/id-generator';
import { Shape } from './shape.render-model';
import { Viewport2d } from '../../viewport';
export class SketchObject extends Shape {

  public id = Generator.genID();
  public aux = false;
  public marked = null;
  public children: Array<SketchObject> = [];
  public linked = [];
  public layer = null;

  constructor(className: string) {
    super(className);
  }

  public normalDistance(aim, scale): number {
    return -1;
  }

  public addChild(child) {
    this.children.push(child);
    child.parent = this;
  }

  public accept(visitor) {
    for (let child of this.children) {
      if (!child.accept(visitor)) {
        return false;
      }
    }
    return visitor(this);
  }

  public stabilize(viewer) { }

  public recoverIfNecessary() {
    return false;
  }

  public isAuxOrLinkedTo() {
    if (!!this.aux) {
      return true;
    }
    for (var i = 0; i < this.linked.length; ++i) {
      if (!!this.linked[i].aux) {
        return true;
      }
    }
    return false;
  }

  translate(dx, dy, translated = {}) {
    if (this.isAuxOrLinkedTo()) {
      return;
    }
    translated[this.id] = 'x';
    for (var i = 0; i < this.linked.length; ++i) {
      if (translated[this.linked[i].id] != 'x') {
        this.linked[i]._translate(dx, dy, translated);
      }
    }
    this.translateSelf(dx, dy);
  };


  translateSelf(dx, dy) {
    this.accept(function (obj) {
      if (obj.className === 'M4CAD.TWO.EndPoint') {
        obj.translate(dx, dy);
      }
      return true;
    });
  }

  draw(viewer: Viewport2d) {
    if (!this.visible) {
      return;
    }
    if (this.marked != null) {
      viewer.context.save();
      viewer.setStyle(this.marked);
    }
    this.drawSelf(viewer);
    if (this.marked != null) {
      viewer.context.restore();
    }
  }

  copy() {
    throw 'method not implemented';
  }
}
