import { useColorScheme, View, Text, TextInput } from "react-native";
import { Colors, Fonts } from "@/constants/theme"; // your file

export default function Signup() {
  const scheme = useColorScheme(); // "light" | "dark" | null
  const c = Colors[scheme ?? "light"];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.background,
        paddingHorizontal: 24,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: c.text,
          fontSize: 32,
          fontWeight: "700",
          marginBottom: 8,
          fontFamily: Fonts.sans,
        }}
      >
        Join Us
      </Text>

      <Text
        style={{
          color: c.icon,
          fontSize: 16,
          marginBottom: 24,
          fontFamily: Fonts.sans,
        }}
      >
        Create your account and get started
      </Text>

      <View
        style={{
          backgroundColor: c.background,
          borderRadius: 24,
          padding: 16,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text
          style={{
            color: c.text,
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 8,
            fontFamily: Fonts.sans,
          }}
        >
          Email
        </Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#9CA3AF"
          style={{
            color: c.text,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 16,
            fontFamily: Fonts.sans,
          }}
        />
      </View>
    </View>
  );
}
