import { Param } from '../solver';

export class ConstraintResolver {

  public params;
  constructor(params: Array<Param>) {
    this.params = params;
  }

  public error(): number {
    return 0;
  }

  public gradient(out: Array<number>): void {

  }

}
