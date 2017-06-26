import { Constraint } from './base.constraint-model';
import { EndPoint, Segment } from '../../geometry/render-models';

export class P2LDistance extends Constraint {

  public p: EndPoint;
  public l: Segment;
  public d;

  static SettableFields = { 'd': "Enter the distance" };


  constructor(p, l, d) {
    super('P2LDistance', 'Distance P & L');
    this.p = p;
    this.l = l;
    this.d = d;
  }
  public getSolveData(resolver) {
    var params = [];
    this.p.collectParams(params);
    this.l.collectParams(params);
    return [[this.NAME, params, [resolver(this.d)]]];
  }

  serialize() {
    return [this.NAME, [this.p.id, this.l.id, this.d]];
  }

  getObjects = function () {
    return [this.p, this.l];
  }

}
