import { Platform } from "react-native";

const LOCAL_IP = "192.168.0.199";

const getApiUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:8000";
  }
  return `http://${LOCAL_IP}:8000`;
};

export const API_URL = getApiUrl();
