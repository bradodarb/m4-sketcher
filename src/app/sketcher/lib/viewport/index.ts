import Canvas from './canvas';
import { Layer, LayerStyle } from '../layers';
import { DefaultStyles } from '../../config';

import { RenderPipeline, SketchPipeline } from '../render-pipeline';

import { isEndPoint } from '../util/geometryUtils';
import * as drawUtils from '../util/drawUtils';

export default class Viewport2d {

  public host: Window;
  public canvas: Canvas;
  public context: CanvasRenderingContext2D;

  public fillStyle: string = '#808080';



  public style: any;
  public prevStyle: LayerStyle;

  public precision: number = 3;
  public retinaPxielRatio: number = 1;

  public translate: any = { x: 0.0, y: 0.0 };
  public scale: number = 1.0;

  private activeLayer: Layer;
  public layers: Array<Layer> = new Array<Layer>();
  public dimLayer = new Layer("_dim", DefaultStyles.DIM);
  public dimLayers = [this.dimLayer];

  public workSpace: Array<Array<Layer>> = new Array<Array<Layer>>();
  public serviceSpace: Array<Array<Layer>> = new Array<Array<Layer>>();


  public selected = [];
  public snapped = null;

  constructor(canvas, host) {
    this.canvas = canvas;
    this.host = host;
    this.retinaPxielRatio = this.host.devicePixelRatio > 1 ? this.host.devicePixelRatio : 1;
  }

  public roundToPrecision(value) {
    return value.toFixed(this.precision);
  }

  private updateCanvasSize(): void {
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


  private repaint(): void {

    this.context.setTransform(1, 0, 0, 1, 0, 0);

    this.context.fillStyle = this.fillStyle;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    //Order is important!
    this.context.transform(1, 0, 0, -1, 0, this.canvas.height);
    this.context.transform(1, 0, 0, 1, this.translate.x, this.translate.y);
    this.context.transform(this.scale, 0, 0, this.scale, 0, 0);

    this.prevStyle = null;

    this.drawWorkspace(this.workSpace, SketchPipeline);
    this.drawWorkspace(this.serviceSpace, new RenderPipeline());
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
    obj.draw(this.context, this.scale / this.retinaPxielRatio, this);
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

  private createServiceLayers = function () {
    let layer = new Layer("_service", DefaultStyles.SERVICE);
    //  layer.objects.push(new CrossHair(0, 0, 20));
    layer.objects.push(new Point(0, 0, 2));
    layer.objects.push(this.referencePoint);
    layer.objects.push(new BasisOrigin(null, this));
    return [layer];

  };
}
