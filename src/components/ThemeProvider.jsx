// MindVault Brand Design System
export const THEMES = {
  dark: {
    bg: "#0a0a0a",
    bgGradient: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
    text: "#f5f5f5",
    accent: "#c9a84c",
    accentGlow: "rgba(201, 168, 76, 0.3)",
    secondary: "#888",
    cardBg: "rgba(255,255,255,0.04)",
    border: "rgba(201, 168, 76, 0.2)",
  },
  gold: {
    bg: "#0d0d0d",
    bgGradient: "linear-gradient(180deg, #0d0d0d 0%, #1a1205 50%, #0d0d0d 100%)",
    text: "#f5e6c8",
    accent: "#d4a849",
    accentGlow: "rgba(212, 168, 73, 0.4)",
    secondary: "#a8936a",
    cardBg: "rgba(212, 168, 73, 0.06)",
    border: "rgba(212, 168, 73, 0.3)",
  },
  stoic: {
    bg: "#0b0e13",
    bgGradient: "linear-gradient(180deg, #0b0e13 0%, #151c28 50%, #0b0e13 100%)",
    text: "#d4dce8",
    accent: "#7b9bc4",
    accentGlow: "rgba(123, 155, 196, 0.3)",
    secondary: "#6a7d96",
    cardBg: "rgba(123, 155, 196, 0.06)",
    border: "rgba(123, 155, 196, 0.2)",
  },
  fire: {
    bg: "#0a0505",
    bgGradient: "linear-gradient(180deg, #0a0505 0%, #1a0a0a 50%, #0a0505 100%)",
    text: "#f5e0d0",
    accent: "#e05a3a",
    accentGlow: "rgba(224, 90, 58, 0.35)",
    secondary: "#c47a5a",
    cardBg: "rgba(224, 90, 58, 0.06)",
    border: "rgba(224, 90, 58, 0.25)",
  },
};

export const PILLAR_ICONS = {
  stoicism: "⚔️",
  habits: "🔄",
  psychology: "🧠",
  focus: "🎯",
  productivity: "⚡",
};

export const getTheme = (themeName) => THEMES[themeName] || THEMES.dark;
