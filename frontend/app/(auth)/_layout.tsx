import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{ headerTitle: "Go Back", headerShadowVisible: false }}
    />
  );
}
