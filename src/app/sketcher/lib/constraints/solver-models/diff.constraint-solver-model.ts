import { ConstraintResolver } from './base.constraint-solver-model'


export class Diff extends ConstraintResolver {

  public value: number;
  constructor(params, value) {
    super(params);
    this.value = value;

  }

  public error(): number {
    return this.params[0].get() - this.params[1].get() - this.value;
  }

  public gradient(out: Array<number>): void {
    this.gradient = function (out) {
      out[0] = 1;
      out[1] = -1;
    };
  }

}
