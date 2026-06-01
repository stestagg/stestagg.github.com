class Point {
  constructor(x, y) {
    this.x = Math.trunc(x);
    this.y = Math.trunc(y);
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

  constructor(width, height, step) {
    this.#width = width;
    this.#height = height;
    this.max = 0;
    this.step = step;
    this.output = null;
    this.points = [];
  }

  #xy(pointOrX, y) {
    if (pointOrX instanceof Point) return pointOrX.toIndex(this.#width);
    return pointOrX + y * this.#width;
  }

  #pointAt(index) {
    return new Point(index % this.#width, Math.trunc(index / this.#width));
  }

  generation(from) {
    const to = new Int16Array(this.#width * this.#height);
    this.max = 0;
    for (let i = 0; i < from.length; i++) {
      if (from[i] > 0) {
        const pos = this.#pointAt(i);
        for (const point of this.points) {
          const idx = this.#xy(pos.approach(point));
          to[idx] = Math.min(to[idx] + from[i], 32767);
          if (to[idx] > this.max) this.max = to[idx];
        }
      }
    }
    return to;
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
      this.points.push(new Point(nx * this.#width, ny * this.#height));
    }
    this.reset();
  }

  addCentrePoint() {
    this.points.push(new Point(this.#width / 2, this.#height / 2));
  }

  reset() {
    this.output = new Int16Array(this.#width * this.#height);
    this.output[this.#xy(this.#width / 2, this.#height / 2)] = this.step;
  }

  next() {
    this.output = this.generation(this.output);
  }

  safe_next() {
    const prevMax = this.max;
    const newOutput = this.generation(this.output);
    if (this.max >= 32767) {
      this.max = prevMax;
      return false;
    }
    this.output = newOutput;
    return true;
  }

  render(canvas) {
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(this.#width, this.#height);
    const factor = 255 / this.max;
    for (let i = 0; i < this.output.length; i++) {
      image.data[i * 4 + 3] = this.output[i] * factor;
    }
    ctx.putImageData(image, 0, 0);
  }

  drawPoints(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 0.3;
    if (this.points.length === 0) return;
    ctx.beginPath();
    for (let i = 0; i < this.points.length; i++) {
      const { x, y } = this.points[i];
      ctx.fillRect(x - 2, y - 2, 4, 4);
      for (let j = i + 1; j < this.points.length; j++) {
        ctx.moveTo(x, y);
        ctx.lineTo(this.points[j].x, this.points[j].y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }
}
