/* tslint:disable */
/* eslint-disable */
/**
* @param {Float64Array} signal
* @returns {Spectrum}
*/
export function compute_spectrum(signal: Float64Array): Spectrum;
/**
* @param {any} sig
* @returns {Spectrum}
*/
export function compute_spectrum_js(sig: any): Spectrum;
/**
*/
export class Canvas {
  free(): void;
/**
* @param {string} canvas_id
*/
  constructor(canvas_id: string);
/**
* @returns {number}
*/
  width(): number;
/**
* @returns {number}
*/
  height(): number;
/**
* @param {number} x1
* @param {number} y1
* @param {number} x2
* @param {number} y2
*/
  line(x1: number, y1: number, x2: number, y2: number): void;
/**
* @param {number} x
* @param {number} y
*/
  move_to(x: number, y: number): void;
/**
* @param {number} x
* @param {number} y
*/
  pan_to(x: number, y: number): void;
/**
* @param {number} x
* @param {number} y
* @param {number} radius
*/
  circle(x: number, y: number, radius: number): void;
/**
*/
  clear(): void;
/**
* @param {number} x
* @param {number} y
* @param {number} radius
* @param {number} start_angle
* @param {number} end_angle
*/
  arc(x: number, y: number, radius: number, start_angle: number, end_angle: number): void;
}
/**
*/
export class Shape {
  free(): void;
/**
* @param {string} canvas_id
*/
  constructor(canvas_id: string);
/**
* @param {number} x
* @param {number} y
*/
  begin_shape(x: number, y: number): void;
/**
* @param {number} x
* @param {number} y
*/
  vertex(x: number, y: number): void;
/**
* @param {number} x
* @param {number} y
*/
  move_to(x: number, y: number): void;
/**
* @param {number} stroke_width
*/
  end_shape(stroke_width: number): void;
}
/**
*/
export class Spectrum {
  free(): void;
/**
* @param {Float64Array} frequency
* @param {Float64Array} real
* @param {Float64Array} imaginary
* @param {Float64Array} amplitude
* @param {Float64Array} phase
* @returns {Spectrum}
*/
  static new(frequency: Float64Array, real: Float64Array, imaginary: Float64Array, amplitude: Float64Array, phase: Float64Array): Spectrum;
/**
* @returns {Float64Array}
*/
  frequency(): Float64Array;
/**
* @returns {Float64Array}
*/
  real(): Float64Array;
/**
* @returns {Float64Array}
*/
  imaginary(): Float64Array;
/**
* @returns {Float64Array}
*/
  amplitude(): Float64Array;
/**
* @returns {Float64Array}
*/
  phase(): Float64Array;
}
