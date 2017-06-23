import { Constraint } from './base.constraint';
import { EndPoint } from '../geometry/render-models';

export class MinLength extends Constraint {

  public a: EndPoint;
  public b: EndPoint;
  public min;
  constructor(a, b, min) {
    super('MinLength', 'MinLength');
    this.a = a;
    this.b = b;
    this.min = min;
    this._aux = true;
  }

  public getSolveData() {
    var params = [];
    this.a.collectParams(params);
    this.b.collectParams(params);
    return [[this.NAME, params, [this.min]]];
  }

}
