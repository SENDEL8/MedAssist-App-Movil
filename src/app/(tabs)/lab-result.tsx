import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
      {warning && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
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
            <Text style={styles.cardIcon}>🔬</Text>
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
      {summary && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📝</Text>
            <Text style={styles.cardTitle}>Explicacion</Text>
          </View>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      )}

      {/* Disclaimer Card - Always visible */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerIcon}>🏥</Text>
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
  root: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 32 },

  /* Header */
  header: { backgroundColor: "#15803d", paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, borderRadius: 16, marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 15, color: "#bbf7d0", marginTop: 4 },

  /* Warning Banner */
  warningBanner: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fbbf24",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  warningIcon: { fontSize: 18, marginRight: 10, marginTop: 2 },
  warningText: { flex: 1, fontSize: 13, color: "#92400e", lineHeight: 20 },

  /* Alert Card */
  alertCard: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  alertIcon: { fontSize: 32, marginBottom: 8 },
  alertTitle: { fontSize: 16, fontWeight: "700", color: "#dc2626", marginBottom: 6 },
  alertText: { fontSize: 14, color: "#991b1b", textAlign: "center", lineHeight: 20 },

  /* Cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  cardIcon: { fontSize: 22, marginRight: 10 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1f2937" },

  /* Value Rows */
  valueRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  valueRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  valueRowAlert: { backgroundColor: "#fef2f2", marginHorizontal: -12, paddingHorizontal: 12, borderRadius: 8 },
  valueInfo: { flex: 1 },
  valueName: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
  valueRange: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  valueResult: { alignItems: "flex-end" },
  valueNumber: { fontSize: 18, fontWeight: "700", color: "#1f2937" },
  valueNumberAlert: { color: "#dc2626" },
  valueUnit: { fontSize: 12, color: "#6b7280" },
  outOfRangeBadge: {
    backgroundColor: "#fecaca",
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },

  /* Summary */
  summaryText: { fontSize: 15, color: "#374151", lineHeight: 22 },

  /* Disclaimer Card */
  disclaimerCard: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  disclaimerIcon: { fontSize: 18, marginRight: 10, marginTop: 2 },
  disclaimerText: { flex: 1, fontSize: 12, color: "#166534", lineHeight: 18 },

  /* New Exam Button */
  newExamButton: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newExamButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});
