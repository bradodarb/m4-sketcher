import * as utils from '../util'
import { Ref } from './reference'
import { SketchObject } from '../geometry/render-models';
import { Param, prepare } from './solver'
import Vector from '../math/vector'
import * as math from '../math/math'
import * as fetch from './fetchers'

var Constraints: any = {};


class SubSystem {
  public alg: number = 1;
  public error: number = 0;
  public reduce: boolean = false;
  public constraints: Array<any>;
}

class Constraint {
  private _name: string;
  private _uiName: string;
  private _reducible: boolean;

  public get NAME(): string {
    return this._name;
  }
  public get UI_NAME(): string {
    return this._uiName;
  }
  public get reducible(): boolean {
    return this._reducible;
  }

  constructor(name, uiName, reducible = false) {
    this._name = name;
    this._uiName = uiName;
    this._reducible = reducible;
  }

  public getSolveData() {

  }
}

class Coincident extends Constraint {
  public a: SketchObject;
  public b: SketchObject;

  constructor(a, b) {
    super('coi', 'Coincident', true);
    this.a = a;
    this.b = b;
    this.a.linked.push(b);
    this.b.linked.push(a);
  }
}


Constraints.ParentsCollector = function () {
  this.parents = [];
  var parents = this.parents;
  var index = {};
  function add(obj) {
    if (index[obj.id] === undefined) {
      index[obj.id] = obj;
      parents.push(obj);
    }
  }
  this.check = function (obj) {
    if (obj.parent !== null) {
      add(obj.parent);
    } else {
      add(obj);
    }
  };
};

Constraints.Factory = {};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.Coincident = function (a, b) {
  this.a = a;
  this.b = b;
  a.linked.push(b);
  b.linked.push(a);
};

Constraints.Coincident.prototype.NAME = 'coi';
Constraints.Coincident.prototype.UI_NAME = 'Coincident';
Constraints.Coincident.prototype.reducible = true;

Constraints.Coincident.prototype.getSolveData = function () {
  return [
    ['equal', [this.a._x, this.b._x], []],
    ['equal', [this.a._y, this.b._y], []]
  ];
};

Constraints.Coincident.prototype.serialize = function () {
  return [this.NAME, [this.a.id, this.b.id]];
};

Constraints.Factory[Constraints.Coincident.prototype.NAME] = function (refs, data) {
  return new Constraints.Coincident(refs(data[0]), refs(data[1]));
};

