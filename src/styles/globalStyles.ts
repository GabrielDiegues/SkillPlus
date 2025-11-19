import { StyleSheet } from "react-native";

const ACCENT_COLOR = "#AD0177";
const TEXT_COLOR = "#1a1a1a";
const BG_COLOR = "#F9F9F9";

const globalStyles = StyleSheet.create({
  // --- Screen containers ---
  screenContainer: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",     // centers everything vertically
    paddingHorizontal: 30,
    paddingVertical: 40,
  },



  // --- Headers ---
  headerContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  titleText: {
    fontSize: 32,
    fontWeight: "700",
    color: ACCENT_COLOR,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },

  // --- Form layout ---
  formContainer: {
    gap: 20,
    alignItems: "center",
  },

  // --- Input ---
  label: {
    width: "100%",
    fontSize: 15,
    color: ACCENT_COLOR,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    fontSize: 14,
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    color: TEXT_COLOR,
  },

  // --- Button ---
  buttonContainer: {
    width: "85%",
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    backgroundColor: "#d8a3c5",
  },

  // --- Links & text ---
  centeredText: {
    alignItems: "center",
    marginTop: 10,
  },
  linkText: {
    color: ACCENT_COLOR,
    fontSize: 15,
  },
  linkTextBold: {
    color: ACCENT_COLOR,
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 4,
  },
  secondaryText: {
    color: "#666",
    fontSize: 15,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  // --- Utility ---
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default globalStyles;
