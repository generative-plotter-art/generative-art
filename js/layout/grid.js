/**
 * Grid snaps uniform random points to a grid.
 */
import { check_inside } from "../helper.js";

export class Grid {
  async render(canvas, ctx, rng, config, svg) {
    let points = [];
    while (points.length < config.layout.number) {
      var inside = await rng.float() < config.layout.prob;
      let x;
      let y;
      while (true) {
        x = await rng.float() * 2.0 - 1.0;
        x = ((x * (1/config.layout.spacing_x))|0)*config.layout.spacing_x
        y = await rng.float() * 2.0 - 1.0;
        y = ((y * (1/config.layout.spacing_y))|0)*config.layout.spacing_y;

        let is_inside = check_inside(x, y, canvas, ctx);
        if (inside == is_inside) {
          break;
        }
      }

      var dot = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
      dot.setAttribute("r", config.size);
      if (config.size > 0) {
        svg.append(dot);
      }
      points.push({x: x, y: y});
    }
    return points;
  }
}
