import {Curve} from '../curve'

export class Line extends Curve {

  constructor(p0, v) {
    super();
    this.p0 = p0;
    this.v = v;
    this._pointsCache = new Map();
  }

  intersectEdge(edge) {
    throw 'not implemented';
  }

  intersectSurface(surface) {
    //assume surface is plane
    const s0 = surface.normal.multiply(surface.w);
    return surface.normal.dot(s0.minus(this.p0)) / surface.normal.dot(this.v); // 4.7.4
  }

  intersectCurve(curve, surface) {
    if (curve instanceof Line) {
      const otherNormal = surface.normal.cross(curve.v)._normalize();
      return otherNormal.dot(curve.p0.minus(this.p0)) / otherNormal.dot(this.v); // (4.8.3)    
    }
    return super.intersectCurve(curve);
  }

  parametricEquation(t) {
    return this.p0.plus(this.v.multiply(t));
  }
  
  t(point) {
    return point.minus(this.p0).dot(this.v);
  }
  
  pointOfSurfaceIntersection(surface) {
    let point = this._pointsCache.get(surface);
    if (!point) {
      const t = this.intersectSurface(surface);
      point = this.parametricEquation(t);
      this._pointsCache.set(surface, point);
    }
    return point;
  }

  translate(vector) {
    return new Line(this.p0.plus(vector), this.v);
  }

  approximate(resolution, from, to, path) {
  }
}

Line.fromTwoPlanesIntersection = function(plane1, plane2) {
  const n1 = plane1.normal;
  const n2 = plane2.normal;
  const v = n1.cross(n2)._normalize();
  const pf1 = plane1.toParametricForm();
  const pf2 = plane2.toParametricForm();
  const r0diff = pf1.r0.minus(pf2.r0);
  const ww = r0diff.minus(n2.multiply(r0diff.dot(n2)));
  const p0 = pf2.r0.plus( ww.multiply( n1.dot(r0diff) / n1.dot(ww)))
  return new Line(p0, v);
};

Line.fromSegment = function(a, b) {
  return new Line(a, b.minus(a)._normalize());
};
