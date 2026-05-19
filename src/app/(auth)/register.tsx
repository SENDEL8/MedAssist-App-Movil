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
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateFullName = (value: string) => {
    if (!value.trim()) {
      setFullNameError("El nombre es requerido");
      return false;
    }
    if (value.trim().length < 2) {
      setFullNameError("Minimo 2 caracteres");
      return false;
    }
    setFullNameError("");
    return true;
  };

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError("El correo es requerido");
      return false;
    }
    if (!regex.test(value)) {
      setEmailError("Ingresa un correo valido");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("La contrasena es requerida");
      return false;
    }
    if (value.length < 8) {
      setPasswordError("Minimo 8 caracteres");
      return false;
    }
    if (!/[A-Z]/.test(value)) {
      setPasswordError("Debe tener una mayuscula");
      return false;
    }
    if (!/[a-z]/.test(value)) {
      setPasswordError("Debe tener una minuscula");
      return false;
    }
    if (!/[0-9]/.test(value)) {
      setPasswordError("Debe tener un numero");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      setConfirmPasswordError("Confirma tu contrasena");
      return false;
    }
    if (value !== password) {
      setConfirmPasswordError("Las contrasenas no coinciden");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleRegister = async () => {
    clearError();
    const isNameValid = validateFullName(fullName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword);
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) return;
    try {
      await register(email.trim().toLowerCase(), password, fullName.trim());
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>
        </View>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <View style={styles.field}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={[styles.input, fullNameError && styles.inputError]}
            placeholder="Juan Perez"
            returnKeyType="next"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (fullNameError) validateFullName(text);
            }}
          />
          {fullNameError ? <Text style={styles.fieldError}>{fullNameError}</Text> : null}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Correo electronico</Text>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="usuario@dominio.com"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) validateEmail(text);
            }}
          />
          {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Contrasena</Text>
          <TextInput
            style={[styles.input, passwordError && styles.inputError]}
            placeholder="Minimo 8 caracteres"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) validatePassword(text);
            }}
          />
          {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Confirmar contrasena</Text>
          <TextInput
            style={[styles.input, confirmPasswordError && styles.inputError]}
            placeholder="Repite tu contrasena"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (confirmPasswordError) validateConfirmPassword(text);
            }}
          />
          {confirmPasswordError ? <Text style={styles.fieldError}>{confirmPasswordError}</Text> : null}
        </View>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          accessibilityLabel="Registrarse"
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Registrando..." : "Registrarse"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.link}
          onPress={() => router.back()}
          accessibilityLabel="Volver al login"
        >
          <Text style={styles.linkText}>
            Ya tienes cuenta?{" "}
            <Text style={styles.linkBold}>Inicia sesion</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 32, paddingVertical: 32 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "bold", color: "#15803d" },
  subtitle: { fontSize: 16, color: "#6b7280", marginTop: 8 },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#dc2626", textAlign: "center" },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: { borderColor: "#ef4444" },
  fieldError: { color: "#ef4444", fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 18 },
  link: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#4b5563", fontSize: 14 },
  linkBold: { color: "#16a34a", fontWeight: "600" },
});
