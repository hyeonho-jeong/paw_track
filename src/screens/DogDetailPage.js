import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import DogInfoPage from "./DogInfoPage";
import DogWalkPage from "./DogWalkPage";
import StepCounter from "./StepCounter";

const DogDetailPage = ({ route }) => {
  const { dog } = route.params;
  const [steps, setSteps] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // ✅ 최신 값 유지용 useRef
  const stepsRef = useRef(steps);
  const timeElapsedRef = useRef(timeElapsed);

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    timeElapsedRef.current = timeElapsed;
  }, [timeElapsed]);

  // ✅ 걸음 수 업데이트
  const handleStepsUpdate = (newSteps) => {
    console.log("✅ 걸음 수 업데이트:", newSteps);
    setSteps(newSteps);
  };
  
  const handleTimeUpdate = (elapsedTime) => {
    console.log("✅ 산책 시간 업데이트:", elapsedTime);
    setTimeElapsed(elapsedTime);
  };

  // ✅ Firestore에 활동 저장
  const handleSaveActivity = async () => {
    console.log("🔍 현재 강아지 정보:", dog);
    console.log("🚶 저장 시 걸음 수:", steps);
    console.log("⏱️ 저장 시 산책 시간:", timeElapsed);
  
    if (!dog?.userId) {
      Alert.alert("Error", "강아지의 정보를 찾을 수 없습니다.");
      return;
    }

    // ✅ Firestore에 저장할 데이터
    const activityData = {
      dogName: dog.name,
      age: dog.age,
      walkedTime: (timeElapsed / 60).toFixed(2),
      steps: steps,
      timestamp: new Date(),
      image: dog.image, // ✅ `DogInfoPage`에서 이미 제공하는 이미지 정보 활용
    };
  
    try {
      const activityCollectionRef = collection(db, "users", dog.userId, "activity");
      await addDoc(activityCollectionRef, activityData);
      Alert.alert("Success", `${dog.name}의 활동이 저장되었습니다!`);
    } catch (error) {
      console.error("Firestore 저장 오류:", error);
      Alert.alert("Error", `저장 실패: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{dog.name} 🐶</Text>

      {/* ✅ DogInfoPage를 통해 이미지 포함됨 */}
      <DogInfoPage dogInfo={dog} />
      <DogWalkPage onTimeUpdate={handleTimeUpdate} dogInfo={dog} />
      <StepCounter onStepsUpdate={handleStepsUpdate} />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveActivity}>
        <Text style={styles.saveButtonText}>오늘의 활동 저장</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default DogDetailPage;
