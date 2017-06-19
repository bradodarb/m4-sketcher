import {Generator} from './id-generator'
import {Layer} from './viewer2d'
import {Styles} from './styles'
import {Arc} from './shapes/arc'
import {EndPoint} from './shapes/point'
import {Segment} from './shapes/segment'
import {Circle} from './shapes/circle'
import {Ellipse} from './shapes/ellipse'
import {EllipticalArc} from './shapes/elliptical-arc'
import {BezierCurve} from './shapes/bezier-curve'
import {HDimension, VDimension, Dimension, DiameterDimension} from './shapes/dim'
import {Constraints} from './parametric'
import {HashTable} from '../utils/hashmap'
import Vector from '../math/vector'

const Types = {
  END_POINT : 'TCAD.TWO.EndPoint',
  SEGMENT   : 'TCAD.TWO.Segment',
  ARC       : 'TCAD.TWO.Arc',
  CIRCLE    : 'TCAD.TWO.Circle',
  ELLIPSE   : 'TCAD.TWO.Ellipse',
  ELL_ARC   : 'TCAD.TWO.EllipticalArc',
  BEZIER    : 'TCAD.TWO.BezierCurve',
  DIM       : 'TCAD.TWO.Dimension',
  HDIM      : 'TCAD.TWO.HDimension',
  VDIM      : 'TCAD.TWO.VDimension',
  DDIM      : 'TCAD.TWO.DiameterDimension'
};

IO.BOUNDARY_LAYER_NAME = "__bounds__";

/** @constructor */
function IO(viewer) {
  this.viewer = viewer;
}

IO.prototype.loadSketch = function(sketchData) {
  return this._loadSketch(JSON.parse(sketchData));
};

IO.prototype.serializeSketch = function() {
  return JSON.stringify(this._serializeSketch());
};

