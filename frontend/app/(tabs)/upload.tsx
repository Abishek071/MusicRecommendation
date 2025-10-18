import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { API_BASE } from "@/lib/api";

const MOODS = ["happy", "chill", "focus"] as const;
type Mood = (typeof MOODS)[number];

export default function UploadScreen() {
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState<Mood>("happy");
  const [cover, setCover] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [audio, setAudio] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const pickCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permission needed", "Allow photo library access.");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) setCover(res.assets[0]);
  };

  const pickAudio = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        "audio/*",
        "audio/mpeg",
        "audio/mp4",
        "audio/wav",
        "audio/x-wav",
        "audio/x-m4a",
      ],
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    setAudio(res.assets[0]);
  };

  const submit = async () => {
    // Validate inputs
    if (!title.trim() || !cover || !audio) {
      console.log("Hello");
      alert("Missing fields");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("mood", mood);

      // Cover (ImagePicker asset)
      fd.append("cover", {
        uri: cover.uri,
        name: cover.fileName || `cover.${cover.uri.split(".").pop() || "jpg"}`,
        type: cover.mimeType || "image/jpeg",
      } as any);

      // Audio (DocumentPicker asset)
      fd.append("audio", {
        uri: audio.uri,
        name: audio.name || "audio.mp3",
        type: audio.mimeType || "audio/mpeg",
      } as any);

      const res = await fetch(`${API_BASE}/api/tracks/`, {
        method: "POST",
        body: fd as any,
      });

      const text = await res.text();
      if (!res.ok) {
        console.log("Upload error", res.status, text);
        throw new Error(text || "Upload failed");
      }

      // Reset
      setTitle("");
      setCover(null);
      setAudio(null);
      Alert.alert("Success", "Track uploaded.");
    } catch (e: any) {
      Alert.alert("Upload error", e.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.h1}>Upload track</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Song name"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Mood</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => {
            const active = m === mood;
            return (
              <Pressable
                key={m}
                onPress={() => setMood(m)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Cover image</Text>
        <View style={styles.row}>
          <Pressable onPress={pickCover} style={styles.btn}>
            <Text style={styles.btnText}>Choose image</Text>
          </Pressable>
          {cover && (
            <Image source={{ uri: cover.uri }} style={styles.preview} />
          )}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Audio file</Text>
        <View style={styles.row}>
          <Pressable onPress={pickAudio} style={styles.btn}>
            <Text style={styles.btnText}>Choose audio</Text>
          </Pressable>
          <Text style={styles.fileName} numberOfLines={1}>
            {audio?.name || "No file selected"}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={submit}
        style={[styles.submit, loading && { opacity: 0.8 }]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Upload</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: "800", marginBottom: 12, color: "white" },
  field: { marginBottom: 16 },
  label: { fontWeight: "700", color: "#5A5E66", marginBottom: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "600",
    color: "white",
  },
  moodRow: { flexDirection: "row", gap: 8 },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#CCC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#7C66FF", borderColor: "#7C66FF" },
  chipText: { fontWeight: "700", textTransform: "capitalize", color: "white" },
  chipTextActive: { color: "#fff" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  btn: {
    backgroundColor: "#121214",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#1E1E22",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontWeight: "800" },
  preview: { width: 50, height: 50, borderRadius: 8, marginLeft: 8 },
  fileName: { flex: 1, fontWeight: "600", color: "white" },
  submit: {
    backgroundColor: "#7C66FF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: { color: "#fff", fontWeight: "800" },
});
