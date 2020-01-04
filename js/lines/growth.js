/**
 * Starting from a random point, grow a line until we leave the shape or hit another line.
 *
 * Inspired to some degree by:
 * https://medium.com/@fogleman/pen-plotter-programming-the-basics-ec0407ab5929
 * https://sighack.com/post/getting-creative-with-perlin-noise-fields
 */
import { check_inside, dist } from "../helper.js";

export class Growth {
  async render(rng, config, points, g, canvas, ctx) {
    var segments = [];
    while (segments.length < config.segments) {
      let x1;
      let y1;
      let a = await rng.float() * Math.PI * 2;
      let segment = [];
      while (true) {
        x1 = await rng.float() * 2.0 - 1.0;
        y1 = await rng.float() * 2.0 - 1.0;
        if (check_inside(x1, y1, canvas, ctx)) {
          break;
        }
      }

      outer: while (true) {
        // add a small piece of segment
        let x2 = x1 + Math.cos(a) * config.segment_length;
        let y2 = y1 + Math.sin(a) * config.segment_length;
        a += await rng.float() * config.segment_angle * 2 - config.segment_angle;

        // stop if we reached the outside
        if (!check_inside(x2, y2, canvas, ctx)) {
          break;
        }

        // stop if we collide with ourselves
        let t = Math.ceil(config.segment_spacing / config.segment_length);
        for (let i=0; i<segment.length-t; i++) {
          if (dist({x: x2, y: y2}, segment[i]) < config.segment_spacing) {
            break outer;
          }
        }

        // stop if we collide with another segment
        for (let i=0; i<segments.length; i++) {
          for (let j=0; j<segments[i].length; j++) {
            if (dist({x: x2, y: y2}, segments[i][j]) < config.segment_spacing) {
              break outer;
            }
          }
        }

        // record piece of segment
        segment.push({x: x1, y: y1})
        x1 = x2;
        y1 = y2;
      }

      // if segment is long engouh, keep it
      if (segment.length > config.segment_min) {
        for (let i=1; i<segment.length; i++) {
          let edge = document.createElementNS("http://www.w3.org/2000/svg", 'line');
          edge.setAttribute("x1", segment[i-1].x);
          edge.setAttribute("y1", segment[i-1].y);
          edge.setAttribute("x2", segment[i].x);
          edge.setAttribute("y2", segment[i].y);
          g.append(edge);
        }
        segments.push(segment);
      }
    }
  }
}
