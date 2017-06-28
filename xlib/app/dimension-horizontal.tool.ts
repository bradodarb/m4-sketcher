import Vector from '../math/vector';
import { EndPoint, HorizontalDimension } from '../geometry/render-models';
import { Tool } from './tool';
import { DimensionTool } from './dimension.tool';



export class HorizontalDimensionTool extends DimensionTool {
    constructor(viewer, layer) {
        super('horizontal dimension', viewer, layer, (a, b) => new HorizontalDimension(a, b));
    }
}
