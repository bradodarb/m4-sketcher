import { ConstraintResolver } from './base.constraint-solver-model'


export class EqualsTo extends ConstraintResolver {

  public value: number;
  constructor(params, value) {
    super(params);
    this.value = value;
  }

  public error(): number {
    return this.params[0].get() - this.value;
  }

  public gradient(out: Array<number>): void {
    out[0] = 1;
  }

}
