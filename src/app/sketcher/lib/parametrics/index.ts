import { Subject } from 'rxjs/Rx';
import {
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
    LockConvex, SubSystem,
} from '../constraints';
import { System } from '../constraints/solver';
import { createByConstraintName } from '../constraints/utils';

import * as fetch from '../constraints/fetchers';
import { Param, prepare } from '../constraints/solver';
import { Param as Parameter } from './parameter';
import { Viewport2d } from '../viewport';
import Vector from '../math/vector'
import * as utils from '../util';

//TODO- REMOVE Viewport from this
// export class ParametricManager {

//     public viewer: Viewport2d;
//     public subSystems: Array<SubSystem> = new Array<SubSystem>();
//     public constantTable = {};
//     public constantResolver: any
//     public constraintStream = new Subject<any>();

//     constructor(viewer: Viewport2d) {
//         this.viewer = viewer;

//         //TODO- REMOVE Viewport from this
//         // this.viewer.params.define('constantDefinition', null);
//         // this.viewer.params.subscribe('constantDefinition', 'parametricManager', this.onConstantsExternalChange, this)();
//         this.constantResolver = this.createConstantResolver();
//         //TODO- REMOVE Viewport from this
//     }


//     createConstantResolver() {
//         var pm = this;
//         return function(value) {
//             var _value = pm.constantTable[value];
//             if (_value !== undefined) {
//                 value = _value;
//             } else if (typeof (value) != 'number') {
//                 console.error("unable to resolve constant " + value);
//             }
//             return value;
//         }
//     }

//     rebuildConstantTable(constantDefinition) {
//         this.constantTable = {};
//         if (constantDefinition == null) return;
//         var lines = constantDefinition.split('\n');
//         var prefix = "(function() { \n";
//         for (var i = 0; i < lines.length; i++) {
//             var line = lines[i];
//             var m = line.match(/^\s*([^\s]+)\s*=(.+)$/);
//             if (m != null && m.length == 3) {
//                 var constant = m[1];
//                 try {
//                     var value = eval(prefix + "return " + m[2] + "; \n})()");
//                     this.constantTable[constant] = value;
//                     prefix += "const " + constant + " = " + value + ";\n"
//                 } catch (e) {
//                     console.log(e);
//                 }
//             }
//         }
//     }

//     onConstantsExternalChange(constantDefinition) {
//         this.rebuildConstantTable(constantDefinition);
//         this.refresh();
//     }

//     defineNewConstant(name, value) {
//         // let constantDefinition = this.viewer.params.constantDefinition;
//         // let constantText = name + ' = ' + value;
//         // if (constantDefinition) {
//         //   constantDefinition += '\n' + constantText;
//         // } else {
//         //   constantDefinition = constantText;
//         // }
//         // this.rebuildConstantTable(constantDefinition);
//         // //disabling onConstantsExternalChange since we don't need re-solve
//         // this.viewer.params.set('constantDefinition', constantDefinition, 'parametricManager');
//     }

//     findComponents(constr: Constraint) {
//         if (this.subSystems.length === 0) {
//             this.subSystems.push(new SubSystem());
//         }
//         return [0];
//     }

//     tune(subSystem) {
//         //
//     }

//     refresh() {
//         this.solve();
//     }

//     notify(actionType: string, constraint) {
//         this.constraintStream.next({
//             action: actionType,
//             constraint: constraint
//         })
//     }

//     _add(constr: Constraint) {
//         var subSystemIds: any = this.findComponents(constr);
//         var subSystem;
//         switch (subSystemIds.length) {
//             case 0:
//                 subSystem = new SubSystem();
//                 this.subSystems.push(subSystem);
//                 break;
//             case 1:
//                 subSystem = this.subSystems[subSystemIds[0]];
//                 break;
//             default:
//                 subSystem = this.subSystems[subSystemIds[0]];
//                 for (var i = 1; i < subSystemIds.length; i++) {
//                     var toMerge = subSystemIds[i];
//                     for (var j = 0; j < toMerge.constraints.length; j++) {
//                         subSystem.push(toMerge.constraints[j]);
//                     }
//                 }
//                 break;
//         }
//         subSystem.constraints.push(constr);
//         this.notify('add', constr);
//         return subSystem;
//     }

//     checkRedundancy(subSystem, constr: Constraint) {
//         var solver = this.prepareForSubSystem([], subSystem.constraints);
//         if (solver.diagnose().conflict) {
//             alert("Most likely this " + constr.NAME + " constraint is CONFLICTING!")
//         }
//     }

//     buildConstraintList() {
//         var result = [];

//         for (var j = 0; j < this.subSystems.length; j++) {
//             var sub = this.subSystems[j];
//             for (var i = 0; i < sub.constraints.length; ++i) {
//                 var constr = sub.constraints[i];
//                 if (constr.aux !== true/* && app.constraintFilter[constr.NAME] != true*/) {
//                     result.push(constr);
//                 }
//             }
//         }
//         result.sort(function(a, b) {
//             if (a.NAME == 'coi') {
//                 return b.NAME == 'coi' ? 0 : 1;
//             }
//             return a.NAME.localeCompare(b.NAME)
//         });
//         return result;
//     }

//     add(constr: Constraint) {
//         // this.viewer.historyManager.checkpoint();
//         var subSystem = this._add(constr);
//         this.checkRedundancy(subSystem, constr);
//         this.refresh();

//     }

//     addAll(constrs: Array<Constraint>) {

//         for (var i = 0; i < constrs.length; i++) {
//             var subSystem = this._add(constrs[i]);
//             this.checkRedundancy(subSystem, constrs[i]);
//         }
//         this.refresh();

//     }

//     remove(constr: Constraint) {
//         //  this.viewer.historyManager.checkpoint();
//         for (var j = 0; j < this.subSystems.length; j++) {
//             var sub = this.subSystems[j];
//             for (var i = 0; i < sub.constraints.length; ++i) {
//                 var p = sub.constraints[i];
//                 if (p === constr) {
//                     sub.constraints.splice(i, 1);
//                     if (p.NAME === 'coi') {

//                         const coincident = p as Coincident;
//                         this.unlinkObjects(coincident.a, coincident.b);
//                     }
//                     break;
//                 }
//             }
//         }
//         this.notify('remove', constr);
//         this.refresh();

//     }

//     removeConstraintsByObj(obj) {
//         var ownedParams = [];
//         obj.collectParams(ownedParams);
//         this.removeConstraintsByParams(ownedParams);

//     }

//     removeConstraintsByParams(ownedParams) {
//         for (var s = 0; s < this.subSystems.length; s++) {
//             var toRemove = [];
//             var sub = this.subSystems[s];
//             var i;
//             for (i = 0; i < sub.constraints.length; ++i) {
//                 var sdataArr = sub.constraints[i].getSolveData(this.constantResolver);
//                 MAIN:
//                 for (var j = 0; j < sdataArr.length; j++) {
//                     var sdata = sdataArr[j];
//                     var params = sdata[1];
//                     for (var oi = 0; oi < ownedParams.length; ++oi) {
//                         for (var k = 0; k < params.length; ++k) {
//                             if (ownedParams[oi].id === params[k].id) {
//                                 toRemove.push(i);
//                                 break MAIN;
//                             }
//                         }
//                     }
//                 }
//             }
//             toRemove.sort();

