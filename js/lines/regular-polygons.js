/**
 * Draw regular polygons centered at each point.
 *
 * TODO: overlaps need to be converted so they can be plotted properly.
 */
class RegularPolygons {
  async render(rng, config, points, g) {
    for (let i=0; i<points.length; i++) {
      let g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
      let r = await rng.float() * 360;
      g2.setAttribute("transform", "translate(" + points[i].x + ", " + points[i].y + ") rotate(" + r + ", 0, 0) ");
      let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      let polyline_points = [];
      for (let j=0; j<=config.sides; j++) {
        let t = Math.PI * 2 / config.sides * j;
        var x = Math.cos(t) * config.size;
        var y = Math.sin(t) * config.size;
        polyline_points.push(x);
        polyline_points.push(y);
      }
      polyline.setAttribute("points", polyline_points.join(" "));
      g2.append(polyline);
      g.append(g2);
    }
  }
}
