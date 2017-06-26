import { ConstraintResolver } from './base.constraint-solver-model'


export class Weighted extends ConstraintResolver {
  public grad: Array<number>;
  public constr: ConstraintResolver;
  public weight;

  constructor(constr: ConstraintResolver, weight) {
    super(constr.params);
    this.weight = weight;
    this.constr = constr;
  }

  public error(): number {
    return this.constr.error() * this.weight;
  }

  public gradient(out: Array<number>): void {
    this.constr.gradient(out);
    for (var i = 0; i < out.length; i++) {
      out[i] *= this.weight;
    }
  }

}
