import { Constraint } from './base.constraint-model';
import { EndPoint } from '../../geometry/render-models';

export class Coincident extends Constraint {
  public a: EndPoint;
  public b: EndPoint;

  constructor(a, b) {
    super('coi', 'Coincident', true);
    this.a = a;
    this.b = b;
    this.a.linked.push(b);
    this.b.linked.push(a);
  }

  public getSolveData() {
    return [
      ['equal', [this.a._x, this.b._x], []],
      ['equal', [this.a._y, this.b._y], []]
    ];
  }

  public serialize = function () {
    return [this.NAME, [this.a.id, this.b.id]];
  }
  public getObjects = function () {
    return [this.a, this.b];
  }
}
