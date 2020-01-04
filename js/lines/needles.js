/**
 * Draws random needles at each point.
 */
export class Needles {
  async render(rng, config, points, g) {
    for (let i=0; i<points.length; i++) {
      let a = await rng.float() * Math.PI * 2;
      let x2 = points[i].x + Math.cos(a) * config.length;
      let y2 = points[i].y + Math.sin(a) * config.length;
      let needle = document.createElementNS("http://www.w3.org/2000/svg", 'line');
      needle.setAttribute("x1", points[i].x);
      needle.setAttribute("y1", points[i].y);
      needle.setAttribute("x2", x2);
      needle.setAttribute("y2", y2);
      g.append(needle);
    }
  }
}
