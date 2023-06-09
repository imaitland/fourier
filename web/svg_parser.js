// load my_svg.svg and parse it
// return a list of objects with the following properties:
//   - type: 'path' or 'circle'
//   - x: x coord
//   - y: y coord
//   - r: radius (if circle)
//   - d: path data (if path)
//


// parse svg path data to x,y coords
// https://stackoverflow.com/questions/5634460/quadratic-bezier-curve-calculate-points
// https://www.w3.org/TR/SVG/paths.html#PathDataQuadraticBezierCommands
// https://www.w3.org/TR/SVG/paths.html#PathDataCubicBezierCommands
// https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
// https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
// https://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
// https://www.w3.org/TR/SVG/implnote.html#ArcParameterizationAlternatives



// https://www.w3.org/TR/SVG/paths.html#PathDataGeneralInformation
// https://www.w3.org/TR/SVG/paths.html#PathDataMovetoCommands
