import { interpolate, useCurrentFrame, spring } from "remotion";
import { getTheme } from "./ThemeProvider";

export const CTA = ({ text, monetization, theme = "dark", showAtFrame = 600, fps = 30 }) => {
  const frame = useCurrentFrame();
  const t = getTheme(theme);

  const progress = spring({
    frame: frame - showAtFrame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  if (frame < showAtFrame) return null;

  const translateY = interpolate(progress, [0, 1], [60, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      {/* Monetization badge */}
      {monetization && (
        <div
          style={{
            background: t.cardBg,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: "16px 36px",
            fontSize: 30,
            color: t.accent,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            backdropFilter: "blur(10px)",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {monetization.text}
        </div>
      )}

      {/* Follow CTA */}
      <div
        style={{
          fontSize: 28,
          color: t.secondary,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          letterSpacing: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
};
