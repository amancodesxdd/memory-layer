export const EASES = {
  "Ease Out": [0.33, 1, 0.68, 1],
  "Ease In Out": [0.65, 0, 0.35, 1],
  Linear: [0, 0, 1, 1],
  "Back Out": [0.34, 1.56, 0.64, 1],
};

export const EASE_NAMES = Object.keys(EASES);

export const DEFAULT_SETTINGS = {
  variant: 0,
  duration: 0.7,
  ease: "Ease Out",
  repeat: false,
  showNeighbors: true,
  prefixGap: 12,
  itemHeight: 80,
  stiffness: 280,
  matrixPreset: 0,
  pixelSize: 12,
  pixelGap: 3,
  matrixFps: 12,
  brightness: 1,
};

/** map an easing name + duration onto a spring config */
export function springFor(name, duration = 0.6) {
  const t = Math.max(0.15, Math.min(2, duration));
  const mood = {
    "Ease Out": 1,
    "Ease In Out": 0.82,
    Linear: 1.18,
    "Back Out": 0.7,
  }[name] ?? 1;

  return {
    type: "spring",
    stiffness: Math.round((300 / t) * mood),
    damping: Math.round((26 / Math.sqrt(t)) * (name === "Back Out" ? 0.82 : 1)),
    mass: 0.8,
  };
}

export const VARIANTS = {
  text: ["Dia LTR", "Dia RTL"],
  tabs: ["Comfortable", "Compact"],
  team: ["Wide fan", "Tight fan"],
  pins: ["Pinned on top", "Pinned on bottom"],
  input: ["Line cursor", "Block cursor", "Glow cursor"],
  card: ["Success badge", "Warning badge"],
  count: ["Animated", "Static"],
  faq: ["Comfortable", "Compact"],
  snap: ["Springy", "Calm"],
  matrix: ["Digits", "Loader", "Pulse", "Wave", "Snake", "VU meter"],
};

export const variantFor = (controls) => VARIANTS[controls] ?? VARIANTS.text;