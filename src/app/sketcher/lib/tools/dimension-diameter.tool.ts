import Vector from '../math/vector';
import { EndPoint, DiameterDimension } from '../geometry/render-models';
import { Tool } from './tool';


export class DiameterDimensionTool extends Tool {

    public layer;
    public dim;

    constructor(viewer, layer) {
        super('diameter dimension', viewer);
        this.layer = layer;
        this.dim = new DiameterDimension(null);
        this.viewer.add(this.dim, this.layer);
    }

    mousemove(e) {
        var p = this.viewer.screenToModel(e);
        var objects = this.viewer.search(p.x, p.y, 20 / this.viewer.scale, true, false, [])
            .filter(function (o) {
                return o.className === 'M4CAD.TWO.Circle' || o.className === 'M4CAD.TWO.Arc' || o.className === 'M4CAD.TWO.DiameterDimension';
            });

        if (objects.length != 0) {
            const target = objects[0];
            if (target.className === 'M4CAD.TWO.DiameterDimension') {
                this.dim = target;
            } else {
                this.dim.obj = target;
            }
        } else {
            this.dim.obj = null;
        }

        if (this.dim.obj != null) {
            this.dim.angle = Math.atan2(p.y - this.dim.obj.center.y, p.x - this.dim.obj.center.x);
        }
        this.viewer.refresh();
    }

    mouseup(e) {
        if (this.dim.obj !== null) {
            //  this.viewer.historyManager.checkpoint();
        } else {
            this.viewer.remove(this.dim);
        }
        this.viewer.toolManager.releaseControl();
    }
}

