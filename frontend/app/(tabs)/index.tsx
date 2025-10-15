// App.tsx — Minimalist Music Recommendation UI (Expo + TypeScript)
// drop this in a new Expo app created with `npx create-expo-app -t expo-template-blank-typescript`
// packages used: react-native, @expo/vector-icons (already included with Expo)

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";

// ---------- Types ----------
type Track = {
  id: string;
  title: string;
  artist: string;
  cover: string; // url (placeholder for now)
  mood: "chill" | "focus" | "energy" | "sleep" | "happy" | "melancholy";
  durationSec: number;
};

// ---------- Dummy Data (replace with your API) ----------
const COVERS = [
  "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464375117522-1311d6a5b81a?q=80&w=1200&auto=format&fit=crop",
];

const sampleTracks: Track[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `t_${i + 1}`,
  title: [
    "Midnight Echo",
    "Soft Static",
    "Neon Bloom",
    "Paper Planes",
    "Glass Rivers",
    "Quiet Arcade",
  ][i % 6],
  artist: [
    "Luna Park",
    "Aria Gray",
    "Echo Atlas",
    "Nora Lights",
    "Velvet Rows",
    "Kite Club",
  ][(i * 2) % 6],
  cover: COVERS[i % COVERS.length],
  mood: ["chill", "focus", "energy", "sleep", "happy", "melancholy"][
    i % 6
  ] as Track["mood"],
  durationSec: 120 + (i % 4) * 43,
}));

const moods: {
  key: Track["mood"];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "chill", label: "Chill", icon: "leaf-outline" },
  { key: "focus", label: "Focus", icon: "contrast-outline" },
  { key: "energy", label: "Energy", icon: "flash-outline" },
  { key: "sleep", label: "Sleep", icon: "moon-outline" },
  { key: "happy", label: "Happy", icon: "sunny-outline" },
  { key: "melancholy", label: "Blue", icon: "cloud-outline" },
];

// ---------- Theme ----------
const useTheme = () => {
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  return {
    dark,
    bg: dark ? "#0B0B0C" : "#FFFFFF",
    card: dark ? "#121214" : "#F7F7F8",
    text: dark ? "#F2F2F2" : "#0E0E11",
    subtext: dark ? "#9EA1A6" : "#5A5E66",
    tint: "#7C66FF", // accent
    border: dark ? "#1E1E22" : "#EAEAED",
    muted: dark ? "#151518" : "#F0F1F4",
  } as const;
};

// ---------- Utility ----------
const secondsToMMSS = (sec: number) => {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(1, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

// ---------- Components ----------
const Header: React.FC = () => {
  const t = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.header, { borderColor: t.border }]}>
      <Text style={[styles.logo, { color: t.text }]}>sonar</Text>

      <View style={styles.authRow}>
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={({ pressed }) => [
            styles.authBtnSecondary,
            { borderColor: t.border },
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="Go to Login"
        >
          <Text style={[styles.authBtnTextSecondary, { color: t.text }]}>
            Log in
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/signup")}
          style={({ pressed }) => [
            styles.authBtnPrimary,
            { backgroundColor: t.tint },
            pressed && { opacity: 0.9 },
          ]}
          accessibilityLabel="Go to Sign up"
        >
          <Text style={styles.authBtnTextPrimary}>Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
};

const SearchBar: React.FC<{ value: string; onChange: (v: string) => void }> = ({
  value,
  onChange,
}) => {
  const t = useTheme();
  return (
    <View
      style={[
        styles.searchWrap,
        { backgroundColor: t.card, borderColor: t.border },
      ]}
    >
      <Ionicons
        name="search"
        size={18}
        color={t.subtext}
        style={{ marginRight: 8 }}
      />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search songs, artists, moods"
        placeholderTextColor={t.subtext}
        style={[styles.searchInput, { color: t.text }]}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChange("")}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="close" size={18} color={t.subtext} />
        </Pressable>
      )}
    </View>
  );
};

const MoodChips: React.FC<{
  selected?: Track["mood"] | "all";
  onSelect: (m: Track["mood"] | "all") => void;
}> = ({ selected = "all", onSelect }) => {
  const t = useTheme();
  return (
    <FlatList
      horizontal
      style={styles.chipRow}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, alignItems: "center" }}
      ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      data={[
        { key: "all", label: "For You", icon: "sparkles-outline" as const },
        ...moods,
      ]}
      keyExtractor={(item: any) => item.key}
      renderItem={({ item }: any) => {
        const active = selected === item.key;
        return (
          <Pressable
            onPress={() => onSelect(item.key)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? t.tint : t.card,
                borderColor: active ? t.tint : t.border,
              },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityLabel={`Filter by ${item.label}`}
          >
            <Ionicons
              name={item.icon}
              size={14}
              color={active ? "#fff" : t.text}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[styles.chipText, { color: active ? "#fff" : t.text }]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      }}
    />
  );
};

const TrackCard: React.FC<{
  track: Track;
  onPress?: (t: Track) => void;
  onLike?: (t: Track) => void;
}> = ({ track, onPress, onLike }) => {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => onPress?.(track)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: t.card, borderColor: t.border },
        pressed && { opacity: 0.9 },
      ]}
      accessibilityLabel={`${track.title} by ${track.artist}`}
    >
      <Image source={{ uri: track.cover }} style={styles.cover} />
      <View style={{ flex: 1, gap: 6 }}>
        <Text numberOfLines={1} style={[styles.title, { color: t.text }]}>
          {track.title}
        </Text>
        <Text numberOfLines={1} style={[styles.subtitle, { color: t.subtext }]}>
          {track.artist} • {secondsToMMSS(track.durationSec)}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={[styles.pill, { backgroundColor: t.muted }]}>
            <Text
              style={{
                color: t.subtext,
                fontSize: 12,
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {track.mood}
            </Text>
          </View>
        </View>
      </View>
      <Pressable
        onPress={() => onLike?.(track)}
        style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        accessibilityLabel="Like"
      >
        <Ionicons name="heart-outline" size={20} color={t.text} />
      </Pressable>
    </Pressable>
  );
};

