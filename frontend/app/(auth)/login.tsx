import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { login, me } from "@/lib/api";
import { saveTokens } from "@/lib/secure";
import { Field, Input, PrimaryButton, IconButton } from "@/components/ui";

export default function LoginScreen() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password)
      return Alert.alert("Missing fields", "Email and password are required.");
    try {
      setLoading(true);
      const tokens = await login(email.trim(), password);
      await saveTokens(tokens.access, tokens.refresh);
      await me(tokens.access); // optional check
      r.replace("/");
    } catch (e: any) {
      Alert.alert("Login failed", e.message || "Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 justify-center px-5"
    >
      <Text className="text-3xl font-extrabold mb-2">Welcome back</Text>

      <View className="gap-4">
        <Field label="Email">
          <Input
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password">
          <View className="relative">
            <Input
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              placeholder="Your password"
            />
            <IconButton
              onPress={() => setShowPwd((v) => !v)}
              name={showPwd ? "eye-off-outline" : "eye-outline"}
            />
          </View>
        </Field>

        <PrimaryButton
          onPress={onSubmit}
          disabled={loading}
          className={loading ? "opacity-80" : ""}
        >
          {loading ? "Signing in…" : "Log in"}
        </PrimaryButton>

        <Text className="text-center text-subtext font-semibold mt-2">
          New here?{" "}
          <Link href="/(auth)/signup" className="text-tint font-extrabold">
            Create an account
          </Link>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
