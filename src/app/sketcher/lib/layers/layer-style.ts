export default class LayerStyle {

  public lineWidth: number = 1;
  public strokeStyle: string = '#ffffff';
  public fillStyle: string = '#ffffff';


  constructor(width: number, stroke: string, fill: string) {
    this.lineWidth = width;
    this.strokeStyle = stroke;
    this.fillStyle = fill;
  }

}
