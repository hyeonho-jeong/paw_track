import React, { useState, useRef } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

// ✅ JSON 파일에서 강아지 산책 정보 불러오기
const dogBreeds = require("../../assets/dogBreeds.json");

const DogWalkPage = ({ dogInfo, onTimeUpdate }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  if (!dogInfo) {
    return <Text style={styles.text}>강아지 정보가 없습니다.</Text>;
  }

  const getWalkTime = () => {
    const breedData = dogBreeds.find(
      (item) => item.Breed.toLowerCase() === dogInfo.breed.toLowerCase()
    );

    if (!breedData) return "Unknown";

    const age = Number(dogInfo.age);
    if (age < Number(breedData.Puppy_Age)) {
      return Number(breedData["Puppy_Walk_Time(Min)"]);
    } else if (age <= Number(breedData.Adult_Age)) {
      return Number(breedData["Adult_Walk_Time(Min)"]);
    } else {
      return Number(breedData["Senior_Walk_Time(Min)"]);
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      const startTime = Date.now() - elapsedTime * 1000;
      timerRef.current = setInterval(() => {
        const newElapsedTime = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(newElapsedTime);
        onTimeUpdate(newElapsedTime);
      }, 1000);
      setIsRunning(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.text}>🐾 {dogInfo.name}의 산책 정보</Text>
        <Text style={styles.text}>권장 산책 시간: {getWalkTime()} 분</Text>
        <Text style={styles.text}>
          경과 시간: {Math.floor(elapsedTime / 60)}분 {elapsedTime % 60}초
        </Text>
        <Button title={isRunning ? "타이머 중지" : "타이머 시작"} onPress={toggleTimer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
});

export default DogWalkPage;
