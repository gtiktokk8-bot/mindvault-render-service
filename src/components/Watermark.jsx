import { interpolate, useCurrentFrame } from "remotion";
import { getTheme } from "./ThemeProvider";

export const Watermark = ({ theme = "dark" }) => {
  const frame = useCurrentFrame();
  const t = getTheme(theme);
  const opacity = interpolate(frame, [0, 20], [0, 0.15], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        right: 50,
        opacity,
        fontSize: 28,
        fontFamily: "'Georgia', serif",
        color: t.accent,
        letterSpacing: 3,
        textTransform: "uppercase",
        fontWeight: 300,
      }}
    >
      MIND VAULT
    </div>
  );
};
