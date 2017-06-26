import { Constraint } from './base.constraint-model';
import { EndPoint } from '../../geometry/render-models';
export class P2PDistanceV extends Constraint {

  public p1: EndPoint;
  public p2: EndPoint;
  public d;


  constructor(p1, p2, d) {
    super('P2PDistanceV', 'Distance Points');
    this.p1 = p1;
    this.p2 = p2;
    this.d = d;
    this._aux = true;
  }
  public getSolveData(resolver) {
    var params = [];
    this.p1.collectParams(params);
    this.p2.collectParams(params);
    params.push(this.d);
    return [[this.NAME, params]];
  }

  serialize() {
    return [this.NAME, [this.p1.id, this.p2.id, this.d]];
  }

  getObjects = function () {
    return [this.p1, this.p2];
  }

}
