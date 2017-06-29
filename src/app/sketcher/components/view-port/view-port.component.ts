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
import { Observable } from 'rxjs/Rx';

import { WindowRef } from '../../services/window.service';
import { Viewport2d } from '../../lib/viewport';
import {
  PointTool, ArcTool, CircleTool, DiameterDimensionTool,
  RectangleTool, BezierCurveTool, FilletTool
} from '../../lib/tools';
import { askNumber } from '../../lib/util';

@Component({
  selector: 'm4-sketcher-view-port',
  templateUrl: './view-port.component.html',
  styleUrls: ['./view-port.component.css']
})
export class ViewPortComponent implements OnInit {
  @Input() fillStyle: string = '#808080';
  @Input() drawButtonClass: string;
  @Input() precision: number = 3;

  @ViewChild('canvas') canvasElement: ElementRef;

  public viewport: Viewport2d;

  constructor(private windowRef: WindowRef) { }

  ngOnInit() {
    this.viewport = new Viewport2d(this.canvasElement.nativeElement, this.windowRef.nativeWindow);
  }

  ngAfterViewInit() {

    const viewport = this.viewport;
    this.windowRef.resizeStream.debounceTime(1500)
      .subscribe((event) => {
        viewport.updateCanvasSize();
        viewport.refresh();
      });
  }

  addPoint() {
    this.viewport.toolManager.takeControl(new PointTool(this.viewport));
  }

  addArc() {
    this.viewport.toolManager.takeControl(new ArcTool(this.viewport));
  }

  addCircle() {
    this.viewport.toolManager.takeControl(new CircleTool(this.viewport));
  }
  addFillet() {
    this.viewport.toolManager.takeControl(new FilletTool(this.viewport));
  }
  addRectangle() {
    this.viewport.toolManager.takeControl(new RectangleTool(this.viewport));
  }
  addBezier() {
    this.viewport.toolManager.takeControl(new BezierCurveTool(this.viewport));
  }
  addDiameterDimension() {
    this.viewport.toolManager.takeControl(new DiameterDimensionTool(this.viewport, this.viewport.dimLayer));
  }


  onPeek(item) {
    this.viewport.select(item.getObjects(), true);
    this.viewport.refresh();
  }

  onSelect(item) {
    var c = item;
    if (c.SettableFields === undefined) return;
    for (var f in c.SettableFields) {
      var value = c[f];
      var intro = c.SettableFields[f];


      value = askNumber(intro, typeof (value) == "number" ? value.toFixed(4) : value, prompt, this.viewport.parametricManager.constantResolver);
      if (value != null) {
        c[f] = value;
      }
    }
    this.viewport.parametricManager.refresh();
  }

  onDeSelect() {
    this.viewport.deselectAll();
    this.viewport.refresh();
  }
}





/*
  var pm = app.viewer.parametricManager;
  var constrList = new ui.List('constrs', {
    items : function() {
      var theItems = [];
      for (var j = 0; j < pm.subSystems.length; j++) {
        var sub = pm.subSystems[j];
        for (var i = 0; i < sub.constraints.length; ++i) {
          var constr = sub.constraints[i];
          if (constr.aux !== true && app.constraintFilter[constr.NAME] != true) {
            theItems.push({name : constr.UI_NAME + infoStr(constr), constr : constr});
          }
        }
      }
      theItems.sort(function (a, b) {
        if (a.constr.NAME == 'coi') {
          return b.constr.NAME == 'coi' ? 0 : 1;
        }
        return a.constr.NAME.localeCompare(b.constr.NAME)
      });
      return theItems;
    },

    remove : function(item) {
      pm.remove(item.constr);
    },

    mouseleave : function(item) {
      app.viewer.deselectAll();
      app.viewer.refresh();
    },

    hover : function(item) {
      app.viewer.select(item.constr.getObjects(), true);
      app.viewer.refresh();
    },

    click : function(item) {
      var c = item.constr;
      if (c.SettableFields === undefined) return;
      for (var f in c.SettableFields) {
        var value = c[f];
        var intro = c.SettableFields[f];


        value = askNumber(intro, typeof(value) == "number" ? value.toFixed(4) : value, prompt, pm.constantResolver);
        if (value != null) {
          c[f] = value;
        }
      }
      app.viewer.parametricManager.refresh();
    }
  });

*/
