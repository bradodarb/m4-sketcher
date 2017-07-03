import * as utils from '../../util';
import * as math from '../../math/math';
import Vector from '../../math/vector'
import { SketchObject } from './sketch-shape.render-model';
import { LinearDimension } from './dimension-linear.render-model';


export class VerticalDimension extends LinearDimension {

  constructor(a, b) {
    super(a, b, 'M4CAD.TWO.VDimension');
  }

  getA() {
    return this.a;
  }

  getB() {
    return { x: this.a.x, y: this.b.y };
  }
}

