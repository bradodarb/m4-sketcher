import Vector from './vector';

var ORIGIN = new Vector(0, 0, 0);

var AXIS = {
  X: new Vector(1, 0, 0),
  Y: new Vector(0, 1, 0),
  Z: new Vector(0, 0, 1)
};

var IDENTITY_BASIS = [AXIS.X, AXIS.Y, AXIS.Z];

export const STANDARD_BASES = {
  'XY': IDENTITY_BASIS,
  'XZ': [AXIS.X, AXIS.Z, AXIS.Y],
  'ZY': [AXIS.Z, AXIS.Y, AXIS.X]
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

export { ORIGIN, IDENTITY_BASIS, AXIS, BasisForPlane };
