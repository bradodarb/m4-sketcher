import { vectorsEqual } from './math'

class Vector {

  public x: number = 0;
  public y: number = 0;
  public z: number = 0;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public set(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    return this;
  }

  public set3(data) {
    this.x = data[0];
    this.y = data[1];
    this.z = data[2];
    return this;
  }

  public setV(data) {
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
    return this;
  }

  public multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  public _multiply(scalar) {
    return this.set(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  public dot(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }

  public copy() {
    return new Vector(this.x, this.y, this.z);
  }

  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public lengthSquared() {
    return this.dot(this);
  }

  public distanceToSquared(a) {
    return this.minus(a).lengthSquared();
  }

  public minus(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
  }

  public _minus(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
    return this;
  }

  public _minusXYZ(x, y, z) {
    this.x -= x;
    this.y -= y;
    this.z -= z;
    return this;
  }

  public plusXYZ(x, y, z) {
    return new Vector(this.x + x, this.y + y, this.z + z);
  }

  public plus(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);
  }

  private _plus(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
    return this;
  }

  public normalize() {
    var mag = this.length();
    if (mag == 0.0) {
      return new Vector(0.0, 0.0, 0.0);
    }
    return new Vector(this.x / mag, this.y / mag, this.z / mag);
  }


  private _normalize() {
    var mag = this.length();
    if (mag == 0.0) {
      return this.set(0, 0, 0)
    }
    return this.set(this.x / mag, this.y / mag, this.z / mag)
  }

  public cross(a) {
    return new Vector(
      this.y * a.z - this.z * a.y,
      this.z * a.x - this.x * a.z,
      this.x * a.y - this.y * a.x
    )
  }

  public negate() {
    return this.multiply(-1);
  }

  private _negate() {
    return this._multiply(-1);
  }

  public equals(vector) {
    return vectorsEqual(this, vector);
  }

  public toArray() {
    return [this.x, this.y, this.z];
  }

  // public three = function() {
  //   return new THREE.Vector3(this.x, this.y, this.z);
  // };
}
export default Vector;
