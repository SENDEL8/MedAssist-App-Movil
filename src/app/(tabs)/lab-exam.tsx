import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { labsApi, LabExamResponse } from "@/services/api";

export default function LabExamScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Se necesita acceso a la camara para tomar fotos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setError("");
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setError("");
    }
  };

  const compressImage = async (uri: string): Promise<string> => {
    if (Platform.OS === "web") {
      return uri;
    }
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulated.uri;
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Selecciona o toma una foto del examen de laboratorio.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const compressedUri = await compressImage(selectedImage);

      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(compressedUri);
        const blob = await response.blob();
        console.log("[LabExam] Web upload - blob size:", blob.size, "type:", blob.type);
        formData.append("file", blob, "lab_exam.jpg");
      } else {
        console.log("[LabExam] Native upload - uri:", compressedUri);
        formData.append("file", {
          uri: compressedUri,
          name: "lab_exam.jpg",
          type: "image/jpeg",
        } as any);
      }

      const result = await labsApi.analyzeLabExam(formData);
      router.push({
        pathname: "/(tabs)/lab-result" as any,
        params: {
          extracted_values: JSON.stringify(result.extracted_values),
          plain_language_summary: result.plain_language_summary,
        },
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Error al analizar el examen. Intente nuevamente.";
      Alert.alert("Error", detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analisis de Examenes</Text>
        <Text style={styles.headerSub}>Toma una foto o sube una imagen de tu examen de laboratorio</Text>
      </View>

      {/* Instructions Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardTitle}>Examenes compatibles</Text>
        </View>
        <Text style={styles.instructionText}>
          • Examenes de sangre (hemograma, glucosa, colesterol){"\n"}
          • Examenes de orina{"\n"}
          • Resultados de laboratorio con valores y rangos de referencia{"\n"}
          • Asegurate de que la imagen sea clara y bien iluminada
        </Text>
      </View>

      {/* Image Preview */}
      {selectedImage && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📷</Text>
            <Text style={styles.cardTitle}>Imagen seleccionada</Text>
          </View>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity style={styles.retakeButton} onPress={() => setSelectedImage(null)}>
            <Text style={styles.retakeButtonText}>Quitar imagen</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📸</Text>
          <Text style={styles.cardTitle}>Seleccionar imagen</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImageFromCamera}>
            <Text style={styles.actionButtonIcon}>📷</Text>
            <Text style={styles.actionButtonText}>Tomar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={pickImageFromGallery}>
            <Text style={styles.actionButtonIcon}>🖼️</Text>
            <Text style={styles.actionButtonText}>Galeria</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, (!selectedImage || isLoading) && styles.submitButtonDisabled]}
        onPress={handleAnalyze}
        disabled={!selectedImage || isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.submitButtonText}>Analizando examen...</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Analizar Examen</Text>
        )}
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
  instructionText: { fontSize: 14, color: "#4b5563", lineHeight: 22 },

  /* Preview */
  previewImage: { width: "100%", height: 200, borderRadius: 12, marginBottom: 12 },
  retakeButton: { alignSelf: "center", paddingVertical: 8, paddingHorizontal: 16 },
  retakeButtonText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },

  /* Action Buttons */
  buttonRow: { flexDirection: "row", gap: 12 },
  actionButton: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
  },
  actionButtonIcon: { fontSize: 32, marginBottom: 8 },
  actionButtonText: { fontSize: 15, fontWeight: "600", color: "#15803d" },

  /* Error */
  errorText: { color: "#ef4444", fontSize: 14, textAlign: "center", marginBottom: 12 },

  /* Submit */
  submitButton: {
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
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  loadingRow: { flexDirection: "row", alignItems: "center" },
});
