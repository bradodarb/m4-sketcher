import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPortComponent } from './components/view-port/view-port.component';
import { WindowRef } from './services/window.service';

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
    ViewPortComponent
  ]
})
export class SketcherModule { }
