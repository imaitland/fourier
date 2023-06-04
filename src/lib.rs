mod utils;
use std::f64;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::CanvasRenderingContext2d;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

fn get_canvas() -> web_sys::HtmlCanvasElement {
    let document = web_sys::window().unwrap().document().unwrap();

    let canvas = document.get_element_by_id("canvas").unwrap();
    let canvas: web_sys::HtmlCanvasElement = canvas
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .map_err(|_| ())
        .unwrap();

    canvas
}

fn get_canvas_context() -> web_sys::CanvasRenderingContext2d {
    let canvas = get_canvas();

    let context: web_sys::CanvasRenderingContext2d = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()
        .unwrap();

    context
}

#[wasm_bindgen]
pub struct Shape {
    context: CanvasRenderingContext2d,
    started: bool,
    last_point: Option<(f64, f64)>,
}

#[wasm_bindgen]
impl Shape {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let context = get_canvas_context();

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
    pub fn new() -> Self {
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
        let canvas = document.get_element_by_id("canvas").unwrap();
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
