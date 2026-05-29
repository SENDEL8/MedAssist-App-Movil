import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ExtractedValue } from "@/services/api";

export default function LabResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const extractedValues: ExtractedValue[] = params.extracted_values
    ? JSON.parse(params.extracted_values as string)
    : [];
  const summary = (params.plain_language_summary as string) || "";
  const warning = (params.medical_warning as string) || "";

  const outOfRangeCount = extractedValues.filter((v) => v.is_out_of_range).length;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resultado del Analisis</Text>
        <Text style={styles.headerSub}>
          {outOfRangeCount > 0
            ? `${outOfRangeCount} valor(es) fuera de rango detectado(s)`
            : "Todos los valores dentro del rango normal"}
        </Text>
      </View>

      {/* Warning Banner */}
      {!!warning && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#92400e" />
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      )}

      {/* Out of Range Alert */}
      {outOfRangeCount > 0 && (
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>🔴</Text>
          <Text style={styles.alertTitle}>Valores fuera de rango</Text>
          <Text style={styles.alertText}>
            Se detectaron {outOfRangeCount} valor(es) que estan fuera del rango de referencia.
            Consulta con un profesional medico.
          </Text>
        </View>
      )}

      {/* Extracted Values */}
      {extractedValues.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flask" size={24} color="#9333ea" />
            <Text style={styles.cardTitle}>Valores Extraidos</Text>
          </View>
          {extractedValues.map((item, index) => (
            <View
              key={index}
              style={[
                styles.valueRow,
                index < extractedValues.length - 1 && styles.valueRowBorder,
                item.is_out_of_range && styles.valueRowAlert,
              ]}
            >
              <View style={styles.valueInfo}>
                <Text style={styles.valueName}>{item.name}</Text>
                <Text style={styles.valueRange}>
                  Rango ref.: {item.reference_range} {item.unit}
                </Text>
              </View>
              <View style={styles.valueResult}>
                <Text
                  style={[
                    styles.valueNumber,
                    item.is_out_of_range && styles.valueNumberAlert,
                  ]}
                >
                  {item.value}
                </Text>
                <Text style={styles.valueUnit}>{item.unit}</Text>
                {item.is_out_of_range && <Text style={styles.outOfRangeBadge}>Fuera</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Summary */}
      {!!summary && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color="#15803d" />
            <Text style={styles.cardTitle}>Explicacion</Text>
          </View>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      )}

      {/* Disclaimer Card - Always visible */}
      <View style={styles.disclaimerCard}>
        <Ionicons name="medkit" size={18} color="#166534" />
        <Text style={styles.disclaimerText}>
          Este analisis es solo orientativo y no reemplaza un diagnostico medico profesional.
          Ante cualquier duda o resultado fuera de rango, consulta con un profesional de salud.
        </Text>
      </View>

      {/* New Exam Button */}
      <TouchableOpacity
        style={styles.newExamButton}
        onPress={() => router.replace("/(tabs)/lab-exam" as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.newExamButtonText}>Analizar Otro Examen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f1f5f9" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },

  /* Header - Enhanced */
  header: { backgroundColor: "#15803d", paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 14, color: "#bbf7d0", marginTop: 6 },

  /* Warning Banner - Enhanced */
  warningBanner: {
    backgroundColor: "#fef3c7",
    borderWidth: 1.5,
    borderColor: "#fbbf24",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  warningText: { flex: 1, fontSize: 14, color: "#92400e", lineHeight: 22, marginLeft: 12 },

  /* Alert Card - Enhanced */
  alertCard: {
    backgroundColor: "#fef2f2",
    borderWidth: 2,
    borderColor: "#fecaca",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    alignItems: "center",
  },
  alertIcon: { fontSize: 40, marginBottom: 10 },
  alertTitle: { fontSize: 18, fontWeight: "700", color: "#dc2626", marginBottom: 8 },
  alertText: { fontSize: 15, color: "#991b1b", textAlign: "center", lineHeight: 24 },

  /* Cards - Enhanced */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b" },

  /* Value Rows - Enhanced */
  valueRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14 },
  valueRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  valueRowAlert: { backgroundColor: "#fef2f2", marginHorizontal: -12, paddingHorizontal: 12, borderRadius: 12 },
  valueInfo: { flex: 1 },
  valueName: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  valueRange: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  valueResult: { alignItems: "flex-end" },
  valueNumber: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  valueNumberAlert: { color: "#dc2626" },
  valueUnit: { fontSize: 13, color: "#64748b" },
  outOfRangeBadge: {
    backgroundColor: "#fecaca",
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },

  /* Summary - Enhanced */
  summaryText: { fontSize: 15, color: "#475569", lineHeight: 26 },

  /* Disclaimer Card - Enhanced */
  disclaimerCard: {
    backgroundColor: "#dcfce7",
    borderWidth: 1.5,
    borderColor: "#86efac",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  disclaimerText: { flex: 1, fontSize: 13, color: "#166534", lineHeight: 22, fontStyle: "italic", marginLeft: 12 },

  /* New Exam Button - Enhanced */
  newExamButton: {
    backgroundColor: "#16a34a",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  newExamButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18, letterSpacing: 0.5 },
});
