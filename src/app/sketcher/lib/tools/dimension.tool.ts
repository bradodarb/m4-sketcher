import Vector from '../math/vector';
import { EndPoint } from '../geometry/render-models';
import { Tool } from './tool';
import { Viewport2d } from '../viewport';

export class DimensionTool extends Tool {

    public layer;
    public dim;
    public _v: Vector;
    public dimCreation;

    constructor(name, viewer: Viewport2d, layer, dimCreation) {
        super(name, viewer);
        this.layer = layer;
        this.dim = null;
        this._v = new Vector(0, 0, 0);
        this.dimCreation = dimCreation;
    }

    public mousemove(e) {
        var p = this.viewer.screenToModel(e);
        this.viewer.snap(p.x, p.y, []);
        if (this.dim != null) {
            this.dim.b.x = p.x;
            this.dim.b.y = p.y;
        }
        this.viewer.refresh();
    }

    public mouseup(e) {

        if (e.button > 0 && this.dim != null) {
            this.dim.flip = !this.dim.flip;
            this.viewer.refresh();
            return;
        }

        if (this.viewer.snapped == null) {
            return;
        }

        const p = this.viewer.snapped;
        this.viewer.cleanSnap();

        if (this.dim == null) {
            //this.viewer.historyManager.checkpoint();
            this.dim = this.dimCreation(p, new EndPoint(p.x, p.y));
            this.layer.add(this.dim);
            this.viewer.refresh();
        } else {
            this.dim.b = p;
            this.viewer.toolManager.releaseControl();
            this.viewer.refresh();
        }
    }
}
