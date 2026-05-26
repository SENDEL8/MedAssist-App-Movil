import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
} from "react-native";
import { useMedicationStore } from "@/store/medicationStore";
import { Medication, SOUND_OPTIONS, SoundOption } from "@/services/notificationService";
import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";

const FREQUENCY_OPTIONS = [
  { label: "Cada 4 horas", value: 4 },
  { label: "Cada 6 horas", value: 6 },
  { label: "Cada 8 horas", value: 8 },
  { label: "Cada 12 horas", value: 12 },
  { label: "Cada 24 horas", value: 24 },
];

const SOUND_LABELS: Record<SoundOption, string> = {
  default: "Por defecto",
  notification: "Notificación",
  alarm: "Alarma",
  reminder: "Recordatorio",
  urgent: "Urgente",
};

export default function AlertsScreen() {
  const {
    medications, isLoading, error, permissionGranted, globalSoundName,
    loadMedications, addMedication, updateMedication, removeMedication,
    toggleMedication, setGlobalSound, clearError,
  } = useMedicationStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequencyHours, setFrequencyHours] = useState(8);
  const [startTime, setStartTime] = useState("08:00");
  const [soundName, setSoundName] = useState<SoundOption>("default");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [tempTime, setTempTime] = useState("08:00");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMedications();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setName("");
    setDosage("");
    setFrequencyHours(8);
    setStartTime("08:00");
    setSoundName(globalSoundName);
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (med: Medication) => {
    setEditingId(med.id);
    setName(med.name);
    setDosage(med.dosage);
    setFrequencyHours(med.frequencyHours);
    setStartTime(med.startTime);
    setSoundName(med.soundName || globalSoundName);
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Ingresa el nombre del medicamento";
    if (!dosage.trim()) errors.dosage = "Ingresa la dosis (ej. 500mg)";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const data = {
      name: name.trim(),
      dosage: dosage.trim(),
      frequencyHours,
      startTime,
      soundName,
    };

    if (editingId) {
      await updateMedication(editingId, data);
    } else {
      await addMedication(data);
    }

    if (!useMedicationStore.getState().error) {
      setShowForm(false);
      setEditingId(null);
      setName("");
      setDosage("");
      setFrequencyHours(8);
      setStartTime("08:00");
      setSoundName("default");
      setFormErrors({});
    }
  };

  const handleRemove = (medication: Medication) => {
    Alert.alert(
      "Eliminar medicamento",
      `¿Deseas eliminar ${medication.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => removeMedication(medication.id),
        },
      ]
    );
  };

  const handleToggle = (id: string) => {
    toggleMedication(id);
  };

  const handleSoundSelect = (sound: SoundOption) => {
    setSoundName(sound);
    setShowSoundPicker(false);
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  if (isLoading && medications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Cargando medicamentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Alertas de Medicamentos</Text>
            <Text style={styles.headerSub}>Programa tus recordatorios</Text>
          </View>
          <TouchableOpacity
            style={styles.soundHeaderBtn}
            onPress={() => setShowSoundPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.soundHeaderIcon}>🔔</Text>
            <Text style={styles.soundHeaderLabel}>{SOUND_LABELS[globalSoundName]}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isExpoGo ? (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            Modo demo (Expo Go): las notificaciones requieren un build de desarrollo. Los medicamentos se guardan pero no generan alertas reales.
          </Text>
        </View>
      ) : !permissionGranted && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            Activa los permisos de notificacion para programar alertas.
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lista de medicamentos */}
        {medications.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>
              Tus medicamentos ({medications.length})
            </Text>

            {medications.map((med) => (
              <View key={med.id} style={[styles.medCard, !med.isActive && styles.medCardInactive]}>
                <View style={styles.medHeader}>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <Text style={styles.medDosage}>{med.dosage}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleBtn, med.isActive && styles.toggleBtnActive]}
                    onPress={() => handleToggle(med.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.toggleText, med.isActive && styles.toggleTextActive]}>
                      {med.isActive ? "ON" : "OFF"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.medDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>⏰</Text>
                    <Text style={styles.detailText}>
                      {formatTimeDisplay(med.startTime)} - Cada {med.frequencyHours}h
                    </Text>
                  </View>
                  {med.soundName && med.soundName !== "default" && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>🔔</Text>
                      <Text style={styles.detailText}>
                        {SOUND_LABELS[med.soundName]}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEditForm(med)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleRemove(med)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Empty state */}
        {medications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💊</Text>
            <Text style={styles.emptyTitle}>Sin medicamentos</Text>
            <Text style={styles.emptyDesc}>
              Agrega tu primer medicamento para recibir recordatorios.
            </Text>
          </View>
        )}

        {/* Boton agregar */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddForm}
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonText}>+ Agregar Medicamento</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal formulario (add / edit) */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Editar Medicamento" : "Nuevo Medicamento"}
              </Text>
              <TouchableOpacity
                onPress={() => { setShowForm(false); setFormErrors({}); }}
                style={styles.closeBtn}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre del medicamento *</Text>
                <TextInput
                  style={[styles.input, formErrors.name && styles.inputError]}
                  placeholder="Ej. Paracetamol"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={(t) => { setName(t); setFormErrors({ ...formErrors, name: "" }); }}
                />
                {formErrors.name ? <Text style={styles.fieldError}>{formErrors.name}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Dosis *</Text>
                <TextInput
                  style={[styles.input, formErrors.dosage && styles.inputError]}
                  placeholder="Ej. 500mg"
                  placeholderTextColor="#9ca3af"
                  value={dosage}
                  onChangeText={(t) => { setDosage(t); setFormErrors({ ...formErrors, dosage: "" }); }}
                />
                {formErrors.dosage ? <Text style={styles.fieldError}>{formErrors.dosage}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Frecuencia *</Text>
                <View style={styles.frequencyOptions}>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.freqBtn, frequencyHours === opt.value && styles.freqBtnActive]}
                      onPress={() => setFrequencyHours(opt.value)}
                    >
                      <Text style={[styles.freqText, frequencyHours === opt.value && styles.freqTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Hora de inicio *</Text>
                <TouchableOpacity
                  style={styles.timePickerBtn}
                  onPress={() => {
                    setTempTime(startTime);
                    setShowTimePicker(true);
                  }}
                >
                  <Text style={styles.timePickerText}>{formatTimeDisplay(startTime)}</Text>
                  <Text style={styles.timePickerIcon}>🕐</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Sonido de la alerta</Text>
                <TouchableOpacity
                  style={styles.soundPickerBtn}
                  onPress={() => setShowSoundPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.soundPickerText}>
                    {SOUND_LABELS[soundName]}
                  </Text>
                  <Text style={styles.soundPickerIcon}>🔔</Text>
                </TouchableOpacity>
              </View>

              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={handleSave}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <View style={styles.submitRow}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.submitText}>Guardando...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitText}>
                    {editingId ? "Guardar Cambios" : "Programar Alertas"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        animationType="fade"
        transparent
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Selecciona la hora</Text>
            
            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hora</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <Pressable
                      key={i}
                      style={[styles.pickerItem, parseInt(tempTime.split(":")[0]) === i && styles.pickerItemSelected]}
                      onPress={() => {
                        const mins = tempTime.split(":")[1];
                        setTempTime(`${i.toString().padStart(2, "0")}:${mins}`);
                      }}
                    >
                      <Text style={[styles.pickerItemText, parseInt(tempTime.split(":")[0]) === i && styles.pickerItemTextSelected]}>
                        {i.toString().padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minuto</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 60 }, (_, i) => (
                    <Pressable
                      key={i}
                      style={[styles.pickerItem, parseInt(tempTime.split(":")[1]) === i && styles.pickerItemSelected]}
                      onPress={() => {
                        const hours = tempTime.split(":")[0];
                        setTempTime(`${hours}:${i.toString().padStart(2, "0")}`);
                      }}
                    >
                      <Text style={[styles.pickerItemText, parseInt(tempTime.split(":")[1]) === i && styles.pickerItemTextSelected]}>
                        {i.toString().padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.pickerButtons}>
              <TouchableOpacity style={styles.pickerCancelBtn} onPress={() => setShowTimePicker(false)}>
                <Text style={styles.pickerCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pickerConfirmBtn}
                onPress={() => {
                  setStartTime(tempTime);
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.pickerConfirmText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sound Picker Modal (global o por medicamento) */}
      <Modal
        visible={showSoundPicker}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSoundPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.soundPickerModalContent}>
            <Text style={styles.pickerTitle}>Sonido de alerta</Text>
            <Text style={styles.soundPickerSub}>
              {editingId || showForm
                ? "Solo para este medicamento"
                : "Sonido global para todas las alertas"}
            </Text>

            <View style={styles.soundOptionsList}>
              {SOUND_OPTIONS.map((opt) => {
                const isSelected = showForm ? soundName === opt.value : globalSoundName === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.soundOptionItem, isSelected && styles.soundOptionItemSelected]}
                    onPress={() => {
                      if (showForm) {
                        handleSoundSelect(opt.value);
                      } else {
                        setGlobalSound(opt.value);
                        setShowSoundPicker(false);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.soundOptionInfo}>
                      <Text style={[styles.soundOptionLabel, isSelected && styles.soundOptionLabelSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.soundOptionDesc}>{opt.description}</Text>
                    </View>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.pickerConfirmBtn}
              onPress={() => setShowSoundPicker(false)}
            >
              <Text style={styles.pickerConfirmText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  loadingContainer: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6b7280" },

  header: { backgroundColor: "#15803d", paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTextBlock: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 15, color: "#bbf7d0", marginTop: 4 },

  soundHeaderBtn: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10 },
  soundHeaderIcon: { fontSize: 18 },
  soundHeaderLabel: { fontSize: 11, color: "#bbf7d0", marginTop: 2, fontWeight: "500" },

  warningBanner: { backgroundColor: "#fef3c7", padding: 12, marginHorizontal: 18, marginTop: 12, borderRadius: 8 },
  warningText: { fontSize: 13, color: "#92400e", textAlign: "center" },

  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 32 },

  sectionLabel: { fontSize: 18, fontWeight: "700", color: "#1f2937", marginBottom: 16 },

  medCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  medCardInactive: { opacity: 0.6 },

  medHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  medInfo: { flex: 1 },
  medName: { fontSize: 18, fontWeight: "600", color: "#1f2937" },
  medDosage: { fontSize: 14, color: "#6b7280", marginTop: 2 },

  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "#e5e7eb" },
  toggleBtnActive: { backgroundColor: "#16a34a" },
  toggleText: { fontSize: 12, fontWeight: "700", color: "#6b7280" },
  toggleTextActive: { color: "#fff" },

  medDetails: { marginBottom: 12 },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  detailIcon: { fontSize: 16, marginRight: 8 },
  detailText: { fontSize: 14, color: "#4b5563" },

  cardActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 12 },
  editBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  editText: { fontSize: 13, color: "#2563eb", fontWeight: "500" },
  deleteBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  deleteText: { fontSize: 13, color: "#ef4444", fontWeight: "500" },

  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#1f2937", marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: "#6b7280", textAlign: "center" },

  addButton: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#1f2937" },
  closeBtn: { padding: 8 },
  closeText: { fontSize: 20, color: "#6b7280" },

  formGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "600", color: "#4b5563", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  inputError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  fieldError: { color: "#ef4444", fontSize: 12, marginTop: 4 },

  frequencyOptions: { gap: 8 },
  freqBtn: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
  },
  freqBtnActive: { borderColor: "#16a34a", backgroundColor: "#dcfce7" },
  freqText: { fontSize: 15, color: "#374151" },
  freqTextActive: { color: "#15803d", fontWeight: "600" },

  timePickerBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#f9fafb",
  },
  timePickerText: { fontSize: 18, fontWeight: "600", color: "#1f2937" },
  timePickerIcon: { fontSize: 22 },

  soundPickerBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#f9fafb",
  },
  soundPickerText: { fontSize: 16, fontWeight: "500", color: "#1f2937" },
  soundPickerIcon: { fontSize: 18 },

  soundPickerModalContent: { backgroundColor: "#fff", borderRadius: 20, padding: 20, width: "85%", maxWidth: 340 },
  soundPickerSub: { fontSize: 13, color: "#6b7280", textAlign: "center", marginBottom: 16, marginTop: -8 },
  soundOptionsList: { gap: 8, marginBottom: 16 },
  soundOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
  },
  soundOptionItemSelected: { borderColor: "#16a34a", backgroundColor: "#dcfce7" },
  soundOptionInfo: { flex: 1 },
  soundOptionLabel: { fontSize: 15, fontWeight: "600", color: "#374151" },
  soundOptionLabelSelected: { color: "#15803d" },
  soundOptionDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  checkMark: { fontSize: 18, color: "#16a34a", fontWeight: "700" },

  errorBanner: { backgroundColor: "#fef2f2", padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { fontSize: 13, color: "#dc2626", textAlign: "center" },

  submitBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  submitRow: { flexDirection: "row", alignItems: "center" },

  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  pickerContent: { backgroundColor: "#fff", borderRadius: 20, padding: 20, width: "80%", maxWidth: 300 },
  pickerTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937", textAlign: "center", marginBottom: 16 },
  pickerRow: { flexDirection: "row", justifyContent: "center", gap: 16 },
  pickerColumn: { alignItems: "center" },
  pickerLabel: { fontSize: 14, fontWeight: "500", color: "#6b7280", marginBottom: 8 },
  pickerScroll: { height: 150, width: 60 },
  pickerItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  pickerItemSelected: { backgroundColor: "#16a34a" },
  pickerItemText: { fontSize: 18, color: "#374151", textAlign: "center" },
  pickerItemTextSelected: { color: "#fff", fontWeight: "600" },
  pickerButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, gap: 12 },
  pickerCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#f3f4f6", alignItems: "center" },
  pickerCancelText: { fontSize: 15, color: "#6b7280", fontWeight: "500" },
  pickerConfirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#16a34a", alignItems: "center" },
  pickerConfirmText: { fontSize: 15, color: "#fff", fontWeight: "600" },
});
