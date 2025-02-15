import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../../AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

// ✅ JSON 파일에서 강아지 산책 정보 불러오기
const dogBreeds = require("../../assets/dogBreeds.json");

const DogWalkPage = () => {
  const { user } = useContext(AuthContext);
  const [dogInfo, setDogInfo] = useState([]);
  const [timers, setTimers] = useState({});
  const timerRefs = useRef({});

  useEffect(() => {
    if (!user) {
      Alert.alert("Error", "No user is signed in.");
      return; // ✅ 실행 중단
    }

    const dogsCollectionRef = collection(db, "users", user.uid, "dogs");

    const unsubscribe = onSnapshot(dogsCollectionRef, (querySnapshot) => {
      const dogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDogInfo(dogs);
    });

    return () => unsubscribe(); // ✅ Firestore 리스너 해제
  }, [user]);

  const getWalkTime = (dog) => {
    const breedData = dogBreeds.find(
      (item) => item.Breed.toLowerCase() === dog.breed.toLowerCase()
    );

    if (!breedData) return "Unknown";

    const age = Number(dog.age);
    if (age < Number(breedData.Puppy_Age)) {
      return Number(breedData["Puppy_Walk_Time(Min)"]);
    } else if (age <= Number(breedData.Adult_Age)) {
      return Number(breedData["Adult_Walk_Time(Min)"]);
    } else {
      return Number(breedData["Senior_Walk_Time(Min)"]);
    }
  };

  const toggleTimer = (dogId) => {
    setTimers((prevTimers) => {
      const isRunning = !!prevTimers[dogId];

      if (isRunning) {
        clearInterval(timerRefs.current[dogId]);
        return { ...prevTimers, [dogId]: 0 };
      } else {
        const startTime = Date.now();
        timerRefs.current[dogId] = setInterval(() => {
          setTimers((prev) => ({
            ...prev,
            [dogId]: Math.floor((Date.now() - startTime) / 1000),
          }));
        }, 1000);
        return { ...prevTimers, [dogId]: 1 }; // ✅ 타이머 실행 중 표시
      }
    });
  };

  return (
    <View style={styles.container}>
      {dogInfo.length > 0 ? (
        dogInfo.map((dog) => {
          const walkTime = getWalkTime(dog);
          const elapsedTime = timers[dog.id] || 0;

          return (
            <View key={dog.id} style={styles.card}>
              <Text style={styles.text}>Name: {dog.name}</Text>
              <Text style={styles.text}>Walk Time: {walkTime} min</Text>
              <Text style={styles.text}>
                Time Elapsed: {Math.floor(elapsedTime / 60)} min {elapsedTime % 60} sec
              </Text>
              <Button
                title={timers[dog.id] ? "Pause Timer" : "Start Timer"}
                onPress={() => toggleTimer(dog.id)}
              />
            </View>
          );
        })
      ) : (
        <Text style={styles.text}>No dog information saved.</Text>
      )}
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
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
});

export default DogWalkPage;
