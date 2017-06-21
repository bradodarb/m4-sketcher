import { Generator } from '../../util/id-generator'

export class Ref {
  public id: number;
  public value: any;
  public obj: any;

  constructor(value: any) {
    this.id = Generator.genID();
    this.value = value;
  }

  public get() {
    return this.value;
  }
  public set(value) {
    this.value = value;
  }
}