//             for (i = toRemove.length - 1; i >= 0; --i) {
//                 this.notify('remove', toRemove[i]);
//                 sub.constraints.splice(toRemove[i], 1);
//             }
//         }


//     }

//     lock(objs) {
//         var p = fetch.points(objs);
//         for (var i = 0; i < p.length; ++i) {
//             this._add(new Lock(p[i], { x: p[i].x, y: p[i].y }));
//         }
//         this.refresh();

//     }

//     coincident(objs) {
//         if (objs.length == 0) return;
//         this.linkObjects(objs);
//         this.solve();
//         this.viewer.refresh();
//     }

//     vertical(objs) {
//         this.addAll(fetch.lines(objs).map(line => new Vertical(line)));
//     }

//     horizontal(objs) {
//         this.addAll(fetch.lines(objs).map(line => new Horizontal(line)));
//     }

//     parallel(objs) {
//         const lines = fetch.lines(objs);
//         const constraints = [];
//         for (let i = 1; i < lines.length; i++) {
//             constraints.push(new Parallel(lines[i - 1], lines[i]));
//         }
//         this.addAll(constraints);
//     }

//     perpendicular(objs) {
//         var lines = fetch.twoLines(objs);
//         this.add(new Perpendicular(lines[0], lines[1]));
//     }

//     lockConvex(objs, warnCallback) {
//         var lines = fetch.twoLines(objs);
//         var l1 = lines[0];
//         var l2 = lines[1];
//         var pts = [l1.a, l1.b, l2.a, l2.b];
//         function isLinked(p1, p2) {
//             for (var i = 0; i < p1.linked.length; ++i) {
//                 if (p1.linked[i].id === p2.id) {
//                     return true;
//                 }
//             }
//             return false;
//         }

//         function swap(arr, i1, i2) {
//             var _ = arr[i1];
//             arr[i1] = arr[i2];
//             arr[i2] = _;
//         }

//         if (isLinked(pts[0], pts[2])) {
//             swap(pts, 0, 1);
//         } else if (isLinked(pts[0], pts[3])) {
//             swap(pts, 0, 1);
//             swap(pts, 2, 3);
//         } else if (isLinked(pts[1], pts[3])) {
//             swap(pts, 2, 3);
//         } else if (isLinked(pts[1], pts[2])) {
//             //we are good
//         } else {
//             warnCallback("Lines must be connected");
//             return;
//         }

//         var c = pts[0];
//         var a = pts[1];
//         var t = pts[3];

//         // ||ac x at|| > 0
//         var crossNorma = (c.x - a.x) * (t.y - a.y) - (c.y - a.y) * (t.x - a.x);

//         if (crossNorma < 0) {
//             var _ = c;
//             c = t;
//             t = _;
//         }

//         this.add(new LockConvex(c, a, t));
//     }

//     tangent(objs) {
//         const ellipses = fetch.generic(objs, ['TCAD.TWO.Ellipse', 'TCAD.TWO.EllipticalArc'], 0);
//         const lines = fetch.generic(objs, ['TCAD.TWO.Segment'], 1);
//         if (ellipses.length > 0) {
//             this.add(new EllipseTangent(lines[0], ellipses[0]));
//         } else {
//             const arcs = fetch.generic(objs, ['TCAD.TWO.Arc', 'TCAD.TWO.Circle'], 1);
//             this.add(new Tangent(arcs[0], lines[0]));
//         }
//     }

//     rr(arcs) {
//         var prev = arcs[0];
//         for (var i = 1; i < arcs.length; ++i) {
//             this._add(new RadiusEquality(prev, arcs[i]));
//             prev = arcs[i];
//         }
//         this.refresh();

//     }

//     ll(lines) {
//         var prev = lines[0];
//         for (var i = 1; i < lines.length; ++i) {
//             this._add(new LineEquality(prev, lines[i]));
//             prev = lines[i];
//         }
//         this.refresh();


//     }

//     entityEquality(objs) {
//         var arcs = fetch.generic(objs, ['TCAD.TWO.Arc', 'TCAD.TWO.Circle'], 0);
//         var lines = fetch.generic(objs, ['TCAD.TWO.Segment'], 0);
//         if (arcs.length > 0) {
//             this.rr(arcs);
//         }
//         if (lines.length > 0) {
//             this.ll(lines);
//         }
//     }

//     p2lDistance(objs, promptCallback) {
//         var pl = fetch.pointAndLine(objs);

//         var target = pl[0];
//         var segment = pl[1];

//         var ex = new Vector(-(segment.b.y - segment.a.y), segment.b.x - segment.a.x).normalize();
//         var distance = Math.abs(ex.dot(new Vector(segment.a.x - target.x, segment.a.y - target.y)));

//         var promptDistance = utils.askNumber(P2LDistance.SettableFields.d, distance.toFixed(2), promptCallback, this.constantResolver);

//         if (promptDistance != null) {
//             this.add(new P2LDistance(target, segment, promptDistance));
//         }
//     }

//     pointInMiddle(objs) {
//         var pl = fetch.pointAndLine(objs);
//         this.add(new PointInMiddle(pl[0], pl[1]));
//     }

//     symmetry(objs) {
//         var pl = fetch.pointAndLine(objs);
//         this.add(new Symmetry(pl[0], pl[1]));
//     }

//     pointOnArc(objs) {
//         const points = fetch.generic(objs, ['TCAD.TWO.EndPoint'], 1);
//         const arcs = fetch.generic(objs, ['TCAD.TWO.Arc', 'TCAD.TWO.Circle', 'TCAD.TWO.Ellipse', 'TCAD.TWO.EllipticalArc'], 1);
//         const arc = arcs[0];
//         if (arc.className == 'TCAD.TWO.Ellipse' || arc.className == 'TCAD.TWO.EllipticalArc') {
//             this.add(new PointOnEllipse(points[0], arc));
//         } else {
//             this.add(new PointOnArc(points[0], arc));
//         }
//     }

//     pointOnLine(objs) {
//         var pl = fetch.pointAndLine(objs);
//         var target = pl[0];
//         var segment = pl[1];
//         this.add(new PointOnLine(target, segment));
//     }

//     llAngle(objs, promptCallback) {
//         var lines = fetch.generic(objs, 'TCAD.TWO.Segment', 2);
//         var l1 = lines[0];
//         var l2 = lines[1];

//         var points = [l1.a, l1.b, l2.a, l2.b];

//         if (l1.b.x < l1.a.x) {
//             points[0] = l1.b;
//             points[1] = l1.a;
//         }

//         if (l2.b.x < l2.a.x) {
//             points[2] = l2.b;
//             points[3] = l2.a;
//         }

//         var dx1 = points[1].x - points[0].x;
//         var dy1 = points[1].y - points[0].y;
//         var dx2 = points[3].x - points[2].x;
//         var dy2 = points[3].y - points[2].y;

