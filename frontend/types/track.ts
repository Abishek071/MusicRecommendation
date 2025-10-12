export type Mood =
  | "chill"
  | "focus"
  | "energy"
  | "sleep"
  | "happy"
  | "melancholy";

export type Track = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  mood: Mood;
  durationSec: number;
};

export type MoodFilter = Mood | "all";
