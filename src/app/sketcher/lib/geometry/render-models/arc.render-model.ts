import * as utils from '../../util';
import * as math from '../../math/math';
import Vector from '../../math/vector'
import { Ref } from '../../constraints/reference';
import { P2PDistanceV } from '../../constraints'
import { EndPoint } from './end-point.render-model';
import { SketchObject } from './sketch-shape.render-model';
import { Viewport2d } from '../../viewport';
export class Arc extends SketchObject {

  public a: EndPoint;
  public b: EndPoint;
  public center: EndPoint;
  public radius: Ref;

  constructor(a, b, center) {
    super('TCAD.TWO.Arc');
    this.a = a;
    this.b = b;
    this.center = center;
    a.parent = this;
    b.parent = this;
    center.parent = this;
    this.children.push(a, b, center);
    this.radius = new Ref(this.distanceA());
    this.radius.obj = this;
  }

  collectParams(params) {
    this.a.collectParams(params);
    this.b.collectParams(params);
    this.center.collectParams(params);
    params.push(this.radius);
  }

  getReferencePoint() {
    return this.center;
  }

  translateSelf(dx, dy) {
    this.a.translate(dx, dy);
    this.b.translate(dx, dy);
    this.center.translate(dx, dy);
  }


  radiusForDrawing() {
    return this.distanceA();
  }

  distanceA() {
    return math.distance(this.a.x, this.a.y, this.center.x, this.center.y);
  }

  distanceB() {
    return math.distance(this.b.x, this.b.y, this.center.x, this.center.y);
  }

  getStartAngle() {
    return Math.atan2(this.a.y - this.center.y, this.a.x - this.center.x);
  }

  getEndAngle() {
    return Math.atan2(this.b.y - this.center.y, this.b.x - this.center.x);
  }

  drawSelf(viewport: Viewport2d) {
    viewport.context.beginPath();
    var r = this.radiusForDrawing();
    var startAngle = this.getStartAngle();
    var endAngle;
    if (math.areEqual(this.a.x, this.b.x, math.TOLERANCE) &&
      math.areEqual(this.a.y, this.b.y, math.TOLERANCE)) {
      endAngle = startAngle + 2 * Math.PI;
    } else {
      endAngle = this.getEndAngle();
    }
    viewport.context.arc(this.center.x, this.center.y, r, startAngle, endAngle);
    var distanceB = this.distanceB();
    if (Math.abs(r - distanceB) * viewport.scale > 1) {
      var adj = r / distanceB;
      viewport.context.save();
      viewport.context.setLineDash([7 / viewport.scale]);
      viewport.context.lineTo(this.b.x, this.b.y);
      viewport.context.moveTo(this.b.x + (this.b.x - this.center.x) / adj, this.b.y + (this.b.y - this.center.y) / adj);
      viewport.context.stroke();
      viewport.context.restore();
    } else {
      viewport.context.stroke();
    }
  }

  isPointInsideSector(x, y) {
    var ca = new Vector(this.a.x - this.center.x, this.a.y - this.center.y);
    var cb = new Vector(this.b.x - this.center.x, this.b.y - this.center.y);
    var ct = new Vector(x - this.center.x, y - this.center.y);

    ca._normalize();
    cb._normalize();
    ct._normalize();
    var cosAB = ca.dot(cb);
    var cosAT = ca.dot(ct);

    var isInside = cosAT >= cosAB;
    var abInverse = ca.cross(cb).z < 0;
    var atInverse = ca.cross(ct).z < 0;

    var result;
    if (abInverse) {
      result = !atInverse || !isInside;
    } else {
      result = !atInverse && isInside;
    }
    return result;
  }

  normalDistance(aim) {

    var isInsideSector = this.isPointInsideSector(aim.x, aim.y);
    if (isInsideSector) {
      return Math.abs(math.distance(aim.x, aim.y, this.center.x, this.center.y) - this.radiusForDrawing());
    } else {
      return Math.min(
        math.distance(aim.x, aim.y, this.a.x, this.a.y),
        math.distance(aim.x, aim.y, this.b.x, this.b.y)
      );
    }
  }

  stabilize(viewer) {
    this.radius.set(this.distanceA());
    viewer.parametricManager._add(new P2PDistanceV(this.b, this.center, this.radius));
    viewer.parametricManager._add(new P2PDistanceV(this.a, this.center, this.radius));
  }

  copy() {
    return new Arc(this.a.copy(), this.b.copy(), this.center.copy());
  }
}

