import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { medicalApi } from "@/services/api";

const SYMPTOMS_LIST = [
  "Fiebre", "Tos", "Dolor de cabeza", "Fatiga", "Nauseas",
  "Vomitos", "Mareos", "Dolor de garganta", "Dolor muscular", "Dolor abdominal",
  "Diarrea", "Dificultad para respirar", "Escalofrios", "Perdida de apetito",
  "Insomnio", "Dolor de espalda", "Dolor articular", "Erupcion",
  "Ojos rojos", "Congestion",
];

export default function ConsultationScreen() {
  const router = useRouter();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [temperature, setTemperature] = useState("36.5");
  const [heartRate, setHeartRate] = useState("70");
  const [systolicBp, setSystolicBp] = useState("");
  const [diastolicBp, setDiastolicBp] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) newErrors.age = "Edad invalida (0-120)";
    if (!gender) newErrors.gender = "Selecciona un genero";
    const tempNum = parseFloat(temperature);
    if (isNaN(tempNum) || tempNum < 34.0 || tempNum > 43.0) newErrors.temperature = "Fuera de rango (34.0-43.0 C)";
    const hrNum = parseInt(heartRate, 10);
    if (isNaN(hrNum) || hrNum < 30 || hrNum > 220) newErrors.heartRate = "Fuera de rango (30-220 BPM)";
    if (systolicBp) {
      const sys = parseInt(systolicBp, 10);
      if (isNaN(sys) || sys < 70 || sys > 260) newErrors.systolicBp = "Rango: 70-260";
    }
    if (diastolicBp) {
      const dia = parseInt(diastolicBp, 10);
      if (isNaN(dia) || dia < 40 || dia > 160) newErrors.diastolicBp = "Rango: 40-160";
    }
    if (selectedSymptoms.length === 0) newErrors.symptoms = "Selecciona al menos un sintoma";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload: any = {
        age: parseInt(age, 10),
        gender,
        temperature: parseFloat(temperature),
        heart_rate: parseInt(heartRate, 10),
        symptoms: selectedSymptoms,
        description: description || undefined,
      };
      if (systolicBp) payload.systolic_bp = parseInt(systolicBp, 10);
      if (diastolicBp) payload.diastolic_bp = parseInt(diastolicBp, 10);

      const result = await medicalApi.createConsultation(payload as any);
      router.push({
        pathname: "/(tabs)/result" as any,
        params: {
          resumen: result.resumen,
          nivel_atencion: result.nivel_atencion,
          recomendacion: result.recomendacion,
        },
      });
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.detail || "Error al enviar la consulta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Consulta de Sintomas</Text>
        <Text style={styles.headerSub}>Completa tus datos para un analisis preciso</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Datos del Paciente */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardTitle}>Informacion basica</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.halfField, { marginRight: 8 }]}>
              <Text style={styles.label}>Edad *</Text>
              <TextInput
                style={[styles.input, errors.age && styles.inputError]}
                placeholder="Ej. 25"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={age}
                onChangeText={(t) => { setAge(t); setErrors({ ...errors, age: "" }); }}
              />
              {errors.age ? <Text style={styles.fieldError}>{errors.age}</Text> : null}
            </View>
            <View style={[styles.halfField, { marginLeft: 8 }]}>
              <Text style={styles.label}>Genero *</Text>
              <View style={styles.genderRow}>
                {["Masculino", "Femenino"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    onPress={() => { setGender(g); setErrors({ ...errors, gender: "" }); }}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender ? <Text style={styles.fieldError}>{errors.gender}</Text> : null}
            </View>
          </View>
        </View>

        {/* Signos Vitales */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💓</Text>
            <Text style={styles.cardTitle}>Valores actuales</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.halfField, { marginRight: 8 }]}>
              <Text style={styles.label}>Temperatura (°C) *</Text>
              <TextInput
                style={[styles.input, errors.temperature && styles.inputError]}
                keyboardType="decimal-pad"
                value={temperature}
                onChangeText={(t) => { setTemperature(t); setErrors({ ...errors, temperature: "" }); }}
              />
              {errors.temperature ? <Text style={styles.fieldError}>{errors.temperature}</Text> : null}
            </View>
            <View style={[styles.halfField, { marginLeft: 8 }]}>
              <Text style={styles.label}>Frec. Cardiaca (lpm) *</Text>
              <TextInput
                style={[styles.input, errors.heartRate && styles.inputError]}
                keyboardType="number-pad"
                value={heartRate}
                onChangeText={(t) => { setHeartRate(t); setErrors({ ...errors, heartRate: "" }); }}
              />
              {errors.heartRate ? <Text style={styles.fieldError}>{errors.heartRate}</Text> : null}
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.halfField, { marginRight: 8 }]}>
              <Text style={styles.label}>Presion Sistolica</Text>
              <TextInput
                style={[styles.input, errors.systolicBp && styles.inputError]}
                placeholder="Ej. 120"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={systolicBp}
                onChangeText={(t) => { setSystolicBp(t); setErrors({ ...errors, systolicBp: "" }); }}
              />
              {errors.systolicBp ? <Text style={styles.fieldError}>{errors.systolicBp}</Text> : null}
            </View>
            <View style={[styles.halfField, { marginLeft: 8 }]}>
              <Text style={styles.label}>Presion Diastolica</Text>
              <TextInput
                style={[styles.input, errors.diastolicBp && styles.inputError]}
                placeholder="Ej. 80"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={diastolicBp}
                onChangeText={(t) => { setDiastolicBp(t); setErrors({ ...errors, diastolicBp: "" }); }}
              />
              {errors.diastolicBp ? <Text style={styles.fieldError}>{errors.diastolicBp}</Text> : null}
            </View>
          </View>
        </View>

        {/* Sintomas */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🤒</Text>
            <Text style={styles.cardTitle}>Sintomas</Text>
          </View>
          <Text style={styles.subLabel}>Selecciona todos los que apliquen *</Text>
          <View style={styles.chipsContainer}>
            {SYMPTOMS_LIST.map((s) => {
              const isActive = selectedSymptoms.includes(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => { toggleSymptom(s); setErrors({ ...errors, symptoms: "" }); }}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.symptoms ? <Text style={styles.fieldError}>{errors.symptoms}</Text> : null}
        </View>

        {/* Descripcion */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📝</Text>
            <Text style={styles.cardTitle}>Descripcion adicional</Text>
          </View>
          <Text style={styles.subLabel}>Opcional</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Cuentanos mas sobre como te sientes..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitButtonText}>Analizando...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Enviar Consulta</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#15803d", paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 15, color: "#bbf7d0", marginTop: 4 },
  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 32 },

  /* Cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  cardIcon: { fontSize: 22, marginRight: 10 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1f2937" },
  subLabel: { fontSize: 13, color: "#9ca3af", marginBottom: 10 },

  /* Form */
  row: { flexDirection: "row", marginBottom: 12 },
  halfField: { flex: 1 },
  label: { fontSize: 13, fontWeight: "600", color: "#4b5563", marginBottom: 6 },
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

  /* Gender */
  genderRow: { flexDirection: "row", gap: 10 },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  genderBtnActive: { borderColor: "#16a34a", backgroundColor: "#dcfce7" },
  genderText: { fontSize: 14, color: "#374151" },
  genderTextActive: { color: "#15803d", fontWeight: "600" },

  /* Chips */
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  chipActive: { borderColor: "#16a34a", backgroundColor: "#dcfce7" },
  chipText: { fontSize: 13, color: "#4b5563" },
  chipTextActive: { color: "#15803d", fontWeight: "600" },

  /* Textarea */
  textArea: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1f2937",
    minHeight: 100,
    backgroundColor: "#f9fafb",
  },

  /* Submit */
  submitButton: {
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
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  loadingRow: { flexDirection: "row", alignItems: "center" },
});
