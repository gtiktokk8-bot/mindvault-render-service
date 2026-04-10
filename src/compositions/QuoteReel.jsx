import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Watermark } from "../components/Watermark";
import { CTA } from "../components/CTA";
import { getTheme } from "../components/ThemeProvider";

/**
 * QuoteReel — Cinematic quote with author attribution
 *
 * Structure:
 * 0–1s:   Opening quote mark reveal
 * 1–12s:  Quote text word-by-word fade in
 * 12–15s: Author name slides in
 * 15–20s: CTA + monetization
 */
export const QuoteReel = ({ quote, author, pillar, theme, cta, monetization }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = getTheme(theme);

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Giant quote mark
  const quoteMarkProgress = spring({ frame, fps, config: { damping: 25, stiffness: 50 } });
  const quoteMarkOpacity = interpolate(quoteMarkProgress, [0, 1], [0, 0.12]);
  const quoteMarkScale = interpolate(quoteMarkProgress, [0, 1], [0.5, 1]);

  // Word-by-word reveal for the quote
  const words = quote.split(" ");
  const wordStartFrame = 30;
  const framesPerWord = Math.min(8, Math.floor((durationInFrames * 0.5) / words.length));

  // Author reveal
  const authorStart = wordStartFrame + words.length * framesPerWord + 20;
  const authorProgress = spring({
    frame: frame - authorStart,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  const ctaStart = authorStart + 60;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Background theme={theme} />
      <Watermark theme={theme} />

      {/* Giant decorative quote mark */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 60,
          fontSize: 400,
          fontFamily: "Georgia, serif",
          color: t.accent,
          opacity: quoteMarkOpacity,
          transform: `scale(${quoteMarkScale})`,
          lineHeight: 1,
        }}
      >
        "
      </div>

      {/* Quote text — word by word */}
      <div
        style={{
          position: "absolute",
          top: 450,
          left: 80,
          right: 80,
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 12px",
          justifyContent: "center",
        }}
      >
        {words.map((word, i) => {
          const wordFrame = wordStartFrame + i * framesPerWord;
          const wordProgress = spring({
            frame: frame - wordFrame,
            fps,
            config: { damping: 20, stiffness: 120 },
          });
          const wordOpacity = interpolate(wordProgress, [0, 1], [0, 1]);
          const wordY = interpolate(wordProgress, [0, 1], [15, 0]);

          return (
            <span
              key={i}
              style={{
                fontSize: 56,
                fontFamily: "'Georgia', serif",
                fontWeight: 400,
                fontStyle: "italic",
                color: t.text,
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                lineHeight: 1.5,
                textShadow: "0 2px 20px rgba(0,0,0,0.4)",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Author attribution */}
      <div
        style={{
          position: "absolute",
          top: 1100,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Accent line */}
        <div
          style={{
            width: interpolate(authorProgress, [0, 1], [0, 120]),
            height: 2,
            background: t.accent,
          }}
        />
        <div
          style={{
            fontSize: 36,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            color: t.accent,
            letterSpacing: 3,
            textTransform: "uppercase",
            opacity: interpolate(authorProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(authorProgress, [0, 1], [20, 0])}px)`,
          }}
        >
          — {author}
        </div>
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
