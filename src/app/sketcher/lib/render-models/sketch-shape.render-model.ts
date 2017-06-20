import { Generator } from '../util/id-generator'
import { Shape } from './shape.render-model'
import ViewPort2d from '../viewport';
export class SketchObject extends Shape {

  public id = Generator.genID();
  public aux = false;
  public marked = null;
  public children = [];
  public linked = [];
  public layer = null;

  constructor() {
    super();
  }

  normalDistance(aim, scale): number {
    return -1;
  }

  addChild(child) {
    this.children.push(child);
    child.parent = this;
  }

  accept(visitor) {
    for (let child of this.children) {
      if (!child.accept(visitor)) {
        return false;
      }
    }
    return visitor(this);
  }

  stabilize(viewer) { }

  recoverIfNecessary() {
    return false;
  }

  isAuxOrLinkedTo() {
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

  _translate(dx, dy, translated) {
    translated[this.id] = 'x';
    for (var i = 0; i < this.linked.length; ++i) {
      if (translated[this.linked[i].id] != 'x') {
        this.linked[i]._translate(dx, dy, translated);
      }
    }
    this.translateImpl(dx, dy);
  };

  translate(dx, dy) {
    //  this.translateImpl(dx, dy);
    if (this.isAuxOrLinkedTo()) {
      return;
    }
    this._translate(dx, dy, {});
  }

  translateImpl(dx, dy) {
    this.accept(function (obj) {
      if (obj._class === 'TCAD.TWO.EndPoint') {
        obj.translate(dx, dy);
      }
      return true;
    });
  }

  draw(viewer: ViewPort2d) {
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
