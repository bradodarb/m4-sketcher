import { Constraint } from './base.constraint-model';
import { EndPoint, Segment } from '../../geometry/render-models';
import { ParentsCollector } from '../utils'

export class P2LDistanceV extends Constraint {

  public p;
  public l;
  public d;

  static SettableFields = { 'd': "Enter the distance" };


  constructor(p, l, d) {
    super('P2LDistanceV', 'Distance P & L');
    this.p = p;
    this.l = l;
    this.d = d;
    this._aux = true;
  }
  public getSolveData(resolver) {
    var params = [];
    this.p.collectParams(params);
    this.l.collectParams(params);
    params.push(this.d);
    return [[this.NAME, params]];
  }

}
