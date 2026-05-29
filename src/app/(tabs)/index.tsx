import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, ActivityIndicator, ScrollView, StatusBar, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, logout, isRestored } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [cpError, setCpError] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editGender, setEditGender] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const formatDate = (iso: string | null): string => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

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

  const openProfileModal = () => {
    setShowProfileEdit(false);
    setShowProfileModal(true);
  };

  const openProfileEdit = () => {
    if (!user) return;
    setEditBirthDate(formatDate(user.birth_date));
    setEditGender(user.gender || "");
    setShowProfileEdit(true);
  };

  const cancelProfileEdit = () => {
    setShowProfileEdit(false);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const body: { birth_date?: string; gender?: string } = {};
      const trimmedDate = editBirthDate.trim();
      if (trimmedDate) body.birth_date = trimmedDate;
      const trimmedGender = editGender.trim();
      if (trimmedGender) body.gender = trimmedGender;

      if (!body.birth_date && !body.gender) {
        Alert.alert("Sin cambios", "No hay datos para actualizar.");
        setSavingProfile(false);
        return;
      }

      const { updateProfile } = useAuthStore.getState();
      await updateProfile(body);
      setShowProfileEdit(false);
      Alert.alert("Perfil actualizado", "Tus datos se guardaron correctamente.");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((d: any) => d.msg || d).join(" | ") : detail || err.message || "Error al guardar";
      Alert.alert("Error", msg);
    } finally {
      setSavingProfile(false);
    }
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
            onPress={openProfileModal}
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
          <Ionicons name="medkit" size={56} color="#15803d" />
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
            <Ionicons name="medkit" size={28} color="#15803d" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Nueva Consulta</Text>
            <Text style={styles.actionDesc}>Analiza tus sintomas con IA</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/lab-exam" as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#f3e8ff" }]}>
            <Ionicons name="flask" size={28} color="#9333ea" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Analisis de Examenes</Text>
            <Text style={styles.actionDesc}>Fotografia tu examen de laboratorio</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/history" as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#dbeafe" }]}>
            <Ionicons name="document-text" size={28} color="#2563eb" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Historial</Text>
            <Text style={styles.actionDesc}>Revisa tus consultas anteriores</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/alerts" as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#fef3c7" }]}>
            <Ionicons name="medical" size={28} color="#d97706" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Alertas Medicamentos</Text>
            <Text style={styles.actionDesc}>Programa tus recordatorios</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de perfil / cerrar sesion */}
      <Modal
        visible={showProfileModal}
        animationType="fade"
        transparent
        onRequestClose={() => { setShowProfileModal(false); setShowProfileEdit(false); }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => { setShowProfileModal(false); setShowProfileEdit(false); }}
        >
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable onPress={() => {}} style={styles.modalInner}>
              <View style={styles.profileCard}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {user.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.profileName}>{user.full_name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>

                {showProfileEdit ? (
                  <View style={styles.profileEditSection}>
                    <Text style={styles.profileEditLabel}>Fecha de nacimiento</Text>
                    <TextInput
                      style={styles.profileEditInput}
                      placeholder="DD/MM/AAAA — Ej. 15/03/1990"
                      placeholderTextColor="#9ca3af"
                      value={editBirthDate}
                      onChangeText={setEditBirthDate}
                      keyboardType="number-pad"
                    />
                    <Text style={styles.profileEditLabel}>Genero</Text>
                    <View style={styles.genderRow}>
                      {["Masculino", "Femenino"].map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[styles.genderBtn, editGender === g && styles.genderBtnActive]}
                          onPress={() => setEditGender(editGender === g ? "" : g)}
                        >
                          <Text style={[styles.genderText, editGender === g && styles.genderTextActive]}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity style={styles.profileSaveBtn} onPress={handleSaveProfile} activeOpacity={0.85} disabled={savingProfile}>
                      <Text style={styles.profileSaveBtnText}>{savingProfile ? "Guardando..." : "Guardar"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileCancelBtn} onPress={cancelProfileEdit} activeOpacity={0.7}>
                      <Text style={styles.profileCancelBtnText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.profileInfoSection}>
                    <View style={styles.profileInfoRow}>
                      <Text style={styles.profileInfoLabel}>Fecha de nacimiento</Text>
                      <Text style={styles.profileInfoValue}>{formatDate(user.birth_date) || "No especificada"}</Text>
                    </View>
                    <View style={styles.profileInfoRow}>
                      <Text style={styles.profileInfoLabel}>Genero</Text>
                      <Text style={styles.profileInfoValue}>{user.gender || "No especificado"}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileEditBtn} onPress={openProfileEdit} activeOpacity={0.85}>
                      <Text style={styles.profileEditBtnText}>Editar informacion</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.profileDivider} />

                <TouchableOpacity style={styles.changePwOption} onPress={() => { setShowProfileModal(false); setShowChangePassword(true); }} activeOpacity={0.7}>
                  <Text style={styles.changePwIcon}>🔑</Text>
                  <Text style={styles.changePwLabel}>Cambiar contraseña</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutOption} onPress={handleLogout} activeOpacity={0.7}>
                  <Text style={styles.logoutIcon}>🚪</Text>
                  <Text style={styles.logoutLabel}>Cerrar sesion</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="fade"
        transparent
        onRequestClose={() => setShowChangePassword(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowChangePassword(false)}>
          <Pressable onPress={() => {}} style={styles.modalInner}>
            <View style={styles.changePwCard}>
              <Text style={styles.changePwTitle}>Cambiar contraseña</Text>

              {cpError ? (
                <View style={styles.cpErrorBox}>
                  <Text style={styles.cpErrorText}>{cpError}</Text>
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>Contraseña actual</Text>
              <TextInput style={styles.fieldInput} placeholder="Ingresa tu contraseña actual" placeholderTextColor="#9ca3af" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />

              <Text style={styles.fieldLabel}>Nueva contraseña</Text>
              <TextInput style={styles.fieldInput} placeholder="Ingresa la nueva contraseña" placeholderTextColor="#9ca3af" secureTextEntry value={newPassword} onChangeText={setNewPassword} />

              <TouchableOpacity style={styles.changePwButton} onPress={handleChangePassword} activeOpacity={0.85}>
                <Text style={styles.changePwButtonText}>Actualizar contraseña</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.changePwCancel} onPress={() => { setShowChangePassword(false); setCpError(""); setCurrentPassword(""); setNewPassword(""); }}>
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
  root: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },

  /* Header - Enhanced */
  headerBg: { backgroundColor: "#15803d", paddingTop: 50, paddingBottom: 36, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: 15, color: "#bbf7d0", marginBottom: 4, fontWeight: "500" },
  name: { fontSize: 24, fontWeight: "bold", color: "#fff" },

  avatarBtn: { padding: 2 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { fontSize: 24, fontWeight: "bold", color: "#fff" },

  headerCurve: { display: "none" },

  /* Body */
  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 },

  /* Main card - Enhanced */
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#15803d",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  mainCardIcon: { fontSize: 56, marginBottom: 14 },
  mainCardTitle: { fontSize: 26, fontWeight: "bold", color: "#15803d", marginBottom: 10 },
  mainCardDesc: { fontSize: 15, color: "#64748b", textAlign: "center", lineHeight: 24 },

  /* Section label - Enhanced */
  sectionLabel: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 16, marginLeft: 4 },

  /* Action cards - Enhanced */
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  actionIcon: { fontSize: 28 },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 17, fontWeight: "600", color: "#1e293b" },
  actionDesc: { fontSize: 14, color: "#64748b", marginTop: 4 },
  actionArrow: { fontSize: 26, color: "#cbd5e1", marginLeft: 8 },

  /* Profile modal - Enhanced */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalScroll: { flex: 1 },
  modalScrollContent: { alignItems: "center", justifyContent: "center", flexGrow: 1, paddingVertical: 16 },
  modalInner: { width: "100%", maxWidth: 400 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#15803d",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profileAvatarText: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  profileName: { fontSize: 22, fontWeight: "700", color: "#1e293b", marginBottom: 6 },
  profileEmail: { fontSize: 14, color: "#64748b", marginBottom: 6 },
  profileDivider: { width: "100%", height: 1, backgroundColor: "#e2e8f0", marginVertical: 24 },

  /* Profile info (view mode) */
  profileInfoSection: { width: "100%" },
  profileInfoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  profileInfoLabel: { fontSize: 15, color: "#64748b" },
  profileInfoValue: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  profileEditBtn: {
    backgroundColor: "#dcfce7",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: "#86efac",
  },
  profileEditBtnText: { color: "#15803d", fontWeight: "700", fontSize: 15 },

  /* Profile edit (edit mode) */
  profileEditSection: { width: "100%", marginTop: 14 },
  profileEditLabel: { fontSize: 13, fontWeight: "600", color: "#64748b", marginBottom: 6, marginTop: 10 },
  profileEditInput: {
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
  profileSaveBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  profileSaveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  profileCancelBtn: { marginTop: 14, alignItems: "center" },
  profileCancelBtnText: { color: "#64748b", fontSize: 15 },

  /* Gender chips - Enhanced */
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
  genderText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  genderTextActive: { color: "#15803d", fontWeight: "700" },

  /* Logout & Change PW - Enhanced */
  logoutOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
  },
  logoutIcon: { fontSize: 22, marginRight: 14 },
  logoutLabel: { fontSize: 16, fontWeight: "600", color: "#dc2626" },

  changePwOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    marginBottom: 12,
  },
  changePwIcon: { fontSize: 22, marginRight: 14 },
  changePwLabel: { fontSize: 16, fontWeight: "600", color: "#15803d" },

  /* Change Password Card - Enhanced */
  changePwCard: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 32,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  changePwTitle: { fontSize: 22, fontWeight: "700", color: "#1e293b", textAlign: "center", marginBottom: 24 },
  cpErrorBox: { backgroundColor: "#fef2f2", borderRadius: 14, padding: 14, marginBottom: 18 },
  cpErrorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#475569", marginBottom: 8 },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    marginBottom: 18,
  },
  changePwButton: {
    backgroundColor: "#16a34a",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  changePwButtonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  changePwCancel: { marginTop: 18, alignItems: "center" },
  changePwCancelText: { color: "#64748b", fontSize: 15 },
});
