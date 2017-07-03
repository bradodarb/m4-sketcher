import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRectangleComponent } from './edit-rectangle.component';

describe('EditRectangleComponent', () => {
  let component: EditRectangleComponent;
  let fixture: ComponentFixture<EditRectangleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRectangleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRectangleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