IO.prototype._loadSketch = function(sketch) {

  this.cleanUpData();

  var index = {};

  function endPoint(p) {
    var id = p[0];
    var ep = index[id];
    if (ep !== undefined) {
      return
    }
    ep = new EndPoint(p[1][1], p[2][1]);
    index[p[1][0]] = ep._x;
    index[p[2][0]] = ep._y;
    index[id] = ep;
    return ep;
  }

  var layerIdGen = 0;
  function getLayer(viewer, name) {
    if (name === undefined) {
      name = "layer_" + layerIdGen++;
    } else {
      if (name === viewer.dimLayer.name) {
        return viewer.dimLayer;
      }
      for (var i = 0; i < viewer.layers.length; ++i) {
        if (name === viewer.layers[i].name) {
          return viewer.layers[i];
        }
      }
    }
    var layer = new Layer(name, Styles.DEFAULT);
    viewer.layers.push(layer);
    return layer;
  }
  var T = Types;
  var maxEdge = 0;
  var sketchLayers = sketch['layers'];
  var boundary = sketch['boundary'];
  var boundaryNeedsUpdate = !(boundary === undefined || boundary == null);
  if (sketchLayers !== undefined) {
    for (var l = 0; l < sketchLayers.length; ++l) {
      var ioLayer = sketchLayers[l];
      var layerName = ioLayer['name'];
      var boundaryProcessing = layerName == IO.BOUNDARY_LAYER_NAME && boundaryNeedsUpdate;
      var layer = getLayer(this.viewer, layerName);
      if (!!ioLayer.style) layer.style = ioLayer.style;
      layer.readOnly = !!ioLayer.readOnly;
      var layerData = ioLayer['data'];
      for (i = 0; i < layerData.length; ++i) {
        var obj = layerData[i];
        var skobj = null;
        var _class = obj['_class'];
        var aux = !!obj['aux'];
        
        if (boundaryProcessing) {
          if (_class === T.SEGMENT && boundary.lines.length == 0) continue;
          else if (_class === T.ARC && boundary.arcs.length == 0) continue;
          else if (_class === T.CIRCLE && boundary.circles.length == 0) continue;
        }
        
        if (_class === T.SEGMENT) {
          const points = obj['points'];
          const a = endPoint(points[0]);
          const b = endPoint(points[1]);
          skobj = new Segment(a, b);
        } else if (_class === T.END_POINT) {
          skobj = endPoint(obj['location']);
        } else if (_class === T.ARC) {
          const points = obj['points'];
          const a = endPoint(points[0]);
          const b = endPoint(points[1]);
          const c = endPoint(points[2]);
          skobj = new Arc(a, b, c);
        } else if (_class === T.CIRCLE) {
          const c = endPoint(obj['c']);
          skobj = new Circle(c);
          skobj.r.set(obj['r']);
        } else if (_class === T.ELLIPSE) {
          const ep1 = endPoint(obj['ep1']);
          const ep2 = endPoint(obj['ep2']);
          skobj = new Ellipse(ep1, ep2);
          skobj.r.set(obj['r']);
        } else if (_class === T.ELL_ARC) {
          const ep1 = endPoint(obj['ep1']);
          const ep2 = endPoint(obj['ep2']);
          const a = endPoint(obj['a']);
          const b = endPoint(obj['b']);
          skobj = new EllipticalArc(ep1, ep2, a, b);
          skobj.r.set(obj['r']);
        } else if (_class === T.BEZIER) {
          const a = endPoint(obj['a']);
          const b = endPoint(obj['b']);
          const cp1 = endPoint(obj['cp1']);
          const cp2 = endPoint(obj['cp2']);
          skobj = new BezierCurve(a, b, cp1, cp2);
        } else if (_class === T.HDIM) {
          skobj = new HDimension(obj['a'], obj['b']);
          skobj.flip = obj['flip'];
        } else if (_class === T.VDIM) {
          skobj = new VDimension(obj['a'], obj['b']);
          skobj.flip = obj['flip'];
        } else if (_class === T.DIM) {
          skobj = new Dimension(obj['a'], obj['b']);
          skobj.flip = obj['flip'];
        } else if (_class === T.DDIM) {
          skobj = new DiameterDimension(obj['obj']);
        }
        if (skobj != null) {
          if (!aux) skobj.stabilize(this.viewer);
          if (aux) skobj.accept(function(o){o.aux = true; return true;});
          if (obj['edge'] !== undefined) {
            skobj.edge = obj['edge'];
            maxEdge = Math.max(maxEdge, skobj.edge);
          }
          layer.add(skobj);
          index[obj['id']] = skobj;
          
          //reindex non point children to recover constraints
          const childrenIds = obj['children'];
          if (childrenIds) {
            const children = nonPointChildren(skobj);
            for (let childIdx = 0; childIdx < childrenIds.length; childIdx++) {
              index[childrenIds[childIdx]] = children[childIdx];
            }
          }
        }
        if (boundaryProcessing) {
          if (_class === T.SEGMENT) this.synchLine(skobj, boundary.lines.shift());
          else if (_class === T.ARC) this.synchArc(skobj, boundary.arcs.shift());
          else if (_class === T.CIRCLE) this.synchCircle(skobj, boundary.circles.shift());
        }
      }
    }
  }

  for (i = 0; i < this.viewer.dimLayer.objects.length; ++i) {
    obj = this.viewer.dimLayer.objects[i];
    if (obj._class === T.DIM || obj._class === T.HDIM || obj._class === T.VDIM) {
      obj.a = index[obj.a];
      obj.b = index[obj.b];
    } else if (obj._class === T.DDIM) {
      obj.obj = index[obj.obj];
    }
  }

  if (boundaryNeedsUpdate) {
    this.addNewBoundaryObjects(boundary, maxEdge);
  }
  const boundaryLayer = this.viewer.findLayerByName(IO.BOUNDARY_LAYER_NAME);
  if (boundaryLayer != null) {
    this.linkEndPoints(boundaryLayer.objects);
  }

  var sketchConstraints = sketch['constraints'];
  if (sketchConstraints !== undefined) {
    for (var i = 0; i < sketchConstraints.length; ++i) {
      try {
        const c = this.parseConstr(sketchConstraints[i], index);
        this.viewer.parametricManager._add(c);
      } catch (msg) {
        console.info("Skipping. " + msg);
      }
    }
    this.viewer.parametricManager.notify();
  }
  var constants = sketch['constants'];
  if (constants !== undefined) {
    this.viewer.params.constantDefinition = constants;
  }
};

