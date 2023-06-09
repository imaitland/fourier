import * as wasm from "./fourier_front_end_bg.wasm";
import { __wbg_set_wasm } from "./fourier_front_end_bg.js";
__wbg_set_wasm(wasm);
export * from "./fourier_front_end_bg.js";
