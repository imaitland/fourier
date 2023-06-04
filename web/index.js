import { Shape, Canvas } from "fourier-front-end";

const radius = 50;
const center_x = 75;
const center_y = 75;

// Requires a canvas element with id="canvas"
let canvas = new Canvas();

// Main Circle
canvas.circle(center_x, center_y, radius);

// Perimeter point
canvas.circle(center_x + radius, center_y, 3);

// animation ticker
let time = 0;
let wave = [];

function step() {
  canvas.clear();
  // Outer Circle
  canvas.circle(center_x, center_y, radius);

  const updated_x = radius * Math.cos(time) + center_x;
  const updated_y = radius * Math.sin(time) + center_y;
  // Wave...
  wave.unshift(updated_y);
  if (wave.length > 200) {
    wave.pop();
  }

  let shape = new Shape();
  let offset = 200;
  let wave_x = center_x + offset;

  shape.begin_shape(center_x + offset, center_y);

  for (let i = 0; i < wave.length; i++) {
    wave_x = center_x + offset + i;
    shape.vertex(wave_x, wave[i]);
  }

  shape.end_shape();
  // Perimeter point
  canvas.circle(updated_x, updated_y, 3);

  // Line from center to perimeter point
  canvas.line(center_x, center_y, updated_x, updated_y);
  // Line from perimeter point to wave
  canvas.line(updated_x, updated_y, center_x + offset, wave[0]);

  window.requestAnimationFrame(step);
  time += 0.05;
}

window.requestAnimationFrame(step);
