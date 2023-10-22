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
  epicycles: "black",
};

// animation ticker
let time = 0;
let path = [];

function epicycles(x, y, rotation, fourier, draw = true) {
  // For each epicycle in the fourier series, we will draw a circle.
  for (let i = 0; i < fourier.length; i++) {
    let prev_x = x;
    let prev_y = y;

    const freq = 1 * fourier[i].freq;
    // Scale down the drawing
    const radius = fourier[i].amp / 9;
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
  sig: offsetAvatar(80),
});
let fourier = genFourier(d);

const maxPathLength = fourier.length - 5;

let lastFrameTime = null;
let speedFactor = 4; // increase this to slow down the animation
let scale = 40; // increase this to zoom in on the animation
let startingScale = 2;
let track = true; // true will follow drawing motion
let minDistance = Infinity;
let closestPointVx = null;

// loop thru all points, find the closes.

function step(currentFrameTime) {
  // Zoom Out
  if (scale > startingScale + 0.0001) {
    // as scale approaches 1 reduce the scale factor by less than 1 logarithmic
    scale -= Math.log(scale) / 100;

    // Compute speedFactor as a linear interpolation between 1 and 4 based on scale
    if (scale <= startingScale) {
      let factor = (startingScale - scale) / startingScale;
      speedFactor = 1 + factor * (startingScale - 1);
    }
  } else {
    scale = startingScale;
  }

  // skip this frame if not enough time has passed since last frame
  // this has the effect of slowing down the animation.
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
  let xTranslation = vx[0] * scale;
  let yTranslation = vx[1] * scale;

  let dx = centerX - xTranslation;
  let dy = centerY - yTranslation;

  const distance = Math.hypot(centerX - vx[0], centerY - vx[1]);

  if (distance < minDistance) {
    minDistance = distance;
    // record closest point. later must calculate scale with it.
    // record deltas of closest point
    closestPointVx = vx;
  }

  // We know we have the closest point for the loop
  if (path.length === maxPathLength - 1) {
    // At the closest point again
    if (closestPointVx === vx) {
      // stop tracking
      track = false;
    }
  }

  // now that tracking is false we use a different delta.
  if (!track && scale === startingScale) {
    // Zoom in will remain constant now
    xTranslation = closestPointVx[0] * scale;
    yTranslation = closestPointVx[1] * scale;
    dx = centerX - xTranslation;
    dy = centerY - yTranslation;
  }

  canvas.translate(dx, dy);
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
  shape.set_stroke_style(colors.face);

  canvas.set_line_width(2.2 / (scale * 0.5));

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
  canvas.translate(-dx, -dy);
  canvas.set_line_width(1.0 / scale);
  // Restore line color
  shape.set_stroke_style(colors.epicycles);

  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
