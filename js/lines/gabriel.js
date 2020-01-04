/**
 * Connects nodes which don't have any other nodes in their proximity.
 * https://en.wikipedia.org/wiki/Gabriel_graph
 */
import { dist } from "../helper.js";

export class Gabriel {
  async render(rng, config, points, g) {
    for (let i=0; i<points.length; i++) {
      outer: for (let j=0; j<i; j++) {
        // Compute mid point
        var m = {x: (points[i].x + points[j].x)/2,
          y: (points[i].y + points[j].y)/2};

        // Compute radius
        var r = dist(points[i], points[j]) / 2;

        // Continue if we have any other points in the neighborhood.
        var neighbors = 0;
        for (let k=0; k<points.length; k++) {
          if (dist(m, points[k]) <= r) {
            neighbors++;
          }
          if (neighbors > 2) {
            continue outer;
          }
        }

        let edge = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        edge.setAttribute("x1", points[i].x);
        edge.setAttribute("y1", points[i].y);
        edge.setAttribute("x2", points[j].x);
        edge.setAttribute("y2", points[j].y);
        g.append(edge);
      }
    }
  }
}
