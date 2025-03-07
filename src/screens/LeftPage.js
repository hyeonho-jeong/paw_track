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
        <View style={styles.safeContainer}>
          <Text style={styles.title}>Dog History</Text>
          <View style={[styles.container, styles.containerFullHeight]}>
            <HeaderButtons navigation={navigation} />
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
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
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "rgb(238,117,11)",
    alignItems: "center",
    justifyContent: "flex-start", // ✅ Dog History가 짤리지 않도록 수정
    paddingTop: 90, // ✅ 상단 여백 추가
  },
  container: { 
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgb(238,117,11)",
    marginTop: 10, // ✅ Dog History와 컨테이너 간 간격 추가
  },
  containerFullHeight: {
    flexGrow: 1, // ✅ 컨테이너가 스크롤 가능하도록 변경하여 Dog History가 보이게 수정
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginBottom: 10,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
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
    borderWidth: 2,
    borderColor: "rgb(238,117,11)",
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