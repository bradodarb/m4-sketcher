import { Ref } from '../../constraints/reference';
import { Viewport2d } from '../../viewport';
import { SketchObject } from './sketch-shape.render-model';
import { Segment } from './segment.render-model';
import { EndPoint } from './end-point.render-model';
import { LUT } from '../../math/bezier-cubic';
import { ConvexHull2D } from '../../math/convex-hull';

import * as draw_utils from '../utils'
import * as math from '../../math/math';


export class BezierCurve extends SketchObject {

  public a: EndPoint;
  public b: EndPoint;
  public cp1: EndPoint;
  public cp2: EndPoint;
  public hull;
  protected lut;

  constructor(a, b, cp1, cp2) {
    super('M4CAD.TWO.BezierCurve');
    this.a = a;
    this.b = b;
    this.cp1 = cp1;
    this.cp2 = cp2;

    this.addChild(new Segment(a, cp1));
    this.addChild(new Segment(b, cp2));
    for (let c of this.children) {
      c.role = 'construction';
    }
  }

  collectParams(params) {
    this.a.collectParams(params);
    this.b.collectParams(params);
    this.cp1.collectParams(params);
    this.cp2.collectParams(params);
  }

  normalDistance(aim, scale) {
    this.hull = ConvexHull2D([this.a, this.b, this.cp1, this.cp2]);
    this.hull = math.polygonOffset(this.hull, 1 + (0.3 / scale));
    if (math.isPointInsidePolygon(aim, this.hull)) {
      this.lut = LUT(this.a, this.b, this.cp1, this.cp2, scale);
      return this.closestNormalDistance(aim, this.lut)
    }
    return -1;
  }

  closestNormalDistance(aim, segments) {
    let hero = -1;
    for (let p = segments.length - 1, q = 0; q < segments.length; p = q++) {
      const dist = Math.min(Segment.calcNormalDistance(aim, segments[p], segments[q]));
      if (dist != -1) {
        hero = hero == -1 ? dist : Math.min(dist, hero);
      }
    }
    return hero;
  }

  drawSelf(viewport: Viewport2d) {
    viewport.context.beginPath();
    viewport.context.moveTo(this.a.x, this.a.y);
    viewport.context.bezierCurveTo(this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.b.x, this.b.y);
    viewport.context.stroke();

    //debug lut and hull
    //this.drawLUTAndHull();
  }

  drawLUTAndHull(viewport: Viewport2d) {
    if (this.lut) {
      for (let p of this.lut) {
        draw_utils.DrawPoint(viewport.context, p.x, p.y, 3, viewport.scale);
      }

      viewport.context.moveTo(this.hull[0].x, this.hull[0].y);
      for (let p of this.hull) {
        viewport.context.lineTo(p.x, p.y);
      }
      viewport.context.stroke();
    }
  }
}

const RECOVER_LENGTH = 100;
