import { Constraint } from './base.constraint-model';
import { Segment, Arc } from '../../geometry/render-models';

export class Tangent extends Constraint {

  public line: Segment;
  public arc: Arc;

  constructor(arc, line) {
    super('Tangent', 'Tangent');
    this.arc = arc;
    this.line = line;
  }
  public getSolveData(resolver) {
    var params = [];
    this.arc.c.collectParams(params);
    this.line.collectParams(params);
    params.push(this.arc.radius);
    return [['P2LDistanceV', params, []]];
  }

  serialize() {
    return [this.NAME, [this.arc.id, this.line.id]];
  }

  getObjects = function () {
    return [this.arc, this.line];
  }

}
