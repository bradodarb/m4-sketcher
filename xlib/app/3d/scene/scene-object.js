import {HashTable} from '../../utils/hashmap'
import Vector from '../../math/vector'
import Counters from '../counters'
import {Matrix3, BasisForPlane} from '../../math/l3space'
import {isCurveClass} from '../cad-utils'
import DPR from '../../utils/dpr'

export class SceneSolid {
  
  constructor(type, id, skin) {
    this.tCadType = type || 'SOLID';

    this.cadGroup = new THREE.Object3D();
    this.cadGroup.__tcad_solid = this;

    this.tCadId = Counters.solid ++;
    this.id = id === undefined ? this.tCadId : id; // to keep identity through the history
    this.faceCounter = 0;

    this.wireframeGroup = new THREE.Object3D();
    this.cadGroup.add(this.wireframeGroup);
    this.mergeable = true;
    this.sceneFaces = [];

    this.material = createSolidMaterial(skin);
  }

  addLineToScene(a, b) {
    var lg = new THREE.Geometry();
    lg.vertices.push(a);
    lg.vertices.push(b);
    var line = new THREE.Line(lg, WIREFRAME_MATERIAL);
    this.wireframeGroup.add(line);
    return line;
  }

  createGeometry() {
    throw 'not implemented';
  }

  dropGeometry() {
    throw 'not implemented';
  }

  vanish() {
    this.cadGroup.parent.remove( this.cadGroup );
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}

export function createSolidMaterial(skin) {
  return new THREE.MeshPhongMaterial(Object.assign({
    vertexColors: THREE.FaceColors,
    color: 0xB0C4DE,
    shininess: 0,
    polygonOffset : true,
    polygonOffsetFactor : 1,
    polygonOffsetUnits : 2,
    //side : THREE.DoubleSide
  }, skin));
}

const OFF_LINES_VECTOR = new Vector();//normal.multiply(0); // disable it. use polygon offset feature of material

export class SceneFace {
  constructor(solid, propagatedId) {
    if (propagatedId === undefined) {
      this.id = solid.tCadId + ":" + (solid.faceCounter++);
    } else {
      this.id = propagatedId;
    }

    this.solid = solid;
    this.meshFaces = [];
    this.sketch3DGroup = null;
  }

  normal() {
    throw 'not implemented';
  }

  depth() {
    throw 'not implemented';
  }
  
  getBounds() {
    throw 'not implemented';
  }
  
  calcBasis() {
    return BasisForPlane(this.normal());    
  };

  basis() {
    if (!this._basis) {
      this._basis = this.calcBasis();
    }
    return this._basis;
  }

  createMeshFace(a, b, c) {
    const face = new THREE.Face3(a, b, c);
    this.registerMeshFace(face);
    return face;
  }

  registerMeshFace(threeFace) {
    this.meshFaces.push(threeFace);
    threeFace.__TCAD_SceneFace = this;
  }

  syncSketches(geom) {
    if (this.sketch3DGroup != null) {
      for (let i = this.sketch3DGroup.children.length - 1; i >= 0; --i) {
        this.sketch3DGroup.remove(this.sketch3DGroup.children[i]);
      }
    } else {
      this.sketch3DGroup = new THREE.Object3D();
      this.solid.cadGroup.add(this.sketch3DGroup);
    }

    const basis = this.basis();
    const _3dTransformation = new Matrix3().setBasis(basis);
    //we lost depth or z off in 2d sketch, calculate it again
    const depth = this.depth();
    const addSketchObjects = (sketchObjects, material, close) => {
      for (let sketchObject of sketchObjects) {
        let line = new THREE.Line(undefined, material);
        line.__TCAD_SketchObject = sketchObject;
        const chunks = sketchObject.approximate(10);
        function addLine(p, q) {
          const lg = line.geometry;
          chunks[p].z = chunks[q].z = depth;
          const a = _3dTransformation.apply(chunks[p]);
          const b = _3dTransformation.apply(chunks[q]);

          lg.vertices.push(a._plus(OFF_LINES_VECTOR).three());
          lg.vertices.push(b._plus(OFF_LINES_VECTOR).three());
        }
        for (let q = 1; q < chunks.length; q ++) {
          addLine(q - 1, q);
        }
        this.sketch3DGroup.add(line);
      }
    };
    addSketchObjects(geom.constructionSegments, SKETCH_CONSTRUCTION_MATERIAL);
    addSketchObjects(geom.connections, SKETCH_MATERIAL);
    addSketchObjects(geom.loops, SKETCH_MATERIAL);
  }

  findById(sketchObjectId) {
    return this.sketch3DGroup.children.find(o => o.__TCAD_SketchObject && o.__TCAD_SketchObject.id == sketchObjectId);
  }

  getSketchObjectVerticesIn3D(sketchObjectId) {
    const object = this.findById(sketchObjectId);
    if (!object) {
      return undefined;
    }
    return object.geometry.vertices;
  }
}

export const SKETCH_MATERIAL = new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: 3/DPR});
export const SKETCH_CONSTRUCTION_MATERIAL = new THREE.LineBasicMaterial({color: 0x777777, linewidth: 2/DPR});
export const WIREFRAME_MATERIAL = new THREE.LineBasicMaterial({color: 0x2B3856, linewidth: 3/DPR});
