import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

function getLevelStyle(level: string) {
  const normalized = level.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("urgente"))
    return { color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", icon: "warning", iconColor: "#dc2626" };
  if (normalized.includes("evaluacion"))
    return { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "alert-circle", iconColor: "#d97706" };
  return { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "checkmark-circle", iconColor: "#16a34a" };
}

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const resumen = (params.resumen as string) || "";
  const nivel_atencion = (params.nivel_atencion as string) || "";
  const recomendacion = (params.recomendacion as string) || "";
  const advertencia = (params.advertencia as string) || "";

  const ls = getLevelStyle(nivel_atencion);

  const recommendations = recomendacion
    .split(/[.,;]+/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultado del Analisis</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={24} color="#92400e" />
          <Text style={styles.warningText}>
            {advertencia || "Esta informacion es orientativa y no reemplaza un diagnostico medico profesional."}
          </Text>
        </View>

        {/* Level Card */}
        <View style={[styles.levelCard, { backgroundColor: ls.bg, borderColor: ls.border }]}>
          <Ionicons name={ls.icon as any} size={48} color={ls.iconColor} />
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.levelLabel}>Nivel de Atencion</Text>
            <Text style={[styles.levelValue, { color: ls.color }]}>{nivel_atencion}</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={22} color="#15803d" />
            <Text style={styles.cardTitle}>Resumen</Text>
          </View>
          <Text style={styles.cardBody}>{resumen}</Text>
        </View>

        {/* Recommendations Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb" size={22} color="#d97706" />
            <Text style={styles.cardTitle}>Recomendaciones</Text>
          </View>
          {recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.cardBody}>{rec}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.cardBody}>{recomendacion}</Text>
          )}
        </View>

        {/* Permanent Medical Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="medkit" size={20} color="#166534" />
          <Text style={styles.disclaimerText}>
            Este analisis es solo orientativo y no reemplaza un diagnostico medico profesional.
            Ante cualquier duda o empeoramiento de sintomas, consulta con un profesional de salud.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.newConsultButton}
          onPress={() => router.replace("/(tabs)/consultation" as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.newConsultText}>Nueva Consulta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f1f5f9" },
  header: { backgroundColor: "#15803d", paddingTop: 12, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backBtn: { alignSelf: "flex-start", marginBottom: 10 },
  backText: { color: "#bbf7d0", fontWeight: "600", fontSize: 15 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },

  /* Warning - Enhanced */
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fefce8",
    borderWidth: 1.5,
    borderColor: "#fde047",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  warningText: { flex: 1, fontSize: 14, color: "#854d0e", lineHeight: 22, marginLeft: 12 },

  /* Level - Enhanced with color coding */
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 2,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  levelLabel: { fontSize: 11, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5 },
  levelValue: { fontSize: 26, fontWeight: "bold", marginTop: 6, textTransform: "capitalize" },

  /* Cards - Enhanced */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b" },
  cardBody: { fontSize: 15, color: "#475569", lineHeight: 24 },

  /* Bullets - Enhanced */
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  bulletDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#22c55e", marginRight: 14, marginTop: 8 },

  /* Permanent Disclaimer - Enhanced */
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#86efac",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  disclaimerText: { flex: 1, fontSize: 13, color: "#166534", lineHeight: 22, fontStyle: "italic", marginLeft: 12 },

  /* Bottom - Enhanced */
  bottomBar: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  newConsultButton: { backgroundColor: "#16a34a", borderRadius: 16, paddingVertical: 18, alignItems: "center", shadowColor: "#16a34a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  newConsultText: { color: "#fff", fontWeight: "bold", fontSize: 17, letterSpacing: 0.5 },
});
