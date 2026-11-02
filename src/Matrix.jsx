import { forwardRef, useEffect, useMemo, useState } from "react";
import "./styles/matrix.css";
import {
  clamp,
  ensureFrameSize,
  useAnimation,
  vu,
} from "./components/matrix-constants";

/**
 * A retro dot-matrix display with circular cells, radial-glow pixels and
 * smooth frame transitions. Ported from ElevenLabs UI / unlumen UI.
 */
export const Matrix = forwardRef(function Matrix(
  {
    rows,
    cols,
    pattern,
    frames,
    fps = 12,
    autoplay = true,
    loop = true,
    size = 10,
    gap = 2,
    palette = {
      on: "currentColor",
      off: "var(--muted-foreground)",
    },
    brightness = 1,
    ariaLabel,
    onFrame,
    mode = "default",
    levels,
    reduced = false,
    className,
    ...props
  },
  ref
) {
  const { frameIndex } = useAnimation(frames, {
    fps,
    autoplay: autoplay && !pattern && !reduced,
    loop,
    onFrame,
  });

  const currentFrame = useMemo(() => {
    if (mode === "vu" && levels && levels.length > 0) {
      return ensureFrameSize(vu(cols, levels), rows, cols);
    }
    if (pattern) return ensureFrameSize(pattern, rows, cols);
    if (frames && frames.length > 0) {
      return ensureFrameSize(frames[frameIndex] || frames[0], rows, cols);
    }
    return ensureFrameSize([], rows, cols);
  }, [pattern, frames, frameIndex, rows, cols, mode, levels]);

  const cellPositions = useMemo(() => {
    const positions = [];
    for (let row = 0; row < rows; row++) {
      positions[row] = [];
      for (let col = 0; col < cols; col++) {
        positions[row][col] = {
          x: col * (size + gap),
          y: row * (size + gap),
        };
      }
    }
    return positions;
  }, [rows, cols, size, gap]);

  const svgDimensions = useMemo(
    () => ({
      width: cols * (size + gap) - gap,
      height: rows * (size + gap) - gap,
    }),
    [rows, cols, size, gap]
  );

  const isAnimating = !pattern && frames && frames.length > 0;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={ariaLabel ?? "matrix display"}
      aria-live={isAnimating ? "polite" : undefined}
      className={`matrix ${reduced && "reduced"} ${className || ""}`.trim()}
      style={{
        "--matrix-on": palette.on,
        "--matrix-off": palette.off,
        "--matrix-gap": `${gap}px`,
        "--matrix-size": `${size}px`,
      }}
      {...props}
    >
      <svg
        width={svgDimensions.width}
        height={svgDimensions.height}
        viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="matrix-svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id="matrix-pixel-on" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--matrix-on)" stopOpacity="1" />
            <stop offset="70%" stopColor="var(--matrix-on)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--matrix-on)" stopOpacity="0.6" />
          </radialGradient>

          <radialGradient id="matrix-pixel-off" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor="var(--muted-foreground)"
              stopOpacity="1"
            />
            <stop
              offset="100%"
              stopColor="var(--muted-foreground)"
              stopOpacity="0.7"
            />
          </radialGradient>

          <filter id="matrix-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {currentFrame.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const pos = cellPositions[rowIndex]?.[colIndex];
            if (!pos) return null;

            const opacity = clamp(brightness * value);
            const isActive = opacity > 0.5;
            const isOn = opacity > 0.05;
            const fill = isOn
              ? "url(#matrix-pixel-on)"
              : "url(#matrix-pixel-off)";

            const scale = isActive ? 1.1 : 1;
            const radius = (size / 2) * 0.9;

            return (
              <circle
                key={`${rowIndex}-${colIndex}`}
                className={
                  "matrix-pixel" +
                  (isActive ? " matrix-pixel-active" : "") +
                  (!isOn ? " matrix-pixel-off" : "")
                }
                cx={pos.x + size / 2}
                cy={pos.y + size / 2}
                r={radius}
                fill={fill}
                opacity={isOn ? opacity : undefined}
                style={{ transform: `scale(${scale})` }}
              />
            );
          })
        )}
      </svg>
    </div>
  );
});

Matrix.displayName = "Matrix";

/* ------------------------------ site helpers ------------------------------ */

/** Live VU meter — random levels for demo purposes. */
export function MatrixVuDemo({
  rows = 7,
  cols = 8,
  size = 12,
  gap = 3,
  brightness = 1,
  reduced = false,
}) {
  const [levels, setLevels] = useState(() =>
    Array.from({ length: cols }, () => 0.4 + Math.random() * 0.5)
  );

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setLevels((prev) =>
        prev.map((v) => {
          const next = v + (Math.random() - 0.5) * 0.55;
          return Math.max(0.08, Math.min(1, next));
        })
      );
    }, 240);
    return () => clearInterval(id);
  }, [reduced, cols]);

  return (
    <Matrix
      rows={rows}
      cols={cols}
      mode="vu"
      levels={levels}
      size={size}
      gap={gap}
      brightness={brightness}
      reduced={reduced}
      ariaLabel="vu meter"
    />
  );
}
