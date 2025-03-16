import React, { useState, useEffect, useRef } from "react";
import { 
  StyleSheet, View, Text, Alert, SafeAreaView, ScrollView, TouchableOpacity, 
  KeyboardAvoidingView, Platform 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import DogInfoPage from "./DogInfoPage";
import DogWalkPage from "./DogWalkPage";
import StepCounter from "./StepCounter";

const DogDetailPage = ({ route }) => {
  const navigation = useNavigation();
  const { dog } = route.params;
  const auth = getAuth();
  const user = auth.currentUser;

  const [steps, setSteps] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const stepsRef = useRef(steps);
  const timeElapsedRef = useRef(timeElapsed);

  useEffect(() => { stepsRef.current = steps; }, [steps]);
  useEffect(() => { timeElapsedRef.current = timeElapsed; }, [timeElapsed]);

  const handleStepsUpdate = (newSteps) => {
    console.log("stepCount:", newSteps);
    setSteps(newSteps);
  };

  const handleTimeUpdate = (elapsedTime) => {
    console.log("walkTime:", elapsedTime);
    setTimeElapsed(elapsedTime);
  };

  const handleSaveActivity = async () => {
    if (!user) {
      Alert.alert("Error", "Log in is required.");
      return;
    }

    if (!dog?.userId) {
      Alert.alert("Error", "No dog's information is found");
      return;
    }

    const username = (user.email || "unknown@example.com").split("@")[0];
    console.log("User Name:", username);

    const activityData = {
      userId: user.uid,
      username,
      dogName: dog.name || "Unknown Dog",
      age: dog.age || "N/A",
      walkedTime: (timeElapsed / 60).toFixed(2),
      steps: steps || 0,
      timestamp: serverTimestamp(),
      ...(dog.image ? { image: dog.image } : {}),
    };

    try {
      await addDoc(collection(db, "users", user.uid, "activity"), activityData);
      await addDoc(collection(db, "users_activity"), activityData);

      Alert.alert("Success", `Activity of ${dog.name}saved!`);
      console.log("activity data saved complete");
    } 
    catch (error) {
      console.error("Firestore save error:", error);
      Alert.alert("Error", `Failed to save: ${error.message}`);
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
            <Text style={styles.title}>{dog.name}</Text>

            <DogInfoPage dogInfo={dog} />
            <DogWalkPage onTimeUpdate={handleTimeUpdate} dogInfo={dog} />
            <StepCounter onStepsUpdate={handleStepsUpdate} />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveActivity}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

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
    backgroundColor: "rgb(238,117,11)", 
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
    backgroundColor: "rgb(47,147,252)",
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
    backgroundColor: "white", 
    padding: 12, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 10, 
    borderWidth: 2, 
    borderColor: "rgb(238,117,11)",
  },
  mainPageButtonText: { 
    color: "rgb(238,117,11)", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});

export default DogDetailPage;