//         var angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
//         angle *= 1 / Math.PI * 180;
//         angle = utils.askNumber(Angle.SettableFields.angle, angle.toFixed(2), promptCallback, this.constantResolver);
//         if (angle === null) return;
//         this.add(new Angle(points[0], points[1], points[2], points[3], angle));
//     }

//     p2pDistance(objs, promptCallback) {
//         var p = fetch.twoPoints(objs);
//         var distance = new Vector(p[1].x - p[0].x, p[1].y - p[0].y).length();
//         var promptDistance = utils.askNumber(P2PDistance.SettableFields.d, distance.toFixed(2), promptCallback, this.constantResolver);

//         if (promptDistance != null) {
//             this.add(new P2PDistance(p[0], p[1], promptDistance));
//         }
//     }

//     radius(objs, promptCallback) {
//         var arcs = fetch.arkCirc(objs, 1);
//         var radius = arcs[0].r.get();
//         var promptDistance = utils.askNumber(Radius.SettableFields.d, radius.toFixed(2), promptCallback, this.constantResolver);
//         if (promptDistance != null) {
//             for (var i = 0; i < arcs.length; ++i) {
//                 this._add(new Radius(arcs[i], promptDistance));
//             }
//             this.refresh();

//         }
//     }

//     _linkObjects(objs) {
//         var i;
//         var masterIdx = -1;
//         for (i = 0; i < objs.length; ++i) {
//             if (ParametricManager.isAux(objs[i])) {
//                 if (masterIdx !== -1) {
//                     throw "not allowed to have a coincident constraint between two or more auxiliary objects";
//                 }
//                 masterIdx = i;
//             }
//         }
//         if (masterIdx === -1) masterIdx = objs.length - 1;


//         for (i = 0; i < objs.length; ++i) {
//             if (i === masterIdx) continue;
//             objs[i].x = objs[masterIdx].x;
//             objs[i].y = objs[masterIdx].y;
//             var c = new Coincident(objs[i], objs[masterIdx]);
//             this._add(c);
//         }
//     }

//     linkObjects(objs) {
//         this._linkObjects(objs);

//     }

//     unlinkObjects(a, b) {

//         function _unlink(a, b) {
//             for (var i = 0; i < a.linked.length; ++i) {
//                 var obj = a.linked[i];
//                 if (obj.id === b.id) {
//                     a.linked.splice(i, 1);
//                     break;
//                 }
//             }
//         }
//         _unlink(a, b);
//         _unlink(b, a);

//     }

//     findCoincidentConstraint(point1, point2): Coincident {
//         for (let subSys of this.subSystems) {
//             for (let c of subSys.constraints) {
//                 if (c.NAME === 'coi') {
//                     const coincident = c as Coincident;
//                     if (
//                         ((coincident.a.id === point1.id && coincident.b.id === point2.id) ||
//                             (coincident.b.id === point1.id && coincident.a.id === point2.id))) {
//                         return coincident;
//                     }
//                 }

//             }
//         }
//         return null;
//     }

//     getSolveData() {
//         var sdata: Array<Constraint> = new Array<Constraint>();
//         for (var i = 0; i < this.subSystems.length; i++) {
//             this.__getSolveData(this.subSystems[i].constraints, sdata);
//         }
//         return sdata;
//     }

//     __getSolveData(constraints: Array<Constraint>, out: Array<any>) {
//         for (var i = 0; i < constraints.length; ++i) {
//             var constraint = constraints[i];
//             if (constraint.getSolveData) {

//                 var data = constraint.getSolveData(this.constantResolver);
//                 for (var j = 0; j < data.length; ++j) {
//                     data[j].push(constraint.reducible !== undefined);
//                     out.push(data[j]);
//                 }
//             }
//         }
//         return out;
//     }

//     solve(lock = [], extraConstraints = [], disabledObjects = []) {
//         const solver = this.prepare(lock, extraConstraints, disabledObjects);
//         solver.solve(false);
//         solver.sync();
//     }

//     prepare(locked, extraConstraints = [], disabledObjects = []) {
//         return this._prepare(locked, this.subSystems, extraConstraints, disabledObjects);
//     }

//     _prepare(locked, subSystems, extraConstraints, disabledObjects) {
//         var solvers = [];
//         for (var i = 0; i < subSystems.length; i++) {
//             solvers.push(this.prepareForSubSystem(locked, subSystems[i].constraints, extraConstraints, disabledObjects));
//         }
//         if (subSystems.length == 0 && locked && locked.length != 0) {
//             solvers.push(this.prepareForSubSystem(locked, [], extraConstraints, disabledObjects));
//         }
//         return {
//             solvers: solvers,

//             solve: function(rough) {
//                 for (var i = 0; i < solvers.length; i++) {
//                     var alg = i < subSystems.length ? subSystems[i].alg : 1;
//                     var res = solvers[i].solve(rough, alg);
//                     if (res.returnCode !== 1) {
//                         alg = alg == 1 ? 2 : 1;
//                         //if (solvers[i].solve(rough, alg).returnCode == 1) {
//                         //subSystems[i].alg = alg;
//                         //}
//                     }
//                 }
//             },

//             sync: function() {
//                 for (var i = 0; i < solvers.length; i++) {
//                     solvers[i].sync();
//                 }
//             },

//             updateParameter: function(p) {
//                 for (var i = 0; i < solvers.length; i++) {
//                     solvers[i].updateParameter(p);
//                 }
//             },

//             updateLock: function(values) {
//                 for (var i = 0; i < solvers.length; i++) {
//                     solvers[i].updateLock(values);
//                 }
//             }
//         }
//     }

//     __toId(v) {
//         return v.id;
//     }

//     prepareForSubSystem(locked: Array<Parameter> = new Array<Parameter>(),
//         subSystemConstraints: Array<Constraint>,
//         extraConstraints = null, disabledObjects = null) {

//         var constrs = [];
//         var solverParamsDict = {};
//         var system = [];
//         var auxParams: Array<Parameter> = new Array<Parameter>();
//         var auxDict = {};

//         this.__getSolveData(subSystemConstraints, system);
//         if (!!extraConstraints) this.__getSolveData(extraConstraints, system);

//         ParametricManager.fetchAuxParams(system, auxParams, auxDict, disabledObjects);
//         var readOnlyParams = auxParams.concat(locked);
//         var reduceInfo = ParametricManager.reduceSystem(system, readOnlyParams);

//         function getSolverParam(p: Parameter) {
//             var master = reduceInfo.reducedParams[p.id];
//             if (master !== undefined) {
//                 p = reduceInfo.idToParam[master];
//             }

//             var _p = solverParamsDict[p.id];
//             if (_p === undefined) {
//                 if (p.__cachedParam__ === undefined) {
//                     _p = new Param(p.id, p.get());
//                     p.__cachedParam__ = _p;
//                 } else {
//                     _p = p.__cachedParam__;
//                     _p.reset(p.get());
//                 }

//                 _p._backingParam = p;
//                 solverParamsDict[p.id] = _p;
//             }
//             return _p;
//         }