IO.prototype.linkEndPoints = function(objects) {
  const index = HashTable.forVector2d();
  for (let obj of objects) {
    obj.accept((o) => {
      if (o._class == Types.END_POINT) {
        const equalPoint = index.get(o);
        if (equalPoint == null) {
          index.put(o, o);
        } else {
          o.linked.push(equalPoint);
          equalPoint.linked.push(o);
        }
      }
      return true;
    })
  }  
};

IO.prototype.synchLine = function(skobj, edgeObj) {
  skobj.a.x = edgeObj.a.x;
  skobj.a.y = edgeObj.a.y;
  skobj.b.x = edgeObj.b.x;
  skobj.b.y = edgeObj.b.y;
};

IO.prototype.synchArc = function(skobj, edgeObj) {
  skobj.a.x = edgeObj.a.x;
  skobj.a.y = edgeObj.a.y;
  skobj.b.x = edgeObj.b.x;
  skobj.b.y = edgeObj.b.y;
  skobj.c.x = edgeObj.c.x;
  skobj.c.y = edgeObj.c.y;
};

IO.prototype.synchCircle = function(skobj, edgeObj) {
  skobj.c.x = edgeObj.c.x;
  skobj.c.y = edgeObj.c.y;
  skobj.r.set(edgeObj.r);
};

IO.prototype.addNewBoundaryObjects = function(boundary, maxEdge) {
  var boundaryLayer = this.viewer.findLayerByName(IO.BOUNDARY_LAYER_NAME);

  if (boundaryLayer === null) {
    boundaryLayer = new Layer(IO.BOUNDARY_LAYER_NAME, Styles.BOUNDS);
    this.viewer.layers.splice(0, 0, boundaryLayer);
  } 

  boundaryLayer.readOnly = true;
  boundaryLayer.style = Styles.BOUNDS;

  var i, obj, id = maxEdge + 1;
  function __processAux(obj) {
    obj.edge = id ++;
    obj.accept(function(o){
      o.aux = true;
      return true;
    });
  }

  for (i = 0; i < boundary.lines.length; ++i) {
    var edge = boundary.lines[i];
    var seg = this.viewer.addSegment(edge.a.x, edge.a.y, edge.b.x, edge.b.y, boundaryLayer);
    __processAux(seg);
  }
  for (i = 0; i < boundary.arcs.length; ++i) {
    var a = boundary.arcs[i];
    var arc = new Arc(
      new EndPoint(a.a.x, a.a.y),
      new EndPoint(a.b.x, a.b.y),
      new EndPoint(a.c.x, a.c.y)
    );
    boundaryLayer.objects.push(arc);
    __processAux(arc);
  }
  for (i = 0; i < boundary.circles.length; ++i) {
    obj = boundary.circles[i];
    var circle = new Circle(new EndPoint(obj.c.x, obj.c.y));
    circle.r.set(obj.r);
    boundaryLayer.objects.push(circle);
    __processAux(circle);
  }
};

IO.prototype.cleanUpData = function() {
  for (var l = 0; l < this.viewer.layers.length; ++l) {
    var layer = this.viewer.layers[l];
    if (layer.objects.length != 0) {
      layer.objects = [];
    }
  }
  this.viewer.deselectAll();
  Generator.resetIDGenerator(0);
  if (this.viewer.parametricManager.subSystems.length != 0) {
    this.viewer.parametricManager.subSystems = [];
    this.viewer.parametricManager.notify();
  }
};

