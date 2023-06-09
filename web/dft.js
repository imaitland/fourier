import { Shape, Canvas, compute_spectrum } from "fourier-front-end";

// A simple Perlin noise generator using 2D gradient vectors.
// NOTE: For simplicity, this doesn't include any kind of smoothing or interpolation.
function noise(x, y) {
  // Generate a random 2D gradient vector.
  let randomGradient = [Math.random() * 2 - 1, Math.random() * 2 - 1];

  // Compute the dot product of the input coordinate and the random gradient.
  let dotProduct = x * randomGradient[0] + y * randomGradient[1];

  // Scale the result to the range [-1, 1].
  return dotProduct * 2 - 1;
}

function randomizeSignal(samplingRate, amplitude, duration) {
  let random_signal = [];

  for (let i = 0; i < duration * samplingRate; i++) {
    let t = i / samplingRate; // Convert index to time
    random_signal.push(amplitude * noise(t, t));
  }
  return random_signal;
}

function genFourier(d) {
  let fourier = [];
  const imginaries = d.imaginary();
  const amplitudes = d.amplitude();
  const phases = d.phase();
  const frequencies = d.frequency();

  d.real().map((re, ix) => {
    fourier.push({
      re: re,
      imag: imginaries[ix],
      amp: amplitudes[ix],
      phase: phases[ix],
      freq: frequencies[ix],
    });
  });

  // Filter our negative frequencies (they will cancel out any positive ones).
  // Our rust fft, will decompose a single sine single wave into two waves, one positive, one negative.
  // When plotted they cancel, resulting in a flat line.
  // We could adapt our drawing method to handle negative frequencies
  // (by being able to draw epicycles that rotate in the opposite direction).
  fourier = fourier.filter((item, index) => index < fourier.length / 2);

  fourier = fourier.sort((a, b) => b.amp - a.amp);
  return fourier;
}

// Requires a canvas element with id="canvas"
let canvas = new Canvas("dft_canvas");

let input_signal = randomizeSignal(11, 20, 1);
let d = compute_spectrum(input_signal);
let fourier = genFourier(d);

document.getElementById("randomize").addEventListener("click", (e) => {
  const randomSamplingRate = Math.floor(Math.random() * 20) + 1;
  const randomAmplitude = Math.floor(Math.random() * 20) + 1;
  const randomDuration = Math.floor(Math.random() * 2) + 1;
  input_signal = randomizeSignal(11, 30, 1);
  d = compute_spectrum(input_signal);
  fourier = genFourier(d);
});

// animation ticker
let time = 0;
let wave = [];

function step() {
  canvas.clear();

  let x = 120;
  let y = 120;

  // Currently, we're drawing a sine wave, our y coords represent the amplitude, the x coords represent the time.
  // We want to now plot an arbitrary signal. What do we need to do to x and y to make this happen?

  // First we init all the y coords, to represent an arbtrary signal. (later we'll swap this out with a drawing)
  // Demo signal is a sine wave.

  // Having broken down our signal, we need to loop through the fourier array, and draw a circle for each one.
  // consider sorting fourier Y by amplitude, so that we draw the largest circles first, or last depending.
  for (let i = 0; i < fourier.length; i++) {
    let prev_x = x;
    let prev_y = y;

    const freq = fourier[i].freq;
    const radius = fourier[i].amp;
    const phase = fourier[i].phase;

    x += radius * Math.cos(freq * time + phase); // consider only adding phase
    y += radius * Math.sin(freq * time + phase);

    // Circle
    canvas.circle(prev_x, prev_y, radius);

    // Perimeter point
    canvas.circle(x, y, 1);

    // Line from perimeter point to wave
    canvas.line(prev_x, prev_y, x, y);
  }

  // Draw the wave.
  const center_x = 100;
  const center_y = 100;

  wave.unshift(y);
  if (wave.length > 200) {
    wave.pop();
  }

  let shape = new Shape("dft_canvas");
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

  const dt = (0.1 * Math.PI) / fourier.length;
  time += dt;
  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
