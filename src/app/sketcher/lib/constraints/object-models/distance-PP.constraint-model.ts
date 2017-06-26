import { Constraint } from './base.constraint-model';
import { EndPoint } from '../../geometry/render-models';

export class P2PDistance extends Constraint {

  public p1: EndPoint;
  public p2: EndPoint;
  public d;

  static SettableFields = { 'd': "Enter the distance" };


  constructor(p1, p2, d) {
    super('P2PDistance', 'Distance Points');
    this.p1 = p1;
    this.p2 = p2;
    this.d = d;
  }
  public getSolveData(resolver) {
    var params = [];
    this.p1.collectParams(params);
    this.p2.collectParams(params);
    return [[this.NAME, params, [resolver(this.d)]]];
  }

  serialize() {
    return [this.NAME, [this.p1.id, this.p2.id, this.d]];
  }

  getObjects = function () {
    return [this.p1, this.p2];
  }

}
