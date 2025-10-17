import { useState } from "react";
import { useColorScheme, View, Text, TextInput, Pressable } from "react-native";
import { Colors, Fonts } from "@/constants/theme";
import { useRouter } from "expo-router";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const scheme = useColorScheme(); // "light" | "dark" | null
  const c = Colors[scheme ?? "light"];

  const api = "http://127.0.0.1:8000";

  const registerUser = async () => {
    try {
      if (email == "" && password == "" && name == "") {
        alert("Please fill the form completely");
        return;
      }
      const res = await fetch(`${api}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, display_name: name }),
      });

      if (!res.ok) throw new Error("Register failed");
      router.push("/(tabs)");
    } catch (error) {
      console.log("Error while registering user:", error);
    }
  };

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
        }}
      >
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#9CA3AF"
          onChangeText={(text) => setEmail(text)}
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
          placeholder="Enter your name"
          placeholderTextColor="#9CA3AF"
          onChangeText={(text) => setName(text)}
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
          placeholder="Create a password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
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
          placeholder="Confirm password"
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
          onPress={() => registerUser()}
          style={{
            backgroundColor: c.icon,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ textAlign: "center" }}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}
