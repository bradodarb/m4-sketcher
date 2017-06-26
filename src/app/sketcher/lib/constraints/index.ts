import * as utils from '../util'
import { Ref } from './reference'
import { SketchObject } from '../geometry/render-models';
import { Param, prepare } from './solver'
import { Constraint } from './object-models/base.constraint-model';
import { Coincident } from './object-models/coincident.constraint-model';
import { RadiusOffset } from './object-models/radius-offset.constraint-model';
import { Lock } from './object-models/lock.constraint-model';
import { Parallel } from './object-models/parallel.constraint-model';
import { Perpendicular } from './object-models/perpendicular.constraint-model';
import { P2LDistanceSigned } from './object-models/distance-PL-signed.constraint-model';
import { P2LDistance } from './object-models/distance-PL.constraint-model';
import { MinLength } from './object-models/min-length.constraint-model';
import { P2LDistanceV } from './object-models/distance-PLV.constraint-model';
import { P2PDistance } from './object-models/distance-PP.constraint-model';
import { P2PDistanceV } from './object-models/distance-PPV.constraint-model';
import { GreaterThan } from './object-models/greater-than.constraint-model';
import { Radius } from './object-models/radius.constraint-model';
import { RadiusEquality } from './object-models/radius-equality.constraint-model';
import { LineEquality } from './object-models/line-equality.constraint-model';
import { Vertical } from './object-models/vertical.constraint-model';
import { Horizontal } from './object-models/horizontal.constraint-model';
import { Tangent } from './object-models/tangent.constraint-model';
import { PointOnLine } from './object-models/point-on-line.constraint-model';
import { PointOnArc } from './object-models/point-on-arc.constraint-model';
import { PointOnEllipseInternal } from './object-models/point-on-ellipse-internal.constraint-model';
import { PointOnEllipse } from './object-models/point-on-ellipse.constraint-model';
import { EllipseTangent } from './object-models/tangent-ellipse.constraint-model';
import { PointInMiddle } from './object-models/mid-point.constraint-model';
import { Symmetry } from './object-models/symetrical.constraint-model';
import { Angle } from './object-models/angle.constraint-model';
import { LockConvex } from './object-models/lock-convexity.constraint-model';

import { SubSystem } from './subsystem';


const Factory = {};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['coi'] = function (refs, data) {
  return new Coincident(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['RadiusOffset'] = function (refs, data) {
  return new RadiusOffset(refs(data[0]), refs(data[1]), data[2]);
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['lock'] = function (refs, data) {
  return new Lock(refs(data[0]), data[1]);
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['parallel'] = function (refs, data) {
  return new Parallel(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['perpendicular'] = function (refs, data) {
  return new Perpendicular(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['P2LDistanceSigned'] = function (refs, data) {
  return new P2LDistanceSigned(refs(data[0]), refs(data[1]), refs(data[2]), data[3]);
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['P2LDistance'] = function (refs, data) {
  return new P2LDistance(refs(data[0]), refs(data[1]), data[2]);
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['MinLength'] = function (refs, data) {
  return new MinLength(refs(data[0]), refs(data[1]), data[2]);
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['P2LDistanceV'] = function (refs, data) {
  return new P2LDistanceV(refs(data[0]), refs(data[1]), data[2]);
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['P2PDistance'] = function (refs, data) {
  return new P2PDistance(refs(data[0]), refs(data[1]), data[2]);
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['P2PDistanceV'] = function (refs, data) {
  return new P2PDistanceV(refs(data[0]), refs(data[1]), data[2]);
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['GreaterThan'] = function (refs, data) {
  return new GreaterThan(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['Radius'] = function (refs, data) {
  return new Radius(refs(data[0]), data[1]);
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['RR'] = function (refs, data) {
  return new RadiusEquality(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['LL'] = function (refs, data) {
  return new LineEquality(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['Vertical'] = function (refs, data) {
  return new Vertical(refs(data[0]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['Horizontal'] = function (refs, data) {
  return new Horizontal(refs(data[0]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['Tangent'] = function (refs, data) {
  return new Tangent(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['PointOnLine'] = function (refs, data) {
  return new PointOnLine(refs(data[0]), refs(data[1]));
};
// ------------------------------------------------------------------------------------------------------------------ //

Factory['PointOnArc'] = function (refs, data) {
  return new PointOnArc(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['PointOnEllipseInternal'] = function (refs, data) {
  return new PointOnEllipseInternal(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['PointOnEllipse'] = function (refs, data) {
  return new PointOnEllipse(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['EllipseTangent'] = function (refs, data) {
  return new EllipseTangent(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['PointInMiddle'] = function (refs, data) {
  return new PointInMiddle(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['Symmetry'] = function (refs, data) {
  return new Symmetry(refs(data[0]), refs(data[1]));
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['Angle'] = function (refs, data) {
  return new Angle(refs(data[0]), refs(data[1]), refs(data[2]), refs(data[3]), data[4]);
};

// ------------------------------------------------------------------------------------------------------------------ //

Factory['LockConvex'] = function (refs, data) {
  return new LockConvex(refs(data[0]), refs(data[1]), refs(data[2]));
};

// ------------------------------------------------------------------------------------------------------------------ //



export {
  SubSystem,
  Constraint,
  Coincident,
  RadiusOffset,
  Lock,
  Parallel,
  Perpendicular,
  P2LDistanceSigned,
  P2LDistance,
  MinLength,
  P2LDistanceV,
  P2PDistance,
  P2PDistanceV,
  GreaterThan,
  Radius,
  RadiusEquality,
  LineEquality,
  Vertical,
  Horizontal,
  Tangent,
  PointOnLine,
  PointOnArc,
  PointOnEllipseInternal,
  PointOnEllipse,
  EllipseTangent,
  PointInMiddle,
  Symmetry,
  Angle,
  LockConvex
}
