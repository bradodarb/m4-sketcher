import Vector from '../math/vector';
import { EndPoint, LinearDimension } from '../geometry/render-models';
import { Tool } from './tool';
import { DimensionTool } from './dimension.tool';



export class LinearDimensionTool extends DimensionTool {
    constructor(viewer, layer) {
        super('linear dimension', viewer, layer, (a, b) => new LinearDimension(a, b));
    }
}
