import { EndPoint, Segment } from '../geometry/render-models';
import { Viewport2d } from '../viewport';
import { Tool } from './tool'

export class MultiSegmentTool extends Tool {

  public line: Segment

  constructor(viewer) {
    super('multi line', viewer);
    this.line = null;
  }

  restart() {
    this.line = null;
    this.sendHint('specify the first point')
  }

  cleanup() {
    this.viewer.cleanSnap();
    this.line = null;
  }

  mousemove(e) {
    var p = this.viewer.screenToModel(e);
    if (this.line != null) {
      this.viewer.snap(p.x, p.y, [this.line.a, this.line.b]);
      this.line.b.x = p.x;
      this.line.b.y = p.y;
      this.viewer.refresh();
    } else {
      this.viewer.snap(p.x, p.y, []);
      this.viewer.refresh();
    }
  }

  mouseup(e) {
    if (this.line == null) {
      const b = this.viewer.screenToModel(e);
      let a = b;
      var needSnap = false;
      if (this.viewer.snapped != null) {
        a = this.viewer.snapped;
        this.viewer.cleanSnap();
        needSnap = true;
      }
      this.line = this.viewer.addSegment(a.x, a.y, b.x, b.y, this.viewer.activeLayer);
      if (needSnap) {
        this.viewer.parametricManager.linkObjects([this.line.a, a]);
      }
      this.firstPointPicked();
      this.viewer.refresh();
    } else {
      if (this.viewer.snapped != null) {
        var p = this.viewer.snapped;
        this.viewer.cleanSnap();
        this.line.b.x = p.x;
        this.line.b.y = p.y;
        this.viewer.parametricManager.linkObjects([this.line.b, p]);
      }
      this.nextPointPicked();
    }
  }

  nextPointPicked() {
    this.pointPicked(this.line.b.x, this.line.b.y);
    const b = this.line.b;
    this.line = this.viewer.addSegment(b.x, b.y, b.x, b.y, this.viewer.activeLayer);
    this.viewer.parametricManager.linkObjects([this.line.a, b]);
    this.sendHint('specify next point');
    this.viewer.refresh();
  }

  firstPointPicked() {
    this.pointPicked(this.line.a.x, this.line.a.y);
    this.sendHint('specify next point');
  }

  dblclick(e) {
    this.cancelSegment();
  }

  keydown(e) {
    if (e.keyCode == 27) {
      this.cancelSegment();
    }
  }

  cancelSegment() {
    if (this.line != null) {
      this.viewer.remove(this.line);
      this.viewer.refresh();
      this.cleanup();
    }
  }

  processCommand(command) {
    const result = Tool.parseVector(this.viewer.referencePoint, command);
    if (typeof result === 'string') {
      return result;
    }
    const p = result;
    if (this.line == null) {
      this.line = this.viewer.addSegment(p.x, p.y, p.x, p.y, this.viewer.activeLayer);
      this.firstPointPicked();
    } else {
      this.line.b.x = p.x;
      this.line.b.y = p.y;
      this.nextPointPicked();
    }
    this.viewer.refresh();
  }

}
