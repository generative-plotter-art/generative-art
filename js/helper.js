export function check_inside(x, y, canvas, ctx) {
  let px = ((x + 1.0) / 2.0 * canvas.width)|0;
  let py = ((y + 1.0) / 2.0 * canvas.height)|0;
  if ((px == canvas.width) || (py == canvas.height)) {
    return false;
  }
  let pixels = ctx.getImageData(px, py, 1, 1).data;
  return (pixels[0] < 128) && (pixels[1] < 128) && (pixels[2] < 128);
}

export function dist(p1, p2) {
  var x = p1.x - p2.x;
  var y = p1.y - p2.y;
  return Math.sqrt(x * x + y * y);
}
