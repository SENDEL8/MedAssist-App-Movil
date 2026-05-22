import { Platform } from "react-native";
import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequencyHours: number;
  startTime: string;
  isActive: boolean;
  notificationIds: string[];
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo) return false;

  const Notifications = await import("expo-notifications");

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") return false;
  }

  await ensureAndroidChannel(Notifications);
  return true;
}

export async function scheduleMedicationNotifications(
  medication: Medication
): Promise<string[]> {
  if (isExpoGo) {
    console.warn("[MedAssist] Notifications not available in Expo Go.");
    return [];
  }

  const Notifications = await import("expo-notifications");
  await ensureAndroidChannel(Notifications);

  const [startHour, startMinute] = medication.startTime.split(":").map(Number);
  const ids: string[] = [];

  const now = new Date();
  const dosesPerDay = Math.floor(24 / medication.frequencyHours);

  for (let i = 0; i < dosesPerDay; i++) {
    const doseHour = (startHour + i * medication.frequencyHours) % 24;

    let triggerDate = new Date(now);
    triggerDate.setHours(doseHour, startMinute, 0, 0);

    if (triggerDate <= now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const trigger: Notifications.DailyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      channelId: Platform.OS === "android" ? "medication-alerts" : undefined,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hora de tu medicamento",
        body: `${medication.name} - ${medication.dosage}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { medicationId: medication.id },
      },
      trigger,
    });

    ids.push(id);
  }

  return ids;
}

export async function cancelMedicationNotifications(
  notificationIds: string[]
): Promise<void> {
  if (isExpoGo) return;
  const Notifications = await import("expo-notifications");
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (isExpoGo) return;
  const Notifications = await import("expo-notifications");
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function ensureAndroidChannel(notifications: typeof import("expo-notifications")) {
  if (Platform.OS === "android" && !isExpoGo) {
    await notifications.setNotificationChannelAsync("medication-alerts", {
      name: "Alertas de Medicamentos",
      importance: notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      showBadge: true,
    });
  }
}
