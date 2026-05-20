import { useEffect } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { Text } from "react-native";
import { useAuthStore } from "@/store/authStore";

export default function TabsLayout() {
  const { token, isRestored } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isRestored && !token && segments[0] === "(tabs)") {
      router.replace("/(auth)/login");
    }
  }, [isRestored, token]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#16a34a" : "#6b7280" }}>Inicio</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="consultation"
        options={{
          title: "Consulta",
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#16a34a" : "#6b7280" }}>Consulta</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#16a34a" : "#6b7280" }}>Historial</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alertas",
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#16a34a" : "#6b7280" }}>Alertas</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
