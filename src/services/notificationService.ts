import { Platform } from "react-native";
import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";

export type SoundOption = "default" | "notification" | "alarm" | "reminder" | "urgent";

export const SOUND_OPTIONS: { label: string; value: SoundOption; description: string }[] = [
  { label: "Sonido por defecto", value: "default", description: "Sonido de notificación del sistema" },
  { label: "Notificación", value: "notification", description: "Tono suave - 440 Hz" },
  { label: "Alarma", value: "alarm", description: "Tono intenso - 880 Hz" },
  { label: "Recordatorio", value: "reminder", description: "Tono corto - 330 Hz" },
  { label: "Urgente", value: "urgent", description: "Tono vibrante - 660 Hz" },
];

// Map sound options to actual filenames in android/app/src/main/res/raw/
const SOUND_FILES: Record<SoundOption, string | undefined> = {
  default: undefined,
  notification: "med_notification",
  alarm: "med_alarm",
  reminder: "med_reminder",
  urgent: "med_urgent",
};

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequencyHours: number;
  startTime: string;
  isActive: boolean;
  notificationIds: string[];
  soundName: SoundOption;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo) return false;

  const Notifications = await import("expo-notifications");

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") return false;
  }

  return true;
}

export async function ensureAndroidChannel(soundName: SoundOption = "default") {
  if (Platform.OS !== "android" || isExpoGo) return;

  const Notifications = await import("expo-notifications");
  const soundFile = SOUND_FILES[soundName];

  await Notifications.setNotificationChannelAsync("medication-alerts", {
    name: "Alertas de Medicamentos",
    importance: Notifications.AndroidImportance.HIGH,
    sound: soundFile || undefined,
    vibrationPattern: null,
    enableVibrate: true,
    showBadge: true,
  });
}

export async function scheduleMedicationNotifications(
  medication: Medication
): Promise<string[]> {
  if (isExpoGo) {
    console.warn("[MedAssist] Notifications not available in Expo Go.");
    return [];
  }

  const Notifications = await import("expo-notifications");
  await ensureAndroidChannel(medication.soundName);

  const [startHour, startMinute] = medication.startTime.split(":").map(Number);
  const ids: string[] = [];

  const now = new Date();
  const dosesPerDay = Math.floor(24 / medication.frequencyHours);

  for (let i = 0; i < dosesPerDay; i++) {
    const doseHour = (startHour + i * medication.frequencyHours) % 24;

    // Compensate ~1min delay by scheduling 1 minute early
    let triggerMinute = startMinute - 1;
    let triggerHour = doseHour;
    if (triggerMinute < 0) {
      triggerMinute = 59;
      triggerHour = (doseHour - 1 + 24) % 24;
    }

    let triggerDate = new Date(now);
    triggerDate.setHours(triggerHour, triggerMinute, 55, 0); // 5 sec before the minute

    if (triggerDate <= now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const triggerBase: any = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      channelId: "medication-alerts",
    };

    if (Platform.OS === "android") {
      triggerBase.alarmType = 0; // AndroidAlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE
    }

    const soundFile = SOUND_FILES[medication.soundName];

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hora de tu medicamento",
        body: `${medication.name} - ${medication.dosage}`,
        sound: soundFile || true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { medicationId: medication.id },
      },
      trigger: triggerBase,
    });

    ids.push(id);
  }

  return ids;
}

export async function rescheduleMedicationNotifications(
  medication: Medication,
  oldIds: string[]
): Promise<string[]> {
  await cancelMedicationNotifications(oldIds);
  return scheduleMedicationNotifications(medication);
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
