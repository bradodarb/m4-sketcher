import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPortComponent } from './components/view-port/view-port.component';
import { WindowRef } from './services/window.service';
import { ConstraintListComponent } from './components/constraint-list/constraint-list.component';
import { SketchEditorComponent } from './components/sketch-editor/sketch-editor.component';
import { EditRectangleComponent } from './components/shape-editor-components/edit-rectangle/edit-rectangle.component';

import { ComponentContainerModule } from 'component-containers';
@NgModule({
  providers: [
    WindowRef
  ],
  imports: [
    CommonModule,
    ComponentContainerModule
  ],
  exports: [
    SketchEditorComponent,
  ],
  declarations: [
    ViewPortComponent,
    ConstraintListComponent,
    SketchEditorComponent,
    EditRectangleComponent
  ],
  entryComponents: [
    ViewPortComponent,
    EditRectangleComponent
  ]
})
export class SketcherModule { }
