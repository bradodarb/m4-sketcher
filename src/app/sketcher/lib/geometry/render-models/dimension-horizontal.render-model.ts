import * as utils from '../../util';
import * as math from '../../math/math';
import Vector from '../../math/vector'
import { LinearDimension } from './dimension-linear.render-model';
import { SketchObject } from './sketch-shape.render-model';



export class HorizontalDimension extends LinearDimension {
  constructor(a, b) {
    super(a, b, 'TCAD.TWO.HDimension');
  }

  getA() {
    return this.a;
  }

  getB() {
    return { x: this.b.x, y: this.a.y };
  }
}
