import Vector from './vector'

export default class BBox {

  public minX = Number.MAX_VALUE;
  public minY = Number.MAX_VALUE;
  public minZ = Number.MAX_VALUE;
  public maxX = -Number.MAX_VALUE;
  public maxY = -Number.MAX_VALUE;
  public maxZ = -Number.MAX_VALUE;

  constructor() {
  }

  public checkBounds(x, y, z) {
    z = z || 0;
    this.minX = Math.min(this.minX, x);
    this.minY = Math.min(this.minY, y);
    this.minZ = Math.min(this.minZ, z);
    this.maxX = Math.max(this.maxX, x);
    this.maxY = Math.max(this.maxY, y);
    this.maxZ = Math.max(this.maxZ, z);
  }

  public checkPoint(p) {
    this.checkBounds(p.x, p.y, p.z);
  }

  public center() {
    return new Vector(this.minX + (this.maxX - this.minX) / 2,
      this.minY + (this.maxY - this.minY) / 2,
      this.minZ + (this.maxZ - this.minZ) / 2)
  }

  public min() {
    return new Vector(this.minX, this.minY, this.minZ)
  }

  public max() {
    return new Vector(this.maxX, this.maxY, this.maxZ)
  }

  public width() {
    return this.maxX - this.minX;
  }

  public height() {
    return this.maxY - this.minY;
  }

  public depth() {
    return this.maxZ - this.minZ;
  }

  public expand(delta) {
    this.minX -= delta;
    this.minY -= delta;
    this.minZ -= delta;
    this.maxX += delta;
    this.maxY += delta;
    this.maxZ += delta;
  }

  public toPolygon() {
    return [
      new Vector(this.minX, this.minY, 0),
      new Vector(this.maxX, this.minY, 0),
      new Vector(this.maxX, this.maxY, 0),
      new Vector(this.minX, this.maxY, 0)
    ];
  }
}
