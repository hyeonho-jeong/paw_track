import React, { useState, useRef, useEffect } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView 
} from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import DogInfoPage from "./DogInfoPage";
import DogWalkPage from "./DogWalkPage";
import StepCounter from "./StepCounter";

const DogDetailPage = ({ route }) => {
  const { dog } = route.params;
  const [steps, setSteps] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const navigation = useNavigation();

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

  // ✅ Firestore에 활동 저장
  const handleSaveActivity = async () => {
    if (!user) {
      Alert.alert("Error", "로그인이 필요합니다.");
      return;
    }

    if (!dog?.userId) {
      Alert.alert("Error", "강아지의 정보를 찾을 수 없습니다.");
      return;
    }

    const userEmail = user.email || "unknown@example.com"; 
    const username = userEmail.split("@")[0]; 
    console.log("🔍 저장할 사용자:", username);

    const activityData = {
      userId: user.uid,
      username: username,
      dogName: dog.name || "Unknown Dog",
      age: dog.age || "N/A",
      walkedTime: (timeElapsed / 60).toFixed(2),
      steps: steps || 0,
      timestamp: serverTimestamp(),
      ...(dog.image ? { image: dog.image } : {}),
    };

    try {
      // 🔹 1) 개인 기록 저장
      const userActivityRef = collection(db, "users", user.uid, "activity");
      await addDoc(userActivityRef, activityData);

      // 🔹 2) 랭킹용 공개 데이터 저장
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
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <Text style={styles.title}>{dog.name} 🐶</Text>

            {/* ✅ DogInfoPage를 통해 이미지 포함됨 */}
            <DogInfoPage dogInfo={dog} />
            <DogWalkPage onTimeUpdate={handleTimeUpdate} dogInfo={dog} />
            <StepCounter onStepsUpdate={handleStepsUpdate} />

            {/* ✅ SAVE 버튼 */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveActivity}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            {/* ✅ MAIN TABS 버튼 */}
            <TouchableOpacity 
              style={styles.mainPageButton} 
              onPress={() => navigation.navigate("MainTabs")}
            >
              <Text style={styles.mainPageButtonText}>Go to MainPage</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "rgb(238,117,11)", // ✅ 주황색 배경
  },
  flexContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 20,
  },
  container: { 
    width: "90%", 
    maxWidth: 450,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginTop: 30,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  mainPageButton: { 
    backgroundColor: "white", // ✅ 버튼 배경 흰색
    padding: 12, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 10, // ✅ "Save" 버튼과 간격 조절
    borderWidth: 2, // ✅ 테두리 추가
    borderColor: "rgb(238,117,11)", // ✅ 주황색 테두리
  },
  mainPageButtonText: { 
    color: "rgb(238,117,11)", // ✅ 텍스트 색상 주황색
    fontSize: 16, 
    fontWeight: "bold" 
  },
});

export default DogDetailPage;
