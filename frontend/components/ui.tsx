import React from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  TextInputProps,
  PressableProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="font-semibold text-subtext">{label}</Text>
      {children}
    </View>
  );
}

export function Input({
  className = "",
  placeholderTextColor,
  ...props
}: TextInputProps & { className?: string }) {
  return (
    <TextInput
      {...props}
      className={`rounded-xl px-3 py-3 font-semibold text-[16px] ${className}`}
      placeholderTextColor={placeholderTextColor ?? "#9EA1A6"}
    />
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...rest
}: Omit<PressableProps, "children"> & {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Pressable
      {...rest}
      className={`bg-tint rounded-xl py-3 items-center ${className}`}
    >
      <Text className="text-white font-extrabold">{children}</Text>
    </Pressable>
  );
}

export function IconButton({
  onPress,
  name,
}: {
  onPress?: () => void;
  name: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable onPress={onPress} className="absolute right-2 p-2">
      <Ionicons name={name} size={20} />
    </Pressable>
  );
}
