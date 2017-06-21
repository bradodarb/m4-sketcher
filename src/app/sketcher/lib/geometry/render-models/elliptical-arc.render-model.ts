
import { EndPoint } from './end-point.render-model';
import { Ellipse } from './ellipse.render-model';

import { Ref } from '../../constraints/reference';
import { Viewport2d } from '../../viewport';

import { Constraints } from '../../constraints'

import * as math from '../../math/math';
import { swap } from '../../util'

export class EllipticalArc extends Ellipse {

  public a: EndPoint;
  public b: EndPoint
  constructor(ep1: EndPoint, ep2: EndPoint, a: EndPoint, b: EndPoint) {
    super(ep1, ep2);
    this.setClassName('TCAD.TWO.EllipticalArc');
    this.a = a;
    this.b = b;
    this.addChild(a);
    this.addChild(b);

    //we'd like to have angles points have higher selection order
    swap(this.children, 0, this.children.length - 2);
    swap(this.children, 1, this.children.length - 1);
  }

  stabilize(viewer) {
    viewer.parametricManager._add(new Constraints.PointOnEllipseInternal(this.b, this));
    viewer.parametricManager._add(new Constraints.PointOnEllipseInternal(this.a, this));
  }

  drawImpl(ctx, scale) {
    ctx.beginPath();
    const radiusX = Math.max(this.radiusX, 1e-8);
    const radiusY = Math.max(this.radiusY, 1e-8);
    let aAngle = this.drawAngle(this.a);
    let bAngle;
    if (math.areEqual(this.a.x, this.b.x, math.TOLERANCE) &&
      math.areEqual(this.a.y, this.b.y, math.TOLERANCE)) {
      bAngle = aAngle + 2 * Math.PI;
    } else {
      bAngle = this.drawAngle(this.b)
    }
    ctx.ellipse(this.centerX, this.centerY, radiusX, radiusY, this.rotation, aAngle, bAngle);
    ctx.stroke();
  }

  drawAngle(point) {
    let deformScale = this.radiusY / this.radiusX;
    let x = point.x - this.centerX;
    let y = point.y - this.centerY;
    const rotation = - this.rotation;
    let xx = x * Math.cos(rotation) - y * Math.sin(rotation);
    let yy = x * Math.sin(rotation) + y * Math.cos(rotation);
    xx *= deformScale;
    return Math.atan2(yy, xx);
  }
}

