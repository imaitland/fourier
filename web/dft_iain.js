import { Shape, Canvas, compute_spectrum_js } from "fourier-front-end";
import { avatar, logo } from "./avatar.js";

// animation ticker
let time = 0;
let path = [];

function epicycles(x, y, rotation, fourier) {
  // For each epicycle in the fourier series, we will draw a circle.
  for (let i = 0; i < fourier.length; i++) {
    let prev_x = x;
    let prev_y = y;

    const freq = fourier[i].freq;
    // Scale down our drawing, by a factor of 100.
    const radius = fourier[i].amp * 4;
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

function genFourier(d) {
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
  return fourier;
}

// Requires a canvas element with id="canvas"
let canvas = new Canvas("dft_iain_canvas");

let centerX = canvas.width() / 2;
let centerY = canvas.height() / 2;

let input_signal = logo;

// This will "decompose" our input signal into its constituent waves.
let d = compute_spectrum_js({ sig: input_signal });
let fourier = genFourier(d);

const maxPathLength = fourier.length;

function step() {
  let draw = true;
  canvas.clear();

  // calculate middle of the canvas...
  let x = centerX;
  let y = centerY;

  // Epicycles returns the last point in that sequence of epicycles.
  let vx = epicycles(x, y, 0, fourier);

  // Draw the wave.
  const center_x = 100;
  const center_y = 100;
  // add to beginning.
  path.unshift(vx);

  if (path.length === maxPathLength + 5) {
    // remove from end
    path.pop();
  }

  let shape = new Shape("dft_iain_canvas");
  let offset = 0;

  shape.begin_shape(center_x, center_y);

  for (let i = 0; i < path.length; i++) {
    // check if subsequent points are nearby on the x axis, if they are far apart, move the pen to the new point without drawing it.
    if (i < path.length - 2) {
      if (Math.abs(path[i][0] - path[i + 1][0]) > 10) {
        shape.move_to(path[i + 1][0] + offset, path[i + 1][1]);
      } else {
        shape.vertex(path[i][0] + offset, path[i][1]);
      }
    }
  }

  shape.end_shape();

  const dt = (2 * Math.PI) / fourier.length;
  time += dt;
  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
