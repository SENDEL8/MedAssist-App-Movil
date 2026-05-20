import { Platform } from "react-native";
import Constants from "expo-constants";

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) {
    return envUrl;
  }

  const extraUrl = Constants.expoConfig?.extra?.API_URL as string | undefined;
  if (extraUrl) {
    return extraUrl;
  }

  if (__DEV__) {
    if (Platform.OS === "web") {
      return "http://localhost:8000";
    }
    return "http://10.0.2.2:8000";
  }

  return "http://192.168.1.17:8000";
};

export const API_URL = getApiUrl();

export const APP_NAME = "MedAssist";
export const APP_VERSION = "1.0.0";
