/**
 * PoissonDisc
 *
 * Note: this implementation is rather slow. Probably slower than best candidate!
 */
class PoissonDisc {
  async render(canvas, ctx, rng, config, svg) {
    let points = [];
    while (points.length < config.layout.number) {
      // pick whether we want to be inside or outside
      var inside = await rng.float() < config.layout.prob;
      let x;
      let y;
      outer: while (true) {
        x = await rng.float() * 2.0 - 1.0;
        y = await rng.float() * 2.0 - 1.0;
        let is_inside = check_inside(x, y, canvas, ctx);
        if (inside != is_inside) {
          continue;
        }

        // check that we aren't too close to any other point
        for (let i=0; i<points.length; i++) {
          if (dist(points[i], {x: x, y: y}) < config.layout.min_distance) {
            continue outer;
          }
        }

        break;
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
