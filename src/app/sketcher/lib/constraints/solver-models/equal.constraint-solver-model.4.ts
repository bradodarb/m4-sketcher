import { ConstraintResolver } from './base.constraint-solver-model'


export class Equal extends ConstraintResolver {

  constructor(params) {
    super(params);

  }

  public error(): number {
    return this.params[0].get() - this.params[1].get();
  }

  public gradient(out: Array<number>): void {
    out[0] = 1;
    out[1] = -1;
  }

}
