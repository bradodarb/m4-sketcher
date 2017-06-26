import { Constraint } from './base.constraint-model';
import { Circle, Arc } from '../../geometry/render-models';

export class RadiusOffset extends Constraint {

  public arc1: Arc;
  public arc2: Arc;
  public offset;

  static SettableFields = { 'offset': "Enter the offset" };

  constructor(arc1, arc2, offset) {
    super('RadiusOffset', 'Radius Offset');
    this.arc1 = arc1;
    this.arc2 = arc2;
    this.offset = offset;
  }

  public getSolveData(resolver) {
    return [
      ['Diff', [this.arc1.radius, this.arc2.radius], [resolver(this.offset)]]
    ];
  }
  public serialize() {
    return [this.NAME, [this.arc1.id, this.arc2.id, this.offset]];
  }

  public getObjects() {
    return [this.arc1, this.arc2];
  }
}

