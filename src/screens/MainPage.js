import React, { useState, useEffect, useContext } from "react";
import { 
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, 
  TouchableWithoutFeedback, Keyboard, Platform, TouchableOpacity, Alert
} from "react-native";
import { AuthContext } from "../../AuthContext";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import DogInfoPage from "./DogInfoPage";
import DogWalkPage from "./DogWalkPage";
import StepCounter from "./StepCounter";

const MainPage = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [dogInfo, setDogInfo] = useState([]); // 강아지 정보 저장
  const [steps, setSteps] = useState(0); // 걸음 수 저장
  const [timeElapsed, setTimeElapsed] = useState(0); // 타이머 저장

  // ✅ Firestore에서 강아지 정보 가져오기
  useEffect(() => {
    if (!user) {
      console.log("🚨 No user found");
      return;
    }

    const dogsCollectionRef = collection(db, "users", user.uid, "dogs");

    const unsubscribe = onSnapshot(dogsCollectionRef, (querySnapshot) => {
      const dogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDogInfo(dogs);
    });

    return () => unsubscribe();
  }, [user]);

  // ✅ 걸음 수 업데이트 핸들러 (StepCounter에서 호출)
  const handleStepsUpdate = (newSteps) => {
    console.log(`📌 걸음 수 업데이트: ${newSteps}`);
    setSteps(newSteps);
  };

  // ✅ 타이머 업데이트 핸들러 (DogWalkPage에서 호출)
  const handleTimeUpdate = (elapsedTime) => {
    console.log(`📌 경과 시간 업데이트: ${elapsedTime}초`);
    setTimeElapsed(elapsedTime);
  };

  // ✅ 활동 저장 함수
  const handleSaveActivity = async () => {
    console.log("🛑 handleSaveActivity() 실행됨");

    if (!user || dogInfo.length === 0) {
      console.log("🚨 No user or dog information found");
      Alert.alert("Error", "No user or dog information found.");
      return;
    }

    const selectedDog = dogInfo[0]; // 첫 번째 강아지 정보 사용

    const activityData = {
      dogName: selectedDog.name,
      age: selectedDog.age,
      walkedTime: Math.floor(timeElapsed / 60), // 분 단위로 저장
      steps: steps,
      timestamp: new Date(),
    };

    console.log("🔥 저장할 활동 데이터:", activityData);

    try {
      const activityCollectionRef = collection(db, "users", user.uid, "activity");
      await addDoc(activityCollectionRef, activityData);

      console.log("✅ 활동 데이터 Firestore에 저장 완료!");
      Alert.alert("Success", "Today's activity saved successfully!");
    } catch (error) {
      console.error("🚨 활동 데이터 저장 오류:", error.message);
      Alert.alert("Error", `Failed to save activity: ${error.message}`);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.outerContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* 강아지 정보 */}
            <DogInfoPage dogInfo={dogInfo} />
            {/* 강아지 산책 정보 */}
            <DogWalkPage onTimeUpdate={handleTimeUpdate} dogInfo={dogInfo} />
            {/* 걸음 수 측정기 */}
            <StepCounter onStepsUpdate={handleStepsUpdate} />

            {/* ✅ "오늘의 활동 저장" 버튼 추가 */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveActivity}>
              <Text style={styles.saveButtonText}>오늘의 활동 저장</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50, // ✅ 위쪽 여백 추가
  },
  scrollContainer: { 
    flexGrow: 1, 
    paddingBottom: 30, // ✅ 버튼 아래 공간 확보
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20, // ✅ 버튼 위치 조정
    marginHorizontal: 40,
    marginBottom: 30, // ✅ 스크롤이 끝났을 때 버튼이 가려지지 않도록 설정
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MainPage;
