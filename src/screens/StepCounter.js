import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { Pedometer } from "expo-sensors";

const StepCounter = () => {
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
            setStepCount(result.steps);
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

  const resetStepCount = () => {
    setStepCount(0);
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
