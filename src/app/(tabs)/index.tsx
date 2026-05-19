import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, logout, isRestored } = useAuthStore();

  useEffect(() => {
    if (isRestored && !token) {
      router.replace("/(auth)/login");
    }
  }, [isRestored, token]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  if (!isRestored) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!token || !user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenido</Text>
      <Text style={styles.name}>{user.full_name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.description}>
        Tu asistente medico personal esta listo para ayudarte.
      </Text>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityLabel="Cerrar sesion"
      >
        <Text style={styles.logoutText}>Cerrar Sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  loadingContainer: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  welcome: { fontSize: 24, fontWeight: "bold", color: "#15803d", marginBottom: 16 },
  name: { fontSize: 20, color: "#374151", marginBottom: 8 },
  email: { fontSize: 16, color: "#6b7280", marginBottom: 32 },
  description: { fontSize: 16, color: "#4b5563", marginBottom: 32, textAlign: "center" },
  logoutButton: { backgroundColor: "#ef4444", borderRadius: 8, paddingHorizontal: 32, paddingVertical: 12 },
  logoutText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
