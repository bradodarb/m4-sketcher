import { Constraint } from './base.constraint-model';
import { EndPoint, Segment } from '../../geometry/render-models';

export class PointOnLine extends Constraint {

  public point: EndPoint;
  public line: Segment;

  constructor(point, line) {
    super('PointOnLine', 'Point On Line');
    this.point = point;
    this.line = line;
  }
  public getSolveData(resolver) {
    var params = [];
    this.point.collectParams(params);
    this.line.collectParams(params);
    return [['P2LDistance', params, [0]]];
  }

  serialize() {
    return [this.NAME, [this.point.id, this.line.id]];
  }

  getObjects = function () {
    return [this.point, this.line];
  }

}