IO.prototype._serializeSketch = function() {
  var sketch = {};
  //sketch.boundary = boundary;
  sketch['layers'] = [];
  function point(p) {
    return [ p.id, [p._x.id, p.x], [p._y.id, p.y] ];
  }
  var T = Types;
  var toSave = [this.viewer.dimLayers, this.viewer.layers];
  for (var t = 0; t < toSave.length; ++t) {
    var layers = toSave[t];
    for (var l = 0; l < layers.length; ++l) {
      var layer = layers[l];
      var toLayer = {'name' : layer.name, style : layer.style, readOnly: layer.readOnly, 'data' : []};
      sketch['layers'].push(toLayer);
      for (var i = 0; i < layer.objects.length; ++i) {
        var obj = layer.objects[i];
        var to = {'id': obj.id, '_class': obj._class};
        if (obj.aux) to.aux = obj.aux;
        if (obj.edge !== undefined) to.edge = obj.edge;
        toLayer['data'].push(to);
        if (obj._class === T.SEGMENT) {
          to['points'] = [point(obj.a), point(obj.b)];
        } else if (obj._class === T.END_POINT) {
          to['location'] = point(obj);
        } else if (obj._class === T.ARC) {
          to['points'] = [point(obj.a), point(obj.b), point(obj.c)];
        } else if (obj._class === T.CIRCLE) {
          to['c'] = point(obj.c);
          to['r'] = obj.r.get();
        } else if (obj._class === T.ELLIPSE) {
          to['ep1'] = point(obj.ep1);
          to['ep2'] = point(obj.ep2);
          to['r'] = obj.r.get();
        } else if (obj._class === T.ELL_ARC) {
          to['ep1'] = point(obj.ep1);
          to['ep2'] = point(obj.ep2);
          to['a'] = point(obj.a);
          to['b'] = point(obj.b);
          to['r'] = obj.r.get();
        } else if (obj._class === T.BEZIER) {
          to['a'] = point(obj.a);
          to['b'] = point(obj.b);
          to['cp1'] = point(obj.cp1);
          to['cp2'] = point(obj.cp2);
        } else if (obj._class === T.DIM || obj._class === T.HDIM || obj._class === T.VDIM) {
          to['a'] = obj.a.id;
          to['b'] = obj.b.id;
          to['flip'] = obj.flip;
        } else if (obj._class === T.DDIM) {
          to['obj'] = obj.obj.id;
        }
        const children = nonPointChildren(obj).map(c => c.id);
        if (children.length != 0) {
          to['children'] = children;
        }
      }
    }
  }

  var constrs = sketch['constraints'] = [];
  var subSystems = this.viewer.parametricManager.subSystems;
  for (var j = 0; j < subSystems.length; j++) {
    var sub = subSystems[j];
    for (i = 0; i < sub.constraints.length; ++i) {
      if (!sub.constraints[i].aux) {
        constrs.push(this.serializeConstr(sub.constraints[i]));
      }
    }
  }

  var constantDefinition = this.viewer.params.constantDefinition;
  if (constantDefinition !== undefined && constantDefinition != null && !/^\s*$/.test(constantDefinition)) {
    sketch['constants'] = constantDefinition;
  }
  return sketch;
};

function nonPointChildren(obj){
  const children = [];
  obj.accept((o) => {
    if (o._class !== Types.END_POINT) {
      children.push(o);
    }
    return true;
  });
  return children;
}

IO.prototype.parseConstr = function (c, index) {
  var name = c[0];
  var ps = c[1];
  function find(id) {
    var p = index[id];
    if (!p) {
      throw "Constraint " + name + " refers to nonexistent object.";
    }
    return p;
  }
  var constrCreate = Constraints.Factory[name];
  if (constrCreate === undefined) {
    throw "Constraint " + name + " doesn't exist.";
  }
  return constrCreate(find, ps);
};

IO.prototype.serializeConstr = function (c) {
  return c.serialize();
};

function _format(str, args) {
  if (args.length == 0) return str;
  var i = 0;
  return str.replace(/\$/g, function() {
    if (args === undefined || args[i] === undefined) throw "format arguments mismatch";
    var val =  args[i];
    if (typeof val === 'number') val = val.toPrecision();
    i ++;
    return val;
  });
}

/** @constructor */
function PrettyColors() {
  var colors = ["#000000", "#00008B", "#006400", "#8B0000", "#FF8C00", "#E9967A"];
  var colIdx = 0;
  this.next = function () {
    return colors[colIdx++ % colors.length];
  }
}

/** @constructor */
function TextBuilder() {
  this.data = "";
  this.fline = function (chunk, args) {
    this.data += _format(chunk, args) + "\n"
  };
  this.line = function (chunk) {
    this.data += chunk + "\n"
  };
  this.number = function (n) {
    this.data += n.toPrecision()
  };
  this.numberln = function (n) {
    this.number(n)
    this.data += "\n"
  }
}

