import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { authApi } from "@/services/api";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");
    if (!email) { setError("Correo no disponible. Vuelve a solicitar el codigo."); return; }
    if (!code.trim() || code.trim().length !== 6) { setError("Ingresa el codigo de 6 digitos"); return; }
    if (!newPassword || newPassword.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); return; }

    setIsLoading(true);
    try {
      await authApi.resetPassword(email, code.trim(), newPassword);
      setShowSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.detail || "Error al restablecer la contraseña";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <View style={[styles.root, styles.successContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#15803d" />
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Contraseña restablecida</Text>
          <Text style={styles.successDesc}>
            Tu contraseña se actualizó correctamente. Inicia sesión con tu nueva contraseña.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Ir al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔐</Text>
        <Text style={styles.headerTitle}>Nueva contraseña</Text>
        <Text style={styles.headerSub}>Ingresa el codigo y tu nueva contraseña</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Restablecer contraseña</Text>
          <Text style={styles.formSub}>
            Ingresa el codigo de 6 digitos que enviamos a {email} y tu nueva contraseña.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Codigo de verificacion</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(text) => { setCode(text.replace(/[^0-9]/g, "").slice(0, 6)); setError(""); }}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 8 caracteres, mayuscula, minuscula, numero, especial"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCapitalize="none"
              value={newPassword}
              onChangeText={(text) => { setNewPassword(text); setError(""); }}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  successContainer: { justifyContent: "center", alignItems: "center", padding: 24 },
  successCard: { backgroundColor: "#fff", borderRadius: 24, padding: 32, alignItems: "center", width: "100%", maxWidth: 340, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  successIcon: { fontSize: 56, marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: "bold", color: "#15803d", marginBottom: 12, textAlign: "center" },
  successDesc: { fontSize: 15, color: "#6b7280", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  header: { backgroundColor: "#15803d", paddingTop: 60, paddingBottom: 32, alignItems: "center" },
  headerIcon: { fontSize: 56, marginBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", textAlign: "center" },
  headerSub: { fontSize: 16, color: "#bbf7d0", marginTop: 6, textAlign: "center" },
  body: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24 },
  formCard: { backgroundColor: "#fff", borderRadius: 20, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  formTitle: { fontSize: 22, fontWeight: "bold", color: "#1f2937", marginBottom: 4 },
  formSub: { fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 20 },
  errorBox: { backgroundColor: "#fef2f2", borderRadius: 12, padding: 14, marginBottom: 20 },
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  field: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#1f2937", backgroundColor: "#f9fafb" },
  button: { backgroundColor: "#16a34a", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8, shadowColor: "#16a34a", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  backLink: { marginTop: 20, alignItems: "center" },
  backLinkText: { color: "#16a34a", fontSize: 15, fontWeight: "500" },
});
