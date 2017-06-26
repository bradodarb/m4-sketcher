import { Constraint } from './object-models/base.constraint-model';
export class SubSystem {
  public alg: number = 1;
  public error: number = 0;
  public reduce: boolean = false;
  public constraints: Array<Constraint> = new Array<Constraint>();
}
