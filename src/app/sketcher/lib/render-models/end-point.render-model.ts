import { SketchObject } from './sketch-shape.render-model';
import { DrawPoint } from '../util/drawUtils';
import { Generator } from '../util/id-generator';
import Vector from '../math/vector'
import ViewPort2d from '../viewport';

export default class EndPoint extends SketchObject {

  public _class = 'TCAD.TWO.EndPoint';

  public x: number = 0;
  public y: number = 0;
  public size: number = 3;
  public parent = null;

  private _x: Param = new Param(this, 'x');
  private _y: Param = new Param(this, 'y');

  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }

  public collectParams(params) {
    params.push(this._x);
    params.push(this._y);
  }

  public normalDistance(aim) {
    return aim.minus(new Vector(this.x, this.y)).length();
  }

  public getReferencePoint() {
    return this;
  }

  public translateImpl(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  public drawSelf(viewer: ViewPort2d) {
    viewer.context.beginPath();
    viewer.context.arc(this.x, this.y, this.size / viewer.scale, 0, 2 * Math.PI, false);
    viewer.context.fill();
  }

  public setXY(x, y) {
    this.x = x;
    this.y = y;
  }

  public setFromPoint(p) {
    this.setXY(p.x, p.y);
  }

  public setFromArray(arr) {
    this.setXY(arr[0], arr[1]);
  }

  public toVector() {
    return new Vector(this.x, this.y);
  }

  public copy() {
    return new EndPoint(this.x, this.y);
  }
}

export class Param {
  public id: number = Generator.genID();
  public obj;
  public prop;

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