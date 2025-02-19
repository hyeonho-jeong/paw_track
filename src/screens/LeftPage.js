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
  const [selectedDate, setSelectedDate] = useState(""); // ✅ 선택한 날짜 저장
  const [activityData, setActivityData] = useState([]); // ✅ Firestore에서 불러온 데이터 저장

  // ✅ 날짜 선택 시 Firestore에서 해당 날짜 데이터 가져오기
  const fetchActivityData = async (date) => {
    if (!user) return;

    setActivityData([]); // ✅ 새 날짜를 선택할 때 기존 데이터 초기화

    try {
        const userActivityRef = collection(db, "users", user.uid, "activity");

        // ✅ Firestore에 저장된 UTC 시간을 사용하여 필터링
        const selectedUTCDate = new Date(date); 
        selectedUTCDate.setUTCHours(0, 0, 0, 0); // UTC 00:00:00 설정
        const nextUTCDate = new Date(selectedUTCDate);
        nextUTCDate.setUTCDate(nextUTCDate.getUTCDate() + 1); // 다음날 UTC 00:00:00 설정

        // ✅ Firestore에서 해당 UTC 날짜에 저장된 데이터만 가져오기
        const q = query(
            userActivityRef, 
            where("timestamp", ">=", selectedUTCDate), 
            where("timestamp", "<", nextUTCDate)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setActivityData([]); // ✅ 데이터가 없으면 빈 배열 설정
        } else {
            const activities = querySnapshot.docs.map(doc => {
                const activity = doc.data();

                // ✅ Firestore UTC timestamp → 사용자 현지 시간 변환
                const localDate = activity.timestamp.toDate().toLocaleDateString(); 
                const localTime = activity.timestamp.toDate().toLocaleTimeString(); 

                return {
                    id: doc.id,
                    ...activity,
                    localDate, // ✅ 변환된 날짜
                    localTime, // ✅ 변환된 시간
                };
            });

            setActivityData(activities);
        }
    } catch (error) {
        console.error("🚨 Firestore 데이터 가져오기 오류:", error);
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
            {/* ✅ 헤더 버튼 추가 */}
            <HeaderButtons navigation={navigation} />

            {/* ✅ 달력 추가 */}
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

            {/* ✅ 선택한 날짜에 저장된 강아지 활동 데이터 표시 */}
            <Text style={styles.dateTitle}>
              {selectedDate ? `${selectedDate}의 활동 기록` : "날짜를 선택하세요"}
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
                    <Text style={styles.activityText}>🐶 {activity.dogName}</Text>
                    <Text style={styles.activityText}>📅 저장 날짜: {activity.localDate}</Text>
                    <Text style={styles.activityText}>📅 산책 시간: {activity.walkedTime} 분</Text>
                    <Text style={styles.activityText}>🚶 걸음 수: {activity.steps}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>📌 선택한 날짜에 저장된 활동이 없습니다.</Text>
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
