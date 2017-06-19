import Vector from './vector';

var ORIGIN = new Vector(0, 0, 0);

var AXIS = {
  X : new Vector(1, 0, 0),
  Y : new Vector(0, 1, 0),
  Z : new Vector(0, 0, 1)
};

var IDENTITY_BASIS = [AXIS.X, AXIS.Y, AXIS.Z];

export const STANDARD_BASES = {
  'XY': IDENTITY_BASIS,
  'XZ': [AXIS.X, AXIS.Z, AXIS.Y],
  'ZY': [AXIS.Z, AXIS.Y, AXIS.X]
};


/** @constructor */
function Matrix3() {
  this.reset();
}

Matrix3.prototype.reset = function() {
  this.mxx = 1; this.mxy = 0; this.mxz = 0; this.tx = 0;
  this.myx = 0; this.myy = 1; this.myz = 0; this.ty = 0;
  this.mzx = 0; this.mzy = 0; this.mzz = 1; this.tz = 0;
  return this;
};

Matrix3.prototype.setBasis = function(basis) {
  var b = basis;
  this.mxx = b[0].x; this.mxy = b[1].x; this.mxz = b[2].x; this.tx = 0;
  this.myx = b[0].y; this.myy = b[1].y; this.myz = b[2].y; this.ty = 0;
  this.mzx = b[0].z; this.mzy = b[1].z; this.mzz = b[2].z; this.tz = 0;
  return this;
};

Matrix3.prototype.translate = function(dx, dy, dz) {
  this.tx += dx;
  this.ty += dy;
  this.tz += dz;
  return this;
};

Matrix3.prototype.set3 = function(
  mxx, mxy, mxz,
  myx, myy, myz,
  mzx, mzy, mzz
) {
  this.mxx = mxx; this.mxy = mxy; this.mxz = mxz;
  this.myx = myx; this.myy = myy; this.myz = myz;
  this.mzx = mzx; this.mzy = mzy; this.mzz = mzz;
  return this;
};

Matrix3.prototype.set34 = function(
  mxx, mxy, mxz, tx,
  myx, myy, myz, ty,
  mzx, mzy, mzz, tz
) {
  this.mxx = mxx; this.mxy = mxy; this.mxz = mxz; this.tx = tx;
  this.myx = myx; this.myy = myy; this.myz = myz; this.ty = ty;
  this.mzx = mzx; this.mzy = mzy; this.mzz = mzz; this.tz = tz;
  return this;
};

Matrix3.prototype.setMatrix = function(m) {
  this.mxx = m.mxx; this.mxy = m.mxy; this.mxz = m.mxz; this.tx = m.tx;
  this.myx = m.myx; this.myy = m.myy; this.myz = m.myz; this.ty = m.ty;
  this.mzx = m.mzx; this.mzy = m.mzy; this.mzz = m.mzz; this.tz = m.tz;
  return this;
};

Matrix3.prototype.invert = function() {

  var det =
    this.mxx * (this.myy * this.mzz - this.mzy * this.myz) +
    this.mxy * (this.myz * this.mzx - this.mzz * this.myx) +
    this.mxz * (this.myx * this.mzy - this.mzx * this.myy);

  if (det == 0.0) {
    return null;
  }

  var cxx =   this.myy * this.mzz - this.myz * this.mzy;
  var cyx = - this.myx * this.mzz + this.myz * this.mzx;
  var czx =   this.myx * this.mzy - this.myy * this.mzx;
  var cxt = - this.mxy * (this.myz * this.tz - this.mzz  * this.ty)
    - this.mxz * (this.ty  * this.mzy - this.tz  * this.myy)
    - this.tx  * (this.myy * this.mzz - this.mzy * this.myz);
  var cxy = - this.mxy * this.mzz + this.mxz * this.mzy;
  var cyy =   this.mxx * this.mzz - this.mxz * this.mzx;
  var czy = - this.mxx * this.mzy + this.mxy * this.mzx;
  var cyt =   this.mxx * (this.myz * this.tz  - this.mzz * this.ty)
    + this.mxz * (this.ty  * this.mzx - this.tz  * this.myx)
    + this.tx  * (this.myx * this.mzz - this.mzx * this.myz);
  var cxz =   this.mxy * this.myz - this.mxz * this.myy;
  var cyz = - this.mxx * this.myz + this.mxz * this.myx;
  var czz =   this.mxx * this.myy - this.mxy * this.myx;
  var czt = - this.mxx * (this.myy * this.tz - this.mzy  * this.ty)
    - this.mxy * (this.ty  * this.mzx - this.tz  * this.myx)
    - this.tx  * (this.myx * this.mzy - this.mzx * this.myy);

  var result = new Matrix3();
  result.mxx = cxx / det;
  result.mxy = cxy / det;
  result.mxz = cxz / det;
  result.tx = cxt / det;
  result.myx = cyx / det;
  result.myy = cyy / det;
  result.myz = cyz / det;
  result.ty = cyt / det;
  result.mzx = czx / det;
  result.mzy = czy / det;
  result.mzz = czz / det;
  result.tz = czt / det;
  return result;
};

