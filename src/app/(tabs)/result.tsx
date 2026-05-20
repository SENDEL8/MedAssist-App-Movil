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

function getLevelStyle(level: string) {
  const lower = level.toLowerCase();
  if (lower.includes("urgente") || lower.includes("emergencia"))
    return { color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", icon: "🔴" };
  if (lower.includes("evaluacion") || lower.includes("moderada"))
    return { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "🟡" };
  return { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "🟢" };
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
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            {advertencia || "Esta informacion es orientativa y no reemplaza un diagnostico medico profesional."}
          </Text>
        </View>

        {/* Level Card */}
        <View style={[styles.levelCard, { backgroundColor: ls.bg, borderColor: ls.border }]}>
          <Text style={styles.levelIcon}>{ls.icon}</Text>
          <View>
            <Text style={styles.levelLabel}>Nivel de Atencion</Text>
            <Text style={[styles.levelValue, { color: ls.color }]}>{nivel_atencion}</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={styles.cardTitle}>Resumen</Text>
          </View>
          <Text style={styles.cardBody}>{resumen}</Text>
        </View>

        {/* Recommendations Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💡</Text>
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
          <Text style={styles.disclaimerIcon}>🏥</Text>
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
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#15803d", paddingTop: 12, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { alignSelf: "flex-start", marginBottom: 8 },
  backText: { color: "#bbf7d0", fontWeight: "600", fontSize: 15 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 24 },

  /* Warning */
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fefce8",
    borderWidth: 1,
    borderColor: "#fde047",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  warningIcon: { fontSize: 22, marginRight: 10, marginTop: 0 },
  warningText: { flex: 1, fontSize: 14, color: "#854d0e", lineHeight: 20 },

  /* Level */
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  levelIcon: { fontSize: 32, marginRight: 14 },
  levelLabel: { fontSize: 12, fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 },
  levelValue: { fontSize: 22, fontWeight: "bold", marginTop: 2 },

  /* Cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cardIcon: { fontSize: 20, marginRight: 10 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1f2937" },
  cardBody: { fontSize: 15, color: "#374151", lineHeight: 22 },

  /* Bullets */
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  bulletDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#16a34a", marginRight: 12, marginTop: 7 },

  /* Permanent Disclaimer */
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  disclaimerIcon: { fontSize: 22, marginRight: 10, marginTop: 0 },
  disclaimerText: { flex: 1, fontSize: 13, color: "#15803d", lineHeight: 20, fontStyle: "italic" },

  /* Bottom */
  bottomBar: { paddingHorizontal: 18, paddingVertical: 14, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  newConsultButton: { backgroundColor: "#16a34a", borderRadius: 14, paddingVertical: 16, alignItems: "center", shadowColor: "#16a34a", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  newConsultText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
});
