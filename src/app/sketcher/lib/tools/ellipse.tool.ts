import { Tool } from './tool';
import { EndPoint, Ellipse } from '../geometry/render-models';
import Vector from '../math/vector';
import { Viewport2d } from '../viewport';

export const STATE_POINT1 = 0;
export const STATE_POINT2 = 1;
export const STATE_RADIUS = 2;

//TODO, split this into the two tools it is (Ellipse and Eliptical Arc)
export class EllipseTool extends Tool {

  public ellipse: Ellipse
  public state: number;
  public solver: any;

  constructor(viewer: Viewport2d) {
    super('ellipse', viewer);
    this.ellipse = null;
    this.state = STATE_POINT1;
  }

  restart() {
    this.ellipse = null;
    this.state = STATE_POINT1;
    this.sendHint('specify first major axis point')
  }

  cleanup(e) {
    this.viewer.cleanSnap();
  }

  point(e) {
    return this.viewer.snapped ? this.viewer.snapped : this.viewer.screenToModel(e);
  }

  newEllipse(p) {
    const ep = () => new EndPoint(p.x, p.y);
    return new Ellipse(ep(), ep());
  }

  mouseup(e) {
    switch (this.state) {
      case STATE_POINT1: {
        const p = this.point(e);
        this.ellipse = this.newEllipse(p);
        this.snapIfNeed(this.ellipse.ep1);
        this.viewer.activeLayer.add(this.ellipse);
        this.viewer.refresh();
        this.state = STATE_POINT2;
        this.sendHint('specify second major axis point');
        break;
      }
      case STATE_POINT2: {
        const p = this.point(e);
        this.ellipse.ep2.setFromPoint(p);
        this.snapIfNeed(this.ellipse.ep2);
        this.viewer.refresh();
        this.state = STATE_RADIUS;
        this.sendHint('specify minor axis radius');
        break;
      }
      case STATE_RADIUS:

        this.viewer.toolManager.releaseControl();
    }
  }

  mousemove(e) {
    const p = this.viewer.screenToModel(e);
    switch (this.state) {
      case STATE_POINT1:
        this.viewer.snap(p.x, p.y, []);
        break;
      case STATE_POINT2:
        this.ellipse.ep2.setFromPoint(this.viewer.screenToModel(e));
        this.ellipse.radius.value = this.ellipse.radiusX * 0.5;
        this.viewer.snap(p.x, p.y, this.ellipse.children);

        break;
      case STATE_RADIUS:
        const polarPoint = this.ellipse.toEllipseCoordinateSystem(p);
        let minorRadius = Ellipse.findMinorRadius(this.ellipse.radiusX, polarPoint.radius, polarPoint.angle);
        if (isNaN(minorRadius)) {
          const projAxis = new Vector(-(this.ellipse.ep2.y - this.ellipse.ep1.y), this.ellipse.ep2.x - this.ellipse.ep1.x);
          projAxis._normalize();
          const v = new Vector(this.ellipse.ep2.x - p.x, this.ellipse.ep2.y - p.y);
          minorRadius = Math.abs(projAxis.dot(v));
        }
        this.ellipse.radius.set(minorRadius);
        if (!Tool.dumbMode(e)) {
          this.solveRequest(true);
        }

        break;
    }
    this.viewer.refresh();
  }

  solveRequest(rough) {
    this.solver = this.viewer.parametricManager.prepare([this.ellipse.radius]);
    this.solver.solve(rough, 1);
    this.solver.sync();
  }
}
