mod utils;
use js_sys::Array;
use num::Complex;
use std::f64;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;

use serde::{Deserialize, Serialize};

use num::complex::Complex64;
use rustfft::FftPlanner;
use svg;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Shape {
    context: CanvasRenderingContext2d,
    started: bool,
    last_point: Option<(f64, f64)>,
}

#[wasm_bindgen]
impl Shape {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas_id: &str) -> Self {
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
        let canvas = document.get_element_by_id(canvas_id).unwrap();
        let canvas: web_sys::HtmlCanvasElement =
            canvas.dyn_into::<web_sys::HtmlCanvasElement>().unwrap();
        let context = canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()
            .unwrap();

        Self {
            context: context,
            started: false,
            last_point: None,
        }
    }

    pub fn begin_shape(&mut self, x: f64, y: f64) {
        self.context.move_to(x, y);
        self.context.begin_path();
        self.started = true;
        self.last_point = Some((x, y));
    }

    pub fn vertex(&mut self, x: f64, y: f64) {
        if !self.started {
            return;
        }
        self.context.line_to(x, y);
        // Turn this off to see a line from the origin to the first vertex, to the current vertex
        self.context.move_to(x, y);
    }

    pub fn move_to(&mut self, x: f64, y: f64) {
        if !self.started {
            return;
        }
        self.context.move_to(x, y);
    }

    pub fn end_shape(&mut self) {
        self.context.close_path();
        self.context.stroke();
        self.started = false;
    }
}

#[wasm_bindgen]
pub struct Canvas {
    context: CanvasRenderingContext2d,
}

#[wasm_bindgen]
impl Canvas {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas_id: &str) -> Self {
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
        let canvas = document.get_element_by_id(canvas_id).unwrap();
        let canvas: web_sys::HtmlCanvasElement =
            canvas.dyn_into::<web_sys::HtmlCanvasElement>().unwrap();
        let context = canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()
            .unwrap();

        Self { context: context }
    }

    pub fn line(&self, x1: f64, y1: f64, x2: f64, y2: f64) {
        self.context.begin_path();
        self.context.move_to(x1, y1);
        self.context.line_to(x2, y2);
        self.context.stroke();
    }

    pub fn move_to(&self, x: f64, y: f64) {
        self.context.move_to(x, y);
    }

    pub fn circle(&self, x: f64, y: f64, radius: f64) {
        self.context.begin_path();
        self.context
            .arc(x, y, radius, 0.0, 2.0 * std::f64::consts::PI)
            .unwrap();
        self.context.stroke();
    }

    pub fn clear(&self) {
        let canvas = self.context.canvas().unwrap();
        let width = canvas.width() as f64;
        let height = canvas.height() as f64;
        self.context.clear_rect(0.0, 0.0, width, height);
    }
}

#[wasm_bindgen]
pub struct Spectrum {
    frequency: Vec<f64>,
    real: Vec<f64>,
    imaginary: Vec<f64>,
    amplitude: Vec<f64>,
    phase: Vec<f64>,
}

#[wasm_bindgen]
impl Spectrum {
    pub fn new(
        frequency: Vec<f64>,
        real: Vec<f64>,
        imaginary: Vec<f64>,
        amplitude: Vec<f64>,
        phase: Vec<f64>,
    ) -> Spectrum {
        Spectrum {
            frequency,
            real,
            imaginary,
            amplitude,
            phase,
        }
    }

    // getters for each component
    pub fn frequency(&self) -> Vec<f64> {
        self.frequency.clone()
    }

    pub fn real(&self) -> Vec<f64> {
        self.real.clone()
    }

    pub fn imaginary(&self) -> Vec<f64> {
        self.imaginary.clone()
    }

    pub fn amplitude(&self) -> Vec<f64> {
        self.amplitude.clone()
    }

    pub fn phase(&self) -> Vec<f64> {
        self.phase.clone()
    }
}

#[wasm_bindgen]
pub fn compute_spectrum(signal: &[f64]) -> Spectrum {
    let n_samples = signal.len();
    let mut planner = FftPlanner::new();
    let fft = planner.plan_fft_forward(n_samples);

    let mut buffer: Vec<Complex64> = signal.iter().map(|&x| Complex64::new(x, 0.0)).collect();

    fft.process(&mut buffer);

    let mut frequency = Vec::new();
    let mut real = Vec::new();
    let mut imaginary = Vec::new();
    let mut amplitude = Vec::new();
    let mut phase = Vec::new();

    for (i, &c) in buffer.iter().enumerate() {
        frequency.push(i as f64);
        real.push(c.re);
        imaginary.push(c.im);
        amplitude.push(2.0 * c.norm() / n_samples as f64);
        phase.push(c.arg());
    }

    Spectrum::new(frequency, real, imaginary, amplitude, phase)
}

#[derive(Serialize, Deserialize)]
pub struct InputSignal {
    pub sig: Vec<(f64, f64)>,
}

#[wasm_bindgen]
pub fn compute_spectrum_js(sig: JsValue) -> Spectrum {
    let signal: InputSignal = serde_wasm_bindgen::from_value::<InputSignal>(sig).unwrap();
    compute_complex_spectrum(signal.sig)
}

// takes an array of arrays of length 2 with the first element being the real part and the second element being the imaginary part
pub fn compute_complex_spectrum(sig: Vec<(f64, f64)>) -> Spectrum {
    let n_samples: usize = sig.len();

    let mut planner: FftPlanner<_> = FftPlanner::new();
    let fft = planner.plan_fft_forward(n_samples);

    let mut buffer: Vec<Complex<f64>> = sig
        .into_iter()
        .map(|x: (f64, f64)| Complex::new(x.0, x.1))
        .collect();

    fft.process(&mut buffer);

    let mut frequency = Vec::new();
    let mut real = Vec::new();
    let mut imaginary = Vec::new();
    let mut amplitude = Vec::new();
    let mut phase = Vec::new();

    for (i, &c) in buffer.iter().enumerate() {
        frequency.push(i as f64);
        real.push(c.re);
        imaginary.push(c.im);
        amplitude.push(2.0 * c.norm() / n_samples as f64);
        phase.push(c.arg());
    }

    Spectrum::new(frequency, real, imaginary, amplitude, phase)
}
