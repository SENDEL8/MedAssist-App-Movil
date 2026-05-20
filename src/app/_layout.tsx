import { useEffect } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";

export default function RootLayout() {
  useEffect(() => {
    if (isExpoGo || Platform.OS !== "android") return;

    import("expo-notifications").then((Notifications) => {
      Notifications.setNotificationChannelAsync("medication-alerts", {
        name: "Medication Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
      });
    });
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
