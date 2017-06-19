import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnChanges
} from '@angular/core';

import { WindowRef } from '../../services/window.service';
import Layer from '../../models/Layer';
import LayerStyle from '../../models/LayerStyle';
import DefaultStyles from '../../config/defaultStyles';
import Pipelines from '../../lib/renderPipeline';
import RenderPipeline from '../../lib/renderPipeline/RenderPipeline';

@Component({
  selector: 'm4-sketcher-view-port',
  templateUrl: './view-port.component.html',
  styleUrls: ['./view-port.component.css']
})
export class ViewPortComponent implements OnInit {
  @Input() fillStyle: string = '#808080';
  @Input() drawButtonClass: string;

  @ViewChild('canvas') canvasElement: ElementRef;

  private window = this.windowRef.nativeWindow;

  public retinaPxielRatio: number = 1;
  public canvas: any;
  public context: CanvasRenderingContext2D;
  public style: any;
  public prevStyle: LayerStyle;

  public translate: any = { x: 0.0, y: 0.0 };
  public scale: number = 1.0;

  private activeLayer = null;
  public pipelines: Array<RenderPipeline> = new Array<RenderPipeline>()
  public layers: Array<Layer> = new Array<Layer>();

  public workSpace: Array<Layer> = new Array<Layer>();
  public serviceSpace: Array<Layer> = new Array<Layer>();

  public dimLayer = new Layer("_dim", DefaultStyles.DIM);
  public dimLayers = [this.dimLayer];

  public selected = [];
  public snapped = null;

  constructor(private windowRef: WindowRef) { }

  ngOnInit() {

    this.retinaPxielRatio = this.window.devicePixelRatio > 1 ? this.window.devicePixelRatio : 1;


    this.pipelines.push(Pipelines.SketchPipeline);
    this.pipelines.push(Pipelines.SimplePipeline);


  }
  ngAfterViewInit() {
    this.canvas = this.canvasElement.nativeElement;
    this.context = this.canvas.getContext("2d");
  }


  private updateCanvasSize(): void {
    var canvasWidth = this.canvas.parentNode.offsetWidth;
    var canvasHeight = this.canvas.parentNode.offsetHeight;

    this.canvas.width = canvasWidth * this.retinaPxielRatio;
    this.canvas.height = canvasHeight * this.retinaPxielRatio;

    this.canvas.style.width = canvasWidth + "px";
    this.canvas.style.height = canvasHeight + "px";
  }

  onWindowResize(): void {
    this.updateCanvasSize();
    this.refresh();
  }

  public refresh(): void {
    const _self = this;
    this.window.requestAnimationFrame(function () {
      _self.repaint();
    });
  }
  repaint(): void {

    this.context.setTransform(1, 0, 0, 1, 0, 0);

    this.context.fillStyle = this.fillStyle;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    //Order is important!
    this.context.transform(1, 0, 0, -1, 0, this.canvas.height);
    this.context.transform(1, 0, 0, 1, this.translate.x, this.translate.y);
    this.context.transform(this.scale, 0, 0, this.scale, 0, 0);

    this.prevStyle = null;

    this.drawWorkspace(this.workSpace, Pipelines.SketchPipeline);
    this.drawWorkspace(this.serviceSpace, Pipelines.SimplePipeline);
  }

  private drawWorkspace(workspace, pipeline) {
    for (let drawPredicate of pipeline) {
      for (let layers of workspace) {
        for (let layer of layers) {
          for (let obj of layer.objects) {
            obj.accept((obj) => {
              if (!obj.visible) return true;
              if (drawPredicate(obj)) {
                this.draw(layer, obj);
              }
              return true;
            });
          }
        }
      }
    }
  }

  private draw(layer, obj): void {
    const style = this.getStyleForObject(layer, obj);
    if (style !== this.prevStyle) {
      this.setStyle(style);
    }
    this.prevStyle = style;
    obj.draw(this.context, this.scale / this.retinaPxielRatio, this);
  }
  private getStyleForObject(layer, obj) {
    if (obj.style != null) {
      return obj.style;
    } else if (obj.role != null) {
      const style = layer.stylesByRoles[obj.role];
      if (style) {
        return style;
      }
    }
    return layer.style;
  };
  private setStyle(style: LayerStyle): void {
    this.context.lineWidth = style.lineWidth / this.scale;
    this.context.strokeStyle = style.strokeColor;
    this.context.fillStyle = style.strokeColor;
  }
}
