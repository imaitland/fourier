import { Shape, Canvas, compute_spectrum_js } from "fourier-front-end";
import { avatar } from "./avatar.js";

// animation ticker
let time = 0;
let path = [];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function epicycles(x, y, rotation, fourier, draw = true) {
  // For each epicycle in the fourier series, we will draw a circle.
  for (let i = 0; i < fourier.length; i++) {
    let prev_x = x;
    let prev_y = y;

    const freq = 1 * fourier[i].freq;
    // Scale down our drawing, by a factor of 100.
    const radius = fourier[i].amp / 10;
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

let centerX = canvas.width() / 2;
let centerY = canvas.height() / 2;

// This will "decompose" our input signal into its constituent waves.
let d = compute_spectrum_js({
  sig: avatar,
});
let fourier = genFourier(d);

const maxPathLength = fourier.length - 5;

let lastFrameTime = null;
let speedFactor = 2; // increase this to slow down the animation
let scale = 1; // increase this to zoom in on the animation
let startingScale = 1;
let track = false; // true will follow drawing motion

function step(currentFrameTime) {
  if (scale > 1.00005) {
    // as scale approaches 1 reduce the scale factor by less than 1 logarithmic
    scale -= Math.log(scale) / 20;

    // Compute speedFactor as a linear interpolation between 1 and 4 based on scale
    if (scale <= startingScale) {
      let factor = (startingScale - scale) / (startingScale - 1);
      speedFactor = 1 + factor * (startingScale - 1);
    }
  } else {
    scale = 1;
  }

  // skip this frame if not enough time has passed since last frame
  // this has the effect of sloing down the animation.
  if (
    lastFrameTime !== null &&
    currentFrameTime - lastFrameTime < (1000 / 60) * speedFactor
  ) {
    window.requestAnimationFrame(step);
    return;
  }
  // save the timestamp of this frame
  lastFrameTime = currentFrameTime;

  canvas.clear();

  // calculate middle of the canvas...
  let x = centerX;
  let y = centerY;

  // Epicycles returns the last point in that sequence of epicycles.
  let vx = epicycles(x, y, 0, fourier, false);

  // Zoom in on the xy coords of the last epicycle
  if (track) {
    let xTranslation = vx[0] * scale;
    let yTranslation = vx[1] * scale;

    let dx = centerX - xTranslation;
    let dy = centerY - yTranslation;

    canvas.translate(dx, dy);
  }

  canvas.scale(scale, scale);
  canvas.set_line_width(1.0 / scale);

  // Draw the epicycles this time
  epicycles(x, y, 0, fourier, true);

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
  shape.set_line_width(1.0 / scale);
  let offset = 0;

  shape.begin_shape(center_x, center_y);
  canvas.set_line_width(1.0 / (scale * 0.5));

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

  // Restore zoom
  canvas.scale(1.0 / scale, 1.0 / scale);

  // Restore translation
  track && canvas.translate(-dx, -dy);
  canvas.set_line_width(1.0 / scale);

  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
