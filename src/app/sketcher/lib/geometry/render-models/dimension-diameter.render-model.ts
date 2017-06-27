import * as utils from '../../util';
import * as math from '../../math/math';
import Vector from '../../math/vector'
import { SketchObject } from './sketch-shape.render-model';
import { Circle } from './circle.render-model';
import { Arc } from './arc.render-model';
import { getTextOffset } from '../utils';


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

  translateImpl(dx, dy) {
  }

  drawImpl(ctx, scale, viewer) {
    if (this.obj == null) return;
    if (this.obj.className === 'TCAD.TWO.Circle') {
      this.drawForCircle(ctx, scale, viewer);
    } else if (this.obj.className === 'TCAD.TWO.Arc') {
      this.drawForArc(ctx, scale, viewer);
    }
  }

  drawForCircle(ctx, scale, viewer) {
    const circle = this.obj as Circle;
    var c = new Vector().setV(circle.center);
    var r = circle.radius.get();
    var angled = new Vector(r * Math.cos(this.angle), r * Math.sin(this.angle), 0);
    var a = c.minus(angled);
    var b = c.plus(angled);
    var textOff = getTextOffset(viewer.dimScale);

    var d = 2 * r;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.closePath();
    ctx.stroke();

    var fontSize = 12 * viewer.dimScale;
    ctx.font = (fontSize) + "px Arial";
    var txt = String.fromCharCode(216) + ' ' + d.toFixed(2);
    var textWidth = ctx.measureText(txt).width;
    var h = d / 2 - textWidth / 2;

    var _vx = - (b.y - a.y);
    var _vy = b.x - a.x;

    //normalize
    var _vxn = _vx / d;
    var _vyn = _vy / d;

    function drawText(tx, ty) {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(-Math.atan2(_vxn, _vyn));
      ctx.scale(1, -1);
      ctx.fillText(txt, 0, 0);
      ctx.restore();
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
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + extraLine.x, b.y + extraLine.y);
      ctx.closePath();
      ctx.stroke();
      angled._multiply(off);

      tx = (b.x + _vxn * textOff) + angled.x;
      ty = (b.y + _vyn * textOff) + angled.y;
      drawText(tx, ty);
    }
  }

  drawForArc(ctx, scale, viewer) {

    const arc = this.obj as Arc;
    var r = arc.distanceA();

    var hxn = Math.cos(this.angle);
    var hyn = Math.sin(this.angle);

    var vxn = - hyn;
    var vyn = hxn;

    //fix angle if needed
    if (!arc.isPointInsideSector(arc.c.x + hxn, arc.c.y + hyn)) {
      var cosA = hxn * (arc.a.x - arc.c.x) + hyn * (arc.a.y - arc.c.y);
      var cosB = hxn * (arc.b.x - arc.c.x) + hyn * (arc.b.y - arc.c.y);
      if (cosA - hxn > cosB - hxn) {
        this.angle = arc.getStartAngle();
      } else {
        this.angle = arc.getEndAngle();
      }
    }

    var vertOff = getTextOffset(viewer.dimScale);
    var horOff = 5 * viewer.dimScale;

    var fontSize = 12 * viewer.dimScale;
    ctx.font = (fontSize) + "px Arial";
    var txt = 'R ' + r.toFixed(2);
    var textWidth = ctx.measureText(txt).width;

    var startX = arc.c.x + hxn * r;
    var startY = arc.c.y + hyn * r;
    var lineLength = textWidth + horOff * 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + hxn * lineLength, startY + hyn * lineLength);
    ctx.closePath();
    ctx.stroke();

    var tx = startX + vxn * vertOff + hxn * horOff;
    var ty = startY + vyn * vertOff + hyn * horOff;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(-Math.atan2(vxn, vyn));
    ctx.scale(1, -1);
    ctx.fillText(txt, 0, 0);
    ctx.restore();
  }

  normalDistance(aim) {
    return -1;
  }
}
