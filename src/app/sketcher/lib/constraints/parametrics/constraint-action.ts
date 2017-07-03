import { Constraint } from '../';
export class ConstraintAction {
  public action: string;
  public constraint: Constraint;

  constructor(action, constraint) {
    this.action = action;
    this.constraint = constraint;
  }
}
