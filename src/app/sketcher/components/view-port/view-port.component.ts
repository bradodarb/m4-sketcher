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
import { Layer, LayerStyle } from '../../lib/layers';
import DefaultStyles from '../../config/defaultStyles';

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



  constructor(private windowRef: WindowRef) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    // this.canvas = this.canvasElement.nativeElement;
    // this.context = this.canvas.getContext("2d");

    // this.windowRef.resizeStream.debounceTime(1500)
    //   .subscribe((event) => {
    //     this.updateCanvasSize();
    //     this.refresh();
    //   });
  }


}
