import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnInit, ComponentFactory } from '@angular/core';
import { ViewPortComponent } from '../view-port/view-port.component';
import { ComponentInjectorService } from '../../../shared/services/component-injector.service';
@Component({
  selector: 'm4-sketcher-sketch-editor',
  templateUrl: './sketch-editor.component.html',
  styleUrls: ['./sketch-editor.component.css'],
  providers: [ComponentInjectorService]
})
export class SketchEditorComponent implements OnInit {

  @ViewChild('parent', { read: ViewContainerRef })
  parent: ViewContainerRef;


  constructor(private componentInjectorService: ComponentInjectorService) {
  }

  ngOnInit() {
    this.componentInjectorService.injectInto(ViewPortComponent, this.parent);
  }

}
