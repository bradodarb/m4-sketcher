import { SketchObject } from './sketch-shape.render-model';
import { EndPoint } from './end-point.render-model';
import Vector from '../../math/vector';
import { Constraints } from '../../constraints';
import * as math from '../../math/math';
import { Viewport2d } from '../../viewport';

export class Segment extends SketchObject {

  public a: EndPoint;
  public b: EndPoint;
  constructor(a, b) {
    super('TCAD.TWO.Segment');
    this.a = a;
    this.b = b;
    a.parent = this;
    b.parent = this;
    this.children.push(a, b);
  }

  recoverIfNecessary() {
    if (math.distanceAB(this.a, this.b) > math.TOLERANCE) {
      return false;
    } else {
      const recoverLength = 100;
      this.a.translate(-recoverLength, -recoverLength);
      this.b.translate(recoverLength, recoverLength);
      return true;
    }
  }

  collectParams(params) {
    this.a.collectParams(params);
    this.b.collectParams(params);
  }

  normalDistance(aim) {
    return Segment.calcNormalDistance(aim, this.a, this.b);
  }

  static calcNormalDistance(aim, segmentA, segmentB) {
    const ab = new Vector(segmentB.x - segmentA.x, segmentB.y - segmentA.y)
    const e = ab.normalize();
    const a = new Vector(aim.x - segmentA.x, aim.y - segmentA.y);
    const b = e.multiply(a.dot(e));
    const n = a.minus(b);

    //Check if vector b lays on the vector ab
    if (b.length() > ab.length()) {
      return -1;
    }

    if (b.dot(ab) < 0) {
      return -1;
    }

    return n.length();
  }

  getReferencePoint() {
    return this.a;
  }

  translateImpl(dx, dy) {
    this.a.translate(dx, dy);
    this.b.translate(dx, dy);
  }

  drawSelf(viewport: Viewport2d) {
    viewport.context.beginPath();
    viewport.context.moveTo(this.a.x, this.a.y);
    viewport.context.lineTo(this.b.x, this.b.y);
    //  ctx.save();
    //  ctx.setTransform(1, 0, 0, 1, 0, 0);
    viewport.context.stroke();
    //  ctx.restore();
  }

  copy() {
    return new Segment(this.a.copy(), this.b.copy());
  }
}

