import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, ActivityIndicator, ScrollView, StatusBar, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, logout, isRestored } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [cpError, setCpError] = useState("");

  useEffect(() => {
    if (isRestored && !token) {
      router.replace("/(auth)/login");
    }
  }, [isRestored, token]);

  const handleLogout = async () => {
    setShowProfileModal(false);
    router.replace("/(auth)/login");
    try { await logout(); } catch {}
  };

  const handleChangePassword = async () => {
    setCpError("");
    if (!currentPassword) { setCpError("Ingresa tu contraseña actual"); return; }
    if (!newPassword || newPassword.length < 8) { setCpError("La nueva contraseña debe tener al menos 8 caracteres"); return; }
    try {
      await useAuthStore.getState().changePassword(currentPassword, newPassword);
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Contraseña actualizada", "Tu contraseña se cambió correctamente.");
    } catch (err: any) {
      setCpError(err.message);
    }
  };

  if (!isRestored) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
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

      {/* Header */}
      <View style={styles.headerBg}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{user.full_name}</Text>
          </View>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => setShowProfileModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
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
          onPress={() => router.push("/(tabs)/lab-exam" as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#f3e8ff" }]}>
            <Text style={styles.actionIcon}>🔬</Text>
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Analisis de Examenes</Text>
            <Text style={styles.actionDesc}>Fotografia tu examen de laboratorio</Text>
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

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/alerts" as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#fef3c7" }]}>
            <Text style={styles.actionIcon}>💊</Text>
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Alertas Medicamentos</Text>
            <Text style={styles.actionDesc}>Programa tus recordatorios</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de perfil / cerrar sesion */}
      <Modal
        visible={showProfileModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowProfileModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileModal(false)}
        >
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.profileName}>{user.full_name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>

            <View style={styles.profileDivider} />

            <TouchableOpacity
              style={styles.changePwOption}
              onPress={() => { setShowProfileModal(false); setShowChangePassword(true); }}
              activeOpacity={0.7}
            >
              <Text style={styles.changePwIcon}>🔑</Text>
              <Text style={styles.changePwLabel}>Cambiar contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutOption}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutLabel}>Cerrar sesion</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="fade"
        transparent
        onRequestClose={() => setShowChangePassword(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowChangePassword(false)}>
          <Pressable onPress={() => {}}>
            <View style={styles.changePwCard}>
              <Text style={styles.changePwTitle}>Cambiar contraseña</Text>

              {cpError ? (
                <View style={styles.cpErrorBox}>
                  <Text style={styles.cpErrorText}>{cpError}</Text>
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>Contraseña actual</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Ingresa tu contraseña actual"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />

              <Text style={styles.fieldLabel}>Nueva contraseña</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Ingresa la nueva contraseña"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <TouchableOpacity
                style={styles.changePwButton}
                onPress={handleChangePassword}
                activeOpacity={0.85}
              >
                <Text style={styles.changePwButtonText}>Actualizar contraseña</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changePwCancel}
                onPress={() => { setShowChangePassword(false); setCpError(""); setCurrentPassword(""); setNewPassword(""); }}
              >
                <Text style={styles.changePwCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

  avatarBtn: { padding: 2 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: { fontSize: 22, fontWeight: "bold", color: "#fff" },

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

  /* Profile modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#15803d",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  profileAvatarText: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  profileName: { fontSize: 20, fontWeight: "700", color: "#1f2937", marginBottom: 4 },
  profileEmail: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
  profileDivider: { width: "100%", height: 1, backgroundColor: "#f3f4f6", marginVertical: 20 },

  logoutOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
  },
  logoutIcon: { fontSize: 20, marginRight: 12 },
  logoutLabel: { fontSize: 16, fontWeight: "600", color: "#dc2626" },

  changePwOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
    marginBottom: 10,
  },
  changePwIcon: { fontSize: 20, marginRight: 12 },
  changePwLabel: { fontSize: 16, fontWeight: "600", color: "#15803d" },

  changePwCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    width: "85%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  changePwTitle: { fontSize: 20, fontWeight: "700", color: "#1f2937", textAlign: "center", marginBottom: 20 },
  cpErrorBox: { backgroundColor: "#fef2f2", borderRadius: 12, padding: 12, marginBottom: 16 },
  cpErrorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  fieldInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
    marginBottom: 16,
  },
  changePwButton: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  changePwButtonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  changePwCancel: { marginTop: 16, alignItems: "center" },
  changePwCancelText: { color: "#6b7280", fontSize: 15 },
});
