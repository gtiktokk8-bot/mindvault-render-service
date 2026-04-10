import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Watermark } from "../components/Watermark";
import { CTA } from "../components/CTA";
import { getTheme } from "../components/ThemeProvider";

/**
 * HookReel — Big bold hook line that shakes/pulses, then reveals supporting text
 *
 * Structure:
 * 0–3s:   Hook line slams in with scale bounce
 * 3–5s:   Brief pause (let it sink in)
 * 5–20s:  Reveal lines one by one
 * 20–25s: CTA + monetization
 */
export const HookReel = ({ hookLine, revealLines, theme, pillar, cta, monetization }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = getTheme(theme);

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Hook slam animation
  const hookProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 8, stiffness: 200, mass: 1.5 },
  });
  const hookScale = interpolate(hookProgress, [0, 1], [2.5, 1]);
  const hookOpacity = interpolate(hookProgress, [0, 1], [0, 1]);

  // Pulse effect on hook after landing
  const pulsePhase = Math.sin((frame - 90) * 0.08) * 0.02;
  const hookFinalScale = frame > 90 ? 1 + pulsePhase : hookScale;

  // Accent flash behind hook
  const flashOpacity =
    frame > 20 && frame < 50
      ? interpolate(frame, [20, 30, 50], [0, 0.4, 0], { extrapolateRight: "clamp" })
      : 0;

  // Reveal lines
  const revealStart = 150;
  const revealStagger = Math.min(75, Math.floor((durationInFrames - revealStart - 210) / revealLines.length));
  const ctaStart = revealStart + revealLines.length * revealStagger + 30;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Background theme={theme} />
      <Watermark theme={theme} />

      {/* Flash effect */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${t.accent} 0%, transparent 70%)`,
          filter: "blur(60px)",
          opacity: flashOpacity,
        }}
      />

      {/* Hook line — center screen, big and bold */}
      <div
        style={{
          position: "absolute",
          top: 350,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 900,
            color: t.accent,
            textAlign: "center",
            lineHeight: 1.2,
            transform: `scale(${hookFinalScale})`,
            opacity: hookOpacity,
            textShadow: `0 0 60px ${t.accentGlow}, 0 4px 20px rgba(0,0,0,0.5)`,
          }}
        >
          {hookLine}
        </div>
      </div>

      {/* Reveal lines */}
      <div
        style={{
          position: "absolute",
          top: 700,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {revealLines.map((line, i) => {
          const lineFrame = revealStart + i * revealStagger;
          const lineProgress = spring({
            frame: frame - lineFrame,
            fps,
            config: { damping: 18, stiffness: 100 },
          });

          return (
            <div
              key={i}
              style={{
                fontSize: 44,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                color: t.text,
                textAlign: "center",
                lineHeight: 1.4,
                opacity: interpolate(lineProgress, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(lineProgress, [0, 1], [30, 0])}px)`,
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
              }}
            >
              {line}
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
