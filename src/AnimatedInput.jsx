import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./styles/animated-input.css";

/* ---------------------------------------------------------------- presets */

const CHAR = {
  spring: {
    hidden: { opacity: 0, y: -10, scale: 0.86 },
    show: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 6, scale: 0.9 },
  },
  bounce: {
    hidden: { opacity: 0, y: -22, scale: 0.4 },
    show: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.4 },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    hidden: { opacity: 0, x: -12 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 12 },
  },
  wave: {
    hidden: { opacity: 0, scale: 0.6, y: 8 },
    show: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.7 },
  },
  typewriter: {
    hidden: { opacity: 0, scaleY: 0.15, scaleX: 0.7 },
    show: { opacity: 1, scaleY: 1, scaleX: 1 },
    exit: { opacity: 0 },
  },
};

const SPRING_PRESET = {
  spring: { type: "spring", stiffness: 520, damping: 26 },
  bounce: { type: "spring", stiffness: 380, damping: 12 },
  fade: { duration: 0.18 },
  slide: { type: "spring", stiffness: 420, damping: 30 },
  wave: { type: "spring", stiffness: 340, damping: 18 },
  typewriter: { duration: 0.12 },
};

const NBSP = "\u00A0";

/* ------------------------------------------------------------- component */

export default function AnimatedInput({
  color = "hsl(220, 100%, 60%)",
  caretWidth = 2,
  radius = 2,
  cursorVariant = "line",
  charAnimation = "spring",
  inputVariant = "default",
  multiline = false,
  limitToWidth = true,
  value,
  defaultValue = "",
  onChange,
  placeholder,
  autoType = false,
  autoText = "Ship it, then ship it better.",
  caretSpring,
  className = "",
}) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const text = controlled ? value : inner;

  const fieldRef = useRef(null);
  const layerRef = useRef(null);
  const charRefs = useRef([]);

  const [focused, setFocused] = useState(false);
  const [typing, setTyping] = useState(false);
  const [newFrom, setNewFrom] = useState(Infinity);
  const [caret, setCaret] = useState({ x: 0, w: caretWidth, sel: null });
  const [scale, setScale] = useState(1);

  const emit = useCallback(
    (next) => {
      if (!controlled) setInner(next);
      if (onChange) onChange(next);
    },
    [controlled, onChange]
  );

  useEffect(() => {
    if (!autoType || controlled) return;
    let i = 0;
    let timer;
    const tick = () => {
      i += 1;
      setInner(autoText.slice(0, i));
      if (i < autoText.length) timer = setTimeout(tick, 420);
    };
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [autoType, autoText, controlled]);

  const prevLen = useRef(text.length);
  useEffect(() => {
    if (text.length > prevLen.current) setNewFrom(prevLen.current);
    prevLen.current = text.length;
  }, [text]);

  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setTyping(false), 420);
    return () => clearTimeout(t);
  }, [typing, text]);

  const readMetrics = useCallback(() => {
    const field = fieldRef.current;
    const layer = layerRef.current;
    if (!field || !layer) return;

    const start = field.selectionStart == null ? text.length : field.selectionStart;
    const end = field.selectionEnd == null ? start : field.selectionEnd;

    const at = (idx) => {
      const node = charRefs.current[idx];
      return node ? { left: node.offsetLeft, width: node.offsetWidth } : null;
    };

    const a = at(start);
    const b = end > start ? at(end - 1) : null;

    const x = a ? a.left + (end > start ? a.width : 0) : 0;
    const w = Math.max(
      caretWidth,
      cursorVariant === "block" ? (a ? a.width : caretWidth) : caretWidth
    );
    const sel =
      end > start && a && b ? { x: a.left, w: b.left + b.width - a.left } : null;

    setCaret((prev) =>
      prev.x === x &&
      prev.w === w &&
      prev.sel &&
      prev.sel.x === sel?.x &&
      prev.sel.w === sel?.w
        ? prev
        : { x, w, sel }
    );

    let next = 1;
    if (limitToWidth && !multiline) {
      const avail = field.clientWidth - 2;
      const used = layer.scrollWidth;
      next = used > avail && used > 0 ? Math.max(0.5, avail / used) : 1;
    }
    setScale((prev) => (prev === next ? prev : next));
  }, [text, caretWidth, cursorVariant, limitToWidth, multiline]);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(readMetrics);
    return () => cancelAnimationFrame(id);
  }, [readMetrics, focused]);

  useEffect(() => {
    const onResize = () => readMetrics();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [readMetrics]);

  const spring = caretSpring || SPRING_PRESET[charAnimation] || SPRING_PRESET.spring;
  const v = CHAR[charAnimation] || CHAR.spring;
  const chars = useMemo(() => [...text], [text]);
  const showPlaceholder = text.length === 0 && placeholder;

  const caretClass = [
    "ai-caret",
    `v-${cursorVariant}`,
    focused ? "on" : "",
    typing ? "typing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const Field = multiline ? "textarea" : "input";

  return (
    <div className={`ai ${inputVariant} ${className}`} style={{ "--ai-color": color }}>
      <div className="ai-shell">
        <div
          className="ai-layer"
          ref={layerRef}
          style={{ transform: `scale(${scale})` }}
          aria-hidden="true"
        >
          {showPlaceholder && <span className="ai-placeholder">{placeholder}</span>}

          <AnimatePresence initial={false}>
            {chars.map((ch, i) => {
              const isNew = i >= newFrom;
              return (
                <motion.span
                  key={i}
                  ref={(node) => {
                    charRefs.current[i] = node;
                  }}
                  className={ch === " " ? "ai-ch ai-space" : "ai-ch"}
                  initial={isNew ? v.hidden : v.show}
                  animate={v.show}
                  exit={v.exit}
                  transition={spring}
                >
                  {ch === " " ? NBSP : ch}
                </motion.span>
              );
            })}
          </AnimatePresence>

          {caret.sel && (
            <motion.span
              className="ai-sel"
              style={{ borderRadius: radius, background: color }}
              initial={false}
              animate={{ x: caret.sel.x, width: caret.sel.w }}
              transition={spring}
            />
          )}

          {focused && (
            <motion.span
              className={caretClass}
              style={{
                x: caret.x,
                width: caret.w,
                borderRadius: radius,
                background: cursorVariant === "underline" ? color : undefined,
                boxShadow:
                  cursorVariant === "glow" ? `0 0 12px 2px ${color}` : undefined,
              }}
              initial={false}
              animate={{ height: cursorVariant === "underline" ? 2 : "1.18em" }}
              transition={spring}
            />
          )}
        </div>

        <Field
          ref={fieldRef}
          className="ai-field"
          rows={multiline ? 3 : undefined}
          value={text}
          onChange={(e) => {
            emit(e.target.value);
            setNewFrom(0);
            setTyping(true);
          }}
          onKeyUp={readMetrics}
          onClick={readMetrics}
          onSelect={readMetrics}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder=""
          spellCheck="false"
          style={{ caretColor: "transparent" }}
        />
      </div>
    </div>
  );
}