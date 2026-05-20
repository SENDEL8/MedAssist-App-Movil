jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native-web");
  return RN;
});

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("expo-constants", () => ({
  default: {
    manifest: {
      extra: {
        API_URL: "http://localhost:8000",
      },
    },
  },
}));