Constraints.Coincident.prototype.getObjects = function () {
  return [this.a, this.b];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.RadiusOffset = function (arc1, arc2, offset) {
  this.arc1 = arc1;
  this.arc2 = arc2;
  this.offset = offset;
};

Constraints.RadiusOffset.prototype.NAME = 'RadiusOffset';
Constraints.RadiusOffset.prototype.UI_NAME = 'Radius Offset';

Constraints.RadiusOffset.prototype.getSolveData = function (resolver) {
  return [
    ['Diff', [this.arc1.r, this.arc2.r], [resolver(this.offset)]]
  ];
};

Constraints.RadiusOffset.prototype.serialize = function () {
  return [this.NAME, [this.arc1.id, this.arc2.id, this.offset]];
};

Constraints.Factory[Constraints.RadiusOffset.prototype.NAME] = function (refs, data) {
  return new Constraints.RadiusOffset(refs(data[0]), refs(data[1]), data[2]);
};

Constraints.RadiusOffset.prototype.getObjects = function () {
  return [this.arc1, this.arc2];
};

Constraints.RadiusOffset.prototype.SettableFields = { 'offset': "Enter the offset" };

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.Lock = function (p, c) {
  this.p = p;
  this.c = c;
};

Constraints.Lock.prototype.NAME = 'lock';
Constraints.Lock.prototype.UI_NAME = 'Lock';

Constraints.Lock.prototype.getSolveData = function () {
  return [
    ['equalsTo', [this.p._x], [this.c.x]],
    ['equalsTo', [this.p._y], [this.c.y]]
  ];
};

Constraints.Lock.prototype.serialize = function () {
  return [this.NAME, [this.p.id, this.c]];
};

Constraints.Factory[Constraints.Lock.prototype.NAME] = function (refs, data) {
  return new Constraints.Lock(refs(data[0]), data[1]);
};


Constraints.Lock.prototype.getObjects = function () {
  return [this.p];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.Parallel = function (l1, l2) {
  this.l1 = l1;
  this.l2 = l2;
};

Constraints.Parallel.prototype.NAME = 'parallel';
Constraints.Parallel.prototype.UI_NAME = 'Parallel';

Constraints.Parallel.prototype.getSolveData = function () {
  var params = [];
  this.l1.collectParams(params);
  this.l2.collectParams(params);
  return [[this.NAME, params, []]];
};

Constraints.Parallel.prototype.serialize = function () {
  return [this.NAME, [this.l1.id, this.l2.id]];
};

Constraints.Factory[Constraints.Parallel.prototype.NAME] = function (refs, data) {
  return new Constraints.Parallel(refs(data[0]), refs(data[1]));
};

Constraints.Parallel.prototype.getObjects = function () {
  return [this.l1, this.l2];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.Perpendicular = function (l1, l2) {
  this.l1 = l1;
  this.l2 = l2;
};

Constraints.Perpendicular.prototype.NAME = 'perpendicular';
Constraints.Perpendicular.prototype.UI_NAME = 'Perpendicular';

Constraints.Perpendicular.prototype.getSolveData = function () {
  var params = [];
  this.l1.collectParams(params);
  this.l2.collectParams(params);
  return [[this.NAME, params, []]];
};

Constraints.Perpendicular.prototype.serialize = function () {
  return [this.NAME, [this.l1.id, this.l2.id]];
};

Constraints.Factory[Constraints.Perpendicular.prototype.NAME] = function (refs, data) {
  return new Constraints.Perpendicular(refs(data[0]), refs(data[1]));
};

Constraints.Perpendicular.prototype.getObjects = function () {
  return [this.l1, this.l2];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.P2LDistanceSigned = function (p, a, b, d) {
  this.p = p;
  this.a = a;
  this.b = b;
  this.d = d;
};

Constraints.P2LDistanceSigned.prototype.NAME = 'P2LDistanceSigned';
Constraints.P2LDistanceSigned.prototype.UI_NAME = 'Distance P & L';

Constraints.P2LDistanceSigned.prototype.getSolveData = function (resolver) {
  var params = [];
  this.p.collectParams(params);
  this.a.collectParams(params);
  this.b.collectParams(params);
  return [[this.NAME, params, [resolver(this.d)]]];
};

Constraints.P2LDistanceSigned.prototype.serialize = function () {
  return [this.NAME, [this.p.id, this.a.id, this.b.id, this.d]];
};

Constraints.Factory[Constraints.P2LDistanceSigned.prototype.NAME] = function (refs, data) {
  return new Constraints.P2LDistanceSigned(refs(data[0]), refs(data[1]), refs(data[2]), data[3]);
};

Constraints.P2LDistanceSigned.prototype.getObjects = function () {
  const collector = new Constraints.ParentsCollector();
  collector.check(this.a);
  collector.check(this.b);
  collector.parents.push(this.p);
  return collector.parents;
};

Constraints.P2LDistanceSigned.prototype.SettableFields = { 'd': "Enter the distance" };

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.P2LDistance = function (p, l, d) {
  this.p = p;
  this.l = l;
  this.d = d;
};

Constraints.P2LDistance.prototype.NAME = 'P2LDistance';
Constraints.P2LDistance.prototype.UI_NAME = 'Distance P & L';

Constraints.P2LDistance.prototype.getSolveData = function (resolver) {
  var params = [];
  this.p.collectParams(params);
  this.l.collectParams(params);
  return [[this.NAME, params, [resolver(this.d)]]];
};

Constraints.P2LDistance.prototype.serialize = function () {
  return [this.NAME, [this.p.id, this.l.id, this.d]];
};

Constraints.Factory[Constraints.P2LDistance.prototype.NAME] = function (refs, data) {
  return new Constraints.P2LDistance(refs(data[0]), refs(data[1]), data[2]);
};

Constraints.P2LDistance.prototype.getObjects = function () {
  return [this.p, this.l];
};

Constraints.P2LDistance.prototype.SettableFields = { 'd': "Enter the distance" };

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.MinLength = function (a, b, min) {
  this.a = a;
  this.b = b;
  this.min = min;
};

Constraints.MinLength.prototype.aux = true;
Constraints.MinLength.prototype.NAME = 'MinLength';
Constraints.MinLength.prototype.UI_NAME = 'MinLength';

Constraints.MinLength.prototype.getSolveData = function () {
  var params = [];
  this.a.collectParams(params);
  this.b.collectParams(params);
  return [[this.NAME, params, [this.min]]];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.P2LDistanceV = function (p, l, d) {
  this.p = p;
  this.l = l;
  this.d = d;
};

Constraints.P2LDistanceV.prototype.aux = true;
Constraints.P2LDistanceV.prototype.NAME = 'P2LDistanceV';
Constraints.P2LDistanceV.prototype.UI_NAME = 'Distance P & L';

Constraints.P2LDistanceV.prototype.getSolveData = function () {
  var params = [];
  this.p.collectParams(params);
  this.l.collectParams(params);
  params.push(this.d);
  return [[this.NAME, params]];
};

// We don't serialize auxiliary constraints
//
//Constraints.P2LDistanceV.prototype.serialize = function() {
//  return [this.NAME, [this.p.id, this.l.id, this.d.id]];
//};
//
//Constraints.Factory[Constraints.P2LDistanceV.prototype.NAME] = function(refs, data) {
//  return new Constraints.P2LDistanceV(refs(data[0]), refs(data[1]), refs(data[2]));
//};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.P2PDistance = function (p1, p2, d) {
  this.p1 = p1;
  this.p2 = p2;
  this.d = d;
};

Constraints.P2PDistance.prototype.NAME = 'P2PDistance';
Constraints.P2PDistance.prototype.UI_NAME = 'Distance Points';

Constraints.P2PDistance.prototype.getSolveData = function (resolver) {
  var params = [];
  this.p1.collectParams(params);
  this.p2.collectParams(params);
  return [[this.NAME, params, [resolver(this.d)]]];
};

Constraints.P2PDistance.prototype.serialize = function () {
  return [this.NAME, [this.p1.id, this.p2.id, this.d]];
};

Constraints.Factory[Constraints.P2PDistance.prototype.NAME] = function (refs, data) {
  return new Constraints.P2PDistance(refs(data[0]), refs(data[1]), data[2]);
};

Constraints.P2PDistance.prototype.getObjects = function () {
  return [this.p1, this.p2];
};

Constraints.P2PDistance.prototype.SettableFields = { 'd': "Enter the distance" };

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.P2PDistanceV = function (p1, p2, d) {
  this.p1 = p1;
  this.p2 = p2;
  this.d = d;
};

Constraints.P2PDistanceV.prototype.aux = true;
Constraints.P2PDistanceV.prototype.NAME = 'P2PDistanceV';
Constraints.P2PDistanceV.prototype.UI_NAME = 'Distance Points';

Constraints.P2PDistanceV.prototype.getSolveData = function () {
  var params = [];
  this.p1.collectParams(params);
  this.p2.collectParams(params);
  params.push(this.d);
  return [[this.NAME, params]];
};

// We don't serialize auxiliary constraints
//
//Constraints.P2PDistanceV.prototype.serialize = function() {
//  return [this.NAME, [this.p1.id, this.p2.id, this.d.id]];
//};
//
//Constraints.Factory[Constraints.P2PDistanceV.prototype.NAME] = function(refs, data) {
//  return new Constraints.P2PDistanceV(refs(data[0]), refs(data[1]), refs(data[2]));
//};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.GreaterThan = function (p, limit) {
  this.p = p;
  this.limit = limit;
};

Constraints.GreaterThan.prototype.aux = true;
Constraints.GreaterThan.prototype.NAME = 'GreaterThan';
Constraints.GreaterThan.prototype.UI_NAME = 'Greater Than';

Constraints.GreaterThan.prototype.getSolveData = function () {
  return [[this.NAME, [this.p], [this.limit]]];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.Radius = function (arc, d) {
  this.arc = arc;
  this.d = d;
};

Constraints.Radius.prototype.NAME = 'Radius';
Constraints.Radius.prototype.UI_NAME = 'Radius Value';


Constraints.Radius.prototype.getSolveData = function (resolver) {
  return [['equalsTo', [this.arc.r], [resolver(this.d)]]];
};

Constraints.Radius.prototype.serialize = function () {
  return [this.NAME, [this.arc.id, this.d]];
};

Constraints.Factory[Constraints.Radius.prototype.NAME] = function (refs, data) {
  return new Constraints.Radius(refs(data[0]), data[1]);
};

Constraints.Radius.prototype.getObjects = function () {
  return [this.arc];
};

Constraints.Radius.prototype.SettableFields = { 'd': "Enter the radius value" };

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.RR = function (arc1, arc2) {
  this.arc1 = arc1;
  this.arc2 = arc2;
};

Constraints.RR.prototype.NAME = 'RR';
Constraints.RR.prototype.UI_NAME = 'Radius Equality';
//Constraints.RR.prototype.reducible = true;


Constraints.RR.prototype.getSolveData = function () {
  return [['equal', [this.arc1.r, this.arc2.r], []]];
};

Constraints.RR.prototype.serialize = function () {
  return [this.NAME, [this.arc1.id, this.arc2.id]];
};

Constraints.Factory[Constraints.RR.prototype.NAME] = function (refs, data) {
  return new Constraints.RR(refs(data[0]), refs(data[1]));
};

Constraints.RR.prototype.getObjects = function () {
  return [this.arc1, this.arc2];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.LL = function (line1, line2) {
  this.line1 = line1;
  this.line2 = line2;
  this.length = new Ref(math.distanceAB(line1.a, line1.b));
};

Constraints.LL.prototype.NAME = 'LL';
Constraints.LL.prototype.UI_NAME = 'Lines Equality';

Constraints.LL.prototype.getSolveData = function () {
  var params1 = [];
  var params2 = [];
  this.line1.collectParams(params1);
  this.line2.collectParams(params2);
  params1.push(this.length);
  params2.push(this.length);
  return [
    ['P2PDistanceV', params1, []],
    ['P2PDistanceV', params2, []]
  ];
};

Constraints.LL.prototype.serialize = function () {
  return [this.NAME, [this.line1.id, this.line2.id]];
};

Constraints.Factory[Constraints.LL.prototype.NAME] = function (refs, data) {
  return new Constraints.LL(refs(data[0]), refs(data[1]));
};

Constraints.LL.prototype.getObjects = function () {
  return [this.line1, this.line2];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.Vertical = function (line) {
  this.line = line;
};

Constraints.Vertical.prototype.NAME = 'Vertical';
Constraints.Vertical.prototype.UI_NAME = 'Vertical';
//Constraints.Vertical.prototype.reducible = true;

Constraints.Vertical.prototype.getSolveData = function () {
  return [['equal', [this.line.a._x, this.line.b._x], []]];
};

Constraints.Vertical.prototype.serialize = function () {
  return [this.NAME, [this.line.id]];
};

Constraints.Factory[Constraints.Vertical.prototype.NAME] = function (refs, data) {
  return new Constraints.Vertical(refs(data[0]));
};

Constraints.Vertical.prototype.getObjects = function () {
  return [this.line];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.Horizontal = function (line) {
  this.line = line;
};

Constraints.Horizontal.prototype.NAME = 'Horizontal';
Constraints.Horizontal.prototype.UI_NAME = 'Horizontal';
//Constraints.Horizontal.prototype.reducible = true;

Constraints.Horizontal.prototype.getSolveData = function () {
  return [['equal', [this.line.a._y, this.line.b._y], []]];
};

Constraints.Horizontal.prototype.serialize = function () {
  return [this.NAME, [this.line.id]];
};

Constraints.Factory[Constraints.Horizontal.prototype.NAME] = function (refs, data) {
  return new Constraints.Horizontal(refs(data[0]));
};

Constraints.Horizontal.prototype.getObjects = function () {
  return [this.line];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.Tangent = function (arc, line) {
  this.arc = arc;
  this.line = line;
};

Constraints.Tangent.prototype.NAME = 'Tangent';
Constraints.Tangent.prototype.UI_NAME = 'Tangent';

Constraints.Tangent.prototype.getSolveData = function () {
  var params = [];
  this.arc.c.collectParams(params);
  this.line.collectParams(params);
  params.push(this.arc.r);
  return [['P2LDistanceV', params, []]];
};

Constraints.Tangent.prototype.serialize = function () {
  return [this.NAME, [this.arc.id, this.line.id]];
};

Constraints.Factory[Constraints.Tangent.prototype.NAME] = function (refs, data) {
  return new Constraints.Tangent(refs(data[0]), refs(data[1]));
};

Constraints.Tangent.prototype.getObjects = function () {
  return [this.arc, this.line];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.PointOnLine = function (point, line) {
  this.point = point;
  this.line = line;
};

Constraints.PointOnLine.prototype.NAME = 'PointOnLine';
Constraints.PointOnLine.prototype.UI_NAME = 'Point On Line';

Constraints.PointOnLine.prototype.getSolveData = function () {
  var params = [];
  this.point.collectParams(params);
  this.line.collectParams(params);
  return [['P2LDistance', params, [0]]];
};

Constraints.PointOnLine.prototype.serialize = function () {
  return [this.NAME, [this.point.id, this.line.id]];
};

Constraints.Factory[Constraints.PointOnLine.prototype.NAME] = function (refs, data) {
  return new Constraints.PointOnLine(refs(data[0]), refs(data[1]));
};

Constraints.PointOnLine.prototype.getObjects = function () {
  return [this.point, this.line];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.PointOnArc = function (point, arc) {
  this.point = point;
  this.arc = arc;
};

Constraints.PointOnArc.prototype.NAME = 'PointOnArc';
Constraints.PointOnArc.prototype.UI_NAME = 'Point On Arc';

Constraints.PointOnArc.prototype.getSolveData = function () {
  var params = [];
  this.point.collectParams(params);
  this.arc.c.collectParams(params);
  params.push(this.arc.r);
  return [['P2PDistanceV', params, []]];
};

Constraints.PointOnArc.prototype.serialize = function () {
  return [this.NAME, [this.point.id, this.arc.id]];
};

Constraints.Factory[Constraints.PointOnArc.prototype.NAME] = function (refs, data) {
  return new Constraints.PointOnArc(refs(data[0]), refs(data[1]));
};

Constraints.PointOnArc.prototype.getObjects = function () {
  return [this.point, this.arc];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.PointOnEllipseInternal = function (point, ellipse) {
  this.point = point;
  this.ellipse = ellipse;
};

Constraints.PointOnEllipseInternal.prototype.NAME = 'PointOnEllipseI';
Constraints.PointOnEllipseInternal.prototype.UI_NAME = 'Point On Ellipse';
Constraints.PointOnEllipseInternal.prototype.aux = true;

Constraints.PointOnEllipseInternal.prototype.getSolveData = function () {
  var params = [];
  this.point.collectParams(params);
  this.ellipse.ep1.collectParams(params);
  this.ellipse.ep2.collectParams(params);
  params.push(this.ellipse.r);
  return [['PointOnEllipse', params, []]];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.PointOnEllipse = function (point, ellipse) {
  Constraints.PointOnEllipseInternal.call(this, point, ellipse);
};

Constraints.PointOnEllipse.prototype.NAME = 'PointOnEllipse';
Constraints.PointOnEllipse.prototype.UI_NAME = 'Point On Ellipse';

Constraints.PointOnEllipse.prototype.getSolveData = function () {
  return Constraints.PointOnEllipseInternal.prototype.getSolveData.call(this);
};

Constraints.PointOnEllipse.prototype.serialize = function () {
  return [this.NAME, [this.point.id, this.ellipse.id]];
};

Constraints.Factory[Constraints.PointOnEllipse.prototype.NAME] = function (refs, data) {
  return new Constraints.PointOnEllipse(refs(data[0]), refs(data[1]));
};

Constraints.PointOnEllipse.prototype.getObjects = function () {
  return [this.point, this.ellipse];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.EllipseTangent = function (line, ellipse) {
  this.line = line;
  this.ellipse = ellipse;
};

Constraints.EllipseTangent.prototype.NAME = 'EllipseTangent';
Constraints.EllipseTangent.prototype.UI_NAME = 'Tangent Ellipse';

Constraints.EllipseTangent.prototype.getSolveData = function () {
  const params = [];
  this.line.collectParams(params);
  this.ellipse.ep1.collectParams(params);
  this.ellipse.ep2.collectParams(params);
  params.push(this.ellipse.r);
  return [['EllipseTangent', params, []]];

};

Constraints.EllipseTangent.prototype.serialize = function () {
  return [this.NAME, [this.line.id, this.ellipse.id]];
};

Constraints.Factory[Constraints.EllipseTangent.prototype.NAME] = function (refs, data) {
  return new Constraints.EllipseTangent(refs(data[0]), refs(data[1]));
};

Constraints.EllipseTangent.prototype.getObjects = function () {
  return [this.line, this.ellipse];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.PointInMiddle = function (point, line) {
  this.point = point;
  this.line = line;
  this.length = new Ref(math.distanceAB(line.a, line.b) / 2);
};

Constraints.PointInMiddle.prototype.NAME = 'PointInMiddle';
Constraints.PointInMiddle.prototype.UI_NAME = 'Point In the Middle';

Constraints.PointInMiddle.prototype.getSolveData = function () {
  var params1 = [];
  var params2 = [];

  this.line.a.collectParams(params1);
  this.point.collectParams(params1);
  params1.push(this.length);

  this.line.b.collectParams(params2);
  this.point.collectParams(params2);
  params2.push(this.length);

  return [
    ['P2PDistanceV', params1, []],
    ['P2PDistanceV', params2, []]
  ];
};

Constraints.PointInMiddle.prototype.serialize = function () {
  return [this.NAME, [this.point.id, this.line.id]];
};

Constraints.Factory[Constraints.PointInMiddle.prototype.NAME] = function (refs, data) {
  return new Constraints.PointInMiddle(refs(data[0]), refs(data[1]));
};

Constraints.PointInMiddle.prototype.getObjects = function () {
  return [this.point, this.line];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.Symmetry = function (point, line) {
  this.point = point;
  this.line = line;
  this.length = new Ref(math.distanceAB(line.a, line.b) / 2);
};

Constraints.Symmetry.prototype.NAME = 'Symmetry';
Constraints.Symmetry.prototype.UI_NAME = 'Symmetry';

Constraints.Symmetry.prototype.getSolveData = function (resolver) {
  var pointInMiddleData = Constraints.PointInMiddle.prototype.getSolveData.call(this, [resolver]);
  var pointOnLineData = Constraints.PointOnLine.prototype.getSolveData.call(this, [resolver]);
  return pointInMiddleData.concat(pointOnLineData);
};

Constraints.Symmetry.prototype.serialize = function () {
  return [this.NAME, [this.point.id, this.line.id]];
};

Constraints.Factory[Constraints.Symmetry.prototype.NAME] = function (refs, data) {
  return new Constraints.Symmetry(refs(data[0]), refs(data[1]));
};

Constraints.Symmetry.prototype.getObjects = function () {
  return [this.point, this.line];
};

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.Angle = function (p1, p2, p3, p4, angle) {
  this.p1 = p1;
  this.p2 = p2;
  this.p3 = p3;
  this.p4 = p4;
  this._angle = new Ref(0);
  this.angle = angle;
};

Constraints.Angle.prototype.NAME = 'Angle';
Constraints.Angle.prototype.UI_NAME = 'Lines Angle';

Constraints.Angle.prototype.getSolveData = function (resolver) {
  this._angle.set(resolver(this.angle) / 180 * Math.PI);
  var params = [];
  this.p1.collectParams(params);
  this.p2.collectParams(params);
  this.p3.collectParams(params);
  this.p4.collectParams(params);
  params.push(this._angle);
  return [['angleConst', params, []]];
};

Constraints.Angle.prototype.serialize = function () {
  return [this.NAME, [this.p1.id, this.p2.id, this.p3.id, this.p4.id, this.angle]];
};

Constraints.Factory[Constraints.Angle.prototype.NAME] = function (refs, data) {
  return new Constraints.Angle(refs(data[0]), refs(data[1]), refs(data[2]), refs(data[3]), data[4]);
};

Constraints.Angle.prototype.getObjects = function () {
  var collector = new Constraints.ParentsCollector();
  collector.check(this.p1);
  collector.check(this.p2);
  collector.check(this.p3);
  collector.check(this.p4);
  return collector.parents;
};

Constraints.Angle.prototype.SettableFields = { 'angle': "Enter the angle value" };

// ------------------------------------------------------------------------------------------------------------------ //

/** @constructor */
Constraints.LockConvex = function (c, a, t) {
  this.c = c;
  this.a = a;
  this.t = t;
};

Constraints.LockConvex.prototype.NAME = 'LockConvex';
Constraints.LockConvex.prototype.UI_NAME = 'Lock Convexity';

Constraints.LockConvex.prototype.getSolveData = function () {
  var params = [];
  this.c.collectParams(params);
  this.a.collectParams(params);
  this.t.collectParams(params);
  return [['LockConvex', params, []]];
};

Constraints.LockConvex.prototype.serialize = function () {
  return [this.NAME, [this.c.id, this.a.id, this.t.id]];
};

Constraints.Factory[Constraints.LockConvex.prototype.NAME] = function (refs, data) {
  return new Constraints.LockConvex(refs(data[0]), refs(data[1]), refs(data[2]));
};

Constraints.LockConvex.prototype.getObjects = function () {
  var collector = new Constraints.ParentsCollector();
  collector.check(this.c);
  collector.check(this.a);
  collector.check(this.t);
  return collector.parents;
};

// ------------------------------------------------------------------------------------------------------------------ //
function createByConstraintName(name, params, values) {
  switch (name) {
    case "equal":
      return new Constraints.Equal(params);
    case "equalsTo":
      return new Constraints.EqualsTo(params, values[0]);
    case "Diff":
      return new Constraints.Diff(params, values[0]);
    case "MinLength":
      return new Constraints.MinLength(params, values[0]);
    case "perpendicular":
      return new Constraints.Perpendicular(params);
    case "parallel":
      return new Constraints.Parallel(params);
    case "P2LDistanceSigned":
      return new Constraints.P2LDistanceSigned(params, values[0]);
    case "P2LDistance":
      return new Constraints.P2LDistance(params, values[0]);
    case "P2LDistanceV":
      return new Constraints.P2LDistanceV(params);
    case "P2PDistance":
      return new Constraints.P2PDistance(params, values[0]);
    case "P2PDistanceV":
      return new Constraints.P2PDistanceV(params);
    case "PointOnEllipse":
      return new Constraints.PointOnEllipse(params);
    case "EllipseTangent":
      return new Constraints.EllipseTangent(params);
    case "angle":
      return new Constraints.Angle(params);
    case "angleConst":
      var _ = true,
        x = false;
      // Exclude angle value from parameters
      return new Constraints.ConstantWrapper(new Constraints.Angle(params), [x, x, x, x, x, x, x, x, _]);
    case 'LockConvex':
      return new Constraints.LockConvex(params);
    case 'GreaterThan':
      return new Constraints.GreaterThan(params, values[0]);

  }
}
export { Constraints, SubSystem, createByConstraintName }
