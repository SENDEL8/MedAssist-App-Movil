import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, StatusBar } from "react-native";
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos dias";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Header verde */}
      <View style={styles.headerBg}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{user.full_name}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.full_name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.headerCurve} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta principal */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardIcon}>🏥</Text>
          <Text style={styles.mainCardTitle}>MedAssist</Text>
          <Text style={styles.mainCardDesc}>
            Tu asistente medico personal con inteligencia artificial esta listo para ayudarte.
          </Text>
        </View>

        {/* Acciones principales */}
        <Text style={styles.sectionLabel}>Acciones rapidas</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/consultation" as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#dcfce7" }]}>
            <Text style={styles.actionIcon}>🩺</Text>
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Nueva Consulta</Text>
            <Text style={styles.actionDesc}>Analiza tus sintomas con IA</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/history" as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#dbeafe" }]}>
            <Text style={styles.actionIcon}>📋</Text>
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Historial</Text>
            <Text style={styles.actionDesc}>Revisa tus consultas anteriores</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar Sesion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  loadingContainer: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },

  /* Header */
  headerBg: { backgroundColor: "#15803d", paddingTop: 50, paddingBottom: 32, paddingHorizontal: 24 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: 16, color: "#bbf7d0", marginBottom: 2 },
  name: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  headerCurve: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: "#15803d",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  /* Body */
  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 32 },

  /* Main card */
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#15803d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mainCardIcon: { fontSize: 48, marginBottom: 12 },
  mainCardTitle: { fontSize: 24, fontWeight: "bold", color: "#15803d", marginBottom: 8 },
  mainCardDesc: { fontSize: 15, color: "#6b7280", textAlign: "center", lineHeight: 22 },

  /* Section label */
  sectionLabel: { fontSize: 18, fontWeight: "700", color: "#1f2937", marginBottom: 16 },

  /* Action cards */
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
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
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionIcon: { fontSize: 26 },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 17, fontWeight: "600", color: "#1f2937" },
  actionDesc: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  actionArrow: { fontSize: 24, color: "#d1d5db", marginLeft: 8 },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 14,
  },
  logoutIcon: { fontSize: 18, marginRight: 8 },
  logoutText: { fontSize: 15, color: "#ef4444", fontWeight: "500" },
});
