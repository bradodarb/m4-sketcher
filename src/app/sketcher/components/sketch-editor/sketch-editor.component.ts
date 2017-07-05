import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnInit, ComponentFactory } from '@angular/core';
import { ViewPortComponent } from '../view-port/view-port.component';
import { EditRectangleComponent } from '../shape-editor-components/edit-rectangle/edit-rectangle.component';
import { ComponentMap, ContainerItemDirective } from 'component-containers';

@Component({
  selector: 'm4-sketcher-sketch-editor',
  templateUrl: './sketch-editor.component.html',
  styleUrls: ['./sketch-editor.component.css']
})
export class SketchEditorComponent implements OnInit {

  @ViewChild('parent', { read: ViewContainerRef })
  parent: ViewContainerRef;

  public current: any;
  public map: ComponentMap;

  constructor() {
    this.map =
      new ComponentMap([{
        model: Viewer,
        component: ViewPortComponent
      }, {
        model: Rectangle,
        component: EditRectangleComponent
      }])
  }

  ngOnInit() {

    this.current = new Viewer();
    const _self = this;
    console.log(this.current);
    setTimeout(() => {
      _self.current = new Rectangle();
      console.log(_self.current);
    }, 2000);
  }

}
class Base {
  myProp = 1;
}
class Rectangle extends Base {
  title = 'Rectangle View Model';
}
class Viewer {
}
