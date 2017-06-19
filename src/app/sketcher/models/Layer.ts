import LayerStyle from './LayerStyle'
import DefaultStyles from '../config/defaultStyles'

export default class Layer {
  constructor(name: string, style: LayerStyle) {
    this.name = name;
    this.style = style;
  }

  public name: string;
  public style: LayerStyle;
  public stylesByRoles = {
    'construction': DefaultStyles.CONSTRUCTION_OF_OBJECT
  };
  public objects = [];
  public readOnly = false; // This is actually a mark for boundary layers coming from 3D

  public remove(object) {
    const idx = this.objects.indexOf(object);
    if (idx != -1) {
      this.objects.splice(idx, 1);
      return true;
    }
    return false;
  }

  public add(object) {
    if (object.layer !== undefined) {
      if (object.layer != null) {
        object.layer.remove(object);
      }
      if (object.layer !== this) {
        this.objects.push(object);
        object.layer = this;
      }
    } else {
      this.objects.push(object);
    }
  }
}
