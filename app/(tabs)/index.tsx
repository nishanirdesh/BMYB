import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Dynamic icon and font sizes
  const iconSize = Math.min(screenWidth, screenHeight) * 0.15;
  const fontSize = iconSize * 0.25;

  const icons = [
    
    { name: "receipt-outline", label: "Dashboard", link: "/dashboard" },
    { name: "person-add", label: "Add Member", link: "/add-member" },
    { name: "people-outline", label: "Show Member", link: "/show-member" },
    { name: "card-outline", label: "Add Expenses", link: "/add-expenses" },
    { name: "pricetag-outline", label: "Show Expenses", link: "/show-expenses" },
     { name: "cash", label: "Add Monthly", link: "/add-monthly" },
    { name: "receipt-outline", label: "Show Monthly", link: "/show-monthly" }
   
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {icons.map((item, index) => (
          <Link key={index} href={item.link} asChild>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name={item.name} size={iconSize} color="white" />
              <Text style={[styles.iconText, { fontSize }]}>{item.label}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "hsla(144, 23%, 26%, 1.00)",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
    maxWidth: "100%",
  },
  iconButton: {
    width: "30%",
    aspectRatio: 1, // makes square buttons
    backgroundColor: "#6200EE",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "white",
    marginTop: 5,
    textAlign: "center",
  },
});
