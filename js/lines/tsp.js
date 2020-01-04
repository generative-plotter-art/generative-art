/**
 * Uses a Traveling Salesman Solver to connect nodes.
 * Inspired by http://www.cgl.uwaterloo.ca/csk/projects/tsp/
 *
 * To make things fast, I first perform nearest insertion. Then perform
 * 2-opt which should remove most intersections.
 */
import { solver } from "../tsp_solver.js"

export class Tsp {
  async render(rng, config, points, g) {
    var t = await new Promise((done, _) => {
      solver(points, solution => {
        for (var i=1; i<=solution.paths[0].length; i++) {
          let edge = document.createElementNS("http://www.w3.org/2000/svg", 'line');
          edge.setAttribute("x1", points[solution.paths[0][i-1]].x);
          edge.setAttribute("y1", points[solution.paths[0][i-1]].y);
          edge.setAttribute("x2", points[solution.paths[0][i%solution.paths[0].length]].x);
          edge.setAttribute("y2", points[solution.paths[0][i%solution.paths[0].length]].y);
          g.append(edge);
        }
        done();
      });
    });
  }
}
