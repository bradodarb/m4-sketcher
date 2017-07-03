import { DrawPoint } from '../utils'
import { Shape } from './shape.render-model';
import { Viewport2d } from '../../viewport';

export class Point extends Shape {

  public x: number = 0;
  public y: number = 0;
  public radius: number = 1;

  constructor(x, y, rad) {
    super('M4CAD.TWO.Point');
    this.x = x;
    this.y = y;
    this.radius = rad;
    this.style = null;
  }

  draw(viewport: Viewport2d) {
    DrawPoint(viewport.context, this.x, this.y, this.radius, viewport.scale);
  }
}
