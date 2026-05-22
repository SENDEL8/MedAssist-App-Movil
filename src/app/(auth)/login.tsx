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

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) { setEmailError("El correo es requerido"); return false; }
    if (!regex.test(value)) { setEmailError("Ingresa un correo valido"); return false; }
    setEmailError("");
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) { setPasswordError("La contrasena es requerida"); return false; }
    setPasswordError("");
    return true;
  };

  const handleLogin = async () => {
    clearError();
    if (!validateEmail(email) || !validatePassword(password)) return;
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🏥</Text>
        <Text style={styles.headerTitle}>MedAssist</Text>
        <Text style={styles.headerSub}>Tu asistente medico personal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Inicio de Sesion</Text>
          <Text style={styles.formSub}>Ingresa tus credenciales para continuar</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Correo electronico</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="usuario@dominio.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              value={email}
              onChangeText={(text) => { setEmail(text); if (emailError) validateEmail(text); }}
            />
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contrasena</Text>
            <TextInput
              style={[styles.input, passwordError && styles.inputError]}
              placeholder="Tu contrasena"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              value={password}
              onChangeText={(text) => { setPassword(text); if (passwordError) validatePassword(text); }}
            />
            {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{isLoading ? "Iniciando sesion..." : "Iniciar Sesion"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.link} onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.linkText}>
            No tienes cuenta? <Text style={styles.linkBold}>Registrate</Text>
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

  /* Form card */
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
  formTitle: { fontSize: 22, fontWeight: "bold", color: "#1f2937", marginBottom: 4 },
  formSub: { fontSize: 14, color: "#6b7280", marginBottom: 24 },

  /* Error */
  errorBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef2f2", borderRadius: 12, padding: 14, marginBottom: 20 },
  errorIcon: { fontSize: 18, marginRight: 10 },
  errorText: { flex: 1, color: "#dc2626", fontSize: 14 },

  /* Fields */
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

  /* Button */
  button: { backgroundColor: "#16a34a", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8, shadowColor: "#16a34a", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },

  /* Link */
  link: { marginTop: 24, alignItems: "center", paddingBottom: 24 },
  linkText: { color: "#6b7280", fontSize: 15 },
  linkBold: { color: "#16a34a", fontWeight: "600" },
});
