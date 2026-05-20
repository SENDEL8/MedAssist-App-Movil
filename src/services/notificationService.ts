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

let Notifications: typeof import("expo-notifications") | null = null;

if (!isExpoGo) {
  import("expo-notifications").then((mod) => {
    Notifications = mod;
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo || !Notifications) return false;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === "granted";
  }
  return true;
}

export async function scheduleMedicationNotifications(
  medication: Medication
): Promise<string[]> {
  if (isExpoGo || !Notifications) {
    console.warn("[MedAssist] Notifications not available in Expo Go. Use a development build.");
    return [];
  }

  const [hours, minutes] = medication.startTime.split(":").map(Number);

  const now = new Date();
  let firstTrigger = new Date(now);
  firstTrigger.setHours(hours, minutes, 0, 0);

  if (firstTrigger <= now) {
    firstTrigger.setDate(firstTrigger.getDate() + 1);
  }

  const secondsUntilFirst = Math.floor((firstTrigger.getTime() - now.getTime()) / 1000);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hora de tu medicamento",
      body: `${medication.name} - ${medication.dosage}`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntilFirst,
      repeats: true,
      channelId: Platform.OS === "android" ? "medication-alerts" : undefined,
    },
  });

  return [id];
}

export async function cancelMedicationNotifications(
  notificationIds: string[]
): Promise<void> {
  if (isExpoGo || !Notifications) return;
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (isExpoGo || !Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
