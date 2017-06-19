import libtess from 'libtess'
import {Point} from '../brep/geom/point'
import {Vertex} from '../brep/topo/vertex'

function initTesselator() {
  // function called for each vertex of tesselator output
  function vertexCallback(data, polyVertArray) {
    polyVertArray.push(data);
  }
  // callback for when segments intersect and must be split
  function combinecallback(coords, data, weight) {
    // console.log('combine callback');
    return [coords[0], coords[1], coords[2]];
  }
  function edgeCallback(flag) {
    // don't really care about the flag, but need no-strip/no-fan behavior
    // console.log('edge flag: ' + flag);
  }

  var tessy = new libtess.GluTesselator();
  // tessy.gluTessProperty(libtess.gluEnum.GLU_TESS_WINDING_RULE, libtess.windingRule.GLU_TESS_WINDING_POSITIVE);
  tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertexCallback);
  tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_BEGIN, begincallback);
  tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_ERROR, errorcallback);
  tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combinecallback);
  tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edgeCallback);

  return tessy;
}

function begincallback(type) {
  if (type !== libtess.primitiveType.GL_TRIANGLES) {
    console.log('expected TRIANGLES but got type: ' + type);
  }
}

function errorcallback(errno) {
  console.log('error callback');
  console.log('error number: ' + errno);
}


export function Triangulate(contours, normal) {
  const tessy = initTesselator();
  // libtess will take 3d verts and flatten to a plane for tesselation
  // since only doing 2d tesselation here, provide z=1 normal to skip
  // iterating over verts only to get the same answer.
  // comment out to test normal-generation code
  //tessy.gluTessNormal(0, 0, 1);
  tessy.gluTessNormal(normal[0], normal[1], normal[2]);
  
  const triangleVerts = [];
  tessy.gluTessBeginPolygon(triangleVerts);

  for (let contour of contours) {
    tessy.gluTessBeginContour();
    for (let coords of contour) {
      tessy.gluTessVertex(coords, coords);
    }
    tessy.gluTessEndContour();
  }

  // finish polygon (and time triangulation process)
  tessy.gluTessEndPolygon();
  return triangleVerts;
}

export function TriangulatePolygons(polygons, normal, toArray, fromArray) {
  const triangled = [];
  const contours = [];
  for (let poly of polygons) {
    contours.push(poly.map(point => toArray(point)));
  }

  let vertices = Triangulate(contours, toArray(normal));
  for (let i = 0;  i < vertices.length; i += 3 ) {
    var a = fromArray(vertices[i]);
    var b = fromArray(vertices[i + 1]);
    var c = fromArray(vertices[i + 2]);
    triangled.push([a, b, c]);
  }
  return triangled;
}

export function TriangulateFace(face) {
  function arr(v) {
    return [v.x, v.y, v.z];
  }

  function vertexCallback(data, out) {
    out.push(data);
  }
  let edge = false;
  function combinecallback(coords, data, weight) {
    throw 'should never happen cuz brep is non-manifold'
    //const point = new Point(coords[0], coords[1], coords[2]);
    //if (edge) {
    //  const vertex = new Vertex(point);
    //  data.edge.split(vertex);
    //  return {
    //    edge: data.edge.next,
    //    point
    //  }
    //} else {
    //  return {
    //    edge: null,
    //    point
    //  }
    //}
  }
  function edgeCallback(flag) {
    edge = flag;
  }

  var tessy = new libtess.GluTesselator();
  // tessy.gluTessProperty(libtess.gluEnum.GLU_TESS_WINDING_RULE, libtess.windingRule.GLU_TESS_WINDING_POSITIVE);
  tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertexCallback);
  tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_BEGIN, begincallback);
  tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_ERROR, errorcallback);
  tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combinecallback);
  tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edgeCallback);
  
  const normal = arr(face.surface.normal);
  tessy.gluTessNormal(normal[0], normal[1], normal[2]);

  const vertices = [];
  tessy.gluTessBeginPolygon(vertices);

  for (let loop of face.loops) {
    tessy.gluTessBeginContour();
    for (let e of loop.halfEdges) {
      tessy.gluTessVertex(arr(e.vertexA.point), e.vertexA);
    }
    tessy.gluTessEndContour();
  }

  tessy.gluTessEndPolygon();

  const triangled = [];

  for (let i = 0;  i < vertices.length; i += 3 ) {
    var a = vertices[i];
    var b = vertices[i + 1];
    var c = vertices[i + 2];
    triangled.push([a, b, c]);
  }
  return triangled;
}