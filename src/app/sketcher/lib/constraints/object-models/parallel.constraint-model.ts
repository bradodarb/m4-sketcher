import { Constraint } from './base.constraint-model';
import { Segment } from '../../geometry/render-models';


export class Parallel extends Constraint {
  public l1: Segment;
  public l2: Segment;


  constructor(l1, l2) {
    super('parallel', 'Parallel');
    this.l1 = l1;
    this.l2 = l2;
  }

  public getSolveData() {
    var params = [];
    this.l1.collectParams(params);
    this.l2.collectParams(params);
    return [[this.NAME, params, []]];
  }
  public serialize() {
    return [this.NAME, [this.l1.id, this.l2.id]];
  }

  public getObjects() {
    return [this.l1, this.l2];
  }

}
