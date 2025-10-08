import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
  StyleSheet,
  Image,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = isDark ? "#121212" : "#f2f2f2";
  const cardColor = isDark ? "#1E1E1E" : "#ffffff";
  const textColor = isDark ? "#fff" : "#000";
  const subTextColor = isDark ? "#ccc" : "#555";
  const buttonColor = "#2196F3";

  const features = [
    { icon: "brush", text: "Customizable actions with unique icons and colors" },
    { icon: "flash", text: "One-tap logging of actions with timestamp" },
    { icon: "history", text: "History view with swipe-to-delete logs" },
    { icon: "cloud-off-outline", text: "Offline-first: works without internet" },
    { icon: "delete-sweep", text: "Automatic cleanup of logs older than 1 week" },
    { icon: "gesture-tap", text: "Smooth button animations for better UX" },
    { icon: "plus-box", text: "Easy-to-use modal for adding new actions" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* App Header */}
        <View style={styles.headerWrapper}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
          <Text style={[styles.appName, { color: textColor }]}>Did I?</Text>
        </View>

        {/* About Card */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>About Did I?</Text>
          <Text style={[styles.cardText, { color: subTextColor }]}>
            Did I? is a lightweight productivity tool for busy people who often forget 
            small but important daily actions. Locking the door, taking medicine, 
            or feeding pets—Did I? helps you effortlessly log these actions and stay organized.
          </Text>
        </View>

        {/* Features Card */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Key Features</Text>
          {features.map((item, idx) => (
            <View key={idx} style={styles.featureItem}>
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={buttonColor}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.cardText, { color: subTextColor }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Why Card */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Why We Made This App</Text>
          <Text style={[styles.cardText, { color: subTextColor }]}>
            In a busy lifestyle, people often forget essential tasks like locking the door, 
            taking medication, or completing small chores. Did I? ensures these important 
            actions are logged easily, helping users stay organized and stress-free.
          </Text>
        </View>

        {/* Contact & Feedback */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Contact & Feedback</Text>

          {/* Email Button with Icon */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonColor }]}
            onPress={() => Linking.openURL("mailto:suryanshuverma42@gmail.com")}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Email Us</Text>
          </TouchableOpacity>

          {/* Twitter / Feedback Button with Icon */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonColor }]}
            onPress={() => Linking.openURL("https://x.com/SuryanshuVerma5")}
          >
            <MaterialCommunityIcons
              name="twitter"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Give Feedback / Follow Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  logo: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  appName: {
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 1.8,
    textShadowColor: "#aaa",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
