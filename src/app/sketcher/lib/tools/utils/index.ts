import { Circle, Ellipse, EllipticalArc } from '../../geometry/render-models'

import { Tool } from '../tool'
import { CircleTool } from '../circle.tool'
import { DragTool } from '../drag.tool'
import { EllipseTool, STATE_RADIUS } from '../ellipse.tool'

export function GetShapeEditTool(viewer, obj, alternative): Tool {
  if (obj instanceof Circle && !alternative) {
    const tool = new CircleTool(viewer);
    tool.circle = obj;
    return tool;
  } else if (obj instanceof Ellipse && !alternative) {
    // even for an ell-arc we should act as it would be an ellipse to
    // avoid stabilize constraints added and demoing B point on move
    // so second arg must be FALSE!
    const tool = new EllipseTool(viewer);
    tool.ellipse = obj;
    tool.state = STATE_RADIUS;
    return tool;
  } else {
    return new DragTool(viewer, obj);
  }
}
