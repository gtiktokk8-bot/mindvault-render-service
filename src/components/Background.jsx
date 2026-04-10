import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { getTheme } from "./ThemeProvider";

export const Background = ({ theme = "dark" }) => {
  const frame = useCurrentFrame();
  const t = getTheme(theme);

  // Subtle animated grain overlay
  const grainSeed = Math.floor(frame * 0.5) % 100;
  // Slow moving gradient shift
  const gradientShift = interpolate(frame, [0, 900], [0, 20], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Base gradient */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: t.bgGradient,
        }}
      />

      {/* Animated accent orb */}
      <div
        style={{
          position: "absolute",
          top: `${40 + gradientShift}%`,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${t.accentGlow} 0%, transparent 70%)`,
          filter: "blur(80px)",
          opacity: interpolate(frame, [0, 30], [0, 0.6], { extrapolateRight: "clamp" }),
        }}
      />

      {/* Grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' seed='${grainSeed}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          opacity: 0.4,
          mixBlendMode: "overlay",
        }}
      />

      {/* Top vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
