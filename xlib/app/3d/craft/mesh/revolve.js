import {Matrix3} from '../../../math/l3space'
import Vector from '../../../math/vector'
import * as math from '../../../math/math'
import {createShared} from '../../cad-utils'

function Group(derivedFrom) {
  this.polygons = [];
  this.derivedFrom = derivedFrom;
}

export default function revolve(polygons, axisSegment, angle, resolution) {
  const groups = {};
  const out = [];
  let lids = revolveIterator(polygons, axisSegment, angle, resolution, (pOrig, pRot, p, q, reverse, segmentId) => {
    const polygon = [pOrig[p], pOrig[q]];
    
    //skip point if they are on the axis of revolving
    if (!math.equal(0, math.distanceAB3(pOrig[q], pRot[q]))) {
      polygon.push(pRot[q]);
    }
    if (!math.equal(0, math.distanceAB3(pOrig[p], pRot[p]))) {
      polygon.push(pRot[p]);
    }
    if (polygon.length < 3) {
      return;
    }
    if (reverse) {
      polygon.reverse(); //fixes CCW order
    }

    let shared = createShared();
    let sketchConnectionObject = pOrig[p].sketchConnectionObject;
    if (sketchConnectionObject) {
      if (sketchConnectionObject._class == 'TCAD.TWO.Segment') {
        sketchConnectionObject = Object.assign({}, sketchConnectionObject, {
          _class: 'TCAD.TWO.Arc',
          id: sketchConnectionObject.id + ":REVOLVED" // just avoid having object with the same ID but different classes
        });
      }
      shared.__tcad.csgInfo = {derivedFrom:  sketchConnectionObject};
      pRot[p].sketchConnectionObject = sketchConnectionObject;
    }
    
    const face = csgPolygon(polygon, shared);
    out.push(face);
  });
  if (!math.equal(_360, angle)) {
    if (angle < 0) {
      let t = lids;
      lids = polygons;
      polygons = t;
    } 
    lids.forEach(p => out.push(csgPolygon(p, createShared())));
    polygons.forEach(p => out.push(csgPolygon(p.slice().reverse(), createShared())));
  } 
  return out;
}

export function revolveToWireframe(polygons, axisSegment, angle, resolution) {
  const out = [];
  //add initial polygon
  addAsSegments(out, polygons);
  revolveIterator(polygons, axisSegment, angle, resolution, (pOrig, pRot, p, q) => {
    out.push([pRot[p], pRot[q]]);
    addIfNonZero(out, [pOrig[q], pRot[q]]);
    addIfNonZero(out, [pOrig[p], pRot[p]]);
  });
  return out;
}

export function revolveToTriangles(polygons, axisSegment, angle, resolution) {
  const out = [];
  //add initial polygon
  revolveIterator(polygons, axisSegment, angle, resolution, (pOrig, pRot, p, q) => {
    //skip point if they are on the axis of revolving
    if (!math.equal(0, math.distanceAB3(pOrig[q], pRot[q]))) {
      out.push( [pOrig[p], pOrig[q], pRot[q]] );
    }
    if (!math.equal(0, math.distanceAB3(pOrig[p], pRot[p]))) {
      out.push( [ pRot[q],  pRot[p], pOrig[p]] );
    }
  });
  if (angle < 0) {
    out.forEach(tr => tr.reverse());
  }
  return out;
}

export function revolveIterator(polygons, axisSegment, angle, resolution, callback) {
  
  if (resolution < 2) resolution = 2;
  const reverse = angle < 0;
  angle = Math.abs(angle);
  if (angle > _360) {
    angle = _360;
  }
  
  const angleStep = angle / resolution * (reverse ? -1 : 1);
  const axis = new Vector().setV(axisSegment[1])._minus(axisSegment[0]);
  const tr = Matrix3.rotateMatrix(angleStep, axis, axisSegment[0]);
  
  for (let resIndex = 0; resIndex < resolution; resIndex++) {
    let rotatedPolygons = polygons.map(poly => poly.map(point => tr.apply(point)));
    let segmentId = 0;
    for (let i = 0; i < polygons.length; i++) {
      const pOrig = polygons[i];      
      const pRot = rotatedPolygons[i];
      const n = pOrig.length;
      for (let p = n - 1, q = 0; q < n; p = q ++) {
        callback(pOrig, pRot, p, q, reverse, segmentId ++);
      }
    }
    polygons = rotatedPolygons;
  }
  return polygons;
}


function addIfNonZero(out, seg) {
  if (!math.equal(0, math.distanceAB3(seg[0], seg[1]))) {
    out.push(seg);
  }
}

function addAsSegments(out, polygons) {
  for (let poly of polygons) {
    for (let p = poly.length - 1, q = 0; q < poly.length; p = q ++) {
      out.push([poly[p], poly[q]]);
    }
  }
}

function csgPolygon(points, shared) {
  return new CSG.Polygon(points.map(p => new CSG.Vertex(p.csg())), shared);
}

const _360 = 2 * Math.PI;
