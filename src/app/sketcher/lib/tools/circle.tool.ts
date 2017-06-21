import { Tool } from './tool';
import * as math from '../math/math';
import { EndPoint, Circle } from '../geometry/render-models';
import { Viewport2d } from '../viewport';

export class CircleTool extends Tool {

  public circle: Circle;
  public solver: any;

  constructor(viewer: Viewport2d) {
    super('circle', viewer);
    this.circle = null;
  }

  restart() {
    this.sendMessage('specify center');
  }

  cleanup(e) {
    this.viewer.cleanSnap();
  }

  mousemove(e) {
    var p = this.viewer.screenToModel(e);
    if (this.circle != null) {
      var r = math.distance(p.x, p.y, this.circle.center.x, this.circle.center.y);
      this.circle.radius.set(r);
      if (!Tool.dumbMode(e)) {
        this.solveRequest(true);
      }
    } else {
      this.viewer.snap(p.x, p.y, []);
    }
    this.viewer.refresh();
  }

  solveRequest(rough) {
    this.solver = this.viewer.parametricManager.prepare([this.circle.radius]);
    this.solver.solve(rough, 1);
    this.solver.sync();
  }

  mouseup(e) {
    if (this.circle == null) {
      this.stepCreateCircle(this.viewer.screenToModel(e), true);
    } else {
      this.stepFinish();
    }
  }

  stepCreateCircle(center, tryToSnap) {
    // this.viewer.historyManager.checkpoint();
    const needSnap = tryToSnap && this.viewer.snapped != null;
    const p = needSnap ? this.viewer.snapped : center;
    this.circle = new Circle(
      new EndPoint(p.x, p.y)
    );

    if (needSnap) this.viewer.parametricManager.linkObjects([this.circle.center, p]);
    this.pointPicked(this.circle.center.x, this.circle.center.y);
    this.sendHint('specify radius');
    this.viewer.activeLayer.add(this.circle);
    this.viewer.refresh();
  }

  stepFinish() {
    this.solveRequest(false);
    this.sendMessage("radius: " + this.viewer.roundToPrecision(this.circle.radius.get()));
    this.viewer.refresh();
    this.viewer.toolManager.releaseControl();
  }

  processCommand(command) {
    if (this.circle == null) {
      const result = Tool.parseVector(this.viewer.referencePoint, command);
      if (typeof result === 'string') return result;
      this.stepCreateCircle(result, false)
    } else {
      const result = Tool.parseNumber(command);
      if (typeof result === 'string') return result;
      this.circle.radius.set(result);
      this.stepFinish();
    }
  }
}
