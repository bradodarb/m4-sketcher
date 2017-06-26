import { ConstraintResolver } from './base.constraint-solver-model'


import {
  fillArray
} from '../../util'

export class ConstantWrapper extends ConstraintResolver {

  public grad: Array<number>;
  public constr: ConstraintResolver;
  public mask;
  constructor(constr: ConstraintResolver, mask) {
    super([]);
    this.constr = constr;
    for (let j = 0; j < constr.params.length; j++) {
      if (!mask[j]) {
        this.params.push(constr.params[j]);
      }
      this.grad.push(0);
    }
  }

  public error(): number {
    return this.constr.error();
  }

  public gradient(out: Array<number>): void {
    fillArray(this.grad, 0, this.grad.length, 0);
    this.constr.gradient(this.grad);
    var jj = 0;
    for (let j = 0; j < this.mask.length; j++) {
      if (!this.mask[j]) {
        out[jj++] = this.grad[j];
      }
    }
  }

}
