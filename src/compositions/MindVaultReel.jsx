import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Watermark } from "../components/Watermark";
import { TextReveal } from "../components/TextReveal";
import { CTA } from "../components/CTA";
import { getTheme, PILLAR_ICONS } from "../components/ThemeProvider";

/**
 * MindVaultReel — The flagship general-purpose reel template
 *
 * Structure:
 * 0–2s:   Logo reveal + pillar icon
 * 2–4s:   Hook text (big, bold, attention grab)
 * 4–22s:  Body text lines (staggered reveals)
 * 22–28s: CTA + monetization badge
 * 28–30s: Fade out
 */
export const MindVaultReel = ({ hook, body, cta, monetization, theme, pillar }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = getTheme(theme);

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Logo reveal
  const logoProgress = spring({ frame, fps, config: { damping: 20, stiffness: 60 } });
  const logoScale = interpolate(logoProgress, [0, 1], [0.8, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  // Pillar icon
  const pillarIcon = PILLAR_ICONS[pillar] || "💡";

  // Accent line
  const lineWidth = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  // Hook timing
  const hookStart = 45; // ~1.5s
  const bodyStart = 120; // ~4s
  const bodyStagger = Math.min(90, Math.floor((durationInFrames - bodyStart - 240) / body.length));
  const ctaStart = bodyStart + body.length * bodyStagger + 30;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Background theme={theme} />

      {/* Pillar icon */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <div
          style={{
            position: "absolute",
            top: 120,
            left: "50%",
            transform: `translate(-50%, 0) scale(${logoScale})`,
            opacity: logoOpacity,
            fontSize: 72,
          }}
        >
          {pillarIcon}
        </div>
      </Sequence>

      {/* Accent line under icon */}
      <div
        style={{
          position: "absolute",
          top: 210,
          left: "50%",
          transform: "translateX(-50%)",
          width: interpolate(lineWidth, [0, 1], [0, 200]),
          height: 2,
          background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
        }}
      />

      <Watermark theme={theme} />

      {/* Hook — big centered text */}
      <Sequence from={hookStart} durationInFrames={durationInFrames - hookStart}>
        <div
          style={{
            position: "absolute",
            top: 280,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TextReveal
            lines={[hook]}
            startFrame={0}
            theme={theme}
            fontSize={64}
            fontWeight={800}
            accentFirst={true}
            fps={fps}
          />
        </div>
      </Sequence>

      {/* Body lines */}
      <Sequence from={bodyStart} durationInFrames={durationInFrames - bodyStart}>
        <div
          style={{
            position: "absolute",
            top: 520,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TextReveal
            lines={body}
            startFrame={0}
            staggerFrames={bodyStagger}
            theme={theme}
            fontSize={48}
            fontWeight={500}
            fps={fps}
          />
        </div>
      </Sequence>

      {/* CTA + Monetization */}
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
