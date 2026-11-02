export function hexToRgb(hex) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function makeStops(list) {
  return list.map(([at, color]) => ({ at, rgb: hexToRgb(color) }));
}

export const INK = hexToRgb("#1b1b1f");

export const PALETTES = {
  dia: {
    label: "Dia",
    stops: makeStops([
      [0.0, "#1b1b1f"],
      [0.06, "#1b1b1f"],
      [0.3, "#3f74f4"],
      [0.52, "#6b62f2"],
      [0.7, "#a06fe8"],
      [0.85, "#dd85a6"],
      [0.94, "#f5a340"],
      [1.0, "#f07c2c"],
    ]),
  },
  aurora: {
    label: "Aurora",
    stops: makeStops([
      [0.0, "#12141c"],
      [0.06, "#12141c"],
      [0.32, "#12d6a0"],
      [0.55, "#2fd0f5"],
      [0.75, "#8b8cf8"],
      [0.9, "#e879c8"],
      [1.0, "#f9a8d4"],
    ]),
  },
  ember: {
    label: "Ember",
    stops: makeStops([
      [0.0, "#1a1614"],
      [0.06, "#1a1614"],
      [0.28, "#ef4444"],
      [0.5, "#f97316"],
      [0.7, "#fbbf24"],
      [0.88, "#fde047"],
      [1.0, "#f4f1a0"],
    ]),
  },
};

/** default colours for the "custom" gradient option */
export const CUSTOM_PRESET = [
  "#3f74f4",
  "#6b62f2",
  "#a06fe8",
  "#dd85a6",
  "#f5a340",
];

/** build a stops array from an arbitrary list of hex colours */
export function makeCustomStops(colors) {
  const list = colors.length ? colors : CUSTOM_PRESET;
  const n = list.length;
  const seq = [
    [0.0, "#000000"],
    [0.06, "#000000"],
  ];
  list.forEach((color, i) => {
    const at = n === 1 ? 1 : 0.3 + 0.7 * (i / (n - 1));
    seq.push([at, color]);
  });
  return makeStops(seq);
}

export const rgbToCss = (rgb) => `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;

/** the first two stops are the "plain ink" end of the band — swap them per theme */
export function withInk(stops, inkHex) {
  const rgb = hexToRgb(inkHex);
  return stops.map((s, i) => (i <= 1 ? { at: s.at, rgb } : s));
}

export function stopsToCss(stops) {
  return `linear-gradient(90deg, ${stops
    .map((s) => `${rgbToCss(s.rgb)} ${(s.at * 100).toFixed(1)}%`)
    .join(", ")})`;
}