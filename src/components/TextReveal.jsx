import { interpolate, useCurrentFrame, spring } from "remotion";
import { getTheme } from "./ThemeProvider";

/**
 * Animated text reveal with spring physics
 * Each line fades+slides in sequentially
 */
export const TextReveal = ({
  lines,
  startFrame = 0,
  staggerFrames = 25,
  theme = "dark",
  fontSize = 52,
  fontWeight = 700,
  align = "center",
  maxWidth = 900,
  lineHeight = 1.4,
  fps = 30,
  accentFirst = false,
}) => {
  const frame = useCurrentFrame();
  const t = getTheme(theme);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: fontSize * 0.3,
        maxWidth,
        padding: "0 60px",
      }}
    >
      {lines.map((line, i) => {
        const lineStart = startFrame + i * staggerFrames;
        const progress = spring({
          frame: frame - lineStart,
          fps,
          config: { damping: 18, stiffness: 100 },
        });

        const translateY = interpolate(progress, [0, 1], [40, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        const isAccent = accentFirst && i === 0;

        return (
          <div
            key={i}
            style={{
              fontSize: isAccent ? fontSize * 1.15 : fontSize,
              fontWeight: isAccent ? 800 : fontWeight,
              fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
              color: isAccent ? t.accent : t.text,
              textAlign: align,
              lineHeight,
              transform: `translateY(${translateY}px)`,
              opacity,
              textShadow: isAccent
                ? `0 0 40px ${t.accentGlow}`
                : "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
