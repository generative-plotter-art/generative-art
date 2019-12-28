/**
 * UniformRandom is a boring layout strategy. Just place points randomly.
 *
 * Note: we could re-use the best-candidate code and set candidate=1.
 */
class UniformRandom {
  async render(canvas, ctx, rng, config, svg) {
    let points = [];
    while (points.length < config.layout.number) {
      var inside = await rng.float() < config.layout.prob;
      let x;
      let y;
      while (true) {
        x = await rng.float() * 2.0 - 1.0;
        y = await rng.float() * 2.0 - 1.0;
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
