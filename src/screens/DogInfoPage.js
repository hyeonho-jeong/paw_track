import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

// ✅ JSON 파일에서 강아지 품종 정보 불러오기
const dogBreeds = require("../../assets/dogBreeds.json");

const DogInfoPage = ({ dogInfo }) => {
  if (!dogInfo) {
    return <Text style={styles.text}>강아지 정보가 없습니다.</Text>;
  }

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
      <View style={styles.card}>
        {dogInfo.image && <Image source={{ uri: dogInfo.image }} style={styles.dogImage} />}
        <Text style={styles.text}>Name: {dogInfo.name}</Text>
        <Text style={styles.text}>Breed: {dogInfo.breed}</Text>
        <Text style={styles.text}>Weight Status: {getWeightStatus(dogInfo)}</Text>
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
