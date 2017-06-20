import { SketchObject } from './sketch-shape.render-model';
import { DrawPoint } from '../util/drawUtils';
import { Generator } from '../util/id-generator';
import Vector from '../../math/vector'

export class EndPoint extends SketchObject {
  public x: number = 0;
  public y: number = 0;
  public parent = null;

  private _x: Param = new Param(this, 'x');
  private _y: Param = new Param(this, 'y');

  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }

  collectParams(params) {
    params.push(this._x);
    params.push(this._y);
  }

  normalDistance(aim) {
    return aim.minus(new Vector(this.x, this.y)).length();
  }

  getReferencePoint() {
    return this;
  }

  translateImpl(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  drawImpl(ctx, scale) {
    DrawPoint(ctx, this.x, this.y, 3, scale)
  }

  setXY(x, y) {
    this.x = x;
    this.y = y;
  }

  setFromPoint(p) {
    this.setXY(p.x, p.y);
  }

  setFromArray(arr) {
    this.setXY(arr[0], arr[1]);
  }

  toVector() {
    return new Vector(this.x, this.y);
  }

  copy() {
    return new EndPoint(this.x, this.y);
  }
}
EndPoint.prototype._class = 'TCAD.TWO.EndPoint';

export class Param {
  constructor(obj, prop) {
    this.id = Generator.genID();
    this.obj = obj;
    this.prop = prop;
  }

  set(value) {
    this.obj[this.prop] = value;
  }

  get() {
    return this.obj[this.prop];
  }
}
