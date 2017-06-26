import { Constraint } from './base.constraint-model';
import { PointOnEllipseInternal } from './point-on-ellipse-internal.constraint-model';
import { EndPoint, Ellipse } from '../../geometry/render-models';

export class PointOnEllipse extends PointOnEllipseInternal {


  constructor(point, ellipse) {
    super(point, ellipse);
    this._name = 'PointOnEllipse';
  }

}
