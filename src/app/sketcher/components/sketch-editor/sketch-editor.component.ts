import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnInit, ComponentFactory } from '@angular/core';
import { ViewPortComponent } from '../view-port/view-port.component';
import { ComponentInjectorService } from '../../../shared/services/component-injector.service';
@Component({
  selector: 'm4-sketcher-svetch-editor',
  templateUrl: './sketch-editor.component.html',
  styleUrls: ['./sketch-editor.component.css']
})
export class SketchEditorComponent implements OnInit {

  @ViewChild('parent', { read: ViewContainerRef })
  parent: ViewContainerRef;

  injector = new ComponentInjectorService(ViewPortComponent, null);

  viewPort: ComponentFactory<ViewPortComponent>;
  constructor(private componentFactoryResolver: ComponentInjectorService) {
    this.viewPort = ComponentInjectorService.
  }

  ngOnInit() {
    let anotherChildComponentHolder = this.parent.createComponent(this.viewPort);

    setTimeout(() => anotherChildComponentHolder.destroy(), 500)
  }

}
