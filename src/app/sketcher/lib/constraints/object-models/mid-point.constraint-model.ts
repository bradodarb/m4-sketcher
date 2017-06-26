import { Constraint } from './base.constraint-model';
import { EndPoint, Segment } from '../../geometry/render-models';
import { Ref } from '../reference'
import * as math from '../../math/math'

export class PointInMiddle extends Constraint {

  public point: EndPoint;
  public line: Segment;
  public length: Ref;

  constructor(point, line) {
    super('PointInMiddle', 'Point In the Middle');
    this.point = point;
    this.line = line;
    this.length = new Ref(math.distanceAB(line.a, line.b) / 2);
  }
  public getSolveData(resolver) {
    var params1 = [];
    var params2 = [];

    this.line.a.collectParams(params1);
    this.point.collectParams(params1);
    params1.push(this.length);

    this.line.b.collectParams(params2);
    this.point.collectParams(params2);
    params2.push(this.length);

    return [
      ['P2PDistanceV', params1, []],
      ['P2PDistanceV', params2, []]
    ];
  }

  serialize() {
    return [this.NAME, [this.point.id, this.line.id]];
  }

  getObjects = function () {
    return [this.point, this.line];
  }

}
