import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import { Ionicons } from "@expo/vector-icons";
import { medicalApi, labsApi } from "@/services/api";
import type { ConsultationHistoryItem, LabExamHistoryItem, PageResponse } from "@/services/api";

type TabType = "consultas" | "examenes";

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("consultas");

  const [consultations, setConsultations] = useState<ConsultationHistoryItem[]>([]);
  const [labExams, setLabExams] = useState<LabExamHistoryItem[]>([]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [consultationsTotal, setConsultationsTotal] = useState(0);
  const [labExamsTotal, setLabExamsTotal] = useState(0);
  const consultationsHasNext = consultationsTotal > consultations.length;
  const labExamsHasNext = labExamsTotal > labExams.length;

  const PAGE_SIZE = 20;

  const fetchPage = async (tab: TabType, page: number): Promise<PageResponse<any>> => {
    if (tab === "consultas") return medicalApi.getConsultations(page, PAGE_SIZE);
    return labsApi.getLabExams(page, PAGE_SIZE);
  };

  const fetchInitial = useCallback(async () => {
    try {
      const [consultsRes, examsRes] = await Promise.all([
        fetchPage("consultas", 1),
        fetchPage("examenes", 1),
      ]);
      setConsultations(consultsRes.items);
      setConsultationsTotal(consultsRes.total);
      setLabExams(examsRes.items);
      setLabExamsTotal(examsRes.total);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchInitial();
  }, [fetchInitial]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    const hasNext = activeTab === "consultas" ? consultationsHasNext : labExamsHasNext;
    if (!hasNext) return;

    setLoadingMore(true);
    try {
      const currentItems = activeTab === "consultas" ? consultations : labExams;
      const nextPage = Math.floor(currentItems.length / PAGE_SIZE) + 1;
      const res = await fetchPage(activeTab, nextPage);

      if (activeTab === "consultas") {
        setConsultations((prev) => [...prev, ...res.items]);
      } else {
        setLabExams((prev) => [...prev, ...res.items]);
      }
    } catch (err) {
      console.error("Error loading more:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchInitial(); }, [fetchInitial]));

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
    const normalized = level.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (normalized.includes("urgente"))
      return { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", dot: "#ef4444", icon: "warning", iconColor: "#dc2626" };
    if (normalized.includes("evaluacion"))
      return { bg: "#fffbeb", border: "#fde68a", text: "#d97706", dot: "#f59e0b", icon: "alert-circle", iconColor: "#d97706" };
    return { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", dot: "#22c55e", icon: "checkmark-circle", iconColor: "#16a34a" };
  };

  const handleConsultationPress = (item: ConsultationHistoryItem) => {
    router.push({
      pathname: "/(tabs)/result" as any,
      params: {
        resumen: item.resumen,
        nivel_atencion: item.nivel_atencion,
        recomendacion: item.recomendacion,
      },
    });
  };

  const handleLabExamPress = (item: LabExamHistoryItem) => {
    router.push({
      pathname: "/(tabs)/lab-result" as any,
      params: {
        extracted_values: JSON.stringify(item.extracted_values),
        plain_language_summary: item.plain_language_summary,
      },
    });
  };

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const items = activeTab === "consultas" ? consultations : labExams;
  const currentTotal = activeTab === "consultas" ? consultationsTotal : labExamsTotal;
  const hasNext = activeTab === "consultas" ? consultationsHasNext : labExamsHasNext;
  const outOfRangeCount = (item: LabExamHistoryItem) =>
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
            Consultas ({consultationsTotal})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "examenes" && styles.tabActive]}
          onPress={() => setActiveTab("examenes")}
        >
          <Text style={[styles.tabText, activeTab === "examenes" && styles.tabTextActive]}>
            Examenes ({labExamsTotal})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#16a34a"]} />
        }
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name={activeTab === "consultas" ? "document-text-outline" : "flask-outline"} size={72} color="#cbd5e1" />
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
          <>
            {items.map((item: any) => {
              if (activeTab === "consultas") {
                const c = item as ConsultationHistoryItem;
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
                        <Ionicons name="calendar-outline" size={14} color="#64748b" />
                        <Text style={styles.date}>{formatDate(c.created_at)}</Text>
                      </View>
                      <View style={[styles.levelBadge, { backgroundColor: ls.bg, borderColor: ls.border }]}>
                        <Ionicons name={ls.icon as any} size={16} color={ls.iconColor} style={{ marginRight: 6 }} />
                        <Text style={[styles.levelText, { color: ls.text }]}>{c.nivel_atencion}</Text>
                      </View>
                    </View>
                    <View style={styles.symptomsRow}>
                      <Ionicons name="fitness" size={15} color="#64748b" />
                      <Text style={styles.symptoms} numberOfLines={2}>{c.symptoms}</Text>
                    </View>
                    <Text style={styles.summary} numberOfLines={2}>{c.resumen}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.tapHint}>Toca para ver detalles</Text>
                      <Ionicons name="chevron-forward" size={22} color="#cbd5e1" />
                    </View>
                  </TouchableOpacity>
                );
              }

              const e = item as LabExamHistoryItem;
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
                    <Ionicons name="flask" size={15} color="#64748b" />
                    <Text style={styles.symptoms} numberOfLines={2}>
                      {e.extracted_values.length} valor(es) analizado(s)
                    </Text>
                  </View>
                  <Text style={styles.summary} numberOfLines={2}>{e.plain_language_summary}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.tapHint}>Toca para ver detalles</Text>
                    <Ionicons name="chevron-forward" size={22} color="#cbd5e1" />
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Load More */}
            {hasNext && (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={handleLoadMore}
                activeOpacity={0.85}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color="#16a34a" />
                ) : (
                  <Text style={styles.loadMoreText}>
                    Cargar mas ({items.length} de {currentTotal})
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },

  /* Header - Enhanced */
  header: { backgroundColor: "#15803d", paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 14, color: "#bbf7d0", marginTop: 6 },

  /* Tabs - Enhanced */
  tabContainer: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    marginHorizontal: 4,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#dcfce7" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  tabTextActive: { color: "#15803d", fontWeight: "700" },

  /* Body */
  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  /* Card - Enhanced */
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateIcon: { marginRight: 6 },
  date: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  levelDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  levelText: { fontSize: 12, fontWeight: "700" },
  symptomsRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 4 },
  symptomsIcon: { marginRight: 8, marginTop: 2 },
  symptoms: { fontSize: 15, color: "#1e293b", fontWeight: "500", flex: 1, lineHeight: 22 },
  summary: { fontSize: 14, color: "#64748b", marginTop: 10, lineHeight: 20 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  tapHint: { fontSize: 12, color: "#94a3b8" },
  arrow: { fontSize: 22, color: "#cbd5e1" },

  /* Load More - Enhanced */
  loadMoreBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginTop: 8,
    backgroundColor: "#dcfce7",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#86efac",
  },
  loadMoreText: { color: "#15803d", fontWeight: "700", fontSize: 15 },

  /* Empty state - Enhanced */
  emptyContainer: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 72, marginBottom: 20 },
  emptyText: { fontSize: 17, color: "#64748b", textAlign: "center", marginBottom: 8 },
  emptyButton: {
    backgroundColor: "#16a34a",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 24,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
