import { useEffect, useMemo } from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { EASES } from "./motion-presets";
import "./styles/gradient-text.css";

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const mixRgb = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

function sampleStops(stops, t) {
  t = clamp(t);
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i].at) {
      const a = stops[i - 1];
      const b = stops[i];
      const k = (t - a.at) / (b.at - a.at || 1);
      return mixRgb(a.rgb, b.rgb, k);
    }
  }
  return stops[stops.length - 1].rgb;
}

/** map a glyph's position (0..1 across the line) into the colour band */
const bandT = (p, band) => clamp((p - band) / (1 - band));

const SPRINGS = {
  typewriter: { stiffness: 460, damping: 36, mass: 0.55 },
  sweep: { stiffness: 320, damping: 32, mass: 0.7 },
  pop: { stiffness: 260, damping: 18, mass: 0.8 },
};

const DURATIONS = { typewriter: 2.5, sweep: 2.9, pop: 2.1 };

/** how far along this glyph's own entrance is, 0..1 */
function arrival(mode, v, p, s) {
  if (mode === "sweep") return clamp((v * 1.3 - p) / 0.26);
  if (mode === "pop") return clamp((v - s * 0.62) / 0.38);
  return clamp((v - s * 0.86) / 0.14);
}

function Glyph({
  ch,
  mode,
  index,
  count,
  progress,
  band,
  stops,
  rtl,
  shineColor,
  shinePos,
  shineAmt,
}) {
  const p = (index + 0.5) / count;
  const s = index / count;

  const raw = useTransform(progress, (v) =>
    rtl ? arrival(mode, v, 1 - p, 1 - s) : arrival(mode, v, p, s)
  );
  const local = useSpring(raw, SPRINGS[mode]);
  const eased = useTransform(local, easeOutCubic);

  const opacity = useTransform(eased, (e) => clamp(e * 1.8));
  const blur = useTransform(eased, (e) => (1 - e) * 11);
  const y = useTransform(eased, (e) => (1 - e) * 0.34);
  const scale = useTransform(eased, (e) => 1 + (1 - e) * 0.07);
  const filter = useTransform(blur, (b) => (b < 0.06 ? "none" : `blur(${b.toFixed(2)}px)`));

  const color = useTransform(
    [eased, band, shinePos, shineAmt],
    ([e, b, sp, sa]) => {
      const target = sampleStops(stops, bandT(p, b));

      // brief colour flash as the glyph lands
      const land = e > 0 ? Math.exp(-Math.pow((e - 0.84) / 0.3, 2)) : 0;
      let c = mixRgb(target, sampleStops(stops, bandT(p + 0.16, b)), 0.5 * land);

      // looping specular highlight travelling across the finished line
      if (sa > 0.01) {
        const d = (p - sp) / 0.07;
        c = mixRgb(c, shineColor, 0.26 * Math.exp(-d * d) * sa);
      }
      return `rgb(${c[0] | 0} ${c[1] | 0} ${c[2] | 0})`;
    }
  );

  return (
    <motion.span className="glyph" style={{ opacity, filter, y, scale, color }}>
      {ch}
    </motion.span>
  );
}

function Shimmer({ phase, on }) {
  useAnimationFrame((_, delta) => {
    if (!on) return;
    phase.set((phase.get() + delta / 3600) % 1);
  });
  return null;
}

export default function GradientText({
  text,
  mode = "typewriter",
  stops,
  bandBase = 0.76,
  runKey = 0,
  shine = true,
  shineColor = [255, 255, 255],
  pointerBand = true,
  reduced = false,
  duration: durationProp,
  ease = "Ease Out",
  repeat = false,
  rtl = false,
}) {
  const chars = useMemo(() => [...text], [text]);
  const count = chars.length || 1;
  const duration = durationProp ?? DURATIONS[mode] ?? DURATIONS.typewriter;

  const progress = useMotionValue(0);
  const bandRaw = useMotionValue(bandBase);
  const band = useSpring(bandRaw, { stiffness: 110, damping: 20, mass: 0.7 });
  const phase = useMotionValue(0);
  const shineAmt = useMotionValue(0);
  const shinePos = useTransform(phase, (v) => -0.15 + v * 1.35);

  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration,
      ease: EASES[ease] ?? EASES["Ease Out"],
      repeat: repeat ? Infinity : 0,
      repeatDelay: 0.5,
    });
    return () => controls.stop();
  }, [runKey, duration, ease, repeat, reduced, progress, text]);

  useEffect(() => {
    shineAmt.set(reduced || !shine ? 0 : 1);
  }, [shine, reduced, shineAmt]);

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    bandRaw.set(clamp(bandBase - nx * 0.34, 0.3, 0.95));
  };

  return (
    <div
      className="line"
      onPointerMove={pointerBand ? handleMove : undefined}
      onPointerLeave={pointerBand ? () => bandRaw.set(bandBase) : undefined}
    >
      <Shimmer phase={phase} on={shine && !reduced} />
      {chars.map((ch, i) =>
        ch === " " ? (
          <span key={i} className="gap" />
        ) : (
          <Glyph
            key={i}
            ch={ch}
            mode={mode}
            index={i}
            count={count}
            progress={progress}
            band={band}
            stops={stops}
            rtl={rtl}
            shineColor={shineColor}
            shinePos={shinePos}
            shineAmt={shineAmt}
          />
        )
      )}
    </div>
  );
}
