import * as utils from '../../utils/utils'
import * as math from '../../math/math'
import Vector from '../../math/vector'
import {SketchObject} from './sketch-object'

class LinearDimension extends SketchObject {
  
  constructor(a, b) {
    super();
    this.a = a;
    this.b = b;
    this.flip = false;
  }
  
  collectParams(params) {
  }
  
  getReferencePoint() {
    return this.a;
  }
  
  translateImpl(dx, dy) {
  }
  
  getA() { return this.a }
  getB() { return this.b }
  
  drawImpl(ctx, scale, viewer) {
  
    var off = 30 * viewer.dimScale;
    var textOff = getTextOff(viewer.dimScale);
  
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
  
    ctx.beginPath();
  
    var _ax = a.x + _vx;
    var _ay = a.y + _vy;
    var _bx = b.x + _vx;
    var _by = b.y + _vy;
  
    ctx.moveTo(_ax, _ay);
    ctx.lineTo(_bx, _by);
  
  
    function drawRef(start, x, y) {
      var vec = new Vector(x - start.x, y - start.y);
      vec._normalize();
      vec._multiply(7 * viewer.dimScale);
      
      ctx.moveTo(start.x, start.y );
      ctx.lineTo(x, y);
      ctx.lineTo(x + vec.x, y + vec.y);
    }
  
    drawRef(startA, _ax, _ay);
    drawRef(startB, _bx, _by);
  
    ctx.closePath();
    ctx.stroke();
  
    function drawArrow(x, y) {
      var s1 = 50;
      var s2 = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - s1, y - s2);
      ctx.closePath();
      ctx.stroke();
    }
  
  //  drawArrow(_ax, _ay);
  //  drawArrow(_bx, _by);
  
    ctx.font= (12 * viewer.dimScale) + "px Arial";
    var txt = d.toFixed(2);
    var h = d / 2 - ctx.measureText(txt).width / 2;
  
    if (h > 0) {
      var tx = (_ax + _vxn * textOff) - (- _vyn) * h;
      var ty = (_ay + _vyn * textOff) - (  _vxn) * h;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(	- Math.atan2(_vxn, _vyn));
      ctx.scale(1, -1);
      ctx.fillText(txt, 0, 0);
      ctx.restore();
    }
  }
  
  normalDistance(aim) {
    return -1;
  }
}

export class Dimension extends LinearDimension {
  constructor(a, b) {
    super(a, b);
  }
}
Dimension.prototype._class = 'TCAD.TWO.Dimension';


export class HDimension extends LinearDimension {
  constructor(a, b) {
    super(a, b);
  }

  getA() {
    return this.a;
  }
  
  getB() {
    return {x: this.b.x, y: this.a.y};
  }
}
HDimension.prototype._class = 'TCAD.TWO.HDimension';

export class VDimension extends LinearDimension {
  
  constructor(a, b) {
    super(a, b);
  }

  getA() {
    return this.a;
  }

  getB() {
    return {x: this.a.x, y: this.b.y};
  }
}
VDimension.prototype._class = 'TCAD.TWO.VDimension';


export class DiameterDimension extends SketchObject {
  
  constructor(obj) {
    super();
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
    if (this.obj._class === 'TCAD.TWO.Circle') {
      this.drawForCircle(ctx, scale, viewer);  
    } else if (this.obj._class === 'TCAD.TWO.Arc') { 
      this.drawForArc(ctx, scale, viewer);
    }
  }
  
  drawForCircle(ctx, scale, viewer) {
    var c = new Vector().setV(this.obj.c);
    var r = this.obj.r.get();
    var angled = new Vector(r * Math.cos(this.angle), r * Math.sin(this.angle), 0);
    var a = c.minus(angled);
    var b = c.plus(angled);
    var textOff = getTextOff(viewer.dimScale);
  
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
      ty = (a.y + _vyn * textOff) - (  _vxn) * h;
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
  
    var r = this.obj.distanceA();
  
    var hxn = Math.cos(this.angle);
    var hyn = Math.sin(this.angle);
  
    var vxn = - hyn;
    var vyn = hxn;
  
    //fix angle if needed
    if (!this.obj.isPointInsideSector(this.obj.c.x + hxn, this.obj.c.y + hyn)) {
      var cosA = hxn * (this.obj.a.x - this.obj.c.x) + hyn * (this.obj.a.y - this.obj.c.y);
      var cosB = hxn * (this.obj.b.x - this.obj.c.x) + hyn * (this.obj.b.y - this.obj.c.y);
      if (cosA - hxn > cosB - hxn) {
        this.angle = this.obj.getStartAngle();
      } else {
        this.angle = this.obj.getEndAngle();
      }
    }
  
    var vertOff = getTextOff(viewer.dimScale);
    var horOff = 5 * viewer.dimScale;
  
    var fontSize = 12 * viewer.dimScale;
    ctx.font = (fontSize) + "px Arial";
    var txt = 'R ' + r.toFixed(2);
    var textWidth = ctx.measureText(txt).width;
  
    var startX = this.obj.c.x + hxn * r;
    var startY = this.obj.c.y + hyn * r;
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
DiameterDimension.prototype._class = 'TCAD.TWO.DiameterDimension';


function getTextOff(scale) {
  return 3 * scale;
}


