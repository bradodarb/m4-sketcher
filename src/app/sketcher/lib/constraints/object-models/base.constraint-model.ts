import { Param } from '../../constraints/parametrics/parameter';

export class Constraint {
  protected _name: string;
  protected _uiName: string;
  protected _reducible: boolean;
  protected _aux: boolean;

  public get NAME(): string {
    return this._name;
  }
  public get UI_NAME(): string {
    return this._uiName;
  }
  public get reducible(): boolean {
    return this._reducible;
  }
  public get aux(): boolean {
    return this._aux;
  }


  constructor(name, uiName, reducible = false) {
    this._name = name;
    this._uiName = uiName;
    this._reducible = reducible;
  }

  public getSolveData(resolver = null)
  { return []; }
}

export interface SolveData extends Array<string | Array<any>> {
  0: string; 1: Array<any>
}
