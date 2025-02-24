import React, { useState, useEffect, useContext } from "react";
import { 
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, 
  TouchableWithoutFeedback, Keyboard, Platform, Image 
} from "react-native";
import { Calendar } from "react-native-calendars";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../AuthContext";
import HeaderButtons from "../components/HeaderButtons";

const LeftPage = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [activityData, setActivityData] = useState([]); 

  const fetchActivityData = async (date) => {
    if (!user) return;

    setActivityData([]); 

    try {
        const userActivityRef = collection(db, "users", user.uid, "activity");

        const selectedUTCDate = new Date(date); 
        selectedUTCDate.setUTCHours(0, 0, 0, 0); 
        const nextUTCDate = new Date(selectedUTCDate);
        nextUTCDate.setUTCDate(nextUTCDate.getUTCDate() + 1); 

        const q = query(
            userActivityRef, 
            where("timestamp", ">=", selectedUTCDate), 
            where("timestamp", "<", nextUTCDate)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setActivityData([]); 
        } else {
            const activities = querySnapshot.docs.map(doc => {
                const activity = doc.data();

                const localDate = activity.timestamp.toDate().toLocaleDateString(); 
                const localTime = activity.timestamp.toDate().toLocaleTimeString(); 

                return {
                    id: doc.id,
                    ...activity,
                    localDate, 
                    localTime, 
                };
            });

            setActivityData(activities);
        }
    } catch (error) {
        console.error("🚨 Error fetching Firestore data:", error);
    }
};

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <HeaderButtons navigation={navigation} />

            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                fetchActivityData(day.dateString);
              }}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: "#007AFF" },
              }}
              theme={{
                selectedDayBackgroundColor: "#007AFF",
                todayTextColor: "#FF4500",
              }}
            />

            <Text style={styles.dateTitle}>
              {selectedDate ? `Activity Record on ${selectedDate}` : "Select a Date"}
            </Text>

            {activityData.length > 0 ? (
              activityData.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  {activity.image ? (
                    <Image source={{ uri: activity.image }} style={styles.activityImage} />
                  ) : (
                    <Text style={styles.defaultIcon}>🐾</Text>
                  )}
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityText}> {activity.dogName}</Text>
                    <Text style={styles.activityText}> Recorded Date: {activity.localDate}</Text>
                    <Text style={styles.activityText}> Walk Time: {activity.walkedTime} min</Text>
                    <Text style={styles.activityText}> Steps Taken: {activity.steps}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}> No activity recorded on the selected date.</Text>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1 
  },
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  activityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  defaultIcon: {
    fontSize: 30,
    marginRight: 10,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  noDataText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
});

export default LeftPage;
