import { Shape, Canvas, compute_complex_spectrum } from "fourier-front-end";
import { drawing } from "./drawing.js";
import { logo } from "./coding_train_logo.js";

// animation ticker
let time = 0;
let path = [];

function epicycles(x, y, rotation, fourier) {
  // For each epicycle in the fourier series, we will draw a circle.
  for (let i = 0; i < fourier.length; i++) {
    let prev_x = x;
    let prev_y = y;

    const freq = fourier[i].freq;
    const radius = fourier[i].amp;
    const phase = fourier[i].phase;

    x += radius * Math.cos(freq * time + phase + rotation);
    y += radius * Math.sin(freq * time + phase + rotation);

    // Circle
    canvas.circle(prev_x, prev_y, radius);

    // Perimeter point
    canvas.circle(x, y, 1);

    // Line from circle center to it perimeter.
    canvas.line(prev_x, prev_y, x, y);
  }
  // Return the last x and y point from that epicycle sequence.
  // We'll use this to draw a line from the end of the last epicycle to the path.
  return [x, y];
}

// Requires a canvas element with id="canvas"
let canvas = new Canvas("dft_complex_canvas");

// only take every 8th point from the logo.
let input_signal = logo.filter((item, ix) => {
  return ix % 8 === 0;
});

// This will "decompose" our input signal into its constituent waves.
let d = compute_complex_spectrum({ sig: input_signal });

let fourier = [];

const imaginaries = d.imaginary();
const amplitudes = d.amplitude();
const phases = d.phase();
const frequencies = d.frequency();

d.real().map((re, ix) => {
  fourier.push({
    re: re,
    imag: imaginaries[ix],
    amp: amplitudes[ix],
    phase: phases[ix],
    freq: frequencies[ix],
  });
});

fourier = fourier.sort((a, b) => b.amp - a.amp);

console.log("Fourier: ", fourier);

function step() {
  canvas.clear();

  let x = 250;
  let y = 250;

  // Epicycles returns the last point in that sequence of epicycles.
  let vx = epicycles(x, y, 0, fourier);

  // Draw the wave.
  const center_x = 100;
  const center_y = 100;

  path.unshift(vx);

  if (path.length > 5000) {
    path.pop();
  }

  let shape = new Shape("dft_complex_canvas");
  let offset = 200;

  shape.begin_shape(center_x, center_y);

  for (let i = 0; i < path.length; i++) {
    shape.vertex(path[i][0] + 200, path[i][1]);
  }

  shape.end_shape();
  // Line from perimeter point to wave
  canvas.line(path[0][0], path[0][1], path[0][0] + 200, path[0][1]);

  const dt = (2 * Math.PI) / fourier.length;
  time += dt;
  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
