import { Constraint } from './base.constraint-model';
import { PointInMiddle } from './mid-point.constraint-model';
import { PointOnLine } from './point-on-line.constraint-model';
import { EndPoint, Segment } from '../../geometry/render-models';
import { Ref } from '../reference'
import * as math from '../../math/math'

export class Symmetry extends Constraint {

  public point: EndPoint;
  public line: Segment;
  public length: Ref;

  constructor(point, line) {
    super('Symmetry', 'Symmetry');
    this.point = point;
    this.line = line;
    this.length = new Ref(math.distanceAB(line.a, line.b) / 2);
  }
  public getSolveData(resolver) {
    var pointInMiddleData = new PointInMiddle(this.point, this.line).getSolveData([resolver]);
    var pointOnLineData = new PointOnLine(this.point, this.line).getSolveData([resolver]);
    return pointInMiddleData.concat(pointOnLineData);
  }

  serialize() {
    return [this.NAME, [this.point.id, this.line.id]];
  }

  getObjects = function () {
    return [this.point, this.line];
  }

}
