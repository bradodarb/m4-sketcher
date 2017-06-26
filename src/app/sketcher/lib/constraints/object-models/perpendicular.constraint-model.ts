
import { Constraint } from './base.constraint-model';
import { Segment } from '../../geometry/render-models';


export class Perpendicular extends Constraint {
  public l1: Segment;
  public l2: Segment;


  constructor(l1, l2) {
    super('perpendicular', 'Perpendicular');
    this.l1 = l1;
    this.l2 = l2;
  }


  getSolveData() {
    var params = [];
    this.l1.collectParams(params);
    this.l2.collectParams(params);
    return [[this.NAME, params, []]];
  }

  serialize() {
    return [this.NAME, [this.l1.id, this.l2.id]];
  };
  getObjects() {
    return [this.l1, this.l2];
  }

}
