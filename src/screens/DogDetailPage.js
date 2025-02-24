import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import DogInfoPage from "./DogInfoPage";
import DogWalkPage from "./DogWalkPage";
import StepCounter from "./StepCounter";

const DogDetailPage = ({ route }) => {
  const { dog } = route.params;
  const [steps, setSteps] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const auth = getAuth();
  const user = auth.currentUser;

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

  // ✅ Firestore에 활동 저장 (users/{userId}/activity + users_activity)
  const handleSaveActivity = async () => {
    if (!user) {
      Alert.alert("Error", "로그인이 필요합니다.");
      return;
    }

    if (!dog?.userId) {
      Alert.alert("Error", "강아지의 정보를 찾을 수 없습니다.");
      return;
    }

    const userEmail = user.email || "unknown@example.com"; // ✅ 이메일이 없을 경우 대비
    const username = userEmail.split("@")[0]; // ✅ 이메일 앞부분을 username으로 저장
    console.log("🔍 저장할 사용자:", username);

    // ✅ Firestore에 저장할 데이터 (공개/개인용)
    const activityData = {
      userId: user.uid, // ✅ 사용자 ID 포함
      username: username, // ✅ 사용자 이름 저장
      dogName: dog.name || "Unknown Dog",
      age: dog.age || "N/A",
      walkedTime: (timeElapsed / 60).toFixed(2),
      steps: steps || 0,
      timestamp: serverTimestamp(), // ✅ 서버 시간으로 저장
      ...(dog.image ? { image: dog.image } : {}), // ✅ 이미지가 있을 경우 저장
    };

    try {
      // 🔹 1) 개인 기록 저장 (users/{userId}/activity)
      const userActivityRef = collection(db, "users", user.uid, "activity");
      await addDoc(userActivityRef, activityData);

      // 🔹 2) 랭킹용 공개 데이터 저장 (users_activity)
      const publicActivityRef = collection(db, "users_activity");
      await addDoc(publicActivityRef, activityData);

      Alert.alert("Success", `${dog.name}의 활동이 저장되었습니다!`);
      console.log("✅ 활동 데이터 저장 완료");
    } catch (error) {
      console.error("🚨 Firestore 저장 오류:", error);
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
        <Text style={styles.saveButtonText}>Save</Text>
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

