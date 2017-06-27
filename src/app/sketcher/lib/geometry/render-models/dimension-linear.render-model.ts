import * as utils from '../../util';
import { getTextOffset } from '../utils';
import * as math from '../../math/math';
import Vector from '../../math/vector'
import { SketchObject } from './sketch-shape.render-model';
import { Viewport2d } from '../../viewport';

export class LinearDimension extends SketchObject {

  protected a;
  protected b;
  public flip: boolean;

  constructor(a, b, className = 'TCAD.TWO.Dimension') {
    super(className);
    this.a = a;
    this.b = b;
    this.flip = false;
  }

  public collectParams(params) {
  }

  public getReferencePoint() {
    return this.a;
  }



  public getA() { return this.a }
  public getB() { return this.b }

  public drawSelf(viewer: Viewport2d) {

    var off = 30 * viewer.dimScale;
    var textOff = getTextOffset(viewer.dimScale);

    var a, b, startA, startB;
    if (this.flip) {
      a = this.getB();
      b = this.getA();
      startA = this.b;
      startB = this.a;
    } else {
      a = this.getA();
      b = this.getB();
      startA = this.a;
      startB = this.b;
    }

    var d = math.distanceAB(a, b);

    var _vx = - (b.y - a.y);
    var _vy = b.x - a.x;

    //normalize
    var _vxn = _vx / d;
    var _vyn = _vy / d;

    _vx = _vxn * off;
    _vy = _vyn * off;

    viewer.context.beginPath();

    var _ax = a.x + _vx;
    var _ay = a.y + _vy;
    var _bx = b.x + _vx;
    var _by = b.y + _vy;

    viewer.context.moveTo(_ax, _ay);
    viewer.context.lineTo(_bx, _by);


    function drawRef(start, x, y) {
      var vec = new Vector(x - start.x, y - start.y);
      vec._normalize();
      vec._multiply(7 * viewer.dimScale);

      viewer.context.moveTo(start.x, start.y);
      viewer.context.lineTo(x, y);
      viewer.context.lineTo(x + vec.x, y + vec.y);
    }

    drawRef(startA, _ax, _ay);
    drawRef(startB, _bx, _by);

    viewer.context.closePath();
    viewer.context.stroke();

    function drawArrow(x, y) {
      var s1 = 50;
      var s2 = 20;
      viewer.context.lineCap = 'round';
      viewer.context.beginPath();
      viewer.context.moveTo(x, y);
      viewer.context.lineTo(x - s1, y - s2);
      viewer.context.closePath();
      viewer.context.stroke();
    }

    //  drawArrow(_ax, _ay);
    //  drawArrow(_bx, _by);

    viewer.context.font = (12 * viewer.dimScale) + "px Arial";
    var txt = d.toFixed(2);
    var h = d / 2 - viewer.context.measureText(txt).width / 2;

    if (h > 0) {
      var tx = (_ax + _vxn * textOff) - (- _vyn) * h;
      var ty = (_ay + _vyn * textOff) - (_vxn) * h;
      viewer.context.save();
      viewer.context.translate(tx, ty);
      viewer.context.rotate(- Math.atan2(_vxn, _vyn));
      viewer.context.scale(1, -1);
      viewer.context.fillText(txt, 0, 0);
      viewer.context.restore();
    }
  }

  normalDistance(aim) {
    return -1;
  }
}
