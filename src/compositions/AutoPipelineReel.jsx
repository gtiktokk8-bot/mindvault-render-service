import {
  AbsoluteFill,
  Sequence,
  Video,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from "remotion";
import { getTheme, PILLAR_ICONS } from "../components/ThemeProvider";

/**
 * AutoPipelineReel — Designed for the automated content pipeline
 *
 * Combines:
 * - B-roll video background (from Pexels URL)
 * - Voiceover audio overlay (from ElevenLabs)
 * - Animated caption/subtitle overlays (spring physics)
 * - Brand watermark
 * - Stripe CTA card at the end
 *
 * Props:
 *   brollUrl       - URL to background video
 *   audioUrl       - URL to voiceover audio (mp3)
 *   scriptLines    - Array of caption strings
 *   title          - Video title
 *   theme          - "dark" | "gold" | "stoic" | "fire"
 *   pillar         - "psychology" | "stoicism" | "habits" | "focus" | "productivity"
 *   stripeCta      - CTA text for monetization
 *   stripeUrl      - Stripe payment link
 */
export const AutoPipelineReel = ({
  brollUrl,
  audioUrl,
  scriptLines = [],
  title = "",
  theme = "dark",
  pillar = "psychology",
  stripeCta = "27 Dark Psychology Tactics — Link in bio",
  stripeUrl = "",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = getTheme(theme);

  // === TIMING ===
  // Split the video into segments for each line
  // Reserve first 1s for intro, last 4s for CTA
  const introFrames = Math.round(fps * 1);
  const ctaFrames = Math.round(fps * 4);
  const captionFrames = durationInFrames - introFrames - ctaFrames;
  const framesPerLine = scriptLines.length > 0
    ? Math.floor(captionFrames / scriptLines.length)
    : captionFrames;

  // === FADE IN/OUT ===
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // === CURRENT CAPTION INDEX ===
  const captionFrame = frame - introFrames;
  const currentLineIndex = Math.min(
    Math.floor(captionFrame / framesPerLine),
    scriptLines.length - 1
  );

  // Pillar icon
  const pillarIcon = PILLAR_ICONS[pillar] || "🧠";

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, backgroundColor: "#000" }}>
      {/* B-Roll Video Background */}
      {brollUrl && (
        <Video
          src={brollUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          volume={0}
          startFrom={0}
        />
      )}

      {/* Dark overlay for text readability */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Voiceover Audio */}
      {audioUrl && <Audio src={audioUrl} volume={1} />}

      {/* Top Brand Bar */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <TopBrandBar
          pillarIcon={pillarIcon}
          theme={theme}
          fps={fps}
        />
      </Sequence>

      {/* Animated Captions */}
      {scriptLines.map((line, i) => {
        const lineStart = introFrames + i * framesPerLine;
        const lineDuration = framesPerLine + 10; // slight overlap

        return (
          <Sequence key={i} from={lineStart} durationInFrames={lineDuration}>
            <CaptionLine
              text={line}
              theme={theme}
              fps={fps}
              isFirst={i === 0}
              framesPerLine={framesPerLine}
            />
          </Sequence>
        );
      })}

      {/* CTA Card */}
      <Sequence
        from={durationInFrames - ctaFrames}
        durationInFrames={ctaFrames}
      >
        <CTACard
          stripeCta={stripeCta}
          theme={theme}
          fps={fps}
        />
      </Sequence>

      {/* Bottom watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 22,
          color: "rgba(255,255,255,0.4)",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: 2,
        }}
      >
        @the_mindvaultt
      </div>
    </AbsoluteFill>
  );
};

/* === SUB-COMPONENTS === */

const TopBrandBar = ({ pillarIcon, theme, fps }) => {
  const frame = useCurrentFrame();
  const t = getTheme(theme);

  const progress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [-30, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <span style={{ fontSize: 48 }}>{pillarIcon}</span>
      <span
        style={{
          fontSize: 28,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          color: t.accent,
          letterSpacing: 3,
          textTransform: "uppercase",
          textShadow: `0 0 20px ${t.accentGlow}`,
        }}
      >
        THE MIND VAULT
      </span>
    </div>
  );
};

const CaptionLine = ({ text, theme, fps, isFirst, framesPerLine }) => {
  const frame = useCurrentFrame();
  const t = getTheme(theme);

  // Spring-in animation
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Fade out near end of this line's duration
  const fadeOut = interpolate(
    frame,
    [framesPerLine - 8, framesPerLine],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const translateY = interpolate(enterProgress, [0, 1], [50, 0]);
  const scale = interpolate(enterProgress, [0, 1], [0.9, 1]);
  const opacity = enterProgress * fadeOut;

  // Accent bar width animation
  const barWidth = interpolate(enterProgress, [0, 1], [0, 80]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 320,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Accent bar above text */}
      <div
        style={{
          width: barWidth,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
          marginBottom: 16,
        }}
      />

      {/* Caption text with backdrop */}
      <div
        style={{
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          borderRadius: 16,
          padding: "20px 40px",
          maxWidth: 940,
          border: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            fontSize: isFirst ? 52 : 46,
            fontWeight: isFirst ? 800 : 600,
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            color: isFirst ? t.accent : t.text,
            textAlign: "center",
            lineHeight: 1.35,
            textShadow: isFirst
              ? `0 0 30px ${t.accentGlow}`
              : "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

const CTACard = ({ stripeCta, theme, fps }) => {
  const frame = useCurrentFrame();
  const t = getTheme(theme);

  const progress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const translateY = interpolate(progress, [0, 1], [80, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 180,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${t.cardBg}, rgba(0,0,0,0.7))`,
          border: `1.5px solid ${t.accent}`,
          borderRadius: 20,
          padding: "20px 44px",
          fontSize: 30,
          color: t.accent,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          backdropFilter: "blur(16px)",
          textAlign: "center",
          maxWidth: 900,
          boxShadow: `0 0 40px ${t.accentGlow}`,
        }}
      >
        {stripeCta}
      </div>
    </div>
  );
};
