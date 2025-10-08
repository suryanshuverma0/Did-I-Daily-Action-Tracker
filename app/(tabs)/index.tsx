import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  Animated,
  Image,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Predefined colors and icons
const COLORS = [
  "#4CAF50",
  "#FF9800",
  "#03A9F4",
  "#9C27B0",
  "#E91E63",
  "#FF5722",
  "#795548",
  "#607D8B",
];
const ICONS = [
  "lock",
  "dog",
  "pill",
  "star",
  "book",
  "alarm",
  "coffee",
  "walk",
  "music",
];

function MainScreen() {
  const colorScheme = useColorScheme();
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([
    { id: 1, title: "Locked Door", color: "#4CAF50", icon: "lock" },
    { id: 2, title: "Fed Pet", color: "#FF9800", icon: "dog" },
    { id: 3, title: "Took Medicine", color: "#03A9F4", icon: "pill" },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newActionName, setNewActionName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isDark = colorScheme === "dark";
  const backgroundColor = isDark ? "#121212" : "#f2f2f2";
  const textColor = isDark ? "#fff" : "#000";
  const subTextColor = isDark ? "#ccc" : "#666";
  const logBgColor = isDark ? "#1e1e1e" : "#fff";

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const storedLogs = await AsyncStorage.getItem("actionLogs");
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        const filteredLogs = parsedLogs.filter(
          (log) => new Date(log.timestamp) > oneWeekAgo
        );
        setLogs(filteredLogs);
        await AsyncStorage.setItem("actionLogs", JSON.stringify(filteredLogs));
      }
    } catch (error) {
      console.log("Error loading logs:", error);
    }
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleActionPress = async (action) => {
    animatePress();
    const newLog = {
      id: Date.now(),
      action: action.title,
      icon: action.icon,
      timestamp: new Date().toISOString(),
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    await AsyncStorage.setItem("actionLogs", JSON.stringify(updatedLogs));
  };

  const handleDeleteLog = (id) => {
    Alert.alert("Delete Log", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updatedLogs = logs.filter((log) => log.id !== id);
          setLogs(updatedLogs);
          await AsyncStorage.setItem("actionLogs", JSON.stringify(updatedLogs));
        },
      },
    ]);
  };

  const handleDeleteAction = (id) => {
    Alert.alert(
      "Delete Action",
      "This will delete the action and its logs. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const deletedAction = actions.find((a) => a.id === id);
            const updatedActions = actions.filter((a) => a.id !== id);
            setActions(updatedActions);
            const remainingLogs = logs.filter(
              (l) => l.action !== deletedAction?.title
            );
            setLogs(remainingLogs);
            await AsyncStorage.setItem(
              "actionLogs",
              JSON.stringify(remainingLogs)
            );
          },
        },
      ]
    );
  };

  const handleAddAction = () => {
    if (!newActionName.trim()) return;
    const newAction = {
      id: Date.now(),
      title: newActionName.trim(),
      color: selectedColor,
      icon: selectedIcon,
    };
    setActions([...actions, newAction]);
    setNewActionName("");
    setSelectedColor(COLORS[0]);
    setSelectedIcon(ICONS[0]);
    setModalVisible(false);
  };

  const formatTime = (isoString) => new Date(isoString).toLocaleString();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <>
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  marginBottom: 20,
                  borderRadius: 20,
                  backgroundColor: isDark ? "#1E1E1E" : "#ffffff",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  elevation: 8, // Android shadow
                }}
              >
                <Image
                  source={require("../../assets/logo.png")}
                  style={{
                    width: 55,
                    height: 55,
                    borderRadius: 27.5, // perfectly rounded
                    marginRight: 15,
                    borderWidth: 1,
                    borderColor: isDark ? "#333" : "#ddd", // subtle border for depth
                  }}
                  resizeMode="cover"
                />
                <Text
                  style={{
                    fontSize: 44, // noticeable app name
                    fontWeight: "900",
                    color: textColor,
                    letterSpacing: 1.8,
                    textShadowColor: isDark ? "#000" : "#aaa",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  Did I?
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {actions.map((action) => (
                  <Animated.View
                    key={action.id}
                    style={{ transform: [{ scale: scaleAnim }] }}
                  >
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: action.color }]}
                      onPress={() => handleActionPress(action)}
                      onLongPress={() => handleDeleteAction(action.id)}
                    >
                      <MaterialCommunityIcons
                        name={action.icon}
                        size={22}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.buttonText}>{action.title}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.addButtonText}>+ Add Action</Text>
                </TouchableOpacity>
              </View>

              {/* History Header */}
              <Text style={[styles.subHeader, { color: textColor }]}>
                History
              </Text>
              {logs.length === 0 && (
                <Text style={[styles.noLogsText, { color: subTextColor }]}>
                  No logs yet. Tap an action above!
                </Text>
              )}
            </>
          )}
          renderItem={({ item }) => {
            const renderRightActions = (_, dragX) => {
              const scale = dragX.interpolate({
                inputRange: [-100, 0],
                outputRange: [1, 0],
                extrapolate: "clamp",
              });
              return (
                <Animated.View
                  style={{ justifyContent: "center", alignItems: "flex-end" }}
                >
                  <TouchableOpacity
                    onPress={() => handleDeleteLog(item.id)}
                    style={{
                      backgroundColor: "#F44336",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 80,
                      height: "90%",
                      marginVertical: 5,
                      borderRadius: 8,
                    }}
                  >
                    <Animated.Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        transform: [{ scale }],
                      }}
                    >
                      Delete
                    </Animated.Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            };
            return (
              <Swipeable renderRightActions={renderRightActions}>
                <View style={[styles.logItem, { backgroundColor: logBgColor }]}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={20}
                      color={subTextColor}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.logText, { color: textColor }]}>
                      {item.action}
                    </Text>
                  </View>
                  <Text style={[styles.timestamp, { color: subTextColor }]}>
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
              </Swipeable>
            );
          }}
        />

        {/* Add Action Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={[styles.modalContainer, { backgroundColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Add New Action
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: subTextColor, color: textColor },
                ]}
                placeholder="Action Name"
                placeholderTextColor={subTextColor}
                value={newActionName}
                onChangeText={setNewActionName}
              />
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      {
                        backgroundColor: color,
                        borderWidth: selectedColor === color ? 3 : 0,
                      },
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                {ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconCircle,
                      { borderWidth: selectedIcon === icon ? 2 : 0 },
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={24}
                      color={subTextColor}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                  onPress={handleAddAction}
                >
                  <Text style={styles.modalButtonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#F44336" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default MainScreen;

// Refined Styles - Professional, visually appealing, industry-level
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2", // light neutral background
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // Android shadow
  },

  buttonContainer: {
    flexDirection: "column",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  addButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  logItem: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  logText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },

  timestamp: {
    fontSize: 13,
    marginTop: 4,
    color: "#888",
  },

  noLogsText: {
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 5,
    color: "#666",
    textAlign: "center",
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    padding: 22,
    borderRadius: 16,
    width: "85%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 18,
    textAlign: "center",
    color: "#111",
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderColor: "#ccc",
    fontSize: 16,
    color: "#333",
  },

  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    margin: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },

  iconCircle: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    margin: 6,
    borderColor: "#ddd",
    borderWidth: 2,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