Matrix3.prototype.combine = function(transform) {
  var txx = transform.mxx;
  var txy = transform.mxy;
  var txz = transform.mxz;
  var ttx = transform.tx;
  var tyx = transform.myx;
  var tyy = transform.myy;
  var tyz = transform.myz;
  var tty = transform.ty;
  var tzx = transform.mzx;
  var tzy = transform.mzy;
  var tzz = transform.mzz;
  var ttz = transform.tz;

  var m = new Matrix3();
  m.mxx = (this.mxx * txx + this.mxy * tyx + this.mxz * tzx);
  m.mxy = (this.mxx * txy + this.mxy * tyy + this.mxz * tzy);
  m.mxz = (this.mxx * txz + this.mxy * tyz + this.mxz * tzz);
  m.tx  = (this.mxx * ttx + this.mxy * tty + this.mxz * ttz + this.tx);
  m.myx = (this.myx * txx + this.myy * tyx + this.myz * tzx);
  m.myy = (this.myx * txy + this.myy * tyy + this.myz * tzy);
  m.myz = (this.myx * txz + this.myy * tyz + this.myz * tzz);
  m.ty  = (this.myx * ttx + this.myy * tty + this.myz * ttz + this.ty);
  m.mzx = (this.mzx * txx + this.mzy * tyx + this.mzz * tzx);
  m.mzy = (this.mzx * txy + this.mzy * tyy + this.mzz * tzy);
  m.mzz = (this.mzx * txz + this.mzy * tyz + this.mzz * tzz);
  m.tz  = (this.mzx * ttx + this.mzy * tty + this.mzz * ttz + this.tz);

  return m;
};

Matrix3.prototype.apply = function(vector) {
  return this.__apply(vector, new Vector())
};

Matrix3.prototype._apply = function(vector) {
  return this.__apply(vector, vector);
};

Matrix3.prototype.__apply = function(vector, out) {
  var x = vector.x;
  var y = vector.y;
  var z = vector.z;
  return out.set(
    this.mxx * x + this.mxy * y + this.mxz * z + this.tx,
    this.myx * x + this.myy * y + this.myz * z + this.ty,
    this.mzx * x + this.mzy * y + this.mzz * z + this.tz);
};

Matrix3.rotateMatrix = function(angle, axis, pivot) {
  var sin = Math.sin(angle);
  var cos = Math.cos(angle);
  var axisX, axisY, axisZ;
  var m = new Matrix3();

  if (axis === AXIS.X || axis === AXIS.Y || axis === AXIS.Z) {
    axisX = axis.x;
    axisY = axis.y;
    axisZ = axis.z;
  } else {
    // normalize
    var mag = axis.length();

    if (mag == 0.0) {
      return m;
    } else {
      axisX = axis.x / mag;
      axisY = axis.y / mag;
      axisZ = axis.z / mag;
    }
  }

  var px = pivot.x;
  var py = pivot.y;
  var pz = pivot.z;

  m.mxx = cos + axisX * axisX * (1 - cos);
  m.mxy = axisX * axisY * (1 - cos) - axisZ * sin;
  m.mxz = axisX * axisZ * (1 - cos) + axisY * sin;

  m.tx = px * (1 - m.mxx) - py * m.mxy - pz * m.mxz;

  m.myx = axisY * axisX * (1 - cos) + axisZ * sin;
  m.myy = cos + axisY * axisY * (1 - cos);
  m.myz = axisY * axisZ * (1 - cos) - axisX * sin;
  m.ty = py * (1 - m.myy) - px * m.myx - pz * m.myz;

  m.mzx = axisZ * axisX * (1 - cos) - axisY * sin;
  m.mzy = axisZ * axisY * (1 - cos) + axisX * sin;
  m.mzz = cos + axisZ * axisZ * (1 - cos);
  m.tz = pz * (1 - m.mzz) - px * m.mzx - py * m.mzy;
  return m;
};

function BasisForPlane(normal) {
  let alignPlane, x, y;
  if (Math.abs(normal.dot(AXIS.Y)) < 0.5) {
    alignPlane = normal.cross(AXIS.Y);
  } else {
    alignPlane = normal.cross(AXIS.Z);
  }
  y = alignPlane.cross(normal);
  x = y.cross(normal);
  return [x, y, normal];
}

export {Matrix3, ORIGIN, IDENTITY_BASIS, AXIS, BasisForPlane}; 