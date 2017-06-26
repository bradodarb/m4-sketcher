import { Constraint } from './base.constraint-model';
import { EndPoint, Arc } from '../../geometry/render-models';

export class PointOnArc extends Constraint {

  public point: EndPoint;
  public arc: Arc;

  constructor(point, arc) {
    super('PointOnArc', 'Point On Arc');
    this.point = point;
    this.arc = arc;
  }
  public getSolveData(resolver) {
    var params = [];
    this.point.collectParams(params);
    this.arc.c.collectParams(params);
    params.push(this.arc.radius);
    return [['P2PDistanceV', params, []]];
  }

  serialize() {
    return [this.NAME, [this.point.id, this.arc.id]];
  }

  getObjects = function () {
    return [this.point, this.arc];
  }

}
