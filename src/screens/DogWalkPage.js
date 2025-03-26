import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import * as Notifications from "expo-notifications"; 



const dogBreeds = require("../../assets/dogBreeds.json");

const DogWalkPage = ({ dogInfo, onTimeUpdate }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [trackedPercentages, setTrackedPercentages] = useState(new Set()); 
  const timerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current; 

  if (!dogInfo) {
    return <Text style={styles.text}>No dog information available.</Text>;
  }

  const getWalkTime = () => {
    const breedData = dogBreeds.find(
      (item) => item.Breed.toLowerCase() === dogInfo.breed.toLowerCase()
    );

    if (!breedData) return 20; 

    const age = Number(dogInfo.age);
    
    if (age < Number(breedData.Puppy_Age)) return Number(breedData["Puppy_Walk_Time(Min)"]);
    else if (age <= Number(breedData.Adult_Age)) return Number(breedData["Adult_Walk_Time(Min)"]);
    else return Number(breedData["Senior_Walk_Time(Min)"]);
  };

  const totalWalkTime = getWalkTime() * 60;

  const sendLocalNotification = async (percentage) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Notification",
        body: `You are ${percentage}% finished total walk.`,
        sound: true,
      },
      trigger: null, 
    });
  };


  useEffect(() => {
    const percentages = [10, 30, 50, 70, 100]; 

    percentages.forEach((percent) => {
      const threshold = Math.floor(totalWalkTime * (percent / 100));
      if (elapsedTime >= threshold && !trackedPercentages.has(percent)) {
        sendLocalNotification(percent);
        setTrackedPercentages((prev) => new Set(prev).add(percent));
      }
    });
  }, [elapsedTime]); 

  useEffect(() => {
    const progress = (elapsedTime / totalWalkTime) * 100;

    Animated.timing(progressAnim, {
      toValue: progress, 
      duration: 500, 
      useNativeDriver: false,
    }).start();
  }, [elapsedTime]); 

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      const startTime = Date.now() - elapsedTime * 1000;
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setElapsedTime(0);
    setIsRunning(false);
    setTrackedPercentages(new Set()); 

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const progressPercentage = Math.min((elapsedTime / totalWalkTime) * 100, 100).toFixed(1);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.infoContainer}>
            <Text style={styles.text}>Recommended Walk Time: {getWalkTime()} min</Text>
            <Text style={styles.text}>
              Elapsed Time: {Math.floor(elapsedTime / 60)} min {elapsedTime % 60} sec
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.circleButton,
                { width: elapsedTime === 0 ? 80 : 60, height: elapsedTime === 0 ? 80 : 60 }
              ]}
              onPress={toggleTimer}
            >
              <Text style={styles.buttonText}>{isRunning ? "Pause" : "Start"}</Text>
            </TouchableOpacity>

            {elapsedTime > 0 && (
              <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBar, { width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"]
            }) }]}
          />
          <Text style={styles.progressText}>{progressPercentage}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 10 },
  card: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  buttonContainer: { alignItems: "flex-end" },
  circleButton: {
    borderRadius: 50,
    backgroundColor: "rgb(247,204,73)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  resetButton: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "rgb(186,218,85)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  progressBarContainer: {
    height: 30,
    width: "100%",
    backgroundColor: "#ddd",
    borderRadius: 15,
    marginTop: 20,
    overflow: "hidden",
    justifyContent: "center",
  },
  progressBar: { height: "100%", backgroundColor: "rgb(120,190,252)", borderRadius: 15 },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  infoContainer: { flex: 1 },
  text: { fontSize: 16, fontWeight: "bold", textAlign: "left", marginBottom: 5 },
});

export default DogWalkPage;
