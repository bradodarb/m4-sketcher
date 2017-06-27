import Vector from '../math/vector';
import { EndPoint, VerticalDimension } from '../geometry/render-models';
import { Tool } from './tool';
import { DimensionTool } from './dimension.tool';



export class VerticalDimensionTool extends DimensionTool {
    constructor(viewer, layer) {
        super('vertical dimension', viewer, layer, (a, b) => new VerticalDimension(a, b));
    }
}
