import { Shape, Canvas, compute_spectrum_js } from "fourier-front-end";
import { avatar, offsetAvatar } from "./avatar.js";

let DARKMODE = false;
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  DARKMODE = true;
}

let colors = {
  face: DARKMODE ? "white" : "black",
  epicycles: "white",
};

let path = [];

function epicycles(x, y, rotation, fourier, draw = true, scaleFactor, time) {
  canvas.set_line_width(0.3);
  // For each epicycle in the fourier series, we will draw a circle.
  for (let i = 0; i < fourier.length; i++) {
    let prev_x = x;
    let prev_y = y;

    const freq = 1 * fourier[i].freq;
    // Scale the drawing
    const radius = fourier[i].amp * scaleFactor;
    const phase = fourier[i].phase;

    x += radius * Math.cos(freq * time + phase + rotation);
    y += radius * Math.sin(freq * time + phase + rotation);

    if (draw) {
      // Circle
      canvas.circle(prev_x, prev_y, radius);

      // Perimeter point
      canvas.circle(x, y, 1);

      // Line from circle center to it perimeter.
      canvas.line(prev_x, prev_y, x, y);
    }
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
let canvas = new Canvas("dft_logo_canvas");

// offset
let centerX = canvas.width() / 2 - 30;
let centerY = canvas.height() / 2 - 10;

// This will "decompose" our input signal into its constituent waves.
let d = compute_spectrum_js({
  sig: offsetAvatar(0),
});
let fourier = genFourier(d);

const maxPathLength = fourier.length;

let lastFrameTime = null;
let speedFactor = 2.9; // increase this to slow down the animation
//let scale = 2; // increase this to zoom in on the animation

// Calculate scale factor based on canvas size
let scaleFactor = Math.min(canvas.width(), canvas.height()) / 4000; // Adjust according to your preference

// epicycles ticker
let time = 0;

function step(currentFrameTime) {
  canvas.clear();

  // calculate middle of the canvas...
  let x = centerX;
  let y = centerY;

  // Epicycles returns the last point in that sequence of epicycles.
  let vx = epicycles(x, y, 0, fourier, false, scaleFactor, time);

  // Draw the epicycles this time
  epicycles(x, y, 0, fourier, true, scaleFactor, time);

  // Draw the wave.
  const center_x = 100;
  const center_y = 100;

  // add to beginning.
  path.unshift(vx);

  if (path.length === maxPathLength) {
    // remove from end
    path.pop();
  }

  let shape = new Shape("dft_logo_canvas");
  shape.set_line_width(1.5);
  let offset = 0;

  shape.begin_shape(center_x, center_y);
  shape.set_stroke_style(colors.face);

  for (let i = 0; i < path.length; i++) {
    // check if subsequent points are nearby on the x axis, if they are far apart, move the pen to the new point without drawing it.
    // TODO: scaleFactor at play re > 100
    if (i < path.length - 2) {
      if (Math.abs(path[i][0] - path[i + 1][0]) > 100) {
        shape.move_to(path[i + 1][0] + offset, path[i + 1][1]);
      } else {
        shape.vertex(path[i][0] + offset, path[i][1]);
      }
    }
  }

  shape.end_shape();
  // save the timestamp of this frame
  lastFrameTime = currentFrameTime;

  const dt = (2 * Math.PI) / fourier.length;

  // this is what 'ticks' inside the epicycles function
  time += dt;

  shape.set_stroke_style(colors.epicycles);

  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);

/*
window.addEventListener("mousemove", step);
window.addEventListener("touchmove", step);
window.addEventListener("touchstart", step);
window.addEventListener("touchend", step);
*/
