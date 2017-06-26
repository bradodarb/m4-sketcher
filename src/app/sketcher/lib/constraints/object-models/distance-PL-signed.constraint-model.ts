import { Constraint } from './base.constraint-model';
import { EndPoint } from '../../geometry/render-models';
import { ParentsCollector } from '../utils'

export class P2LDistanceSigned extends Constraint {

  public p;
  public a;
  public b;
  public d;

  static SettableFields = { 'd': "Enter the distance" };


  constructor(p, a, b, d) {
    super('P2LDistanceSigned', 'Distance P & L');
    this.p = p;
    this.a = a;
    this.b = b;
    this.d = d;
  }
  public getSolveData(resolver) {
    var params = [];
    this.p.collectParams(params);
    this.a.collectParams(params);
    this.b.collectParams(params);
    return [[this.NAME, params, [resolver(this.d)]]];
  }

  serialize() {
    return [this.NAME, [this.p.id, this.a.id, this.b.id, this.d]];
  }

  getObjects = function () {
    const collector = new ParentsCollector();
    collector.check(this.a);
    collector.check(this.b);
    collector.parents.push(this.p);
    return collector.parents;
  }

}
