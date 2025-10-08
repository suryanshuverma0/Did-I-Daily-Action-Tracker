import { Tabs } from "expo-router";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
import { HapticTab } from "@/components/haptic-tab";

// Simple Icon wrapper to ensure name, size, color work
const IconSymbol = ({ name, size = 24, color = "black" }: { name: string; size?: number; color?: string }) => {
  return <MaterialIcons name={name} size={size} color={color} />;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <IconSymbol name="home" size={size} color={color} />,
        }}
      />

      {/* About Tab */}
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color, size }) => <IconSymbol name="info" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
