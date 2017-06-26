import { Constraint } from './base.constraint-model';
import { Segment } from '../../geometry/render-models';
import { ParentsCollector } from '../utils'
import { Ref } from '../reference'
import * as math from '../../math/math'

export class LineEquality extends Constraint {

  public line1: Segment;
  public line2: Segment;
  public length: Ref;

  constructor(line1, line2) {
    super('LL', 'Lines Equality');
    this.line1 = line1;
    this.line2 = line2;
    this.length = new Ref(math.distanceAB(line1.a, line1.b));
  }
  public getSolveData(resolver) {
    var params1 = [];
    var params2 = [];
    this.line1.collectParams(params1);
    this.line2.collectParams(params2);
    params1.push(this.length);
    params2.push(this.length);
    return [
      ['P2PDistanceV', params1, []],
      ['P2PDistanceV', params2, []]
    ];
  }

  serialize() {
    return [this.NAME, [this.line1.id, this.line2.id]];
  }

  getObjects = function () {
    return [this.line1, this.line2];
  }

}
