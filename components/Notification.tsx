// components/Notification.tsx
import React from "react";
import { View, Button, Alert } from "react-native";
import * as Notifications from "expo-notifications";

export default function Notification() {
  
  // Function to schedule a notification
  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Reminder 🔔",
        body: "Time to check your habit!",
      },
      trigger: { seconds: 5 }, // triggers after 5 seconds
    });
    Alert.alert("Notification scheduled!");
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <Button title="Send Notification" onPress={scheduleNotification} />
    </View>
  );
}
