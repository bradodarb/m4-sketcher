import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstraintListComponent } from './constraint-list.component';

describe('ConstraintListComponent', () => {
  let component: ConstraintListComponent;
  let fixture: ComponentFixture<ConstraintListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConstraintListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstraintListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
