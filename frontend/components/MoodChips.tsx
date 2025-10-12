import { Sparkles, Leaf, Focus, Zap, Moon, Sun, Cloud } from "lucide-react";
import { MoodFilter } from "@/types/track";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

type MoodChipsProps = {
  selected: MoodFilter;
  onSelect: (mood: MoodFilter) => void;
};

const moods = [
  { key: "all" as const, label: "For You", icon: Sparkles },
  { key: "chill" as const, label: "Chill", icon: Leaf },
  { key: "focus" as const, label: "Focus", icon: Focus },
  { key: "energy" as const, label: "Energy", icon: Zap },
  { key: "sleep" as const, label: "Sleep", icon: Moon },
  { key: "happy" as const, label: "Happy", icon: Sun },
  { key: "melancholy" as const, label: "Blue", icon: Cloud },
];

export const MoodChips = ({ selected, onSelect }: MoodChipsProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap py-2">
      <div className="flex gap-2 px-4">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isActive = selected === mood.key;
          return (
            <Button
              key={mood.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onSelect(mood.key)}
              className={`rounded-full font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-card hover:bg-secondary"
              }`}
              aria-label={`Filter by ${mood.label}`}
              aria-pressed={isActive}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {mood.label}
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
};
