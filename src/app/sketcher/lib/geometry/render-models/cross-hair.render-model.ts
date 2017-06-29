import * as utils from '../../util';
import * as math from '../../math/math';

import { EndPoint } from './end-point.render-model';
import { Ref } from '../../constraints/reference';
import { Viewport2d } from '../../viewport';
import { SketchObject } from './sketch-shape.render-model';



export class CrossHair extends SketchObject {
  public center: EndPoint;
  public radius: number;

  constructor(x, y, radius) {
    super('TCAD.TWO.CrossHair');
    this.center = new EndPoint(x, y);
    this.radius = radius;
    this.style = null;
  }

  drawSelf(viewport: Viewport2d) {
    viewport.context.beginPath();
    var rad = this.radius / viewport.scale;
    viewport.context.moveTo(this.center.x - rad, this.center.y);
    viewport.context.lineTo(this.center.x + rad, this.center.y);
    viewport.context.closePath();
    viewport.context.moveTo(this.center.x, this.center.y - rad);
    viewport.context.lineTo(this.center.x, this.center.y + rad);
    viewport.context.closePath();

    viewport.context.save();
    viewport.context.setTransform(1, 0, 0, 1, 0, 0);
    viewport.context.stroke();
    viewport.context.restore();
  }
}
