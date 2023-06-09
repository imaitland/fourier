(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[5],{

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var fourier_front_end__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fourier-front-end */ \"../pkg/fourier_front_end.js\");\n\n\n// Requires a canvas element with id=\"canvas\"\nlet canvas = new fourier_front_end__WEBPACK_IMPORTED_MODULE_0__[\"Canvas\"](\"canvas\");\n\n// animation ticker\nlet time = 0;\nlet wave = [];\nlet sliderVal = 2;\n\ndocument.getElementById(\"slider\").addEventListener(\"input\", (e) => {\n  sliderVal = e.target.value;\n});\n\nfunction step() {\n  canvas.clear();\n\n  let x = 120;\n  let y = 120;\n\n  // Perimeter point, updated each frame, based on time. This is the fourier series, for n.\n  // where n is 1,3,5,7,9,11...\n  for (let i = 0; i < sliderVal; i++) {\n    let prev_x = x;\n    let prev_y = y;\n\n    const n = 2 * i + 1;\n    const radius = 40 * (4 / (n * Math.PI));\n\n    x += radius * Math.cos(n * time);\n    y += radius * Math.sin(n * time);\n\n    // Circle\n    canvas.circle(prev_x, prev_y, radius);\n\n    // Perimeter point\n    canvas.circle(x, y, 1);\n\n    // Line from perimeter point to wave\n    canvas.line(prev_x, prev_y, x, y);\n  }\n\n  // Wave.\n  const center_x = 100;\n  const center_y = 100;\n\n  wave.unshift(y);\n  if (wave.length > 200) {\n    wave.pop();\n  }\n\n  let shape = new fourier_front_end__WEBPACK_IMPORTED_MODULE_0__[\"Shape\"](\"canvas\");\n  let offset = 200;\n  let wave_x = center_x + offset;\n\n  shape.begin_shape(center_x + offset, center_y);\n\n  for (let i = 0; i < wave.length; i++) {\n    wave_x = center_x + offset + i;\n    shape.vertex(wave_x, wave[i]);\n  }\n\n  shape.end_shape();\n  // Line from perimeter point to wave\n  canvas.line(x, y, center_x + offset, wave[0]);\n\n  window.requestAnimationFrame(step);\n  time += 0.03;\n}\n\nwindow.requestAnimationFrame(step);\n\n\n//# sourceURL=webpack:///./index.js?");

/***/ })

}]);