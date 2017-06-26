import * as RX from 'rxjs';
import Canvas from './canvas';
import Vector from '../math/vector';
import { Layer, LayerStyle } from '../layers';
import { DefaultStyles } from '../config';
import { EndPoint, ReferencePoint, Segment, Datum, Point } from '../geometry/render-models';
import { ToolManager, PanTool } from '../tools'

import { RenderPipeline, SketchPipeline } from '../render-pipeline';

import { isEndPoint, DrawPoint } from '../geometry/utils';

import { ParametricManager } from '../parametrics';

export class Viewport2d {

  public host: Window;
  public canvas: Canvas;
  public context: CanvasRenderingContext2D;

  public bus = new RX.Subject();

  public parametricManager: ParametricManager;

  public fillStyle: string = '#808080';

  public style: any;
  public prevStyle: LayerStyle;

  public precision: number = 3;
  public retinaPxielRatio: number = 1;

  public translate: any = { x: 0.0, y: 0.0 };
  public scale: number = 1.0;

  public activeLayer: Layer;
  public layers: Array<Layer> = new Array<Layer>();
  public dimLayer = new Layer("_dim", DefaultStyles.DIM);
  public dimLayers = [this.dimLayer];

  public referencePoint = new ReferencePoint();
  public workSpace: Array<Array<Layer>> = new Array<Array<Layer>>();
  public serviceSpace: Array<Array<Layer>> = new Array<Array<Layer>>();


  public selected = [];
  public snapped = null;



  public toolManager: ToolManager;



  constructor(canvas, host) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
    this.host = host;
    this.retinaPxielRatio = this.host.devicePixelRatio > 1 ? this.host.devicePixelRatio : 1;
    this.parametricManager = new ParametricManager(this);
    this.serviceSpace = this.createServiceLayers();

    this.toolManager = new ToolManager(this, host, null);

    this.activeLayer = new Layer("default", DefaultStyles.DEFAULT);
    this.layers.push(this.activeLayer);
    this.workSpace = [this.layers, this.dimLayers];


