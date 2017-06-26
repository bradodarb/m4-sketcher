import { Constraint } from './base.constraint-model';
import { EndPoint } from '../../geometry/render-models'

export class GreaterThan extends Constraint {
  public p;
  public limit;
  constructor(p, limit) {
    super('GreaterThan', 'Greater Than');
    this.p = p;
    this.limit = limit;
    this._aux = true;
  }
  public getSolveData() {
    return [[this.NAME, [this.p], [this.limit]]];
  }

}
