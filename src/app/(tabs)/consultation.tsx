import { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { authApi, medicalApi } from "@/services/api";

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

  useEffect(() => {
    (async () => {
      try {
        const prefill = await authApi.getPrefill();
        if (prefill.age) setAge(String(prefill.age));
        if (prefill.gender) setGender(prefill.gender);
      } catch {
        // silencioso — si falla el prefill, el usuario completa manual
      }
    })();
  }, []);

  // Validation functions for real-time feedback
  const validateAge = (value: string): string | null => {
    if (!value) return "Edad requerida";
    const ageNum = parseInt(value, 10);
    if (isNaN(ageNum)) return "Ingrese un número válido";
    if (ageNum <= 0) return "La edad debe ser mayor a 0";
    if (ageNum > 120) return "La edad debe ser menor o igual a 120";
    return null;
  };

  const validateTemperature = (value: string): string | null => {
    if (!value) return "Temperatura requerida";
    const tempNum = parseFloat(value);
    if (isNaN(tempNum)) return "Ingrese un número válido";
    if (tempNum < 34.0) return "Temperatura muy baja (mín. 34.0°C)";
    if (tempNum > 43.0) return "Temperatura muy alta (máx. 43.0°C)";
    return null;
  };

  const validateHeartRate = (value: string): string | null => {
    if (!value) return "Frecuencia cardíaca requerida";
    const hrNum = parseInt(value, 10);
    if (isNaN(hrNum)) return "Ingrese un número válido";
    if (hrNum < 30) return "Frecuencia muy baja (mín. 30 lpm)";
    if (hrNum > 220) return "Frecuencia muy alta (máx. 220 lpm)";
    return null;
  };

  const validateSystolicBP = (value: string): string | null => {
    if (!value) return null; // Optional field
    const sysNum = parseInt(value, 10);
    if (isNaN(sysNum)) return "Ingrese un número válido";
    if (sysNum < 70) return "Presión muy baja (mín. 70 mmHg)";
    if (sysNum > 260) return "Presión muy alta (máx. 260 mmHg)";
    return null;
  };

  const validateDiastolicBP = (value: string): string | null => {
    if (!value) return null; // Optional field
    const diaNum = parseInt(value, 10);
    if (isNaN(diaNum)) return "Ingrese un número válido";
    if (diaNum < 40) return "Presión muy baja (mín. 40 mmHg)";
    if (diaNum > 160) return "Presión muy alta (máx. 160 mmHg)";
    return null;
  };

  const validateSymptomsAndDescription = (): string | null => {
    if (selectedSymptoms.length === 0 && !description.trim()) {
      return "Selecciona síntomas o describe cómo te sientes";
    }
    return null;
  };

  const validateDescription = (value: string): string | null => {
    // Validate the combined symptoms/description rule
    return validateSymptomsAndDescription();
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => {
      const newSelected = prev.includes(symptom) 
        ? prev.filter((s) => s !== symptom) 
        : [...prev, symptom];
      setSelectedSymptoms(newSelected);
      // Validate the combined rule
      const error = validateSymptomsAndDescription();
      setErrors(prev => ({ ...prev, symptoms: error || "" }));
      return newSelected;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate each field using the same logic as real-time validation
    const ageError = validateAge(age);
    if (ageError) newErrors.age = ageError;
    
    if (!gender) newErrors.gender = "Selecciona un genero";
    
    const tempError = validateTemperature(temperature);
    if (tempError) newErrors.temperature = tempError;
    
    const hrError = validateHeartRate(heartRate);
    if (hrError) newErrors.heartRate = hrError;
    
    const sysError = validateSystolicBP(systolicBp);
    if (sysError) newErrors.systolicBp = sysError;
    
    const diaError = validateDiastolicBP(diastolicBp);
    if (diaError) newErrors.diastolicBp = diaError;
    
    const symptomsError = validateSymptomsAndDescription();
    if (symptomsError) newErrors.symptoms = symptomsError;
    
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
            <Ionicons name="person" size={24} color="#15803d" />
            <Text style={styles.cardTitle}>Informacion basica</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.halfField, { marginRight: 8 }]}>
              <Text style={styles.label}>Edad *</Text>
                <TextInput
                  style={[styles.input, 
                    errors.age && styles.inputError, 
                    age && !errors.age && styles.inputSuccess]}
                  placeholder="Ej. 25"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={age}
                  onChangeText={(t) => {
                    setAge(t);
                    const error = validateAge(t);
                    setErrors(prev => ({ ...prev, age: error || "" }));
                  }}
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
            <Ionicons name="heart" size={24} color="#dc2626" />
            <Text style={styles.cardTitle}>Valores actuales</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.halfField, { marginRight: 8 }]}>
              <Text style={styles.label}>Temperatura (°C) *</Text>
                <TextInput
                  style={[styles.input, 
                    errors.temperature && styles.inputError, 
                    temperature && !errors.temperature && styles.inputSuccess]}
                  keyboardType="decimal-pad"
                  value={temperature}
                  onChangeText={(t) => {
                    setTemperature(t);
                    const error = validateTemperature(t);
                    setErrors(prev => ({ ...prev, temperature: error || "" }));
                  }}
                />
              {errors.temperature ? <Text style={styles.fieldError}>{errors.temperature}</Text> : null}
            </View>
            <View style={[styles.halfField, { marginLeft: 8 }]}>
              <Text style={styles.label}>Frec. Cardiaca (lpm) *</Text>
                <TextInput
                  style={[styles.input, 
                    errors.heartRate && styles.inputError, 
                    heartRate && !errors.heartRate && styles.inputSuccess]}
                  keyboardType="number-pad"
                  value={heartRate}
                  onChangeText={(t) => {
                    setHeartRate(t);
                    const error = validateHeartRate(t);
                    setErrors(prev => ({ ...prev, heartRate: error || "" }));
                  }}
                />
              {errors.heartRate ? <Text style={styles.fieldError}>{errors.heartRate}</Text> : null}
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.halfField, { marginRight: 8 }]}>
              <Text style={styles.label}>Presion Sistolica</Text>
                <TextInput
                  style={[styles.input, 
                    errors.systolicBp && styles.inputError, 
                    systolicBp && !errors.systolicBp && styles.inputSuccess]}
                  placeholder="Ej. 120"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={systolicBp}
                  onChangeText={(t) => {
                    setSystolicBp(t);
                    const error = validateSystolicBP(t);
                    setErrors(prev => ({ ...prev, systolicBp: error || "" }));
                  }}
                />
              {errors.systolicBp ? <Text style={styles.fieldError}>{errors.systolicBp}</Text> : null}
            </View>
            <View style={[styles.halfField, { marginLeft: 8 }]}>
              <Text style={styles.label}>Presion Diastolica</Text>
                <TextInput
                  style={[styles.input, 
                    errors.diastolicBp && styles.inputError, 
                    diastolicBp && !errors.diastolicBp && styles.inputSuccess]}
                  placeholder="Ej. 80"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={diastolicBp}
                  onChangeText={(t) => {
                    setDiastolicBp(t);
                    const error = validateDiastolicBP(t);
                    setErrors(prev => ({ ...prev, diastolicBp: error || "" }));
                  }}
                />
              {errors.diastolicBp ? <Text style={styles.fieldError}>{errors.diastolicBp}</Text> : null}
            </View>
          </View>
        </View>

        {/* Sintomas */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="thermometer" size={24} color="#d97706" />
            <Text style={styles.cardTitle}>Sintomas</Text>
          </View>
          <Text style={styles.subLabel}>Opcional. Selecciona los que apliquen, o conta en la descripcion</Text>
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
            <Ionicons name="document-text" size={24} color="#15803d" />
            <Text style={styles.cardTitle}>Descripcion adicional</Text>
          </View>
          <Text style={styles.subLabel}>Opcional</Text>
            <TextInput
              style={[styles.textArea, 
                errors.symptoms && styles.inputError, 
                (selectedSymptoms.length > 0 || description.trim()) && !errors.symptoms && styles.inputSuccess]}
              placeholder="Cuentanos mas sobre como te sientes..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                const error = validateSymptomsAndDescription();
                setErrors(prev => ({ ...prev, symptoms: error || "" }));
              }}
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
  root: { flex: 1, backgroundColor: "#f1f5f9" },
  header: { backgroundColor: "#15803d", paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 14, color: "#bbf7d0", marginTop: 6 },
  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },

  /* Cards - Enhanced */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b" },
  subLabel: { fontSize: 13, color: "#94a3b8", marginBottom: 12, marginTop: -4 },

  /* Form */
  row: { flexDirection: "row", marginBottom: 14 },
  halfField: { flex: 1 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8, marginLeft: 2 },
  input: {
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
  inputError: { borderColor: "#f87171", backgroundColor: "#fef2f2" },
  inputSuccess: { borderColor: "#22c55e", backgroundColor: "#dcfce7" },
  fieldError: { color: "#ef4444", fontSize: 12, marginTop: 6, marginLeft: 2 },

  /* Gender - Enhanced */
  genderRow: { flexDirection: "row", gap: 12 },
  genderBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  genderBtnActive: { borderColor: "#22c55e", backgroundColor: "#dcfce7" },
  genderText: { fontSize: 15, color: "#64748b", fontWeight: "500" },
  genderTextActive: { color: "#15803d", fontWeight: "700" },

  /* Chips - Enhanced */
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  chipActive: { borderColor: "#22c55e", backgroundColor: "#dcfce7" },
  chipText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  chipTextActive: { color: "#15803d", fontWeight: "700" },

  /* Textarea - Enhanced */
  textArea: {
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1e293b",
    minHeight: 120,
    backgroundColor: "#f8fafc",
  },

  /* Submit - Enhanced */
  submitButton: {
    backgroundColor: "#16a34a",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18, letterSpacing: 0.5 },
  loadingRow: { flexDirection: "row", alignItems: "center" },
});
