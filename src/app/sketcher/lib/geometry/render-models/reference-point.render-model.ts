import { Shape } from './shape.render-model';
import { Viewport2d } from '../../viewport';

export class ReferencePoint extends Shape {
  public x: number = 0;
  public y: number = 0;
  constructor() {
    super('M4CAD.TWO.ReferencePoint');
  }

  draw(viewport: Viewport2d) {
    if (!this.visible) return;
    viewport.context.strokeStyle = 'salmon';
    viewport.context.fillStyle = 'salmon';
    viewport.context.lineWidth = 1 / viewport.scale;

    viewport.context.beginPath();
    viewport.context.arc(this.x, this.y, 1 / viewport.scale, 0, 2 * Math.PI, false);
    viewport.context.fill();

    viewport.context.beginPath();
    viewport.context.arc(this.x, this.y, 7 / viewport.scale, 0, 2 * Math.PI, false);
    viewport.context.stroke();
  }
}

