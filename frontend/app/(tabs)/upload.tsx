// UploadScreen.tsx
import React, { useMemo, useState } from "react";
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
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { API_BASE } from "@/lib/api";

const MOODS = ["happy", "chill", "focus"] as const;
type Mood = (typeof MOODS)[number];

// --- Helpers ---------------------------------------------------------------

/** Very small mime fallback helper based on filename. */
function guessMimeFromName(
  name?: string,
  fallback = "application/octet-stream"
) {
  if (!name) return fallback;
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "gif":
      return "image/gif";
    case "mp3":
      return "audio/mpeg";
    case "m4a":
      return "audio/mp4";
    case "mp4":
      return "audio/mp4";
    case "wav":
      return "audio/wav";
    case "aac":
      return "audio/aac";
    case "ogg":
      return "audio/ogg";
    default:
      return fallback;
  }
}

/**
 * Convert Android content:// URIs into cache file:// URIs.
 * If already file:// it returns as-is.
 */
async function toFileUri(uri: string) {
  if (Platform.OS === "android" && uri.startsWith("content://")) {
    // Some versions of expo-file-system's typings may not expose cacheDirectory on the namespace.
    // Use a runtime-safe access with `any` to avoid lint/type issues while still working at runtime.
    const cacheDir = (FileSystem as any).cacheDirectory || FileSystem.cacheDirectory;
    const dest =
      cacheDir + `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // copyAsync handles most content:// providers on modern Expo
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  }
  return uri;
}

/** Build the file-part object React Native FormData understands */
function buildRNFilePart(params: {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  defaultName: string;
  defaultType: string;
}) {
  const name = params.name || params.defaultName;
  const type =
    params.mimeType ||
    guessMimeFromName(params.name || params.defaultName, params.defaultType);

  // @ts-ignore RN's FormData file part shape
  return { uri: params.uri, name, type };
}

// --- Component -------------------------------------------------------------

export default function UploadScreen() {
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState<Mood>("happy");
  const [cover, setCover] = useState<ImagePicker.ImagePickerAsset | null>(null);
  // Use `any` for audio because the installed expo-document-picker typings may differ.
  // The runtime result from getDocumentAsync typically includes { type: 'success'|'cancel', uri, name, size, mimeType }.
  const [audio, setAudio] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const pickCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert(
        "Permission needed",
        "Please allow photo library access."
      );
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
    });
    if (!res.canceled) setCover(res.assets[0]);
    console.log(cover);
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
    // DocumentPicker returns { type: 'success' | 'cancel', ... }
    if ((res as any).type !== "success") return;
    setAudio(res as any);
    // log the selected file info (use res directly because state updates are async)
    console.log("Picked audio:", res);
  };

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && !!cover && !!audio && !loading;
  }, [title, cover, audio, loading]);

  const submit = async () => {
    try {
      if (!title.trim() || !cover || !audio) {
        return Alert.alert(
          "Missing fields",
          "Please provide title, cover and audio."
        );
      }

      setLoading(true);

      // Normalize URIs (Android content:// -> file://)
      const coverUri = await toFileUri(cover.uri);
      const audioUri = await toFileUri(audio.uri);

      const coverPart = buildRNFilePart({
        uri: coverUri,
        name:
          (cover as any).fileName ||
          cover.fileName ||
          `cover.${coverUri.split(".").pop() || "jpg"}`,
        mimeType: cover.mimeType || (cover as any).type,
        defaultName: "cover.jpg",
        defaultType: "image/jpeg",
      });

      const audioPart = buildRNFilePart({
        uri: audioUri,
        // DocumentResult has `name` and `mimeType` (if available)
        name:
          (audio as any).name || `audio.${audioUri.split(".").pop() || "mp3"}`,
        mimeType: (audio as any).mimeType || undefined,
        defaultName: "audio.mp3",
        defaultType: "audio/mpeg",
      });

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("mood", mood);
      fd.append("cover", coverPart as any);
      fd.append("audio", audioPart as any);

      const res = await fetch(`${API_BASE}/api/tracks/`, {
        method: "POST",
        // DO NOT set Content-Type; RN will set multipart/form-data with boundary
        headers: { Accept: "application/json" },
        body: fd,
      });

      const text = await res.text();
      if (!res.ok) {
        // Show backend message (e.g., DRF validation)
        console.log("Upload error", res.status, text);
        throw new Error(
          (() => {
            try {
              const j = JSON.parse(text);
              return typeof j === "string" ? j : JSON.stringify(j);
            } catch {
              return text || "Upload failed";
            }
          })()
        );
      }

      // Reset UI
      setTitle("");
      setMood("happy");
      setCover(null);
      setAudio(null);

      Alert.alert("Success", "Track uploaded.");
    } catch (e: any) {
      Alert.alert("Upload error", e?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>Upload track</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Song name"
          placeholderTextColor="#8A8A92"
          value={title}
          onChangeText={setTitle}
          autoCapitalize="none"
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
          {cover ? (
            <Image source={{ uri: cover.uri }} style={styles.preview} />
          ) : (
            <Text style={styles.fileName}>No image selected</Text>
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
        style={[styles.submit, (!canSubmit || loading) && { opacity: 0.7 }]}
        disabled={!canSubmit}
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

// --- Styles ----------------------------------------------------------------

const styles = StyleSheet.create({
  container: { padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", marginBottom: 12, color: "white" },
  field: { marginBottom: 16 },
  label: { fontWeight: "700", color: "#B6B8BE", marginBottom: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2A2A33",
    backgroundColor: "#121214",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "600",
    color: "white",
  },
  moodRow: { flexDirection: "row", gap: 8 },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3A3A42",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: "#121214",
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
  preview: { width: 50, height: 50, borderRadius: 8 },
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
