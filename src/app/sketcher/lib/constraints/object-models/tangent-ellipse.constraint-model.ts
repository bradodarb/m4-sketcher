import { Constraint } from './base.constraint-model';
import { Segment, Ellipse } from '../../geometry/render-models';

export class EllipseTangent extends Constraint {

  public line: Segment;
  public ellipse: Ellipse;

  constructor(line, ellipse) {
    super('EllipseTangent', 'Tangent Ellipse');
    this.ellipse = ellipse;
    this.line = line;
  }
  public getSolveData(resolver) {
    const params = [];
    this.line.collectParams(params);
    this.ellipse.ep1.collectParams(params);
    this.ellipse.ep2.collectParams(params);
    params.push(this.ellipse.radius);
    return [['EllipseTangent', params, []]];
  }

  serialize() {
    return [this.NAME, [this.line.id, this.ellipse.id]];
  }

  getObjects = function () {
    return [this.line, this.ellipse];
  }

}
