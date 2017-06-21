import * as utils from '../../util';
import * as math from '../../math/math';

import { EndPoint } from './end-point.render-model';
import { Ref } from '../../constraints/reference';
import { Viewport2d } from '../../viewport';
import { SketchObject } from './sketch-shape.render-model';

export class Circle extends SketchObject {

  public center: EndPoint;
  public radius = new Ref(0);

  constructor(center) {
    super('TCAD.TWO.Circle');

    this.center = center;
    this.center.parent = this;

    this.children.push(this.center);
    this.radius.obj = this;
  }

  collectParams(params) {
    this.center.collectParams(params);
    params.push(this.radius);
  }

  getReferencePoint() {
    return this.center;
  }

  translateImpl(dx, dy) {
    this.center.translate(dx, dy);
  }

  drawSelf(viewport: Viewport2d) {
    viewport.context.beginPath();
    viewport.context.arc(this.center.x, this.center.y, this.radius.get(), 0, 2 * Math.PI);
    viewport.context.stroke();
  }

  normalDistance(aim) {
    return Math.abs(math.distance(aim.x, aim.y, this.center.x, this.center.y) - this.radius.get());
  }
}
