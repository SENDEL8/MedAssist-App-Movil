import { Platform } from "react-native";

const getApiUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }
  if (Platform.OS === "ios") {
    return "http://localhost:8000";
  }
  return "http://localhost:8000";
};

export const API_URL = getApiUrl();
