import { Shape, Canvas } from "fourier-front-end";

// Requires a canvas element with id="canvas"
let canvas = new Canvas();

// animation ticker
let time = 0;
let wave = [];
let sliderVal = 1;

document.getElementById("slider").addEventListener("input", (e) => {
  sliderVal = e.target.value;
  console.log(sliderVal);
});

function step() {
  canvas.clear();

  let x = 120;
  let y = 120;

  // Perimeter point, updated each frame, based on time. This is the fourier series, for n.
  // where n is 1,3,5,7,9,11...
  for (let i = 0; i < sliderVal; i++) {
    let prev_x = x;
    let prev_y = y;

    const n = 2 * i + 1;
    const radius = 40 * (4 / (n * Math.PI));

    x += radius * Math.cos(n * time);
    y += radius * Math.sin(n * time);

    // Circle
    canvas.circle(prev_x, prev_y, radius);

    // Perimeter point
    canvas.circle(x, y, 1);

    // Line from perimeter point to wave
    canvas.line(prev_x, prev_y, x, y);
  }

  // Wave.
  const center_x = 100;
  const center_y = 100;

  wave.unshift(y);
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
  // Line from perimeter point to wave
  canvas.line(x, y, center_x + offset, wave[0]);

  window.requestAnimationFrame(step);
  time += 0.03;
}

window.requestAnimationFrame(step);