//         (function pickupAuxiliaryInfoFromSlaves() {
//             for (var i = 0; i < reduceInfo.linkedParams.length; ++i) {
//                 var linkedParams = reduceInfo.linkedParams[i];
//                 var master = linkedParams[0];
//                 if (auxDict[master] !== undefined) continue;
//                 for (var j = 1; j < linkedParams.length; j++) {
//                     var slave = linkedParams[j];
//                     if (auxDict[slave] !== undefined) {
//                         auxDict[master] = true;
//                         break;
//                     }
//                 }
//             }
//         })();

//         for (var i = 0; i < system.length; ++i) {

//             var sdata = system[i];
//             var params = [];

//             for (let p = 0; p < sdata[1].length; ++p) {
//                 const param = sdata[1][p];
//                 const solverParam = getSolverParam(param);
//                 solverParam.aux = auxDict[param.id] !== undefined;
//                 params.push(solverParam);
//             }
//             // if (reduceInfo.reducedConstraints[i] === true) continue;

//             var _constr = createByConstraintName(sdata[0], params, sdata[2]);
//             constrs.push(_constr);
//         }

//         var lockedSolverParams = [];
//         for (let p = 0; p < locked.length; ++p) {
//             lockedSolverParams[p] = getSolverParam(locked[p]);
//         }

//         const solver: any = prepare(constrs, lockedSolverParams);
//         function solve(rough, alg) {
//             return solver.solveSystem(rough, alg);
//         }

//         const viewer = this.viewer;
//         function sync() {
//             for (var paramId in solverParamsDict) {
//                 var solverParam = solverParamsDict[paramId];
//                 if (!!solverParam._backingParam.aux) continue;
//                 solverParam._backingParam.set(solverParam.get());
//             }

//             //Make sure all coincident constraints are equal
//             for (var ei = 0; ei < reduceInfo.linkedParams.length; ++ei) {
//                 var master = reduceInfo.idToParam[reduceInfo.linkedParams[ei][0]];
//                 for (var i = 1; i < reduceInfo.linkedParams[ei].length; ++i) {
//                     var slave = reduceInfo.idToParam[reduceInfo.linkedParams[ei][i]];
//                     slave.set(master.get());
//                 }
//             }
//             viewer.equalizeLinkedEndpoints();
//         }

//         function updateParameter(p) {
//             getSolverParam(p).set(p.get());
//         }

//         solver.solve = solve;
//         solver.sync = sync;
//         solver.updateParameter = updateParameter;
//         return solver;

//     }

//     static isAux(obj, disabledObjects = null) {
//         while (!!obj) {
//             if (!!obj.aux || (disabledObjects !== null && disabledObjects !== undefined && disabledObjects.has(obj))) {
//                 return true;
//             }
//             obj = obj.parent;
//         }
//         return false;
//     }

//     static fetchAuxParams(system, auxParams, auxDict, disabledObjects) {
//         disabledObjects = disabledObjects != undefined ? new Set(disabledObjects) : undefined;
//         for (var i = 0; i < system.length; ++i) {
//             for (var p = 0; p < system[i][1].length; ++p) {
//                 var parameter = system[i][1][p];
//                 if (parameter.obj !== undefined) {
//                     if (ParametricManager.isAux(parameter.obj, disabledObjects)) {
//                         if (auxDict[parameter.id] === undefined) {
//                             auxDict[parameter.id] = parameter;
//                             auxParams.push(parameter);
//                         }
//                     }
//                 }
//             }
//         }
//     }

//     static reduceSystem(system, readOnlyParams: Array<Parameter> = []) {

//         var info = {
//             idToParam: {},
//             linkedParams: [],
//             reducedConstraints: {},
//             reducedParams: {}
//         };

//         var links = [];


//         var c, pi, paramToConstraints = {};
//         for (i = 0; i < system.length; ++i) {
//             c = system[i];
//             if (c[3] !== true) {
//                 for (pi = 0; pi < c[1].length; pi++) {
//                     var param = c[1][pi];
//                     var paramConstrs = paramToConstraints[param.id];
//                     if (paramConstrs === undefined) {
//                         paramConstrs = [];
//                         paramToConstraints[param.id] = paramConstrs;
//                     }
//                     paramConstrs.push(i);
//                 }
//             }
//         }

//         for (i = 0; i < system.length; ++i) {
//             c = system[i];
//             if (c[3] === true) { //Reduce flag
//                 var cp1 = c[1][0];
//                 var cp2 = c[1][1];
//                 links.push(new Link(cp1, cp2, i));
//             }
//         }
//         function intersect(array1, array2) {
//             if (!array1 || !array2) return false;
//             return array1.filter(function(n) {
//                 return array2.indexOf(n) != -1
//             }).length != 0;
//         }

//         function shared(param1, param2) {
//             if (param1 == param2) return false;
//             var assoc0 = paramToConstraints[param1];
//             var assoc1 = paramToConstraints[param2];
//             return intersect(assoc0, assoc1);
//         }

//         var linkTuples = [];

//         function mergeLinks(startIndex, into) {
//             var linkI = links[startIndex];
//             if (linkI.processed) return;
//             linkI.processed = true;
//             into.push(linkI);
//             for (var j = startIndex + 1; j < links.length; j++) {
//                 var linkJ = links[j];
//                 if (linkI.a.id == linkJ.a.id || linkI.a.id == linkJ.b.id || linkI.b.id == linkJ.a.id || linkI.b.id == linkJ.b.id) {
//                     mergeLinks(j, into);
//                 }
//             }
//         }
//         for (i = 0; i < links.length; i++) {
//             if (links[i].processed) continue;
//             var linkTuple = [];
//             linkTuples.push(linkTuple);
//             mergeLinks(i, linkTuple)
//         }

//         function resolveConflicts() {
//             for (var i = 0; i < linkTuples.length; i++) {
//                 var tuple = linkTuples[i];

//                 for (var j = 0; j < tuple.length; j++) {
//                     var linkA = tuple[j];
//                     if (linkA.invalid) continue;
//                     if (shared(linkA.a.id, linkA.b.id)) {
//                         linkA.invalid = true;
//                         continue;
//                     }
//                     for (var k = j + 1; k < tuple.length; k++) {
//                         var linkB = tuple[k];
//                         if (shared(linkA.a.id, linkB.a.id) || shared(linkA.a.id, linkB.b.id) || shared(linkA.b.id, linkB.a.id) || shared(linkA.b.id, linkB.b.id)) {
//                             linkB.invalid = true;
//                         }
//                     }
//                 }
//             }
//         }
//         resolveConflicts();

//         function _merge(arr1, arr2) {
//             for (var i = 0; i < arr2.length; ++i) {
//                 if (arr1.indexOf(arr2[i]) < 0) {
//                     arr1.push(arr2[i]);
//                 }
//             }
//         }

//         function linksToTuples(linkTuples) {
//             var tuples = [];
//             for (var i = 0; i < linkTuples.length; i++) {
//                 var linkTuple = linkTuples[i];
//                 var tuple = [];
//                 tuples.push(tuple);
//                 for (var j = 0; j < linkTuple.length; j++) {
//                     var link = linkTuple[j];
//                     if (!link.invalid) {
//                         _merge(tuple, [link.a.id, link.b.id]);
//                         info.reducedConstraints[link.constr] = true;
//                         info.idToParam[link.a.id] = link.a;
//                         info.idToParam[link.b.id] = link.b;
//                     }
//                 }
//             }
//             return tuples;
//         }
//         var tuples = linksToTuples(linkTuples);

