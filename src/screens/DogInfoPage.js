import React, { useState, useEffect, useContext } from "react";
import { View, Text, Image, StyleSheet, Alert, FlatList } from "react-native";
import { AuthContext } from "../../AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

// ✅ JSON 파일에서 강아지 품종 정보 불러오기
const dogBreeds = require("../../assets/dogBreeds.json");

const DogInfoPage = () => {
  const { user } = useContext(AuthContext);
  const [dogInfo, setDogInfo] = useState([]);

  useEffect(() => {
    if (!user) {
      Alert.alert("Error", "No user is signed in.");
      return; // ✅ 로그인되지 않은 경우 실행 중단
    }

    const dogsCollectionRef = collection(db, "users", user.uid, "dogs");

    const unsubscribe = onSnapshot(dogsCollectionRef, (querySnapshot) => {
      const dogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDogInfo(dogs);
    });

    return () => unsubscribe();
  }, [user]);

  const getWeightStatus = (dog) => {
    if (!dog.breed) return "Unknown";

    const breedData = dogBreeds.find(
      (item) => item.Breed.toLowerCase() === dog.breed.toLowerCase()
    );

    if (!breedData) return "Unknown";

    const overweightMale = Number(breedData["Overweight_Male(lbs)"]) || 0;
    const overweightFemale = Number(breedData["Overweight_Female(lbs)"]) || 0;
    const weight = Number(dog.weight) || 0;

    const isOverweight =
      (dog.gender === "male" && weight >= overweightMale) ||
      (dog.gender === "female" && weight >= overweightFemale);

    return isOverweight ? "Overweight" : "Normal";
  };

  return (
    <View style={styles.container}>
      {dogInfo.length > 0 ? (
        <FlatList
          data={dogInfo}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image && <Image source={{ uri: item.image }} style={styles.dogImage} />}
              <Text style={styles.text}>Name: {item.name}</Text>
              <Text style={styles.text}>Breed: {item.breed}</Text>
              <Text style={styles.text}>Weight Status: {getWeightStatus(item)}</Text>
            </View>
          )}
        />
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
  dogImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
});

export default DogInfoPage;