    this.updateCanvasSize();
    this.refresh();
  }

  public notify(header, payload) {
    this.bus.next({
      header: header,
      payload: payload
    });
  }

  public roundToPrecision(value) {
    return value.toFixed(this.precision);
  }

  public updateCanvasSize(): void {
    var canvasWidth = this.canvas.parentNode.offsetWidth;
    var canvasHeight = this.canvas.parentNode.offsetHeight;

    this.canvas.width = canvasWidth * this.retinaPxielRatio;
    this.canvas.height = canvasHeight * this.retinaPxielRatio;

    this.canvas.style.width = canvasWidth + "px";
    this.canvas.style.height = canvasHeight + "px";
  }

  public refresh(): void {
    const _self = this;
    this.host.requestAnimationFrame(function () {
      _self.repaint();
    });
  }


  public repaint(): void {

    this.context.setTransform(1, 0, 0, 1, 0, 0);

    this.context.fillStyle = this.fillStyle;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    //Order is important!
    this.context.transform(1, 0, 0, -1, 0, this.canvas.height);
    this.context.transform(1, 0, 0, 1, this.translate.x, this.translate.y);
    this.context.transform(this.scale, 0, 0, this.scale, 0, 0);

    this.prevStyle = null;

    this.drawWorkspace(this.serviceSpace, new RenderPipeline());
    this.drawWorkspace(this.workSpace, SketchPipeline);
  }

  public drawWorkspace(workspace: Array<Array<Layer>>, pipeline: RenderPipeline) {
    for (let drawPredicate of pipeline.predicates) {
      for (let layers of workspace) {
        for (let layer of layers) {
          for (let obj of layer.objects) {
            obj.accept((obj) => {
              if (!obj.visible) return true;
              if (drawPredicate.validate(obj)) {
                this.draw(layer, obj);
              }
              return true;
            });
          }
        }
      }
    }
  }




  public add(obj, layer) {
    layer.add(obj);
  }

  public addSegment(x1, y1, x2, y2, layer) {
    var a = new EndPoint(x1, y1);
    var b = new EndPoint(x2, y2);
    var line = new Segment(a, b);
    layer.add(line);
    return line;
  }

  public remove(obj) {
    if (obj.layer != null) {
      if (obj.layer.remove(obj)) {
        this.parametricManager.removeConstraintsByObj(obj);
      }
    }
  }


  public draw(layer, obj): void {
    const style = layer.getStyleForObject(layer, obj);
    if (style !== this.prevStyle) {
      this.setStyle(style);
    }
    this.prevStyle = style;
    obj.draw(this);
  }





  public search(x, y, buffer, deep, onlyPoints, filter) {

    buffer *= 0.5;

    var pickResult = [];
    var aim = new Vector(x, y);

    var heroIdx = 0;
    var unreachable = buffer * 2;
    var heroLength = unreachable; // unreachable

    function isFiltered(o) {
      for (var i = 0; i < filter.length; ++i) {
        if (filter[i] === o) return true;
      }
      return false;
    }

    for (var i = 0; i < this.layers.length; i++) {
      var objs = this.layers[i].objects;
      for (var j = 0; j < objs.length; j++) {
        var l = unreachable + 1;
        var before = pickResult.length;
        objs[j].accept((o) => {
          if (!o.visible) return true;
          if (onlyPoints && !isEndPoint(o)) {
            return true;
          }
          l = o.normalDistance(aim, this.scale);
          if (l >= 0 && l <= buffer && !isFiltered(o)) {
            pickResult.push(o);
            return false;
          }
          return true;
        });
        var hit = before - pickResult.length != 0;
        if (hit) {
          if (!deep && pickResult.length != 0) return pickResult;
          if (l >= 0 && l < heroLength) {
            heroLength = l;
            heroIdx = pickResult.length - 1;
          }
        }
      }
    }
    if (pickResult.length > 0) {
      var _f = pickResult[0];
      pickResult[0] = pickResult[heroIdx];
      pickResult[heroIdx] = _f;
    }
    return pickResult;
  }



  public setStyle(style: LayerStyle): void {
    this.context.lineWidth = style.lineWidth / this.scale;
    this.context.strokeStyle = style.strokeStyle;
    this.context.fillStyle = style.fillStyle;
  }

  public snap(x, y, excl) {
    this.cleanSnap();
    var snapTo = this.search(x, y, 20 / this.scale, true, true, excl);
    if (snapTo.length > 0) {
      this.snapped = snapTo[0];
      this.mark(this.snapped, DefaultStyles.SNAP);
    }
    return this.snapped;
  }

  public cleanSnap = function () {
    if (this.snapped != null) {
      this.deselect(this.snapped);
      this.snapped = null;
    }
  }

  public showBounds = function (x1, y1, x2, y2, offset) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    if (this.canvas.width > this.canvas.height) {
      this.scale = this.canvas.height / dy;
    } else {
      this.scale = this.canvas.width / dx;
    }
    this.translate.x = -x1 * this.scale;
    this.translate.y = -y1 * this.scale;
  }

  public screenToModel2 = function (x, y, out) {

    out.x = x * this.retinaPxielRatio;
    out.y = this.canvas.height - y * this.retinaPxielRatio;

    out.x -= this.translate.x;
    out.y -= this.translate.y;

    out.x /= this.scale;
    out.y /= this.scale;
  }

  public screenToModel = function (e) {
    return this._screenToModel(e.offsetX, e.offsetY);
  }

  public _screenToModel = function (x, y) {
    var out = { x: 0, y: 0 };
    this.screenToModel2(x, y, out);
    return out;
  }

  public accept = function (visitor) {
    for (let layer of this.layers) {
      for (let object of layer.objects) {
        if (!object.accept(visitor)) {
          return false;
        }
      }
    }
  }

  public findLayerByName = function (name) {
    for (var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].name == name) {
        return this.layers[i];
      }
    }
    return null;
  }

  public findById = function (id) {
    var result = null;
    this.accept(function (o) {
      if (o.id === id) {
        result = o;
        return false;
      }
      return true;
    });
    return result;
  }

  public select = function (objs, exclusive) {
    if (exclusive) this.deselectAll();
    for (var i = 0; i < objs.length; i++) {
      this.mark(objs[i]);
    }
  }

  public deselect = function (obj) {
    for (var i = 0; i < this.selected.length; i++) {
      if (obj === this.selected[i]) {
        this.selected.splice(i, 1)[0].marked = null;
        break;
      }
    }
  }
  public deselectAll = function () {
    for (var i = 0; i < this.selected.length; i++) {
      this.selected[i].marked = null;
    }
    while (this.selected.length > 0) this.selected.pop();
  }


  public pick = function (e) {
    var m = this.screenToModel(e);
    return this.search(m.x, m.y, 20 / this.scale, true, false, []);
  }

  public mark = function (obj, style) {
    if (style === undefined) {
      style = DefaultStyles.MARK;
    }
    obj.marked = style;

    if (this.selected.indexOf(obj) == -1) {
      this.selected.push(obj);
    }
  }






  public getActiveLayer = function () {
    var layer = this.activeLayer;
    if (layer == null || layer.readOnly) {
      layer = null;
      for (var i = 0; i < this.layers.length; i++) {
        var l = this.layers[i];
        if (!l.readOnly) {
          layer = l;
          break;
        }
      }
    }
    if (layer == null) {
      layer = new Layer("default", DefaultStyles.DEFAULT);
      this.layers.push(layer);
    }
    return layer;
  }

  public setActiveLayer = function (layer) {
    if (!layer.readOnly) {
      this.activeLayer = layer;
      this.bus.notify("activeLayer");
    }
  }






  equalizeLinkedEndpoints = function () {
    const visited = new Set();
    console.log('Viewport.equalizeLinkedEndpoints called')
    function equalize(obj, link?) {
      if (visited.has(obj.id)) return;
      visited.add(obj.id);
      for (let link of obj.linked) {
        if (isEndPoint(link)) {
          equalize(obj, link);
          link.setFromPoint(obj);
          equalize(link);
        }
      }
    }
    this.accept((obj) => {
      if (isEndPoint(obj)) {
        equalize(obj);
      }
      return true;
    });
  }































  private createServiceLayers(): Array<Array<Layer>> {
    let layer = new Layer("_service", DefaultStyles.SERVICE);
    //  layer.objects.push(new CrossHair(0, 0, 20));
    layer.objects.push(new Point(0, 0, 2));
    //layer.objects.push(this.referencePoint);
    layer.objects.push(new Datum(null, this));
    return [[layer]];

  };
}
