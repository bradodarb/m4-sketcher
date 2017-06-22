import { EndPoint } from '../geometry/render-models'
import { Viewport2d } from '../viewport';

export class Tool {

  public name: string;
  public viewer: Viewport2d;


  constructor(name: string, viewer: Viewport2d) {
    this.name = name;
    this.viewer = viewer;
  }

  restart() { };

  cleanup(e?) { };

  mousemove(e) { };

  mousedown(e) { };

  mouseup(e) { };

  mousewheel(e) { };

  dblclick(e) { };

  keydown(e) { };

  keypress(e) { };

  keyup(e) { };

  sendMessage(text) {
    this.viewer.notify('tool-message', text);
  };

  sendHint(hint) {
    this.viewer.notify('tool-hint', hint);
  };

  sendSpecifyPointHint() {
    this.sendHint('specify point');
  };

  pointPicked(x, y) {
    this.sendMessage('picked: ' + this.viewer.roundToPrecision(x) + " : " + this.viewer.roundToPrecision(y));
    this.viewer.referencePoint.x = x;
    this.viewer.referencePoint.y = y;
  };

  snapIfNeed(p) {
    if (this.viewer.snapped != null) {
      const snapWith = this.viewer.snapped;
      this.viewer.cleanSnap();
      p.setFromPoint(snapWith);
      this.viewer.parametricManager.linkObjects([p, snapWith]);
      this.viewer.parametricManager.refresh();
    }
  }

  endpoint(e) {
    const ep = new EndPoint(0, 0);
    if (this.viewer.snapped != null) {
      this.snapIfNeed(ep);
    } else {
      ep.setFromPoint(this.viewer.screenToModel(e))
    }
    return ep;
  }

  static dumbMode(e) {
    return e.ctrlKey || e.metaKey;
  }

  static parseNumber = function (str) {
    let val;
    try {
      val = eval(str);
    } catch (e) {
      return e.toString();
    }
    let valNumber = parseFloat(val);
    if (isNaN(valNumber)) return "wrong input for number: " + str;
    return valNumber;
  }
  static parseNumberWithRef = function (str, ref = null) {
    const rel = str.startsWith('@');
    if (rel) {
      str = str.substring(1);
    }
    let val = Tool.parseNumber(str);
    if (typeof val === 'string') return val;
    if (rel && ref) {
      val += ref;
    }
    return val;
  }


  static VECTOR_PATTERN = /^(@)?(.+)(,|<)(.+)$/;

  static parseVector = function (referencePoint, command): any {
    command = command.replace(/\s+/g, '');

    const match = command.match(Tool.VECTOR_PATTERN);
    if (match) {
      const ref = match[1] !== undefined;
      let x = Tool.parseNumber(match[2]);
      if (typeof x === 'string') return x;
      const polar = match[3] == '<';
      let y = Tool.parseNumber(match[4]);
      if (typeof y === 'string') return y;
      if (polar) {
        const angle = y / 180 * Math.PI;
        const radius = x;
        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
      }
      if (ref) {
        x += referencePoint.x;
        y += referencePoint.y;
      }
      return { x, y };
    }

    return "wrong input, point is expected: x,y | @x,y | r<polar | @r<polar ";
  }


  static parseNumberSequence = function (command, refs, length): any {
    command = command.replace(/\s+/g, '');
    const parts = command.split(',');
    const result = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      let val = refs && refs[i] ? Tool.parseNumberWithRef(part, refs[i]) : Tool.parseNumberWithRef(part);
      result.push(val);
    }
    if (length !== undefined && result.length != length) {
      return "wrong input, sequence of length " + length + " is expected: x1,x2...";
    }
    return result;
  }

}

