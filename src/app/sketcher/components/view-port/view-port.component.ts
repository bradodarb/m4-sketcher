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
import { PointTool, ArcTool } from '../../lib/tools';

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

  reset() {
    this.viewport.toolManager.takeControl(new PointTool(this.viewport));
  }
}
