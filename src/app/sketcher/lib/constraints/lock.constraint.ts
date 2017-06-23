import { Constraint } from './base.constraint';
import { EndPoint } from '../geometry/render-models';

export class Lock extends Constraint {

  public p: EndPoint;
  public c: EndPoint;

  constructor(p, c) {
    super('lock', 'Lock');
    this.p = p;
    this.c = c;
  }

  public getSolveData() {
    return [
      ['equalsTo', [this.p._x], [this.c.x]],
      ['equalsTo', [this.p._y], [this.c.y]]
    ];
  }
  public serialize() {
    return [this.NAME, [this.p.id, this.c]];
  }
  public getObjects() {
    return [this.p];
  }
}

