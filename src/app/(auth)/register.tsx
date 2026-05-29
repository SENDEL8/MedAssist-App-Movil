import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [birthDateError, setBirthDateError] = useState("");

  const validateFullName = (value: string) => {
    if (!value.trim()) { setFullNameError("El nombre es requerido"); return false; }
    if (value.trim().length < 2) { setFullNameError("Minimo 2 caracteres"); return false; }
    setFullNameError("");
    return true;
  };

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) { setEmailError("El correo es requerido"); return false; }
    if (!regex.test(value)) { setEmailError("Ingresa un correo valido"); return false; }
    setEmailError("");
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) { setPasswordError("La contrasena es requerida"); return false; }
    if (value.length < 8) { setPasswordError("Minimo 8 caracteres"); return false; }
    if (!/[A-Z]/.test(value)) { setPasswordError("Debe tener una mayuscula"); return false; }
    if (!/[a-z]/.test(value)) { setPasswordError("Debe tener una minuscula"); return false; }
    if (!/[0-9]/.test(value)) { setPasswordError("Debe tener un numero"); return false; }
    if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value)) { setPasswordError("Debe tener un caracter especial (!@#$%^&*...)"); return false; }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) { setConfirmPasswordError("Confirma tu contrasena"); return false; }
    if (value !== password) { setConfirmPasswordError("Las contrasenas no coinciden"); return false; }
    setConfirmPasswordError("");
    return true;
  };

  const validateBirthDate = (value: string): boolean => {
    if (!value.trim()) { setBirthDateError(""); return true; }
    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) { setBirthDateError("Formato invalido. Use DD/MM/AAAA"); return false; }
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) { setBirthDateError("Fecha invalida"); return false; }
    if (d > new Date()) { setBirthDateError("La fecha no puede ser futura"); return false; }
    setBirthDateError("");
    return true;
  };

  const handleRegister = async () => {
    clearError();
    if (!validateFullName(fullName) || !validateEmail(email) || !validatePassword(password) || !validateConfirmPassword(confirmPassword) || !validateBirthDate(birthDate)) return;
    try {
      const birthDateIso = birthDate ? birthDate.split("/").reverse().join("-") : undefined;
      await register(email.trim().toLowerCase(), password, fullName.trim(), birthDateIso, gender || undefined);
      router.replace({ pathname: "/(auth)/verify-email", params: { email: email.trim().toLowerCase() } });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🩺</Text>
        <Text style={styles.headerTitle}>Crear Cuenta</Text>
        <Text style={styles.headerSub}>Completa tus datos para registrarte</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput style={[styles.input, fullNameError && styles.inputError]} placeholder="Juan Perez" placeholderTextColor="#9ca3af" returnKeyType="next" value={fullName} onChangeText={(t) => { setFullName(t); if (fullNameError) validateFullName(t); }} />
            {fullNameError ? <Text style={styles.fieldError}>{fullNameError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo electronico</Text>
            <TextInput style={[styles.input, emailError && styles.inputError]} placeholder="usuario@dominio.com" placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none" returnKeyType="next" value={email} onChangeText={(t) => { setEmail(t); if (emailError) validateEmail(t); }} />
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contrasena</Text>
            <TextInput style={[styles.input, passwordError && styles.inputError]} placeholder="Minimo 8 caracteres" placeholderTextColor="#9ca3af" secureTextEntry autoCapitalize="none" autoCorrect={false} returnKeyType="next" value={password} onChangeText={(t) => { setPassword(t); if (passwordError) validatePassword(t); }} />
            {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirmar contrasena</Text>
            <TextInput style={[styles.input, confirmPasswordError && styles.inputError]} placeholder="Repite tu contrasena" placeholderTextColor="#9ca3af" secureTextEntry autoCapitalize="none" autoCorrect={false} returnKeyType="done" onSubmitEditing={handleRegister} value={confirmPassword} onChangeText={(t) => { setConfirmPassword(t); if (confirmPasswordError) validateConfirmPassword(t); }} />
            {confirmPasswordError ? <Text style={styles.fieldError}>{confirmPasswordError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Fecha de nacimiento (opcional)</Text>
            <TextInput style={[styles.input, birthDateError && styles.inputError]} placeholder="DD/MM/AAAA — Ej. 15/03/1990" placeholderTextColor="#9ca3af" value={birthDate} onChangeText={(t) => { setBirthDate(t); if (birthDateError) setBirthDateError(""); }} keyboardType="number-pad" />
            {birthDateError ? <Text style={styles.fieldError}>{birthDateError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Genero (opcional)</Text>
            <View style={styles.genderRow}>
              {["Masculino", "Femenino"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => setGender(gender === g ? "" : g)}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleRegister} disabled={isLoading} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{isLoading ? "Registrando..." : "Registrarse"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.link} onPress={() => router.back()}>
          <Text style={styles.linkText}>
            Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesion</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#15803d", paddingTop: 60, paddingBottom: 32, alignItems: "center" },
  headerIcon: { fontSize: 56, marginBottom: 12 },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 16, color: "#bbf7d0", marginTop: 6 },
  body: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24 },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  errorBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef2f2", borderRadius: 12, padding: 14, marginBottom: 20 },
  errorIcon: { fontSize: 18, marginRight: 10 },
  errorText: { flex: 1, color: "#dc2626", fontSize: 14 },

  field: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  inputError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  fieldError: { color: "#ef4444", fontSize: 12, marginTop: 6 },

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

  button: { backgroundColor: "#16a34a", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8, shadowColor: "#16a34a", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },

  link: { marginTop: 24, alignItems: "center", paddingBottom: 24 },
  linkText: { color: "#6b7280", fontSize: 15 },
  linkBold: { color: "#16a34a", fontWeight: "600" },
});
