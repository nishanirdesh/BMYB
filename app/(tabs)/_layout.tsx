import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Layout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      {/* StatusBar space for notch */}
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        {/* Title in center */}
        <Text style={styles.headerText}>Bali Mewla Youth Brigade</Text>

        {/* Home icon on right */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="home" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Created By Nirdesh </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50, // space from top to avoid notch
    paddingBottom: 15,
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  homeButton: {
    position: "absolute",
    right: 15,
    top: 50, // aligns with paddingTop
  },
  footer: {
    padding: 10,
    backgroundColor: "#f1f1f1",
  },
  footerText: {
    textAlign: "center",
    color: "#777",
  },
});