const MiniPlayer: React.FC<{
  track?: Track | null;
  isPlaying: boolean;
  onToggle: () => void;
  onExpand: () => void;
}> = ({ track, isPlaying, onToggle, onExpand }) => {
  const t = useTheme();
  if (!track) return null;
  return (
    <Pressable
      onPress={onExpand}
      style={({ pressed }) => [
        styles.mini,
        { backgroundColor: t.card, borderColor: t.border },
        pressed && { opacity: 0.9 },
      ]}
    >
      <Image source={{ uri: track.cover }} style={styles.miniCover} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={[styles.miniTitle, { color: t.text }]}>
          {track.title}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.miniArtist, { color: t.subtext }]}
        >
          {track.artist}
        </Text>
      </View>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        accessibilityLabel="Play/Pause"
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={20}
          color={t.text}
        />
      </Pressable>
    </Pressable>
  );
};

const DetailsModal: React.FC<{
  visible: boolean;
  track?: Track | null;
  onClose: () => void;
  onPlay: () => void;
}> = ({ visible, track, onClose, onPlay }) => {
  const t = useTheme();
  const slide = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!track) return null;

  return (
    <Modal
      animationType="none"
      visible={visible}
      transparent
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              // RN 0.75+ warning fix: move pointerEvents into style
              // If TS complains, add: // @ts-expect-error RN style pointerEvents
              pointerEvents: "auto",
              transform: [
                {
                  translateY: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
              backgroundColor: t.card,
              borderColor: t.border,
            },
          ]}
        >
          <Image source={{ uri: track.cover }} style={styles.modalCover} />
          <Text style={[styles.modalTitle, { color: t.text }]}>
            {track.title}
          </Text>
          <Text style={[styles.modalArtist, { color: t.subtext }]}>
            {track.artist} • {track.mood}
          </Text>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <Pressable
              onPress={onPlay}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: t.tint },
                pressed && { opacity: 0.9 },
              ]}
              accessibilityLabel="Play"
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Play</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { borderColor: t.border },
                pressed && { opacity: 0.8 },
              ]}
              accessibilityLabel="Close"
            >
              <Text style={[styles.secondaryBtnText, { color: t.text }]}>
                Close
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ---------- Main Screen ----------
const HomeScreen: React.FC = () => {
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState<Track["mood"] | "all">("all");
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filtered = useMemo(() => {
    return sampleTracks.filter((tr) => {
      const matchMood = mood === "all" || tr.mood === mood;
      const q = query.trim().toLowerCase();
      const matchQuery =
        q.length === 0 ||
        tr.title.toLowerCase().includes(q) ||
        tr.artist.toLowerCase().includes(q) ||
        tr.mood.toLowerCase().includes(q);
      return matchMood && matchQuery;
    });
  }, [query, mood]);

  const onSelectTrack = (tr: Track) => {
    setCurrent(tr);
    setDetailsOpen(true);
  };

  const onPlay = () => {
    setPlaying(true);
    setDetailsOpen(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.dark ? "light-content" : "dark-content"} />
      <Header />
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Text style={[styles.h1, { color: t.text }]}>Discover</Text>
        <Text style={[styles.p, { color: t.subtext }]}>
          Minimal recommendations tuned to your vibe.
        </Text>
      </View>

      <View style={{ height: 10 }} />
      <SearchBar value={query} onChange={setQuery} />
      <View style={{ height: 8 }} />
      <MoodChips selected={mood} onSelect={setMood} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackCard track={item} onPress={onSelectTrack} onLike={() => {}} />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />

      <MiniPlayer
        track={current}
        isPlaying={playing}
        onToggle={() => setPlaying((p) => !p)}
        onExpand={() => setDetailsOpen(true)}
      />

      <DetailsModal
        visible={detailsOpen}
        track={current}
        onClose={() => setDetailsOpen(false)}
        onPlay={onPlay}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "lowercase",
  },
  iconBtn: {
    padding: 6,
    borderRadius: 10,
  },
  searchWrap: {
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#ccc",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  h1: {
    fontSize: 28,
    fontWeight: "800",
  },
  p: {
    fontSize: 14,
    fontWeight: "600",
  },
  mini: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  miniCover: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#bbb",
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  miniArtist: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    margin: 12,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    alignItems: "center",
  },
  modalCover: {
    width: 180,
    height: 180,
    borderRadius: 18,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  modalArtist: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "800",
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryBtnText: {
    fontWeight: "800",
  },
  chipRow: {
    paddingVertical: 8,
    minHeight: 44, // ensures full visibility of chips
    maxHeight: 44,
    marginBottom: 10,
  },
  chipText: {
    fontWeight: "600",
    fontSize: 13,
  },
  authRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authBtnPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  authBtnSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  authBtnTextPrimary: {
    color: "#fff",
    fontWeight: "800",
  },
  authBtnTextSecondary: {
    fontWeight: "800",
  },
});
