import * as utils from '../../util';
import * as math from '../../math/math';
import Vector from '../../math/vector'
import { SketchObject } from './sketch-shape.render-model';
import { Circle } from './circle.render-model';
import { Arc } from './arc.render-model';
import { getTextOffset } from '../utils';
import { Viewport2d } from '../../viewport';


export class DiameterDimension extends SketchObject {

  public obj: SketchObject;
  public angle: number;

  constructor(obj) {
    super('TCAD.TWO.DiameterDimension');
    this.obj = obj;
    this.angle = Math.PI / 4;
  }

  collectParams(params) {
  }

  getReferencePoint() {
  }

  translateSelf(dx, dy) {
  }

  drawSelf(viewer: Viewport2d) {
    if (this.obj == null) return;
    if (this.obj.className === 'TCAD.TWO.Circle') {
      this.drawForCircle(viewer);
    } else if (this.obj.className === 'TCAD.TWO.Arc') {
      this.drawForArc(viewer);
    }
  }

  drawForCircle(viewer: Viewport2d) {
    const circle = this.obj as Circle;
    var c = new Vector().setV(circle.center);
    var r = circle.radius.get();
    var angled = new Vector(r * Math.cos(this.angle), r * Math.sin(this.angle), 0);
    var a = c.minus(angled);
    var b = c.plus(angled);
    var textOff = getTextOffset(viewer.dimScale);

    var d = 2 * r;

    viewer.context.beginPath();
    viewer.context.moveTo(a.x, a.y);
    viewer.context.lineTo(b.x, b.y);
    viewer.context.closePath();
    viewer.context.stroke();

    var fontSize = 12 * viewer.dimScale;
    viewer.context.font = (fontSize) + "px Arial";
    var txt = String.fromCharCode(216) + ' ' + d.toFixed(2);
    var textWidth = viewer.context.measureText(txt).width;
    var h = d / 2 - textWidth / 2;

    var _vx = - (b.y - a.y);
    var _vy = b.x - a.x;

    //normalize
    var _vxn = _vx / d;
    var _vyn = _vy / d;

    function drawText(tx, ty) {
      viewer.context.save();
      viewer.context.translate(tx, ty);
      viewer.context.rotate(-Math.atan2(_vxn, _vyn));
      viewer.context.scale(1, -1);
      viewer.context.fillText(txt, 0, 0);
      viewer.context.restore();
    }

    var tx, ty;
    if (h - fontSize * .3 > 0) { // take into account font size to not have circle overlap symbols
      tx = (a.x + _vxn * textOff) - (-_vyn) * h;
      ty = (a.y + _vyn * textOff) - (_vxn) * h;
      drawText(tx, ty);
    } else {
      var off = 2 * viewer.dimScale;
      angled._normalize();
      var extraLine = angled.multiply(textWidth + off * 2);
      viewer.context.beginPath();
      viewer.context.moveTo(b.x, b.y);
      viewer.context.lineTo(b.x + extraLine.x, b.y + extraLine.y);
      viewer.context.closePath();
      viewer.context.stroke();
      angled._multiply(off);

      tx = (b.x + _vxn * textOff) + angled.x;
      ty = (b.y + _vyn * textOff) + angled.y;
      drawText(tx, ty);
    }
  }

  drawForArc(viewer: Viewport2d) {

    const arc = this.obj as Arc;
    var r = arc.distanceA();

    var hxn = Math.cos(this.angle);
    var hyn = Math.sin(this.angle);

    var vxn = - hyn;
    var vyn = hxn;

    //fix angle if needed
    if (!arc.isPointInsideSector(arc.center.x + hxn, arc.center.y + hyn)) {
      var cosA = hxn * (arc.a.x - arc.center.x) + hyn * (arc.a.y - arc.center.y);
      var cosB = hxn * (arc.b.x - arc.center.x) + hyn * (arc.b.y - arc.center.y);
      if (cosA - hxn > cosB - hxn) {
        this.angle = arc.getStartAngle();
      } else {
        this.angle = arc.getEndAngle();
      }
    }

    var vertOff = getTextOffset(viewer.dimScale);
    var horOff = 5 * viewer.dimScale;

    var fontSize = 12 * viewer.dimScale;
    viewer.context.font = (fontSize) + "px Arial";
    var txt = 'R ' + r.toFixed(2);
    var textWidth = viewer.context.measureText(txt).width;

    var startX = arc.center.x + hxn * r;
    var startY = arc.center.y + hyn * r;
    var lineLength = textWidth + horOff * 2;

    viewer.context.beginPath();
    viewer.context.moveTo(startX, startY);
    viewer.context.lineTo(startX + hxn * lineLength, startY + hyn * lineLength);
    viewer.context.closePath();
    viewer.context.stroke();

    var tx = startX + vxn * vertOff + hxn * horOff;
    var ty = startY + vyn * vertOff + hyn * horOff;
    viewer.context.save();
    viewer.context.translate(tx, ty);
    viewer.context.rotate(-Math.atan2(vxn, vyn));
    viewer.context.scale(1, -1);
    viewer.context.fillText(txt, 0, 0);
    viewer.context.restore();
  }

  normalDistance(aim) {
    return -1;
  }
}
