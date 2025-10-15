import { useColorScheme, View, Text, TextInput, Pressable } from "react-native";
import { Colors, Fonts } from "@/constants/theme"; // your file

export default function Login() {
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
        Welcome Back
      </Text>

      <Text
        style={{
          color: c.icon,
          fontSize: 16,
          marginBottom: 24,
          fontFamily: Fonts.sans,
        }}
      >
        Enter your details to log in
      </Text>

      <View
        style={{
          backgroundColor: c.background,
        }}
      >
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
            marginBottom: 15,
          }}
        />
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={true}
          style={{
            color: c.text,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 16,
            fontFamily: Fonts.sans,
            marginBottom: 15,
          }}
        />

        <Pressable
          style={{
            backgroundColor: c.icon,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ textAlign: "center" }}>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}
