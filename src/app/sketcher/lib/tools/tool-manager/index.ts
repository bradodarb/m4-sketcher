
import { Viewport2d } from '../../viewport';
import { Tool } from './../tool';
import { PanTool } from './../pan.tool';

export class ToolManager {

  public defaultTool: Tool;
  public tool: Tool;
  public viewer: Viewport2d;
  public window: Window;


  constructor(viewer: Viewport2d, host: Window, defaultTool) {
    const _self = this;
    this.defaultTool = defaultTool || new PanTool(viewer);
    this.tool = this.defaultTool;
    this.viewer = viewer;
    this.window = host;

    viewer.canvas.addEventListener('mousemove', (e) => {
      e.preventDefault();
      //e.stopPropagation(); // allow propagation for move in sake of dynamic layout
      _self.tool.mousemove(e);
    }, false);
    viewer.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      _self.tool.mousedown(e);
    }, false);
    viewer.canvas.addEventListener('mouseup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      _self.tool.mouseup(e);
    }, false);
    viewer.canvas.addEventListener('mousewheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let tool = _self.tool;
      if (tool.mousewheel === undefined) {
        tool = _self.defaultTool;
      }
      if (tool.mousewheel !== undefined) {
        tool.mousewheel(e)
      }
    }, false);
    viewer.canvas.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      _self.tool.dblclick(e);
    }, false);

    window.addEventListener("keydown", (e) => {
      _self.tool.keydown(e);
      if (e.keyCode == 27) {
        _self.releaseControl();
      } else if (e.keyCode == 46 || e.keyCode == 8) {
        var selection = viewer.selected.slice();
        viewer.deselectAll();
        for (var i = 0; i < selection.length; i++) {
          viewer.remove(selection[i]);
        }
        viewer.refresh();
      }
    }, false);
    window.addEventListener("keypress", (e) => {
      _self.tool.keydown(e);
    }, false);
    window.addEventListener("keyup", (e) => {
      _self.tool.keydown(e);
    }, false);
  }

  takeControl(tool) {
    this.tool.cleanup();
    this.switchTool(tool);
    this.tool.restart();
  }

  switchTool(tool) {
    this.tool = tool;
    this.viewer.notify("tool-change", tool);
  }

  releaseControl() {
    this.takeControl(this.defaultTool);
  }
}
