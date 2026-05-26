import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { authApi } from "@/services/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    setError("");
    if (!email.trim()) { setError("Ingresa tu correo electronico"); return; }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email.trim())) { setError("Ingresa un correo valido"); return; }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      router.push({ pathname: "/(auth)/reset-password", params: { email: email.trim().toLowerCase() } });
    } catch (err: any) {
      const message = err.response?.data?.detail || "Error al enviar el codigo";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔑</Text>
        <Text style={styles.headerTitle}>Restablecer contraseña</Text>
        <Text style={styles.headerSub}>Te enviaremos un codigo a tu correo</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.formSub}>
            Ingresa tu correo electronico y te enviaremos un codigo de 6 digitos para restablecerla.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Correo electronico</Text>
            <TextInput
              style={styles.input}
              placeholder="usuario@dominio.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => { setEmail(text); setError(""); }}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSendCode}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Enviando..." : "Enviar codigo"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Volver al inicio de sesion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
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
