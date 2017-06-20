import { Generator } from '../util/id-generator';

export class Param {
  public id: number = Generator.genID();
  public obj;
  public prop;

  constructor(obj, prop) {
    this.id = Generator.genID();
    this.obj = obj;
    this.prop = prop;
  }

  set(value) {
    this.obj[this.prop] = value;
  }

  get() {
    return this.obj[this.prop];
  }
}
