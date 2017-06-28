import { EndPoint, Arc } from '../geometry/render-models';
import { Tool } from './tool'
import Vector from '../math/vector'
import * as math from '../math/math';
import { Viewport2d } from '../viewport';

export class ArcTool extends Tool {

  public arc: Arc;
  public point: EndPoint;
  public _v: Vector;

  constructor(viewer: Viewport2d) {
    super('arc', viewer);
    this.arc = null;
    this.point = null;
    this._v = new Vector(0, 0, 0);
  }

  restart() {
    this.sendHint('specify center');
  }

  mousemove(e) {
    var p = this.viewer.screenToModel(e);
    if (this.point != null) {
      this.point.x = p.x;
      this.point.y = p.y;

      if (this.point.id === this.arc.b.id) {
        //force placement second point on the arc
        const r = this.radiusOfFirstPoint();
        const v = this._v;
        v.set(this.arc.b.x - this.arc.center.x, this.arc.b.y - this.arc.center.y, 0);
        v._normalize()._multiply(r);
        this.arc.b.x = v.x + this.arc.center.x;
        this.arc.b.y = v.y + this.arc.center.y;
      } else {
        this.demoSecondPoint();
      }

      this.viewer.snap(p.x, p.y, [this.arc.a, this.arc.b, this.arc.center]);
      this.viewer.refresh();
    } else {
      this.viewer.snap(p.x, p.y, []);
      this.viewer.refresh();
    }
  }

  mouseup(e) {
    if (this.arc == null) {
      const center = this.viewer.screenToModel(e);
      this.createArcStep(center);
    } else if (this.point.id === this.arc.a.id) {
      this.snapIfNeed(this.arc.a);
      this.startingPointSetStep();
    } else {
      this.snapIfNeed(this.arc.b);
      this.finishStep();
    }
  }

  createArcStep(p) {
    //  this.viewer.historyManager.checkpoint();
    this.arc = new Arc(
      new EndPoint(p.x, p.y),
      new EndPoint(p.x, p.y),
      new EndPoint(p.x, p.y)
    );
    this.point = this.arc.a;
    this.viewer.activeLayer.add(this.arc);
    this.snapIfNeed(this.arc.center);
    this.pointPicked(p.x, p.y);
    this.sendHint('specify arc starting point');
    this.viewer.refresh();
  }

  startingPointSetStep() {
    this.point = this.arc.b;
    this.pointPicked(this.arc.a.x, this.arc.a.y);
    this.sendHint('specify angle')
  }

  finishStep() {
    this.arc.stabilize(this.viewer);
    this.pointPicked(this.arc.b.x, this.arc.b.y);
    this.viewer.refresh();
    this.viewer.toolManager.releaseControl();
  }

  demoSecondPoint() {
    const r = this.radiusOfFirstPoint();
    let ang = Math.atan2(this.arc.a.y - this.arc.center.y, this.arc.a.x - this.arc.center.x) + (2 * Math.PI - 0.3);
    ang %= 2 * Math.PI;
    this.arc.b.x = this.arc.center.x + r * Math.cos(ang);
    this.arc.b.y = this.arc.center.y + r * Math.sin(ang);
  }

  radiusOfFirstPoint() {
    return math.distance(this.arc.a.x, this.arc.a.y, this.arc.center.x, this.arc.center.y);
  }

  processCommand(command) {
    if (this.arc == null) {
      const result = Tool.parseVector(this.viewer.referencePoint, command);
      if (typeof result === 'string') return result;
      this.viewer.cleanSnap();
      this.createArcStep(result);
    } else if (this.point.id === this.arc.a.id) {
      const result = Tool.parseVector(this.viewer.referencePoint, command);
      if (typeof result === 'string') return result;
      this.arc.a.x = result.x;
      this.arc.a.y = result.y;
      this.startingPointSetStep();
      this.demoSecondPoint();
      this.viewer.refresh();
    } else {
      const startingAngle = Math.atan2(this.point.y - this.arc.center.y, this.point.x - this.arc.center.x);
      const result = Tool.parseNumberWithRef(command, startingAngle); // treated as radius and angle
      const r = this.radiusOfFirstPoint();
      if (typeof result === 'string') return result;
      let angle = result / 180 * Math.PI;
      angle %= 2 * Math.PI;
      this.arc.b.x = this.arc.center.x + r * Math.cos(angle);
      this.arc.b.y = this.arc.center.y + r * Math.sin(angle);
      this.finishStep();
    }
  }
}
