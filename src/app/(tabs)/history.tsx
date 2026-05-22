import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { medicalApi, labsApi } from "@/services/api";

interface ConsultationItem {
  id: number;
  age: number | null;
  gender: string | null;
  temperature: number | null;
  heart_rate: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  symptoms: string;
  description: string;
  resumen: string;
  nivel_atencion: string;
  recomendacion: string;
  created_at: string;
}

interface LabExamItem {
  id: number;
  extracted_values: any[];
  plain_language_summary: string;
  created_at: string;
}

type TabType = "consultas" | "examenes";

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("consultas");
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [labExams, setLabExams] = useState<LabExamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [consults, exams] = await Promise.all([
        medicalApi.getConsultations(),
        labsApi.getLabExams(),
      ]);
      setConsultations(consults);
      setLabExams(exams);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLevelStyle = (level: string) => {
    const lower = level.toLowerCase();
    if (lower.includes("urgente") || lower.includes("emergencia"))
      return { bg: "#fef2f2", border: "#fca5a5", text: "#dc2626", dot: "#ef4444" };
    if (lower.includes("evaluacion") || lower.includes("moderada"))
      return { bg: "#fffbeb", border: "#fde68a", text: "#d97706", dot: "#f59e0b" };
    return { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", dot: "#22c55e" };
  };

  const handleConsultationPress = (item: ConsultationItem) => {
    router.push({
      pathname: "/(tabs)/result" as any,
      params: {
        resumen: item.resumen,
        nivel_atencion: item.nivel_atencion,
        recomendacion: item.recomendacion,
      },
    });
  };

  const handleLabExamPress = (item: LabExamItem) => {
    router.push({
      pathname: "/(tabs)/lab-result" as any,
      params: {
        extracted_values: JSON.stringify(item.extracted_values),
        plain_language_summary: item.plain_language_summary,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const items = activeTab === "consultas" ? consultations : labExams;
  const outOfRangeCount = (item: LabExamItem) =>
    item.extracted_values.filter((v: any) => v.is_out_of_range).length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <Text style={styles.headerSub}>Revisa tus consultas y examenes anteriores</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "consultas" && styles.tabActive]}
          onPress={() => setActiveTab("consultas")}
        >
          <Text style={[styles.tabText, activeTab === "consultas" && styles.tabTextActive]}>
            Consultas ({consultations.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "examenes" && styles.tabActive]}
          onPress={() => setActiveTab("examenes")}
        >
          <Text style={[styles.tabText, activeTab === "examenes" && styles.tabTextActive]}>
            Examenes ({labExams.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchData} colors={["#16a34a"]} />
        }
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{activeTab === "consultas" ? "📭" : "🔬"}</Text>
            <Text style={styles.emptyText}>
              No tienes {activeTab} todavia
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push(activeTab === "consultas" ? "/(tabs)/consultation" : "/(tabs)/lab-exam" as any)}
            >
              <Text style={styles.emptyButtonText}>
                {activeTab === "consultas" ? "Hacer una consulta" : "Analizar un examen"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item: any) => {
            if (activeTab === "consultas") {
              const c = item as ConsultationItem;
              const ls = getLevelStyle(c.nivel_atencion);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={styles.card}
                  onPress={() => handleConsultationPress(c)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.dateRow}>
                      <Text style={styles.dateIcon}>📅</Text>
                      <Text style={styles.date}>{formatDate(c.created_at)}</Text>
                    </View>
                    <View style={[styles.levelBadge, { backgroundColor: ls.bg, borderColor: ls.border }]}>
                      <View style={[styles.levelDot, { backgroundColor: ls.dot }]} />
                      <Text style={[styles.levelText, { color: ls.text }]}>{c.nivel_atencion}</Text>
                    </View>
                  </View>
                  <View style={styles.symptomsRow}>
                    <Text style={styles.symptomsIcon}>🤒</Text>
                    <Text style={styles.symptoms} numberOfLines={2}>{c.symptoms}</Text>
                  </View>
                  <Text style={styles.summary} numberOfLines={2}>{c.resumen}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.tapHint}>Toca para ver detalles</Text>
                    <Text style={styles.arrow}>›</Text>
                  </View>
                </TouchableOpacity>
              );
            }

            const e = item as LabExamItem;
            const oor = outOfRangeCount(e);
            return (
              <TouchableOpacity
                key={e.id}
                style={styles.card}
                onPress={() => handleLabExamPress(e)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateIcon}>📅</Text>
                    <Text style={styles.date}>{formatDate(e.created_at)}</Text>
                  </View>
                  {oor > 0 && (
                    <View style={[styles.levelBadge, { backgroundColor: "#fef2f2", borderColor: "#fca5a5" }]}>
                      <View style={[styles.levelDot, { backgroundColor: "#ef4444" }]} />
                      <Text style={[styles.levelText, { color: "#dc2626" }]}>{oor} fuera de rango</Text>
                    </View>
                  )}
                </View>
                <View style={styles.symptomsRow}>
                  <Text style={styles.symptomsIcon}>🔬</Text>
                  <Text style={styles.symptoms} numberOfLines={2}>
                    {e.extracted_values.length} valor(es) analizado(s)
                  </Text>
                </View>
                <Text style={styles.summary} numberOfLines={2}>{e.plain_language_summary}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.tapHint}>Toca para ver detalles</Text>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  loadingContainer: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: "#15803d", paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 14, color: "#bbf7d0", marginTop: 4 },

  /* Tabs */
  tabContainer: { flexDirection: "row", backgroundColor: "#fff", paddingHorizontal: 18, paddingTop: 16, paddingBottom: 0, gap: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#16a34a" },
  tabText: { fontSize: 15, color: "#6b7280", fontWeight: "500" },
  tabTextActive: { color: "#16a34a", fontWeight: "700" },

  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 32 },

  /* Empty */
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 72, marginBottom: 16 },
  emptyText: { fontSize: 18, color: "#6b7280", marginBottom: 24 },
  emptyButton: { backgroundColor: "#16a34a", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  emptyButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  /* Cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateIcon: { fontSize: 16, marginRight: 6 },
  date: { fontSize: 13, color: "#9ca3af", fontWeight: "500" },
  levelBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  levelDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  levelText: { fontWeight: "600", fontSize: 12 },
  symptomsRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  symptomsIcon: { fontSize: 16, marginRight: 8, marginTop: 1 },
  symptoms: { fontSize: 15, color: "#374151", fontWeight: "600", flex: 1 },
  summary: { fontSize: 13, color: "#6b7280", marginBottom: 12, lineHeight: 18 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 12 },
  tapHint: { fontSize: 13, color: "#16a34a", fontWeight: "500" },
  arrow: { fontSize: 20, color: "#16a34a", fontWeight: "bold" },
});
