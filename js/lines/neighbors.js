/**
 * Connects nodes which are close to each other
 */
import { dist } from "../helper.js";

export class Neighbors {
  async render(rng, config, points, g) {
    for (let i=0; i<points.length; i++) {
      for (let j=0; j<i; j++) {
        if (dist(points[i], points[j]) < config.max_distance) {
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
}
