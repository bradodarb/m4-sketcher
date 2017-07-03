import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SketchEditorComponent } from './sketch-editor.component';

describe('SketchEditorComponent', () => {
  let component: SketchEditorComponent;
  let fixture: ComponentFixture<SketchEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SketchEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SketchEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
