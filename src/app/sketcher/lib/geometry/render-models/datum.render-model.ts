import { Shape } from './shape.render-model';
import { Viewport2d } from '../../viewport';


export class Datum /*BasisOrigin*/ extends Shape {

  public viewer;
  public inverseX = false;
  public inverseY = false;
  public lineWidth = 100;
  public xColor = '#FF0000';
  public yColor = '#00FF00';
  public xScale = 1;
  public yScale = 1;
  public yShift = 0;
  public xShift = 0;

  constructor(basis, viewer) {
    super('M4CAD.TWO.Datum');
  }

  draw(viewer: Viewport2d) {
    viewer.context.save();
    if (this.inverseX) {
      this.xScale = -1;
      this.xShift = this.lineWidth + 10;
    } else {
      this.xScale = 1;
      this.xShift = 10;
    }
    if (this.inverseY) {
      this.yScale = -1;
      this.yShift = viewer.canvas.height - this.lineWidth - 10;
    } else {
      this.yScale = 1;
      this.yShift = viewer.canvas.height - 10;
    }

    viewer.context.setTransform(this.xScale, 0, 0, this.yScale, this.xShift, this.yShift);
    viewer.context.beginPath();

    viewer.context.lineWidth = 1;
    viewer.context.strokeStyle = this.yColor;

    var headA = 1;
    var headB = 10;

    viewer.context.moveTo(0.5, 0);
    viewer.context.lineTo(0.5, - this.lineWidth);

    viewer.context.moveTo(0, - this.lineWidth);
    viewer.context.lineTo(headA, 0 - this.lineWidth + headB);

    viewer.context.moveTo(0, - this.lineWidth);
    viewer.context.lineTo(- headA, - this.lineWidth + headB);
    viewer.context.closePath();
    viewer.context.stroke();

    viewer.context.beginPath();
    viewer.context.strokeStyle = this.xColor;
    viewer.context.moveTo(0, 0.5);
    viewer.context.lineTo(this.lineWidth, 0.5);

    viewer.context.moveTo(this.lineWidth, 0);
    viewer.context.lineTo(this.lineWidth - headB, headA);

    viewer.context.moveTo(this.lineWidth, 0);
    viewer.context.lineTo(this.lineWidth - headB, - headA);
    viewer.context.closePath();
    viewer.context.stroke();

    viewer.context.restore();
  }
}