//         for (var i = 0; i < tuples.length; ++i) {
//             var tuple = tuples[i];
//             info.linkedParams.push(tuple);
//             for (var mi = 0; mi < readOnlyParams.length; ++mi) {
//                 var masterParam = readOnlyParams[mi];
//                 var masterIdx = tuple.indexOf(masterParam.id);
//                 if (masterIdx >= 0) {
//                     var tmp = tuple[0];
//                     tuple[0] = tuple[masterIdx];
//                     tuple[masterIdx] = tmp;
//                     break;
//                 }
//             }
//         }

//         for (var ei = 0; ei < info.linkedParams.length; ++ei) {
//             var master = info.linkedParams[ei][0];
//             for (i = 1; i < info.linkedParams[ei].length; ++i) {
//                 info.reducedParams[info.linkedParams[ei][i]] = master;
//             }
//         }
//         return info;
//     }
// }


// class Link {

//     public a: any;
//     public b: any;
//     public constr: Constraint;
//     public invalid: boolean;
//     public processed: boolean;

//     constructor(a, b, constr) {
//         this.a = a;
//         this.b = b;
//         this.constr = constr;
//         this.invalid = false;
//         this.processed = false;
//     }
// }

const Constraints = {
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
/** @constructor */
function ParametricManager(viewer: any): any {
    this.constraintStream = new Subject<any>();
    this.viewer = viewer;
    this.subSystems = [];
    this.listeners = [];
    this.constantTable = {};

    // this.viewer.params.define('constantDefinition', null);
    // this.viewer.params.subscribe('constantDefinition', 'parametricManager', this.onConstantsExternalChange, this)();
    this.constantResolver = this.createConstantResolver();

}

ParametricManager.prototype.createConstantResolver = function() {
    var pm = this;
    return function(value) {
        var _value = pm.constantTable[value];
        if (_value !== undefined) {
            value = _value;
        } else if (typeof (value) != 'number') {
            console.error("unable to resolve constant " + value);
        }
        return value;
    }
};

ParametricManager.prototype.notify = function(event) {
    for (var i = 0; i < this.listeners.length; ++i) {
        var l = this.listeners[i];
        l(event);
    }
};

ParametricManager.prototype.rebuildConstantTable = function(constantDefinition) {
    this.constantTable = {};
    if (constantDefinition == null) return;
    var lines = constantDefinition.split('\n');
    var prefix = "(function() { \n";
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var m = line.match(/^\s*([^\s]+)\s*=(.+)$/);
        if (m != null && m.length == 3) {
            var constant = m[1];
            try {
                var value = eval(prefix + "return " + m[2] + "; \n})()");
                this.constantTable[constant] = value;
                prefix += "const " + constant + " = " + value + ";\n"
            } catch (e) {
                console.log(e);
            }
        }
    }
};

ParametricManager.prototype.onConstantsExternalChange = function(constantDefinition) {
    this.rebuildConstantTable(constantDefinition);
    this.refresh();
};

ParametricManager.prototype.defineNewConstant = function(name, value) {
    let constantDefinition = this.viewer.params.constantDefinition;
    let constantText = name + ' = ' + value;
    if (constantDefinition) {
        constantDefinition += '\n' + constantText;
    } else {
        constantDefinition = constantText;
    }
    this.rebuildConstantTable(constantDefinition);
    //disabling onConstantsExternalChange since we don't need re-solve
    this.viewer.params.set('constantDefinition', constantDefinition, 'parametricManager');
};

ParametricManager.prototype.findComponents = function(constr) {
    if (this.subSystems.length === 0) {
        this.subSystems.push(new SubSystem());
    }
    return [0];
};

ParametricManager.prototype.tune = function(subSystem) {

};

ParametricManager.prototype._add = function(constr) {
    var subSystemIds = this.findComponents(constr);
    var subSystem;
    switch (subSystemIds.length) {
        case 0:
            subSystem = new SubSystem();
            this.subSystems.push(subSystem);
            break;
        case 1:
            subSystem = this.subSystems[subSystemIds[0]];
            break;
        default:
            subSystem = this.subSystems[subSystemIds[0]];
            for (var i = 1; i < subSystemIds.length; i++) {
                var toMerge = subSystemIds[i];
                for (var j = 0; j < toMerge.constraints.length; j++) {
                    subSystem.push(toMerge.constraints[j]);
                }
            }
            break;
    }
    subSystem.constraints.push(constr);
    return subSystem;
};

ParametricManager.prototype.checkRedundancy = function(subSystem, constr) {
    var solver = this.prepareForSubSystem([], subSystem.constraints);
    if (solver.diagnose().conflict) {
        alert("Most likely this " + constr.NAME + " constraint is CONFLICTING!")
    }
};

ParametricManager.prototype.refresh = function() {
    this.solve();
    this.notify();
    this.viewer.refresh();
};

ParametricManager.prototype.add = function(constr) {
    this.viewer.historyManager.checkpoint();
    var subSystem = this._add(constr);
    this.checkRedundancy(subSystem, constr);
    this.refresh();
};

ParametricManager.prototype.addAll = function(constrs) {
    for (var i = 0; i < constrs.length; i++) {
        var subSystem = this._add(constrs[i]);
        this.checkRedundancy(subSystem, constrs[i]);
    }
    this.refresh();
};

ParametricManager.prototype.remove = function(constr) {
    this.viewer.historyManager.checkpoint();
    for (var j = 0; j < this.subSystems.length; j++) {
        var sub = this.subSystems[j];
        for (var i = 0; i < sub.constraints.length; ++i) {
            var p = sub.constraints[i];
            if (p === constr) {
                sub.constraints.splice(i, 1);
                if (p.NAME === 'coi') {
                    this.unlinkObjects(p.a, p.b);
                }
                break;
            }
        }
    }
    this.refresh();
};

ParametricManager.prototype.removeConstraintsByObj = function(obj) {
    var ownedParams = [];
    obj.collectParams(ownedParams);
    this.removeConstraintsByParams(ownedParams);
};

ParametricManager.prototype.removeConstraintsByParams = function(ownedParams) {
    for (var s = 0; s < this.subSystems.length; s++) {
        var toRemove = [];
        var sub = this.subSystems[s];
        var i;
        for (i = 0; i < sub.constraints.length; ++i) {
            var sdataArr = sub.constraints[i].getSolveData(this.constantResolver);
            MAIN:
            for (var j = 0; j < sdataArr.length; j++) {
                var sdata = sdataArr[j];
                var params = sdata[1];
                for (var oi = 0; oi < ownedParams.length; ++oi) {
                    for (var k = 0; k < params.length; ++k) {
                        if (ownedParams[oi].id === params[k].id) {
                            toRemove.push(i);
                            break MAIN;
                        }
                    }
                }
            }
        }
        toRemove.sort();

        for (i = toRemove.length - 1; i >= 0; --i) {
            sub.constraints.splice(toRemove[i], 1);
        }
    }

    this.notify();
};

