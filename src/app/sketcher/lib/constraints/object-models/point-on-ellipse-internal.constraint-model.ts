import { Constraint } from './base.constraint-model';
import { EndPoint, Ellipse } from '../../geometry/render-models';

export class PointOnEllipseInternal extends Constraint {

  public point: EndPoint;
  public ellipse: Ellipse;

  constructor(point, ellipse) {
    super('PointOnEllipseI', 'Point On Ellipse');
    this.point = point;
    this.ellipse = ellipse;
  }
  public getSolveData(resolver) {
    var params = [];
    this.point.collectParams(params);
    this.ellipse.ep1.collectParams(params);
    this.ellipse.ep2.collectParams(params);
    params.push(this.ellipse.radius);
    return [['PointOnEllipse', params, []]];
  }

  serialize() {
    return [this.NAME, [this.point.id, this.ellipse.id]];
  }

  getObjects = function () {
    return [this.point, this.ellipse];
  }

}
