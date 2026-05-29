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
import { Ionicons } from "@expo/vector-icons";
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
          <Ionicons name="document-text" size={24} color="#15803d" />
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
             <Ionicons name="camera" size={24} color="#15803d" />
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
            <Ionicons name="camera" size={24} color="#15803d" />
            <Text style={styles.cardTitle}>Seleccionar imagen</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={pickImageFromCamera}>
              <Ionicons name="camera" size={36} color="#15803d" />
              <Text style={styles.actionButtonText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={pickImageFromGallery}>
              <Ionicons name="images" size={36} color="#15803d" />
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
  root: { flex: 1, backgroundColor: "#f1f5f9" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },

  /* Header - Enhanced */
  header: { backgroundColor: "#15803d", paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 14, color: "#bbf7d0", marginTop: 6 },

  /* Cards - Enhanced */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
  instructionText: { fontSize: 14, color: "#64748b", lineHeight: 24 },

  /* Preview - Enhanced */
  previewImage: { width: "100%", height: 220, borderRadius: 16, marginBottom: 14 },
  retakeButton: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 18 },
  retakeButtonText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },

  /* Action Buttons - Enhanced */
  buttonRow: { flexDirection: "row", gap: 14 },
  actionButton: {
    flex: 1,
    backgroundColor: "#dcfce7",
    borderWidth: 1.5,
    borderColor: "#86efac",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  actionButtonText: { fontSize: 15, fontWeight: "600", color: "#15803d" },

  /* Error */
  errorText: { color: "#ef4444", fontSize: 14, textAlign: "center", marginBottom: 14, fontWeight: "500" },

  /* Submit - Enhanced */
  submitButton: {
    backgroundColor: "#16a34a",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18, letterSpacing: 0.5 },
  loadingRow: { flexDirection: "row", alignItems: "center" },
});
