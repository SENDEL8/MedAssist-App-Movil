import { Platform } from "react-native";

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) {
    return envUrl;
  }

  if (__DEV__) {
    if (Platform.OS === "web") {
      return "http://localhost:8000";
    }
    return "http://10.0.2.2:8000";
  }

  throw new Error(
    "EXPO_PUBLIC_API_URL must be set in production. " +
    "Create a .env file with EXPO_PUBLIC_API_URL=https://your-api-domain.com"
  );
};

export const API_URL = getApiUrl();

export const APP_NAME = "MedAssist";
export const APP_VERSION = "1.0.0";
