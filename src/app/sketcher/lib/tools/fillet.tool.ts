import Vector from '../math/vector';
import { EndPoint, Arc } from '../geometry/render-models';
import { Tool } from './tool';
import { DefaultStyles } from '../config';
import { Coincident, Tangent, Radius } from '../constraints';
import * as fetch from '../constraints/fetchers';
import * as math from '../math/math';



export class FilletTool extends Tool {

  constructor(viewer) {
    super('fillet', viewer);
  }

  restart() {
    for (let master of this.viewer.selected) {
      if (master instanceof EndPoint) {
        for (let slave of master.linked) {
          if (slave instanceof EndPoint) {
            if (this.breakLinkAndMakeFillet(master, slave)) {
              this.viewer.toolManager.releaseControl();
            }
          }
        }
      }
    }
  }

  makeFillet(point1, point2) {
    function shrink(point1) {
      var a, b;
      if (point1.id === point1.parent.a.id) {
        a = point1.parent.b;
        b = point1.parent.a;
      } else {
        a = point1.parent.a;
        b = point1.parent.b;
      }
      var d = math.distanceAB(a, b);
      var k = 4 / 5;
      b.x = a.x + (b.x - a.x) * k;
      b.y = a.y + (b.y - a.y) * k;
      return new Vector(a.x - b.x, a.y - b.y, 0);
    }

    var v1 = shrink(point1);
    var v2 = shrink(point2);

    if (v1.cross(v2).z > 0) {
      var _ = point1;
      point1 = point2;
      point2 = _;
    }

    var vec = new Vector();
    vec.setV(point2);
    vec._minus(point1);
    vec._multiply(0.5);
    vec._plus(point1);

    var arc = new Arc(
      new EndPoint(point1.x, point1.y),
      new EndPoint(point2.x, point2.y),
      new EndPoint(vec.x, vec.y));
    point1.parent.layer.add(arc);
    var pm = this.viewer.parametricManager;
    arc.stabilize(this.viewer);
    pm._add(new Tangent(arc, point1.parent));
    pm._add(new Tangent(arc, point2.parent));
    pm._add(new Coincident(arc.a, point1));
    pm._add(new Coincident(arc.b, point2));
    pm._add(new Radius(arc, arc.radius.value))


    pm.refresh();
  }

  mouseup(e) {
    var candi = this.getCandidate(e);
    if (candi == null) return;
    const point1 = candi[0];
    const point2 = candi[1];
    this.breakLinkAndMakeFillet(point1, point2)
  }

  breakLinkAndMakeFillet(point1, point2) {
    const pm = this.viewer.parametricManager;
    const coi = pm.findCoincidentConstraint(point1, point2);
    if (coi != null) {
      pm.remove(coi);
      this.makeFillet(point1, point2);
      this.viewer.deselectAll();
      return true;
    }
    return false;
  }

  static isLine(line) {
    return line != null && line.className === 'M4CAD.TWO.Segment';
  }

  getCandidate(e) {
    var picked = this.viewer.pick(e);
    if (picked.length > 0) {
      var res = fetch.sketchObjects(picked, true, ['M4CAD.TWO.EndPoint']);
      if (res == null) return null;
      var point1 = res[0];
      if (!FilletTool.isLine(point1.parent)) return;
      var line2 = null;
      for (var i = 0; i < point1.linked.length; i++) {
        var point2 = point1.linked[i];
        if (FilletTool.isLine(point2.parent)) {
          return [point1, point2];
        }
      }
    }
    return null;
  }

  mousemove(e) {
    var needRefresh = false;
    if (this.viewer.selected.length != 0) {
      this.viewer.deselectAll();
      needRefresh = true;
    }
    var candi = this.getCandidate(e);
    if (candi != null) {
      this.viewer.mark(candi[0], DefaultStyles.SNAP);
      needRefresh = true;
    }
    if (needRefresh) {
      this.viewer.refresh();
    }
  }
}
