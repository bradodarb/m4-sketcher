export function isEndPoint(o) {
  return o.className === 'M4CAD.TWO.EndPoint'
}

export function DrawPoint(ctx, x, y, rad, scale) {
  ctx.beginPath();
  ctx.arc(x, y, rad / scale, 0, 2 * Math.PI, false);
  ctx.fill();
}


export function equalizeLinkedEndpoints() {
  const visited = new Set();

  function equalize(obj) {
    if (visited.has(obj.id)) return;
    visited.add(obj.id);
    for (let link of obj.linked) {
      if (isEndPoint(link)) {
        //equalize(obj, link);
        equalize(obj);
        link.setFromPoint(obj);
        equalize(link);
      }
    }
  }
  this.accept((obj) => {
    if (isEndPoint(obj)) {
      equalize(obj);
    }
    return true;
  });
}

//TODO, make this based on dimension style
export function getTextOffset(scale) {
  return 3 * scale;
}
