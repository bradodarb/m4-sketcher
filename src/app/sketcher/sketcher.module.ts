import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPortComponent } from './components/view-port/view-port.component';
import { WindowRef } from './services/window.service';
import { ConstraintListComponent } from './components/constraint-list/constraint-list.component';

@NgModule({
  providers: [
    WindowRef
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ViewPortComponent,
  ],
  declarations: [
    ViewPortComponent,
    ConstraintListComponent
  ]
})
export class SketcherModule { }
