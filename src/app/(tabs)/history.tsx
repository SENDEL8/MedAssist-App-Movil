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
import { medicalApi } from "@/services/api";

interface HistoryItem {
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
  advertencia: string;
  created_at: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const data = await medicalApi.getConsultations();
      setItems(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, []));

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

  const handlePress = (item: HistoryItem) => {
    router.push({
      pathname: "/(tabs)/result" as any,
      params: {
        resumen: item.resumen,
        nivel_atencion: item.nivel_atencion,
        recomendacion: item.recomendacion,
        advertencia: item.advertencia,
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

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de Consultas</Text>
        <Text style={styles.headerSub}>{items.length} consulta{items.length !== 1 ? "s" : ""} registrada{items.length !== 1 ? "s" : ""}</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchHistory} colors={["#16a34a"]} />
        }
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No tienes consultas todavia</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(tabs)/consultation" as any)}
            >
              <Text style={styles.emptyButtonText}>Hacer una consulta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => {
            const ls = getLevelStyle(item.nivel_atencion);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateIcon}>📅</Text>
                    <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                  </View>
                  <View style={[styles.levelBadge, { backgroundColor: ls.bg, borderColor: ls.border }]}>
                    <View style={[styles.levelDot, { backgroundColor: ls.dot }]} />
                    <Text style={[styles.levelText, { color: ls.text }]}>{item.nivel_atencion}</Text>
                  </View>
                </View>

                <View style={styles.symptomsRow}>
                  <Text style={styles.symptomsIcon}>🤒</Text>
                  <Text style={styles.symptoms} numberOfLines={2}>{item.symptoms}</Text>
                </View>

                <Text style={styles.summary} numberOfLines={2}>{item.resumen}</Text>

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
  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 32 },

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
