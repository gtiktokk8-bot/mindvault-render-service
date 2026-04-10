import { Composition } from "remotion";
import { MindVaultReel } from "./compositions/MindVaultReel";
import { QuoteReel } from "./compositions/QuoteReel";
import { ListReel } from "./compositions/ListReel";
import { HookReel } from "./compositions/HookReel";
import { AutoPipelineReel } from "./compositions/AutoPipelineReel";

// Default props for preview
const defaultReelProps = {
  hook: "The most dangerous sentence in any language...",
  body: [
    "\"I already know that.\"",
    "The moment you believe you know everything...",
    "...is the moment you stop growing.",
    "Stay a student. Always.",
  ],
  cta: "Follow @the_mindvaultt for daily wisdom",
  monetization: {
    type: "stripe",
    text: "🔗 27 Dark Psychology Tactics — Link in bio",
    url: "https://buy.stripe.com/5kQeV66P5g6hdpp4rA1sQ03",
  },
  theme: "dark",           // "dark" | "gold" | "stoic" | "fire"
  pillar: "psychology",    // stoicism | habits | psychology | focus | productivity
  musicTrack: null,
};

const defaultQuoteProps = {
  quote: "He who has a why to live can bear almost any how.",
  author: "Friedrich Nietzsche",
  pillar: "stoicism",
  theme: "stoic",
  cta: "Follow @the_mindvaultt",
  monetization: {
    type: "amazon",
    text: "📖 Get Meditations by Marcus Aurelius",
    url: "https://www.amazon.com/Meditations-New-Translation-Marcus-Aurelius/dp/0812968255?tag=mindvault-20",
  },
};

const defaultListProps = {
  title: "5 Books That Changed My Life",
  items: [
    "Meditations — Marcus Aurelius",
    "Atomic Habits — James Clear",
    "Deep Work — Cal Newport",
    "Thinking, Fast and Slow — Daniel Kahneman",
    "The Daily Stoic — Ryan Holiday",
  ],
  theme: "gold",
  pillar: "habits",
  cta: "Save this & follow @the_mindvaultt",
  monetization: {
    type: "amazon",
    text: "📚 Get all 5 — Links in bio #ad",
    url: "https://www.amazon.com/Meditations-New-Translation-Marcus-Aurelius/dp/0812968255?tag=mindvault-20",
  },
};

const defaultHookProps = {
  hookLine: "Stop saying \"I'm fine\"",
  revealLines: [
    "It's the most common lie we tell.",
    "Behind every \"I'm fine\" is a battle untold.",
    "Vulnerability isn't weakness.",
    "It's the birthplace of courage.",
  ],
  theme: "fire",
  pillar: "psychology",
  cta: "Follow for more @the_mindvaultt",
  monetization: {
    type: "stripe",
    text: "🧠 27 Dark Psychology Tactics — Link in bio",
    url: "https://buy.stripe.com/5kQeV66P5g6hdpp4rA1sQ03",
  },
};

const defaultAutoPipelineProps = {
  brollUrl: "",
  audioUrl: "",
  scriptLines: [
    "The most dangerous people in any room...",
    "...are the ones who never raise their voice.",
    "They observe. They calculate. They wait.",
    "And when they act, it's already too late.",
    "Master your silence. It's your greatest weapon.",
  ],
  title: "The Power of Silence",
  theme: "dark",
  pillar: "psychology",
  stripeCta: "27 Dark Psychology Tactics — Link in bio",
  stripeUrl: "https://buy.stripe.com/5kQeV66P5g6hdpp4rA1sQ03",
};

// 30fps × 30s = 900 frames (safe under 58s limit)
const FPS = 30;
const DURATION = 30 * FPS;

export const RemotionRoot = () => {
  return (
    <>
      {/* Auto Pipeline composition — dynamic duration based on content */}
      <Composition
        id="AutoPipelineReel"
        component={AutoPipelineReel}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultAutoPipelineProps}
        calculateMetadata={({ props }) => {
          // Dynamic duration: ~3.5s per script line + 5s overhead (intro + CTA)
          const lineCount = (props.scriptLines || []).length;
          const seconds = Math.min(58, Math.max(15, lineCount * 3.5 + 5));
          return { durationInFrames: Math.round(seconds * FPS) };
        }}
      />
      <Composition
        id="MindVaultReel"
        component={MindVaultReel}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultReelProps}
      />
      <Composition
        id="QuoteReel"
        component={QuoteReel}
        durationInFrames={20 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultQuoteProps}
      />
      <Composition
        id="ListReel"
        component={ListReel}
        durationInFrames={25 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultListProps}
      />
      <Composition
        id="HookReel"
        component={HookReel}
        durationInFrames={25 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultHookProps}
      />
    </>
  );
};
