import React, { useState, useEffect, useContext } from "react";
import { 
  View, Text, StyleSheet, KeyboardAvoidingView, 
  TouchableWithoutFeedback, Keyboard, Platform, Image, FlatList, ScrollView
} from "react-native";
import { Calendar } from "react-native-calendars";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../AuthContext";

const LeftPage = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [activityData, setActivityData] = useState([]); 

  const fetchActivityData = async (date) => {
    if (!user) 
      return;

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
        } 
        else {
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
    } 
    catch (error) {
        console.error("Error fetching Firestore data:", error);
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
  
          <View style={styles.container}>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                fetchActivityData(day.dateString);
              }}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: "rgb(40,167,69)" },
              }}
              theme={{
                selectedDayBackgroundColor: "rgb(40,167,69)",
                todayTextColor: "rgb(255,69,0)",
              }}
              style={styles.calendar}
            />
  
            <Text style={styles.dateTitle}>
              {selectedDate ? `Activity Record on ${selectedDate}` : "Select a Date"}
            </Text>
  
            <FlatList
              data={activityData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.activityItem}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.activityImage} />
                  ) : (
                    <Text style={styles.defaultIcon}>🐾</Text>
                  )}
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityText}> {item.dogName}</Text>
                    <Text style={styles.activityText}> Recorded Date: {item.localDate}</Text>
                    <Text style={styles.activityText}> Walk Time: {item.walkedTime} min</Text>
                    <Text style={styles.activityText}> Steps Taken: {item.steps}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.noDataText}> No activity recorded on the selected date.</Text>}
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            />
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
    justifyContent: "flex-start", 
    paddingTop: 90, 
  },
  container: { 
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgb(238,117,11)",
    marginTop: 10,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginBottom: 10,
  },
  calendar: {
    marginBottom: 10, 
    borderRadius: 10,
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
