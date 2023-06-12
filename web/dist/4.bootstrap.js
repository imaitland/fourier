(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[4],{

/***/ "./dft.js":
/*!****************!*\
  !*** ./dft.js ***!
  \****************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var fourier_front_end__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fourier-front-end */ \"../pkg/fourier_front_end.js\");\n\n\n// A simple Perlin noise generator using 2D gradient vectors.\n// NOTE: For simplicity, this doesn't include any kind of smoothing or interpolation.\nfunction noise(x, y) {\n  // Generate a random 2D gradient vector.\n  let randomGradient = [Math.random() * 2 - 1, Math.random() * 2 - 1];\n\n  // Compute the dot product of the input coordinate and the random gradient.\n  let dotProduct = x * randomGradient[0] + y * randomGradient[1];\n\n  // Scale the result to the range [-1, 1].\n  return dotProduct * 2 - 1;\n}\n\nfunction randomizeSignal(samplingRate, amplitude, duration) {\n  let random_signal = [];\n\n  for (let i = 0; i < duration * samplingRate; i++) {\n    let t = i / samplingRate; // Convert index to time\n    random_signal.push(amplitude * noise(t, t));\n  }\n  return random_signal;\n}\n\nfunction genFourier(d) {\n  let fourier = [];\n  const imginaries = d.imaginary();\n  const amplitudes = d.amplitude();\n  const phases = d.phase();\n  const frequencies = d.frequency();\n\n  d.real().map((re, ix) => {\n    fourier.push({\n      re: re,\n      imag: imginaries[ix],\n      amp: amplitudes[ix],\n      phase: phases[ix],\n      freq: frequencies[ix],\n    });\n  });\n\n  // Filter our negative frequencies (they will cancel out any positive ones).\n  // Our rust fft, will decompose a single sine single wave into two waves, one positive, one negative.\n  // When plotted they cancel, resulting in a flat line.\n  // We could adapt our drawing method to handle negative frequencies\n  // (by being able to draw epicycles that rotate in the opposite direction).\n  fourier = fourier.filter((item, index) => index < fourier.length / 2);\n\n  fourier = fourier.sort((a, b) => b.amp - a.amp);\n  return fourier;\n}\n\n// Requires a canvas element with id=\"canvas\"\nlet canvas = new fourier_front_end__WEBPACK_IMPORTED_MODULE_0__[\"Canvas\"](\"dft_canvas\");\n\nlet input_signal = randomizeSignal(11, 20, 1);\nlet d = Object(fourier_front_end__WEBPACK_IMPORTED_MODULE_0__[\"compute_spectrum\"])(input_signal);\nlet fourier = genFourier(d);\n\ndocument.getElementById(\"randomize\").addEventListener(\"click\", (e) => {\n  const randomSamplingRate = Math.floor(Math.random() * 20) + 1;\n  const randomAmplitude = Math.floor(Math.random() * 20) + 1;\n  const randomDuration = Math.floor(Math.random() * 2) + 1;\n  input_signal = randomizeSignal(11, 30, 1);\n  d = Object(fourier_front_end__WEBPACK_IMPORTED_MODULE_0__[\"compute_spectrum\"])(input_signal);\n  fourier = genFourier(d);\n});\n\n// animation ticker\nlet time = 0;\nlet wave = [];\n\nfunction step() {\n  canvas.clear();\n\n  let x = 120;\n  let y = 120;\n\n  // Currently, we're drawing a sine wave, our y coords represent the amplitude, the x coords represent the time.\n  // We want to now plot an arbitrary signal. What do we need to do to x and y to make this happen?\n\n  // First we init all the y coords, to represent an arbtrary signal. (later we'll swap this out with a drawing)\n  // Demo signal is a sine wave.\n\n  // Having broken down our signal, we need to loop through the fourier array, and draw a circle for each one.\n  // consider sorting fourier Y by amplitude, so that we draw the largest circles first, or last depending.\n  for (let i = 0; i < fourier.length; i++) {\n    let prev_x = x;\n    let prev_y = y;\n\n    const freq = fourier[i].freq;\n    const radius = fourier[i].amp;\n    const phase = fourier[i].phase;\n\n    x += radius * Math.cos(freq * time + phase); // consider only adding phase\n    y += radius * Math.sin(freq * time + phase);\n\n    // Circle\n    canvas.circle(prev_x, prev_y, radius);\n\n    // Perimeter point\n    canvas.circle(x, y, 1);\n\n    // Line from perimeter point to wave\n    canvas.line(prev_x, prev_y, x, y);\n  }\n\n  // Draw the wave.\n  const center_x = 100;\n  const center_y = 100;\n\n  wave.unshift(y);\n  if (wave.length > 200) {\n    wave.pop();\n  }\n\n  let shape = new fourier_front_end__WEBPACK_IMPORTED_MODULE_0__[\"Shape\"](\"dft_canvas\");\n  let offset = 200;\n  let wave_x = center_x + offset;\n\n  shape.begin_shape(center_x + offset, center_y);\n\n  for (let i = 0; i < wave.length; i++) {\n    wave_x = center_x + offset + i;\n    shape.vertex(wave_x, wave[i]);\n  }\n\n  shape.end_shape();\n  // Line from perimeter point to wave\n  canvas.line(x, y, center_x + offset, wave[0]);\n\n  const dt = (0.1 * Math.PI) / fourier.length;\n  time += dt;\n  window.requestAnimationFrame(step);\n}\n\nwindow.requestAnimationFrame(step);\n\n\n//# sourceURL=webpack:///./dft.js?");

/***/ })

}]);