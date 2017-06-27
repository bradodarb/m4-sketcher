import * as utils from '../../util';
import * as math from '../../math/math';
import Vector from '../../math/vector';
import { LinearDimension } from './dimension-linear.render-model';
import { SketchObject } from './sketch-shape.render-model';


export class VerticalDimension extends LinearDimension {

  constructor(a, b) {
    super(a, b, 'TCAD.TWO.VDimension');
  }

  getA() {
    return this.a;
  }

  getB() {
    return { x: this.a.x, y: this.b.y };
  }
}