ParametricManager.prototype.lock = function(objs) {
    var p = fetch.points(objs);
    for (var i = 0; i < p.length; ++i) {
        this._add(new Constraints.Lock(p[i], { x: p[i].x, y: p[i].y }));
    }
    this.refresh();
};

ParametricManager.prototype.vertical = function(objs) {
    this.addAll(fetch.lines(objs).map(line => new Constraints.Vertical(line)));
};

ParametricManager.prototype.horizontal = function(objs) {
    this.addAll(fetch.lines(objs).map(line => new Constraints.Horizontal(line)));
};

ParametricManager.prototype.parallel = function(objs) {
    const lines = fetch.lines(objs);
    const constraints = [];
    for (let i = 1; i < lines.length; i++) {
        constraints.push(new Constraints.Parallel(lines[i - 1], lines[i]));
    }
    this.addAll(constraints);
};

ParametricManager.prototype.perpendicular = function(objs) {
    var lines = fetch.twoLines(objs);
    this.add(new Constraints.Perpendicular(lines[0], lines[1]));
};

ParametricManager.prototype.lockConvex = function(objs, warnCallback) {
    var lines = fetch.twoLines(objs);
    var l1 = lines[0];
    var l2 = lines[1];
    var pts = [l1.a, l1.b, l2.a, l2.b];

    function isLinked(p1, p2) {
        for (var i = 0; i < p1.linked.length; ++i) {
            if (p1.linked[i].id === p2.id) {
                return true;
            }
        }
        return false;
    }

    function swap(arr, i1, i2) {
        var _ = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = _;
    }

    if (isLinked(pts[0], pts[2])) {
        swap(pts, 0, 1);
    } else if (isLinked(pts[0], pts[3])) {
        swap(pts, 0, 1);
        swap(pts, 2, 3);
    } else if (isLinked(pts[1], pts[3])) {
        swap(pts, 2, 3);
    } else if (isLinked(pts[1], pts[2])) {
        //we are good
    } else {
        warnCallback("Lines must be connected");
        return;
    }

    var c = pts[0];
    var a = pts[1];
    var t = pts[3];

    // ||ac x at|| > 0
    var crossNorma = (c.x - a.x) * (t.y - a.y) - (c.y - a.y) * (t.x - a.x);

    if (crossNorma < 0) {
        var _ = c;
        c = t;
        t = _;
    }

    this.add(new Constraints.LockConvex(c, a, t));
};

ParametricManager.prototype.tangent = function(objs) {
    const ellipses = fetch.generic(objs, ['TCAD.TWO.Ellipse', 'TCAD.TWO.EllipticalArc'], 0);
    const lines = fetch.generic(objs, ['TCAD.TWO.Segment'], 1);
    if (ellipses.length > 0) {
        this.add(new Constraints.EllipseTangent(lines[0], ellipses[0]));
    } else {
        const arcs = fetch.generic(objs, ['TCAD.TWO.Arc', 'TCAD.TWO.Circle'], 1);
        this.add(new Constraints.Tangent(arcs[0], lines[0]));
    }
};

ParametricManager.prototype.rr = function(arcs) {
    var prev = arcs[0];
    for (var i = 1; i < arcs.length; ++i) {
        this._add(new Constraints.RadiusEquality(prev, arcs[i]));
        prev = arcs[i];
    }
    this.refresh();
};

ParametricManager.prototype.ll = function(lines) {
    var prev = lines[0];
    for (var i = 1; i < lines.length; ++i) {
        this._add(new Constraints.LineEquality(prev, lines[i]));
        prev = lines[i];
    }
    this.refresh();

};

ParametricManager.prototype.entityEquality = function(objs) {
    var arcs = fetch.generic(objs, ['TCAD.TWO.Arc', 'TCAD.TWO.Circle'], 0);
    var lines = fetch.generic(objs, ['TCAD.TWO.Segment'], 0);
    if (arcs.length > 0) this.rr(arcs);
    if (lines.length > 0) this.ll(lines);
};

ParametricManager.prototype.p2lDistance = function(objs, promptCallback) {
    var pl = fetch.pointAndLine(objs);

    var target = pl[0];
    var segment = pl[1];

    var ex = new Vector(-(segment.b.y - segment.a.y), segment.b.x - segment.a.x).normalize();
    var distance = Math.abs(ex.dot(new Vector(segment.a.x - target.x, segment.a.y - target.y)));

    var promptDistance = utils.askNumber(Constraints.P2LDistance.SettableFields.d, distance.toFixed(2), promptCallback, this.constantResolver);

    if (promptDistance != null) {
        this.add(new Constraints.P2LDistance(target, segment, promptDistance));
    }
};

ParametricManager.prototype.pointInMiddle = function(objs) {
    var pl = fetch.pointAndLine(objs);
    this.add(new Constraints.PointInMiddle(pl[0], pl[1]));
};

ParametricManager.prototype.symmetry = function(objs) {
    var pl = fetch.pointAndLine(objs);
    this.add(new Constraints.Symmetry(pl[0], pl[1]));
};

ParametricManager.prototype.pointOnArc = function(objs) {
    const points = fetch.generic(objs, ['TCAD.TWO.EndPoint'], 1);
    const arcs = fetch.generic(objs, ['TCAD.TWO.Arc', 'TCAD.TWO.Circle', 'TCAD.TWO.Ellipse', 'TCAD.TWO.EllipticalArc'], 1);
    const arc = arcs[0];
    if (arc._class == 'TCAD.TWO.Ellipse' || arc._class == 'TCAD.TWO.EllipticalArc') {
        this.add(new Constraints.PointOnEllipse(points[0], arc));
    } else {
        this.add(new Constraints.PointOnArc(points[0], arc));
    }
};

ParametricManager.prototype.pointOnLine = function(objs) {
    var pl = fetch.pointAndLine(objs);
    var target = pl[0];
    var segment = pl[1];
    this.add(new Constraints.PointOnLine(target, segment));
};

ParametricManager.prototype.llAngle = function(objs, promptCallback) {
    var lines = fetch.generic(objs, 'TCAD.TWO.Segment', 2);
    var l1 = lines[0];
    var l2 = lines[1];

    var points = [l1.a, l1.b, l2.a, l2.b];

    if (l1.b.x < l1.a.x) {
        points[0] = l1.b;
        points[1] = l1.a;
    }

    if (l2.b.x < l2.a.x) {
        points[2] = l2.b;
        points[3] = l2.a;
    }

    var dx1 = points[1].x - points[0].x;
    var dy1 = points[1].y - points[0].y;
    var dx2 = points[3].x - points[2].x;
    var dy2 = points[3].y - points[2].y;

    var angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
    angle *= 1 / Math.PI * 180;
    angle = utils.askNumber(Constraints.Angle.prototype.angle, angle.toFixed(2), promptCallback, this.constantResolver);
    if (angle === null) return;
    this.add(new Constraints.Angle(points[0], points[1], points[2], points[3], angle));
};

