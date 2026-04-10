import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Watermark } from "../components/Watermark";
import { CTA } from "../components/CTA";
import { getTheme } from "../components/ThemeProvider";

/**
 * ListReel — Numbered list reveal (Top 5 books, 3 rules, etc.)
 *
 * Structure:
 * 0–2s:   Title with accent underline
 * 2–18s:  Each item slides in with number badge
 * 18–25s: CTA + monetization
 */
export const ListReel = ({ title, items, theme, pillar, cta, monetization }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = getTheme(theme);

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Title animation
  const titleProgress = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });

  // Item timing
  const itemStart = 60;
  const itemStagger = Math.min(80, Math.floor((durationInFrames - itemStart - 210) / items.length));
  const ctaStart = itemStart + items.length * itemStagger + 30;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Background theme={theme} />
      <Watermark theme={theme} />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            color: t.accent,
            textAlign: "center",
            padding: "0 60px",
            opacity: interpolate(titleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
            textShadow: `0 0 40px ${t.accentGlow}`,
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: interpolate(titleProgress, [0, 1], [0, 300]),
            height: 3,
            background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
          }}
        />
      </div>

      {/* List items */}
      <div
        style={{
          position: "absolute",
          top: 400,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {items.map((item, i) => {
          const itemFrame = itemStart + i * itemStagger;
          const itemProgress = spring({
            frame: frame - itemFrame,
            fps,
            config: { damping: 16, stiffness: 90 },
          });

          const slideX = interpolate(itemProgress, [0, 1], [-80, 0]);
          const opacity = interpolate(itemProgress, [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                transform: `translateX(${slideX}px)`,
                opacity,
              }}
            >
              {/* Number badge */}
              <div
                style={{
                  minWidth: 72,
                  height: 72,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${t.accent}, ${t.accentGlow})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#000",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: `0 4px 20px ${t.accentGlow}`,
                }}
              >
                {i + 1}
              </div>

              {/* Item text */}
              <div
                style={{
                  fontSize: 40,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  color: t.text,
                  lineHeight: 1.3,
                  flex: 1,
                  textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>

      <CTA
        text={cta}
        monetization={monetization}
        theme={theme}
        showAtFrame={ctaStart}
        fps={fps}
      />
    </AbsoluteFill>
  );
};
