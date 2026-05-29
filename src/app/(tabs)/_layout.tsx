import { useEffect } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
          tabBarStyle: { display: "none" },
           tabBarIcon: ({ focused }) => (
             <Ionicons name={focused ? "home" : "medkit"} size={22} color={focused ? "#16a34a" : "#6b7280"} />
           ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#16a34a" : "#6b7280", fontSize: 11 }}>Inicio</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="consultation"
        options={{
          title: "Consulta",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>💬</Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#16a34a" : "#6b7280", fontSize: 11 }}>Consulta</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
           tabBarIcon: ({ focused }) => (
             <Ionicons name="document-text" size={22} color={focused ? "#16a34a" : "#6b7280"} />
           ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#16a34a" : "#6b7280", fontSize: 11 }}>Historial</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alertas",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>🔔</Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#16a34a" : "#6b7280", fontSize: 11 }}>Alertas</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="lab-exam"
        options={{
          title: "Examenes",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>🔬</Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#16a34a" : "#6b7280", fontSize: 11 }}>Examenes</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="lab-result"
        options={{
          href: null,
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