ParametricManager.prototype.p2pDistance = function(objs, promptCallback) {
    var p = fetch.twoPoints(objs);
    var distance = new Vector(p[1].x - p[0].x, p[1].y - p[0].y).length();
    var promptDistance = utils.askNumber(Constraints.P2PDistance.SettableFields.d, distance.toFixed(2), promptCallback, this.constantResolver);

    if (promptDistance != null) {
        this.add(new Constraints.P2PDistance(p[0], p[1], promptDistance));
    }
};

ParametricManager.prototype.radius = function(objs, promptCallback) {
    var arcs = fetch.arkCirc(objs, 1);
    var radius = arcs[0].r.get();
    var promptDistance = utils.askNumber(Constraints.Radius.SettableFields.d, radius.toFixed(2), promptCallback, this.constantResolver);
    if (promptDistance != null) {
        for (var i = 0; i < arcs.length; ++i) {
            this._add(new Constraints.Radius(arcs[i], promptDistance));
        }
        this.refresh();
    }
};

ParametricManager.prototype._linkObjects = function(objs) {
    var i;
    var masterIdx = -1;
    for (i = 0; i < objs.length; ++i) {
        if (isAux(objs[i])) {
            if (masterIdx !== -1) {
                throw "not allowed to have a coincident constraint between two or more auxiliary objects";
            }
            masterIdx = i;
        }
    }
    if (masterIdx === -1) masterIdx = objs.length - 1;


    for (i = 0; i < objs.length; ++i) {
        if (i === masterIdx) continue;
        objs[i].x = objs[masterIdx].x;
        objs[i].y = objs[masterIdx].y;
        var c = new Constraints.Coincident(objs[i], objs[masterIdx]);
        this._add(c);
    }
};

ParametricManager.prototype.linkObjects = function(objs) {
    this._linkObjects(objs);
    this.notify();
};

ParametricManager.prototype.unlinkObjects = function(a, b) {

    function _unlink(a, b) {
        for (var i = 0; i < a.linked.length; ++i) {
            var obj = a.linked[i];
            if (obj.id === b.id) {
                a.linked.splice(i, 1);
                break;
            }
        }
    }
    _unlink(a, b);
    _unlink(b, a);
};

ParametricManager.prototype.findCoincidentConstraint = function(point1, point2) {
    for (let subSys of this.subSystems) {
        for (let c of subSys.constraints) {
            if (c.NAME === 'coi' &&
                ((c.a.id === point1.id && c.b.id === point2.id) ||
                    (c.b.id === point1.id && c.a.id === point2.id))) {
                return c;
            }
        }
    }
    return null;
};

ParametricManager.prototype.coincident = function(objs) {
    if (objs.length == 0) return;
    this.linkObjects(objs);
    this.solve();
    this.viewer.refresh();
};

ParametricManager.prototype.getSolveData = function() {
    var sdata = [];
    for (var i = 0; i < this.subSystems.length; i++) {
        this.__getSolveData(this.subSystems[i].constraints, sdata);
    }
    return sdata;
};

ParametricManager.prototype.__getSolveData = function(constraints, out) {
    for (var i = 0; i < constraints.length; ++i) {
        var constraint = constraints[i];
        var data = constraint.getSolveData(this.constantResolver);
        for (var j = 0; j < data.length; ++j) {
            data[j].push(constraint.reducible !== true);
            out.push(data[j]);
        }
    }
    return out;
};

ParametricManager.prototype.solve = function(lock, extraConstraints, disabledObjects) {
    const solver = this.prepare(lock, extraConstraints, disabledObjects);
    solver.solve(false);
    solver.sync();
};

ParametricManager.prototype.prepare = function(locked, extraConstraints, disabledObjects) {
    return this._prepare(locked, this.subSystems, extraConstraints, disabledObjects);
};

ParametricManager.prototype._prepare = function(locked, subSystems, extraConstraints, disabledObjects) {
    var solvers = [];
    for (var i = 0; i < subSystems.length; i++) {
        solvers.push(this.prepareForSubSystem(locked, subSystems[i].constraints, extraConstraints, disabledObjects));
    }
    if (subSystems.length == 0 && locked && locked.length != 0) {
        solvers.push(this.prepareForSubSystem(locked, [], extraConstraints, disabledObjects));
    }
    return {
        solvers: solvers,

        solve: function(rough) {
            for (var i = 0; i < solvers.length; i++) {
                var alg = i < subSystems.length ? subSystems[i].alg : 1;
                var res = solvers[i].solve(rough, alg);
                if (res.returnCode !== 1) {
                    alg = alg == 1 ? 2 : 1;
                    //if (solvers[i].solve(rough, alg).returnCode == 1) {
                    //subSystems[i].alg = alg;
                    //}
                }
            }
        },

        sync: function() {
            for (var i = 0; i < solvers.length; i++) {
                solvers[i].sync();
            }
        },

        updateParameter: function(p) {
            for (var i = 0; i < solvers.length; i++) {
                solvers[i].updateParameter(p);
            }
        },

        updateLock: function(values) {
            for (var i = 0; i < solvers.length; i++) {
                solvers[i].updateLock(values);
            }
        }
    }
};

const isAux = function(obj, disabledObjects?) {
    while (!!obj) {
        if (!!obj.aux || (disabledObjects !== undefined && disabledObjects.has(obj))) {
            return true;
        }
        obj = obj.parent;
    }
    return false;
};

const fetchAuxParams = function(system, auxParams, auxDict, disabledObjects) {
    disabledObjects = disabledObjects != undefined ? new Set(disabledObjects) : undefined;
    for (var i = 0; i < system.length; ++i) {
        for (var p = 0; p < system[i][1].length; ++p) {
            var parameter = system[i][1][p];
            if (parameter.obj !== undefined) {
                if (isAux(parameter.obj, disabledObjects)) {
                    if (auxDict[parameter.id] === undefined) {
                        auxDict[parameter.id] = parameter;
                        auxParams.push(parameter);
                    }
                }
            }
        }
    }
};

const __toId = function(v) {
    return v.id;
};

