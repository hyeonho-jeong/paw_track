import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { Pedometer } from "expo-sensors";

const StepCounter = ({ onStepsUpdate }) => {  
  const [pedometerAvailable, setPedometerAvailable] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  useEffect(() => {
    let subscription = null;

    async function checkPedometer() {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setPedometerAvailable(isAvailable);

        if (isAvailable) {
          subscription = Pedometer.watchStepCount((result) => {
            console.log("📢 걸음 수 업데이트:", result.steps); // ✅ 로그 추가
            setStepCount((prevSteps) => {
              const updatedSteps = prevSteps + result.steps; // ✅ 걸음 수 누적 업데이트
              if (onStepsUpdate) {
                onStepsUpdate(updatedSteps);  // ✅ 걸음 수 업데이트 전달
              }
              return updatedSteps;
            });
          });
        }
      } catch (error) {
        console.error("🚨 Pedometer error:", error);
        setPedometerAvailable(false);
      }
    }

    checkPedometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // ✅ 걸음 수가 변경될 때마다 onStepsUpdate 호출
  useEffect(() => {
    if (onStepsUpdate) {
      console.log("📢 걸음 수 업데이트 호출됨:", stepCount);
      onStepsUpdate(stepCount);
    }
  }, [stepCount]);

  const resetStepCount = () => {
    setStepCount(0);
    if (onStepsUpdate) {
      onStepsUpdate(0);  
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headingDesign}>
        Pedometer Available: {pedometerAvailable ? "Yes" : "No"}
      </Text>
      <Text style={styles.headingDesign}>Steps Taken: {stepCount}</Text>
      <Button title="Reset Steps" onPress={resetStepCount} color="#841584" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  headingDesign: {
    color: "white",
    backgroundColor: "rgb(155,89,182)",
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
});

export default StepCounter;
