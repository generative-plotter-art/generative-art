/**
 * BestCandidate is slower than Poisson-disc (when implemented right) and looks less nice.
 * I wrote it because the PoissonDisc is currently not optimized.
 *
 * See also https://bost.ocks.org/mike/algorithms/.
 */
import { check_inside, dist } from "../helper.js";

export class BestCandidate {
  async render(canvas, ctx, rng, config, svg) {
    let points = [];
    while (points.length < config.layout.number) {
      let best = {
        x: null,
        y: null,
        dist: 0,
        seen: 0
      };
      // pick whether we want to be inside or outside
      var inside = await rng.float() < config.layout.prob;
      while (best.seen < config.layout.candidates) {
        let x = await rng.float() * 2.0 - 1.0;
        let y = await rng.float() * 2.0 - 1.0;
        let is_inside = check_inside(x, y, canvas, ctx);
        if (inside != is_inside) {
          continue;
        }

        // find distance to closest point
        let closest = 3;
        for (let i=0; i<points.length; i++) {
          let point = points[i];
          let t = dist(point, {x: x, y:y});
          if (t < closest) {
            closest = t;
            if (closest < best.dist) {
              break;
            }
          }
        }

        // keep point which is further from all others
        if (closest >= best.dist) {
          best.x = x;
          best.y = y;
          best.dist = closest;
        }
        best.seen = best.seen + 1;
      }

      var dot = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
      dot.setAttribute("cx", best.x);
      dot.setAttribute("cy", best.y);
      dot.setAttribute("r", config.size);
      if (config.size > 0) {
        svg.append(dot);
      }
      points.push({x: best.x, y: best.y});
    }
    return points;
  }
}
