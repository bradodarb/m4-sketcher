import { Constraint } from './base.constraint-model';
import { Arc } from '../../geometry/render-models';

export class Radius extends Constraint {

  public arc: Arc;
  public d;

  static SettableFields = { 'd': "Enter the radius value" };


  constructor(arc, d) {
    super('Radius', 'Radius Value');
    this.arc = arc;
    this.d = d;
  }
  public getSolveData(resolver) {
    return [['equalsTo', [this.arc.radius], [resolver(this.d)]]];
  }

  serialize() {
    return [this.NAME, [this.arc.id, this.d]];
  }

  getObjects = function () {
    return [this.arc];
  }

}
