/**
 * Generative Art
 *
 * Just experimenting with various generative art algorithms. Hope you Enjoy.
 *
 * Settings are stored in json files. Feel free to play with them!
 * `cat foo.json | jq` is useful to ensure your json is well formed.
 *
 * Contributing:
 * I'll happily accept pull requests, as long as they follow these constraints:
 * 1. Output must be XY plotter friendly (such as AxiDraw).
 *    This implies creating SVGs and being careful about a few things, such as color use (everything is monochrome for
 *    now), keeping line widths small, thinking about where the pen is going to be raised and lowered, etc.
 * 2. Algorithms must interact with the components. These are base images which influence the final image.
 */
import $ from "jquery";
import { UniformRandom } from "./layout/uniform-random.js";
import { BestCandidate } from "./layout/best-candidate.js";
import { Grid } from "./layout/grid.js";
import { PoissonDisc } from "./layout/poisson-disc.js";

import { Needles } from "./lines/needles.js";
import { RegularPolygons } from "./lines/regular-polygons.js";
import { Neighbors } from "./lines/neighbors.js";
import { DelaunayTriangles } from "./lines/delaunay-triangles.js";
import { Gabriel } from "./lines/gabriel.js";
import { Tsp } from "./lines/tsp.js";
import { Growth } from "./lines/growth.js";
import { Hair } from "./lines/hair.js";

import { Csrng } from "./csrng.js";

var instance;

export class GenArt {
  static createInstance() {
    if (!instance) {
      instance = new GenArt();
    }
  }

  constructor() {
    this.configs = [];
    this.current = document.location.hash.substr(1)|0;
    $(next).click(_ => {
      this.current = (this.current + 1) % this.configs.length;
      this.render();
      return false;
    });
    $(prev).click(_ => {
      this.current = (this.current + this.configs.length - 1) % this.configs.length;
      this.render();
      return false;
    });
    $(save).click(_ => {
      var blob = new Blob([svg.outerHTML], {type : 'image/svg+xml'});
      var e = document.createElement('a');
      const url = URL.createObjectURL(blob)
      e.setAttribute('href', url);
      e.setAttribute('download', 'generative_art.svg');
      $(download).empty().append(e);
      e.click();
    })

    document.body.onload = async _ => {
      let configs = await getJSON("configs/all.json");
      for (let i=0; i<configs.length; i++) {
        this.setConfig(i, getJSON(configs[i]));
      }
      this.render();
    }
  }

  setConfig(index, config) {
    this.configs[index] = config;
  }

  async render() {
    document.location.hash = this.current;
    let config = await this.configs[this.current];

    // reset things
    $(svg).empty();
    let s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "-1 -1 2 2");
    svg.append(s);

    $(rendering).show();

    document.body.style.backgroundColor = config.background;
    document.body.style.color = config.foreground;
    title.textContent = "#" + this.current + " " + config.title;
    description.innerHTML = config.description;

    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "-1");
    rect.setAttribute("y", "-1");
    rect.setAttribute("width", "2");
    rect.setAttribute("height", "2");
    rect.setAttribute("fill", config.background);
    s.append(rect);

    var promises = [];
    for (let i=0; i<config.components.length; i++) {
      // render each component
      let component = config.components[i];
      let img = new Image();
      img.src = component.name;
      img.onerror = e => {throw e};
      promises.push(new Promise((done, _) => {
        img.onload = async _ => {
          var t = await this._render(config, component, img, s);
          done(t);
        };
      }));
    }
    await Promise.all(promises);
    $(rendering).hide();
  }

  async _render(config, component, img, svg) {
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Setup the RNG
    let rng;
    if (component.rng.algorithm == "csrng") {
      if (component.rng.seed == "") {
        component.rng.seed = "" + ((Math.random() * 123456789)|0);
        console.log("seed for " + component.name + ": " + component.rng.seed);
      }
      rng = new Csrng(component.rng.seed);
    }

    // Generate random points
    let layout;
    switch (component.points.layout.algorithm) {
      case "uniform-random":
        layout = new UniformRandom();
        break;
      case "best-candidate":
        layout = new BestCandidate();
        break;
      case "grid":
        layout = new Grid();
        break;
      case "poisson-disc":
        layout = new PoissonDisc();
        break;
    }

    let g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    g.setAttribute("style", "fill: " + component.points.color);
    svg.append(g);
    let points = await layout.render(canvas, ctx, rng, component.points, g);

    if (component.lines) {
      let lines
      g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
      g.setAttribute("stroke", component.lines.color);
      g.setAttribute("stroke-width", component.lines.width);
      switch (component.lines.algorithm) {
        case "needles":
          lines = new Needles();
          g.setAttribute("stroke-opacity", component.lines.opacity);
          break;
        case "regular-polygons":
          lines = new RegularPolygons();
          g.setAttribute("fill", config.background)
          break;
        case "neighbors":
          lines = new Neighbors();
          g.setAttribute("stroke-opacity", component.lines.opacity);
          break;
        case "delaunay-triangles":
          lines = new DelaunayTriangles();
          g.setAttribute("stroke-opacity", component.lines.opacity);
          break;
        case "gabriel":
          lines = new Gabriel();
          g.setAttribute("stroke-opacity", component.lines.opacity);
          break;
        case "tsp":
          lines = new Tsp();
          g.setAttribute("stroke-opacity", component.lines.opacity);
          break;
        case "growth":
          lines = new Growth();
          g.setAttribute("stroke-opacity", component.lines.opacity);
          break;
        case "hair":
          lines = new Hair();
          g.setAttribute("stroke-opacity", component.lines.opacity);
          break;
      }
      svg.append(g);

      return lines.render(rng, component.lines, points, g, canvas, ctx);
    }
  }
}

// A helper
async function getJSON(file) {
  return new Promise((resolve, reject) => {
    $.getJSON(file, data => resolve(data)).fail((jqxhr, textStatus, err) => {
      console.error(textStatus);
      reject(err);
    });
  });
}
