import { create } from "zustand";
import { Medication, scheduleMedicationNotifications, cancelMedicationNotifications, requestNotificationPermission } from "@/services/notificationService";
import { storage } from "@/utils/storage";

const MEDICATIONS_KEY = "medications_list";

interface MedicationFormData {
  name: string;
  dosage: string;
  frequencyHours: number;
  startTime: string;
}

interface MedicationState {
  medications: Medication[];
  isLoading: boolean;
  error: string | null;
  permissionGranted: boolean;

  loadMedications: () => Promise<void>;
  addMedication: (data: MedicationFormData) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  toggleMedication: (id: string) => Promise<void>;
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

  loadMedications: async () => {
    set({ isLoading: true });
    try {
      const granted = await requestNotificationPermission();
      set({ permissionGranted: granted });

      const stored = await storage.getItem(MEDICATIONS_KEY);
      if (stored) {
        set({ medications: JSON.parse(stored) });
      }
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

  clearError: () => set({ error: null }),
}));
