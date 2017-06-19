export default class LayerStyle {

  public lineWidth: number = 1;
  public strokeColor: string = '#ffffff';
  public fillColor: string = '#ffffff';


  constructor(width: number, stroke: string, fill: string) {
    this.lineWidth = width;
    this.strokeColor = stroke;
    this.fillColor = fill;
  }

}
