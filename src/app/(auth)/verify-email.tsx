import { useState, useRef, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email as string) || "";
  const { verifyEmail, resendCode, isLoading, error, clearError } = useAuthStore();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    clearError();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      Alert.alert("Error", "Ingresa el codigo completo de 6 digitos");
      return;
    }
    try {
      await verifyEmail(email, fullCode);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleResend = async () => {
    clearError();
    try {
      await resendCode(email);
      Alert.alert("Exito", "Codigo reenviado. Revisa tu email.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const isComplete = code.every((d) => d !== "");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      <View style={styles.header}>
        <Text style={styles.headerIcon}>📧</Text>
        <Text style={styles.headerTitle}>Verificar Email</Text>
        <Text style={styles.headerSub}>Ingresa el codigo que enviamos a tu correo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.emailText}>{email}</Text>

          <Text style={styles.codeLabel}>Codigo de verificacion</Text>

          <View style={styles.codeRow}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[styles.codeInput, code[index] && styles.codeInputFilled]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(t) => handleChange(t, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                textAlign="center"
              />
            ))}
          </View>

           {error ? (
             <View style={styles.errorBox}>
               <Ionicons name="alert-circle" size={20} color="#dc2626" />
               <Text style={styles.errorText}>{error}</Text>
             </View>
           ) : null}

          <TouchableOpacity
            style={[styles.button, (!isComplete || isLoading) && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={!isComplete || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verificar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendLink} onPress={handleResend} disabled={isLoading}>
            <Text style={styles.resendText}>
              ¿No recibiste el codigo? <Text style={styles.resendBold}>Reenviar</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backLink} onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.backText}>← Volver al inicio de sesion</Text>
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
    alignItems: "center",
  },
  emailText: { fontSize: 16, color: "#15803d", fontWeight: "600", marginBottom: 24, textAlign: "center" },
  codeLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 16 },

  codeRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  codeInputFilled: { borderColor: "#16a34a", backgroundColor: "#f0fdf4" },

  errorBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef2f2", borderRadius: 12, padding: 14, marginBottom: 20, width: "100%" },
  errorText: { flex: 1, color: "#dc2626", fontSize: 14, marginLeft: 10 },

  button: { backgroundColor: "#16a34a", borderRadius: 14, paddingVertical: 16, alignItems: "center", width: "100%", shadowColor: "#16a34a", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },

  resendLink: { marginTop: 20, alignItems: "center" },
  resendText: { color: "#6b7280", fontSize: 15 },
  resendBold: { color: "#16a34a", fontWeight: "600" },

  backLink: { marginTop: 24, alignItems: "center", paddingBottom: 24 },
  backText: { color: "#6b7280", fontSize: 15 },
});
