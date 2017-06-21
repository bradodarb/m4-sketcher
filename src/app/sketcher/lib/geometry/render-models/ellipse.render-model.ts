
import { EndPoint } from './end-point.render-model';
import { Ref } from '../../constraints/reference';
import { Viewport2d } from '../../viewport';
import { SketchObject } from './sketch-shape.render-model';

import * as math from '../../math/math';

export class Ellipse extends SketchObject {


  public ep1: EndPoint;
  public ep2: EndPoint;
  public radius = new Ref(0);

  constructor(ep1: EndPoint, ep2: EndPoint) {
    super('TCAD.TWO.Ellipse');
    this.ep1 = ep1;
    this.ep2 = ep2;

    this.addChild(this.ep1);
    this.addChild(this.ep2);

    this.radius.set(this.radiusX * 0.5);
    this.radius.obj = this;
  }

  recoverIfNecessary() {
    let recovered = false;
    if (math.distanceAB(this.ep1, this.ep2) <= math.TOLERANCE) {
      this.ep1.translate(-RECOVER_LENGTH, -RECOVER_LENGTH);
      this.ep2.translate(RECOVER_LENGTH, RECOVER_LENGTH);
      recovered = true;
    }
    if (this.radiusY <= 0.1) {
      this.radius.set(RECOVER_LENGTH);
      recovered = true;
    }
    return recovered;
  }

  collectParams(params) {
    this.ep1.collectParams(params);
    this.ep2.collectParams(params);
    params.push(this.radius);
  }


  get rotation() {
    return Math.atan2(this.ep2.y - this.ep1.y, this.ep2.x - this.ep1.x);
  }

  get radiusX() {
    return math.distance(this.ep1.x, this.ep1.y, this.ep2.x, this.ep2.y) * 0.5;
  }

  get radiusY() {
    return this.radius.get();
  }

  get centerX() {
    return this.ep1.x + (this.ep2.x - this.ep1.x) * 0.5;
  }

  get centerY() {
    return this.ep1.y + (this.ep2.y - this.ep1.y) * 0.5;
  }

  drawSelf(viewport: Viewport2d) {
    viewport.context.beginPath();
    const radiusX = Math.max(this.radiusX, 1e-8);
    const radiusY = Math.max(this.radiusY, 1e-8);
    viewport.context.ellipse(this.centerX, this.centerY, radiusX, radiusY, this.rotation, 0, 2 * Math.PI);
    viewport.context.stroke();
  }

  toEllipseCoordinateSystem(point) {
    let x = point.x - this.centerX;
    let y = point.y - this.centerY;
    const angle = Math.atan2(y, x) - this.rotation;
    const radius = math.distance(0, 0, x, y);
    x = radius * Math.cos(angle);
    y = radius * Math.sin(angle);
    return { x, y, angle, radius };
  }

  radiusAtAngle(angle) {
    return Math.sqrt(1 / (sq(Math.cos(angle) / this.radiusX) + sq(Math.sin(angle) / this.radiusY)));
  }

  normalDistance(aim) {
    const polarPoint = this.toEllipseCoordinateSystem(aim);
    const L = this.radiusAtAngle(polarPoint.angle);
    return Math.abs(polarPoint.radius - L);
  }

  static findMinorRadius(majorRadius, pntRadius, pntAngle) {
    return Math.abs(Math.sin(pntAngle) / Math.sqrt(1 / sq(pntRadius) - sq(Math.cos(pntAngle) / majorRadius)));
  }
}
const sq = (a) => a * a;
const RECOVER_LENGTH = 100;
