/**
 * Delaunay Triangulation
 * see https://en.wikipedia.org/wiki/Delaunay_triangulation
 */
class DelaunayTriangles {
  async render(rng, config, points, g, canvas, ctx) {
    let p = [];
    for (let i=0; i<points.length; i++) {
      p.push([points[i].x, points[i].y]);
    }
    var delaunay = Delaunator.from(p);
    for (let i = 0; i < delaunay.triangles.length; i+=3) {
      for (let j=0; j<3; j++) {
        let edge = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        let p1 = points[delaunay.triangles[i+(j%3)]];
        let p2 = points[delaunay.triangles[i+((j+1)%3)]];
        if (config.check_inside) {
          let m = {x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2};
          if (!check_inside(m.x, m.y, canvas, ctx)) {
            continue;
          }
        }
        edge.setAttribute("x1", p1.x);
        edge.setAttribute("y1", p1.y);
        edge.setAttribute("x2", p2.x);
        edge.setAttribute("y2", p2.y);
        g.append(edge);
      }
    }
  }
}
