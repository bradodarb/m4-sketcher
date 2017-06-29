import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ParametricManager } from '../../lib/parametrics';
import { Subject } from 'rxjs/Rx';
@Component({
  selector: 'm4-sketcher-constraint-list',
  templateUrl: './constraint-list.component.html',
  styleUrls: ['./constraint-list.component.css']
})
export class ConstraintListComponent implements OnInit {
  @Input()
  parametricManager: ParametricManager;

  @Output() peekConstraint = new EventEmitter();
  @Output() selectConstraint = new EventEmitter();
  @Output() deSelectConstraint = new EventEmitter();
  @Output() removeConstraint = new EventEmitter();

  public constraints = [];

  constructor() { }

  ngOnInit() {
    console.log(this.parametricManager);
    this.parametricManager.constraintStream.subscribe(item => {
      switch (item.action) {
        case 'add':
          if (this.constraints.indexOf(item.constraint) < 0) {

            this.constraints.push(item.constraint);

          }
          break;

        case 'remove':
          const index = this.constraints.indexOf(item.constraint)
          if (index > -1) {

            this.constraints.splice(index, 1);

          }
          break;
      }
    });
  }

  peek(item) {
    this.peekConstraint.emit(item);
  }
  select(item) {
    this.selectConstraint.emit(item);
  }
  leave() {
    this.deSelectConstraint.emit();
  }
  remove(item) {
    this.removeConstraint.emit(item);
    console.log('remove', item);
  }
}