/** @constructor */
function BBox() {
  var bbox = [Number.MAX_VALUE, Number.MAX_VALUE, - Number.MAX_VALUE, - Number.MAX_VALUE];

  var T = Types;

  this.checkLayers = function(layers) {
    for (var l = 0; l < layers.length; ++l)
      for (var i = 0; i < layers[l].objects.length; ++i)
        this.check(layers[l].objects[i]);
  };

  this.check = function(obj) {
    if (obj._class === T.SEGMENT) {
      this.checkBounds(obj.a.x, obj.a.y);
      this.checkBounds(obj.b.x, obj.b.y);
    } else if (obj._class === T.END_POINT) {
      this.checkBounds(obj.x, obj.y);
    } else if (obj._class === T.ARC) {
      this.checkCircBounds(obj.c.x, obj.c.y, obj.r.get());
    } else if (obj._class === T.CIRCLE) {
      this.checkCircBounds(obj.c.x, obj.c.y, obj.r.get());
    } else if (obj._class === T.ELLIPSE || obj._class === T.ELL_ARC) {
      this.checkCircBounds(obj.centerX, obj.centerY, Math.max(obj.radiusX, obj.radiusY));
    } else if (obj) {
      obj.accept((o) => {
        if (o._class == T.END_POINT) {
          this.checkBounds(o.x, o.y);
        }
        return true;
      });
//    } else if (obj._class === T.DIM || obj._class === T.HDIM || obj._class === T.VDIM) {
    }
  };

  this.isValid = function() {
    return bbox[0] != Number.MAX_VALUE;
  };
  
  this.checkBounds = function(x, y) {
    bbox[0] = Math.min(bbox[0], x);
    bbox[1] = Math.min(bbox[1], y);
    bbox[2] = Math.max(bbox[2], x);
    bbox[3] = Math.max(bbox[3], y);
  };

  this.checkCircBounds = function(x, y, r) {
    this.checkBounds(x + r, y + r);
    this.checkBounds(x - r, y + r);
    this.checkBounds(x - r, y - r);
    this.checkBounds(x - r, y + r);
  };

  this.inc = function(by) {
    bbox[0] -= by;
    bbox[1] -= by;
    bbox[2] += by;
    bbox[3] += by;
  };
  
  this.width = function() {
    return bbox[2] - bbox[0];
  };

  this.height = function() {
    return bbox[3] - bbox[1];
  };

  this.bbox = bbox;
}

IO.prototype.getWorkspaceToExport = function() {
  return [this.viewer.layers];
};

IO.prototype.getLayersToExport = function() {
  var ws = this.getWorkspaceToExport();
  var toExport = [];
  for (var t = 0; t < ws.length; ++t) {
    var layers = ws[t];
    for (var l = 0; l < layers.length; ++l) {
      var layer = layers[l];
      toExport.push(layer)
    }
  }
  return toExport;
};

IO.prototype.svgExport = function () {

  var T = Types;
  var out = new TextBuilder();

  var bbox = new BBox();

  var a = new Vector();
  var b = new Vector();

  var prettyColors = new PrettyColors();
  var toExport = this.getLayersToExport();
  for (var l = 0; l < toExport.length; ++l) {
    var layer = toExport[l];
    var color = prettyColors.next();
    out.fline('<g id="$" fill="$" stroke="$" stroke-width="$">', [layer.name, "none", color, '2']);
    for (var i = 0; i < layer.objects.length; ++i) {
      var obj = layer.objects[i];
      if (obj._class !== T.END_POINT) bbox.check(obj);
      if (obj._class === T.SEGMENT) {
        out.fline('<line x1="$" y1="$" x2="$" y2="$" />', [obj.a.x, obj.a.y, obj.b.x, obj.b.y]);
      } else if (obj._class === T.ARC) {
        a.set(obj.a.x - obj.c.x, obj.a.y - obj.c.y, 0);
        b.set(obj.b.x - obj.c.x, obj.b.y - obj.c.y, 0);
        var dir = a.cross(b).z > 0 ? 0 : 1;
        var r = obj.r.get();
        out.fline('<path d="M $ $ A $ $ 0 $ $ $ $" />', [obj.a.x, obj.a.y, r, r, dir, 1, obj.b.x, obj.b.y]);
      } else if (obj._class === T.CIRCLE) {
        out.fline('<circle cx="$" cy="$" r="$" />', [obj.c.x, obj.c.y, obj.r.get()]);
//      } else if (obj._class === T.DIM || obj._class === T.HDIM || obj._class === T.VDIM) {
      }
    }
    out.line('</g>');
  }
  bbox.inc(20);
  return _format("<svg viewBox='$ $ $ $'>\n", bbox.bbox) + out.data + "</svg>"
};

