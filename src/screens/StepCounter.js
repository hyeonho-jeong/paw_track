import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
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
            console.log("Update the stepCount:", result.steps); 
            setStepCount(result.steps); 

            if (onStepsUpdate) {
              onStepsUpdate(result.steps); 
            }
          });
        }
      } 
      catch (error) {
        console.error("Pedometer error:", error);
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

  useEffect(() => {
    if (onStepsUpdate) {
      console.log("stepCount:", stepCount);
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
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.headingDesign}>Steps Count: {stepCount}</Text>

          <TouchableOpacity style={styles.resetButton} onPress={resetStepCount}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgb(221,221,221)",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
  },
  row: {
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "space-between",
  },
  headingDesign: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
    marginLeft: 5,
    borderRadius: 5,
  },
  resetButton: {
    width: 80,
    height: 80, 
    borderRadius:50,
    backgroundColor: "rgb(254,112,57)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});

export default StepCounter;