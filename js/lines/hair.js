/**
 * Similar to growth (also inspired by https://sighack.com/post/getting-creative-with-perlin-noise-fields),
 * but using a noise field this time.
 */
import { check_inside, dist } from "../helper.js";
import SimplexNoise from "simplex-noise";

export class Hair {
  async render(rng, config, points, g, canvas, ctx) {
    let simplex = new SimplexNoise(await rng.float());
    let direction_bias = await rng.float() * Math.PI * 2;
    for (let i=0; i<points.length; i++) {
      let x1 = points[i].x;
      let y1 = points[i].y;

      while (true) {
        let a = direction_bias + simplex.noise2D(x1*config.chaos, y1*config.chaos) * config.direction;
        let x2 = x1 + Math.cos(a) * config.smoothness;
        let y2 = y1 + Math.sin(a) * config.smoothness;
        if (!check_inside(x2, y2, canvas, ctx)) {
          break;
        }

        let edge = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        edge.setAttribute("x1", x1);
        edge.setAttribute("y1", y1);
        edge.setAttribute("x2", x2);
        edge.setAttribute("y2", y2);
        g.append(edge);

        x1 = x2;
        y1 = y2;
      }
    }

    // the commented code below renders the noise direction at every point:
    // let l = 0.015;
    // let chaos = 2;
    // for (let x = -1; x<1; x+=l) {
    //   for (let y = -1; y<1; y+=l) {
    //     if (!check_inside(x, y, canvas, ctx)) {
    //       continue;
    //     }
    //     let v = simplex.noise2D(x*chaos, y*chaos);
    //
    //     let x1 = x - Math.cos(v * Math.PI) * l/2;
    //     let y1 = y - Math.sin(v * Math.PI) * l/2;
    //     let x2 = x + Math.cos(v * Math.PI) * l/2;
    //     let y2 = y + Math.sin(v * Math.PI) * l/2;
    //
    //     let edge = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    //     edge.setAttribute("x1", x1);
    //     edge.setAttribute("y1", y1);
    //     edge.setAttribute("x2", x2);
    //     edge.setAttribute("y2", y2);
    //     g.append(edge);
    //   }
    // }
  }
}
