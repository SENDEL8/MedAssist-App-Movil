import { create } from "zustand";
import {
  Medication,
  SoundOption,
  scheduleMedicationNotifications,
  cancelMedicationNotifications,
  requestNotificationPermission,
  rescheduleMedicationNotifications,
  ensureAndroidChannel,
} from "@/services/notificationService";
import { storage } from "@/utils/storage";

const MEDICATIONS_KEY = "medications_list";
const SOUND_PREF_KEY = "medication_sound_preference";

export interface MedicationFormData {
  name: string;
  dosage: string;
  frequencyHours: number;
  startTime: string;
  soundName: SoundOption;
}

interface MedicationState {
  medications: Medication[];
  isLoading: boolean;
  error: string | null;
  permissionGranted: boolean;
  globalSoundName: SoundOption;

  loadMedications: () => Promise<void>;
  addMedication: (data: MedicationFormData) => Promise<void>;
  updateMedication: (id: string, data: MedicationFormData) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  toggleMedication: (id: string) => Promise<void>;
  setGlobalSound: (sound: SoundOption) => Promise<void>;
  clearError: () => void;
}

async function saveMedicationsToStorage(medications: Medication[]): Promise<void> {
  await storage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  isLoading: false,
  error: null,
  permissionGranted: false,
  globalSoundName: "default",

  loadMedications: async () => {
    set({ isLoading: true });
    try {
      const granted = await requestNotificationPermission();
      set({ permissionGranted: granted });

      const stored = await storage.getItem(MEDICATIONS_KEY);
      const storedSound = await storage.getItem(SOUND_PREF_KEY);

      let parsed: Medication[] = [];
      if (stored) {
        parsed = JSON.parse(stored);
      }

      if (granted) {
        const Notifications = await import("expo-notifications");
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        const activeIds = new Set(scheduled.map((n: any) => n.identifier));

        const rescheduled: Medication[] = [];

        for (const med of parsed) {
          if (med.isActive) {
            const stillScheduled = med.notificationIds.length > 0 && med.notificationIds.every((id) => activeIds.has(id));
            if (!stillScheduled) {
              const newIds = await scheduleMedicationNotifications(med);
              rescheduled.push({ ...med, notificationIds: newIds });
            } else {
              rescheduled.push(med);
            }
          } else {
            rescheduled.push(med);
          }
        }

        parsed = rescheduled;
        await saveMedicationsToStorage(parsed);
      }

      set({
        medications: parsed,
        globalSoundName: storedSound ? (JSON.parse(storedSound) as SoundOption) : "default",
      });
    } catch (err: any) {
      set({ error: err.message || "Error al cargar medicamentos" });
    } finally {
      set({ isLoading: false });
    }
  },

  addMedication: async (data: MedicationFormData) => {
    set({ isLoading: true, error: null });
    try {
      const granted = await requestNotificationPermission();

      const newMedication: Medication = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        name: data.name,
        dosage: data.dosage,
        frequencyHours: data.frequencyHours,
        startTime: data.startTime,
        isActive: granted,
        notificationIds: [],
        soundName: data.soundName || get().globalSoundName,
      };

      if (granted) {
        const notificationIds = await scheduleMedicationNotifications(newMedication);
        newMedication.notificationIds = notificationIds;
      }

      const updated = [...get().medications, newMedication];
      await saveMedicationsToStorage(updated);
      set({ medications: updated, permissionGranted: granted });
    } catch (err: any) {
      set({ error: err.message || "Error al agregar medicamento" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateMedication: async (id: string, data: MedicationFormData) => {
    set({ isLoading: true, error: null });
    try {
      const medications = get().medications;
      const old = medications.find((m) => m.id === id);
      if (!old) throw new Error("Medicamento no encontrado");

      const updatedMedication: Medication = {
        ...old,
        name: data.name,
        dosage: data.dosage,
        frequencyHours: data.frequencyHours,
        startTime: data.startTime,
        soundName: data.soundName || get().globalSoundName,
      };

      if (old.isActive) {
        const newIds = await rescheduleMedicationNotifications(updatedMedication, old.notificationIds);
        updatedMedication.notificationIds = newIds;
      }

      const updated = medications.map((m) => (m.id === id ? updatedMedication : m));
      await saveMedicationsToStorage(updated);
      set({ medications: updated });
    } catch (err: any) {
      set({ error: err.message || "Error al actualizar medicamento" });
    } finally {
      set({ isLoading: false });
    }
  },

  removeMedication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const medications = get().medications;
      const medication = medications.find((m) => m.id === id);
      if (medication) {
        await cancelMedicationNotifications(medication.notificationIds);
      }

      const updated = medications.filter((m) => m.id !== id);
      await saveMedicationsToStorage(updated);
      set({ medications: updated });
    } catch (err: any) {
      set({ error: err.message || "Error al eliminar medicamento" });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleMedication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const medications = get().medications;
      const medication = medications.find((m) => m.id === id);
      if (!medication) return;

      let updatedMedication: Medication;

      if (medication.isActive) {
        await cancelMedicationNotifications(medication.notificationIds);
        updatedMedication = { ...medication, isActive: false, notificationIds: [] };
      } else {
        const notificationIds = await scheduleMedicationNotifications(medication);
        updatedMedication = { ...medication, isActive: true, notificationIds };
      }

      const updated = medications.map((m) => m.id === id ? updatedMedication : m);
      await saveMedicationsToStorage(updated);
      set({ medications: updated });
    } catch (err: any) {
      set({ error: err.message || "Error al cambiar estado" });
    } finally {
      set({ isLoading: false });
    }
  },

  setGlobalSound: async (sound: SoundOption) => {
    try {
      await ensureAndroidChannel(sound);
      await storage.setItem(SOUND_PREF_KEY, JSON.stringify(sound));
      set({ globalSoundName: sound });
    } catch (err: any) {
      set({ error: err.message || "Error al cambiar sonido" });
    }
  },

  clearError: () => set({ error: null }),
}));
