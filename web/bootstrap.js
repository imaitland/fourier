// A dependency graph that contains any wasm must all be imported
// asynchronously. This `bootstrap.js` file does the single async import, so
// that no one else needs to worry about it again.
import("./index.js").catch((e) =>
  console.error("Error importing `index.js`:", e)
);
/*
import("./dft.js").catch((e) => console.error("Error importing `dft.js`:", e));
import("./dft_complex.js").catch((e) =>
  console.error("Error importing `dft_complex.js`:", e)
);
import("./dft_svg.js").catch((e) =>
  console.error("Error importing `dft_svg.js`:", e)
);
*/
import("./dft_logo.js").catch((e) =>
  console.error("Error importing `dft_logo.js`:", e)
);
/*
import("./dft_iain.js").catch((e) =>
  console.error("Error importing `dft_iain.js`:", e)
);
*/
