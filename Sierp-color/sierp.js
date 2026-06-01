class Point {
  constructor(x, y) {
    this.x = Math.trunc(x);
    this.y = Math.trunc(y);
    this.color = [1, 1, 1];
  }

  toIndex(width) {
    return this.x + this.y * width;
  }

  approach(other) {
    return new Point((this.x + other.x) / 2, (this.y + other.y) / 2);
  }
}

export class Sierp {
  #width;
  #height;
  #scale;

  constructor(width, height, scale = 2) {
    this.#width = width;
    this.#height = height;
    this.#scale = scale;
    this.max_r = this.max_g = this.max_b = 0;
    this.r_output = this.g_output = this.b_output = null;
    this.points = [];
  }

  get #iw() { return this.#width * this.#scale; }
  get #ih() { return this.#height * this.#scale; }

  #xy(pointOrX, y) {
    if (pointOrX instanceof Point) return pointOrX.toIndex(this.#iw);
    return pointOrX + y * this.#iw;
  }

  #pointAt(index) {
    return new Point(index % this.#iw, Math.trunc(index / this.#iw));
  }

  static #saturating_add(arr, idx, val) {
    const sum = arr[idx] + val;
    arr[idx] = sum >= 0x100000000 ? 0xFFFFFFFF : sum;
  }

  generation(from_r, from_g, from_b) {
    const len = from_r.length;
    const to_r = new Uint32Array(len);
    const to_g = new Uint32Array(len);
    const to_b = new Uint32Array(len);
    this.max_r = this.max_g = this.max_b = 0;
    for (let i = 0; i < len; i++) {
      const r = from_r[i], g = from_g[i], b = from_b[i];
      if (r > 0 || g > 0 || b > 0) {
        const pos = this.#pointAt(i);
        for (const point of this.points) {
          const idx = this.#xy(pos.approach(point));
          Sierp.#saturating_add(to_r, idx, r);
          Sierp.#saturating_add(to_g, idx, g);
          Sierp.#saturating_add(to_b, idx, b);
          if (to_r[idx] > this.max_r) this.max_r = to_r[idx];
          if (to_g[idx] > this.max_g) this.max_g = to_g[idx];
          if (to_b[idx] > this.max_b) this.max_b = to_b[idx];
        }
      }
    }
    return [to_r, to_g, to_b];
  }

  set_points(sides) {
    this.points = [];
    const fullCircle = 2 * Math.PI;
    const stepAngle = fullCircle / sides;
    let minSin = Infinity, maxSin = -Infinity;
    for (let i = 0; i < sides; i++) {
      const s = Math.sin(-fullCircle / 4 + stepAngle * i);
      if (s < minSin) minSin = s;
      if (s > maxSin) maxSin = s;
    }
    const yCenter = 0.5 - (minSin + maxSin) * 0.499 / 2;
    for (let i = 0; i < sides; i++) {
      const angle = -fullCircle / 4 + stepAngle * i;
      const nx = 0.5 + Math.cos(angle) * 0.499;
      const ny = yCenter + Math.sin(angle) * 0.499;
      this.points.push(new Point(nx * this.#iw, ny * this.#ih));
    }
    if (sides === 3) {
      const palette = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      this.points.forEach((p, i) => p.color = palette[i]);
    } else {
      this.points.forEach(p => p.color = [1, 1, 1]);
    }
    this.reset();
  }

  addCentrePoint() {
    this.points.push(new Point(this.#iw / 2, this.#ih / 2));
  }

  reset() {
    const len = this.#iw * this.#ih;
    this.r_output = new Uint32Array(len);
    this.g_output = new Uint32Array(len);
    this.b_output = new Uint32Array(len);
    this.max_r = this.max_g = this.max_b = 0;
    const center = new Point(this.#iw / 2, this.#ih / 2);
    for (const point of this.points) {
      const idx = this.#xy(center.approach(point));
      const [cr, cg, cb] = point.color;
      this.r_output[idx] += cr;
      this.g_output[idx] += cg;
      this.b_output[idx] += cb;
      if (cr > this.max_r) this.max_r = cr;
      if (cg > this.max_g) this.max_g = cg;
      if (cb > this.max_b) this.max_b = cb;
    }
  }

  next() {
    [this.r_output, this.g_output, this.b_output] =
      this.generation(this.r_output, this.g_output, this.b_output);
  }

  safe_next() {
    const [pr, pg, pb] = [this.max_r, this.max_g, this.max_b];
    const result = this.generation(this.r_output, this.g_output, this.b_output);
    if (this.max_r >= 0xFFFFFFF0 || this.max_g >= 0xFFFFFFF0 || this.max_b >= 0xFFFFFFF0) {
      [this.max_r, this.max_g, this.max_b] = [pr, pg, pb];
      return false;
    }
    [this.r_output, this.g_output, this.b_output] = result;
    return true;
  }

  render(canvas) {
    const s = this.#scale, iw = this.#iw;
    const W = this.#width, H = this.#height;

    // First pass: block-sum downscale and find per-channel maxes
    let mr = 0, mg = 0, mb = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let r = 0, g = 0, b = 0;
        for (let dy = 0; dy < s; dy++) {
          for (let dx = 0; dx < s; dx++) {
            const i = (x * s + dx) + (y * s + dy) * iw;
            r += this.r_output[i];
            g += this.g_output[i];
            b += this.b_output[i];
          }
        }
        if (r > mr) mr = r;
        if (g > mg) mg = g;
        if (b > mb) mb = b;
      }
    }

    // Second pass: normalise per channel, invert, write image
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(W, H);
    const fr = 255 / (mr || 1);
    const fg = 255 / (mg || 1);
    const fb = 255 / (mb || 1);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let r = 0, g = 0, b = 0;
        for (let dy = 0; dy < s; dy++) {
          for (let dx = 0; dx < s; dx++) {
            const i = (x * s + dx) + (y * s + dy) * iw;
            r += this.r_output[i];
            g += this.g_output[i];
            b += this.b_output[i];
          }
        }
        const oi = (x + y * W) * 4;
        image.data[oi + 0] = 255 - Math.min(255, r * fr);
        image.data[oi + 1] = 255 - Math.min(255, g * fg);
        image.data[oi + 2] = 255 - Math.min(255, b * fb);
        image.data[oi + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  drawPoints(canvas) {
    const s = this.#scale;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 0.3;
    if (this.points.length === 0) return;
    for (const { x, y, color } of this.points) {
      const [r, g, b] = color;
      ctx.fillStyle = `rgb(${r * 255},${g * 255},${b * 255})`;
      ctx.fillRect(x / s - 2, y / s - 2, 4, 4);
    }
    ctx.beginPath();
    for (let i = 0; i < this.points.length; i++) {
      const { x, y } = this.points[i];
      for (let j = i + 1; j < this.points.length; j++) {
        ctx.moveTo(x / s, y / s);
        ctx.lineTo(this.points[j].x / s, this.points[j].y / s);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }
}
