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
            .filter(function(o) {
                return o._class === 'TCAD.TWO.Circle' || o._class === 'TCAD.TWO.Arc';
            });

        if (objects.length != 0) {
            this.dim.obj = objects[0];
        } else {
            this.dim.obj = null;
        }
        if (this.dim.obj != null) {
            this.dim.angle = Math.atan2(p.y - this.dim.obj.c.y, p.x - this.dim.obj.c.x);
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

