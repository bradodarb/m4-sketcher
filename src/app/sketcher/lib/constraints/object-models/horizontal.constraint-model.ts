import { Constraint } from './base.constraint-model';
import { Segment } from '../../geometry/render-models';

export class Horizontal extends Constraint {

  public line: Segment;

  constructor(line) {
    super('Horizontal', 'Horizontal', true);
    this.line = line;
  }
  public getSolveData(resolver) {
    return [['equal', [this.line.a._y, this.line.b._y], []]];
  }

  serialize() {
    return [this.NAME, [this.line.id]];
  }

  getObjects = function () {
    return [this.line];
  }

}