const reduceSystem = function(system, readOnlyParams) {

    var info = {
        idToParam: {},
        linkedParams: [],
        reducedConstraints: {},
        reducedParams: {}
    };

    var links = [];

    function Link(a, b, constr) {
        this.a = a;
        this.b = b;
        this.constr = constr;
        this.invalid = false;
        this.processed = false;
    }

    var c, pi, paramToConstraints = {};
    for (i = 0; i < system.length; ++i) {
        c = system[i];
        if (c[3] !== true) {
            for (pi = 0; pi < c[1].length; pi++) {
                var param = c[1][pi];
                var paramConstrs = paramToConstraints[param.id];
                if (paramConstrs === undefined) {
                    paramConstrs = [];
                    paramToConstraints[param.id] = paramConstrs;
                }
                paramConstrs.push(i);
            }
        }
    }

    for (i = 0; i < system.length; ++i) {
        c = system[i];
        if (c[3] === true) { //Reduce flag
            var cp1 = c[1][0];
            var cp2 = c[1][1];
            links.push(new Link(cp1, cp2, i));
        }
    }

    function intersect(array1, array2) {
        if (!array1 || !array2) return false;
        return array1.filter(function(n) {
            return array2.indexOf(n) != -1
        }).length != 0;
    }

    function shared(param1, param2) {
        if (param1 == param2) return false;
        var assoc0 = paramToConstraints[param1];
        var assoc1 = paramToConstraints[param2];
        return intersect(assoc0, assoc1);
    }

    var linkTuples = [];

    function mergeLinks(startIndex, into) {
        var linkI = links[startIndex];
        if (linkI.processed) return;
        linkI.processed = true;
        into.push(linkI);
        for (var j = startIndex + 1; j < links.length; j++) {
            var linkJ = links[j];
            if (linkI.a.id == linkJ.a.id || linkI.a.id == linkJ.b.id || linkI.b.id == linkJ.a.id || linkI.b.id == linkJ.b.id) {
                mergeLinks(j, into);
            }
        }
    }
    for (i = 0; i < links.length; i++) {
        if (links[i].processed) continue;
        var linkTuple = [];
        linkTuples.push(linkTuple);
        mergeLinks(i, linkTuple)
    }

    function resolveConflicts() {
        for (var i = 0; i < linkTuples.length; i++) {
            var tuple = linkTuples[i];

            for (var j = 0; j < tuple.length; j++) {
                var linkA = tuple[j];
                if (linkA.invalid) continue;
                if (shared(linkA.a.id, linkA.b.id)) {
                    linkA.invalid = true;
                    continue;
                }
                for (var k = j + 1; k < tuple.length; k++) {
                    var linkB = tuple[k];
                    if (shared(linkA.a.id, linkB.a.id) || shared(linkA.a.id, linkB.b.id) || shared(linkA.b.id, linkB.a.id) || shared(linkA.b.id, linkB.b.id)) {
                        linkB.invalid = true;
                    }
                }
            }
        }
    }
    resolveConflicts();

    function _merge(arr1, arr2) {
        for (var i = 0; i < arr2.length; ++i) {
            if (arr1.indexOf(arr2[i]) < 0) {
                arr1.push(arr2[i]);
            }
        }
    }

    function linksToTuples(linkTuples) {
        var tuples = [];
        for (var i = 0; i < linkTuples.length; i++) {
            var linkTuple = linkTuples[i];
            var tuple = [];
            tuples.push(tuple);
            for (var j = 0; j < linkTuple.length; j++) {
                var link = linkTuple[j];
                if (!link.invalid) {
                    _merge(tuple, [link.a.id, link.b.id]);
                    info.reducedConstraints[link.constr] = true;
                    info.idToParam[link.a.id] = link.a;
                    info.idToParam[link.b.id] = link.b;
                }
            }
        }
        return tuples;
    }
    var tuples = linksToTuples(linkTuples);

    for (var i = 0; i < tuples.length; ++i) {
        var tuple = tuples[i];
        info.linkedParams.push(tuple);
        for (var mi = 0; mi < readOnlyParams.length; ++mi) {
            var masterParam = readOnlyParams[mi];
            var masterIdx = tuple.indexOf(masterParam.id);
            if (masterIdx >= 0) {
                var tmp = tuple[0];
                tuple[0] = tuple[masterIdx];
                tuple[masterIdx] = tmp;
                break;
            }
        }
    }

    for (var ei = 0; ei < info.linkedParams.length; ++ei) {
        var master = info.linkedParams[ei][0];
        for (i = 1; i < info.linkedParams[ei].length; ++i) {
            info.reducedParams[info.linkedParams[ei][i]] = master;
        }
    }
    return info;
};

ParametricManager.prototype.prepareForSubSystem = function(locked, subSystemConstraints, extraConstraints, disabledObjects) {

    locked = locked || [];

    var constrs = [];
    var solverParamsDict = {};
    var system = [];
    var auxParams = [];
    var auxDict = {};

    this.__getSolveData(subSystemConstraints, system);
    if (!!extraConstraints) this.__getSolveData(extraConstraints, system);

    fetchAuxParams(system, auxParams, auxDict, disabledObjects);
    var readOnlyParams = auxParams.concat(locked);
    var reduceInfo = reduceSystem(system, readOnlyParams);

    function getSolverParam(p) {
        var master = reduceInfo.reducedParams[p.id];
        if (master !== undefined) {
            p = reduceInfo.idToParam[master];
        }
        var _p = solverParamsDict[p.id];
        if (_p === undefined) {
            if (p.__cachedParam__ === undefined) {
                _p = new Param(p.id, p.get());
                p.__cachedParam__ = _p;
            } else {
                _p = p.__cachedParam__;
                _p.reset(p.get());
            }

            _p._backingParam = p;
            solverParamsDict[p.id] = _p;
        }
        return _p;
    }

    (function pickupAuxiliaryInfoFromSlaves() {
        for (var i = 0; i < reduceInfo.linkedParams.length; ++i) {
            var linkedParams = reduceInfo.linkedParams[i];
            var master = linkedParams[0];
            if (auxDict[master] !== undefined) continue;
            for (var j = 1; j < linkedParams.length; j++) {
                var slave = linkedParams[j];
                if (auxDict[slave] !== undefined) {
                    auxDict[master] = true;
                    break;
                }
            }
        }
    })();

    for (var i = 0; i < system.length; ++i) {

        var sdata = system[i];
        var params = [];

        for (let p = 0; p < sdata[1].length; ++p) {
            const param = sdata[1][p];
            const solverParam = getSolverParam(param);
            solverParam.aux = auxDict[param.id] !== undefined;
            params.push(solverParam);
        }
        //if (reduceInfo.reducedConstraints[i] === true) continue;


        var _constr = createByConstraintName(sdata[0], params, sdata[2]);
        constrs.push(_constr);
    }

    var lockedSolverParams = [];
    for (let p = 0; p < locked.length; ++p) {
        lockedSolverParams[p] = getSolverParam(locked[p]);
    }

    var solver: any = prepare(constrs, lockedSolverParams);

    function solve(rough, alg) {
        return solver.solveSystem(rough, alg);
    }

    const viewer = this.viewer;

    function sync() {
        for (var paramId in solverParamsDict) {
            var solverParam = solverParamsDict[paramId];
            if (!!solverParam._backingParam.aux) continue;
            solverParam._backingParam.set(solverParam.get());
        }

        //Make sure all coincident constraints are equal
        for (var ei = 0; ei < reduceInfo.linkedParams.length; ++ei) {
            var master = reduceInfo.idToParam[reduceInfo.linkedParams[ei][0]];
            for (var i = 1; i < reduceInfo.linkedParams[ei].length; ++i) {
                var slave = reduceInfo.idToParam[reduceInfo.linkedParams[ei][i]];
                slave.set(master.get());
            }
        }
        viewer.equalizeLinkedEndpoints();
    }

    function updateParameter(p) {
        getSolverParam(p).set(p.get());
    }

    solver.solve = solve;
    solver.sync = sync;
    solver.updateParameter = updateParameter;
    return solver;
};

export { ParametricManager }