IO.prototype.dxfExport = function () {
  var T = Types;
  var out = new TextBuilder();
  var bbox = new BBox();
  var toExport = this.getLayersToExport();
  var i;
  bbox.checkLayers(toExport);
  out.line("999");
  out.line("js.parametric.sketcher");
  out.line("0");
  out.line("SECTION");
  out.line("2");
  out.line("HEADER");
  out.line("9");
  out.line("$ACADVER");
  out.line("1");
  out.line("AC1006");
  out.line("9");
  out.line("$INSBASE");
  out.line("10");
  out.line("0");
  out.line("20");
  out.line("0");
  out.line("30");
  out.line("0");
  out.line("9");
  out.line("$EXTMIN");
  out.line("10");
  out.numberln(bbox.bbox[0]);
  out.line("20");
  out.numberln(bbox.bbox[1]);
  out.line("9");
  out.line("$EXTMAX");
  out.line("10");
  out.numberln(bbox.bbox[2]);
  out.line("20");
  out.numberln(bbox.bbox[3]);
  out.line("0");
  out.line("ENDSEC");

  out.line("0");
  out.line("SECTION");
  out.line("2");
  out.line("TABLES");

  for (i = 0; i < toExport.length; i++) {
    out.line("0");
    out.line("LAYER");
    out.line("2");
    out.line("" + (i + 1));
    out.line("70");
    out.line("64");
    out.line("62");
    out.line("7");
    out.line("6");
    out.line("CONTINUOUS");
  }
  out.line("0");
  out.line("ENDTAB");
  out.line("0");
  out.line("ENDSEC");
  out.line("0");
  out.line("SECTION");
  out.line("2");
  out.line("BLOCKS");
  out.line("0");
  out.line("ENDSEC");
  out.line("0");
  out.line("SECTION");
  out.line("2");
  out.line("ENTITIES");

  for (var l = 0; l < toExport.length; l++) {
    var lid = l + 1;
    var layer = toExport[l];
    for (i = 0; i < layer.objects.length; ++i) {
      var obj = layer.objects[i];
      if (obj._class === T.END_POINT) {
        out.line("0");
        out.line("POINT");
        out.line("8");
        out.line(lid);
        out.line("10");
        out.numberln(obj.x);
        out.line("20");
        out.numberln(obj.y);
        out.line("30");
        out.line("0");
      } else if (obj._class === T.SEGMENT) {
        out.line("0");
        out.line("LINE");
        out.line("8");
        out.line(lid);
        //out.line("62"); color
        //out.line("4");
        out.line("10");
        out.numberln(obj.a.x);
        out.line("20");
        out.numberln(obj.a.y);
        out.line("30");
        out.line("0");
        out.line("11");
        out.numberln(obj.b.x);
        out.line("21");
        out.numberln(obj.b.y);
        out.line("31");
        out.line("0");
      } else if (obj._class === T.ARC) {
        out.line("0");
        out.line("ARC");
        out.line("8");
        out.line(lid);
        out.line("10");
        out.numberln(obj.c.x);
        out.line("20");
        out.numberln(obj.c.y);
        out.line("30");
        out.line("0");
        out.line("40");
        out.numberln(obj.r.get());
        out.line("50");
        out.numberln(obj.getStartAngle() * (180 / Math.PI));
        out.line("51");
        out.numberln(obj.getEndAngle() * (180 / Math.PI));
      } else if (obj._class === T.CIRCLE) {
        out.line("0");
        out.line("CIRCLE");
        out.line("8");
        out.line(lid);
        out.line("10");
        out.numberln(obj.c.x);
        out.line("20");
        out.numberln(obj.c.y);
        out.line("30");
        out.line("0");
        out.line("40");
        out.numberln(obj.r.get());
//      } else if (obj._class === T.DIM || obj._class === T.HDIM || obj._class === T.VDIM) {
      }
    }
  }

  out.line("0");
  out.line("ENDSEC");
  out.line("0");
  out.line("EOF");
  return out.data;
};

IO.exportTextData = function(data, fileName) {
  var link = document.getElementById("downloader");
  link.href = "data:application/octet-stream;charset=utf-8;base64," + btoa(data);
  link.download = fileName;
  link.click();
  //console.log(app.viewer.io.svgExport());
};

export {IO, BBox, Types};