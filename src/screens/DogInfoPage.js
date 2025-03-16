import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const dogBreeds = require("../../assets/dogBreeds.json");

const DogInfoPage = ({ dogInfo }) => {
  if (!dogInfo) {
    return <Text style={styles.text}>No dog information available.</Text>;
  }

  const getWeightStatus = (dog) => {
    if (!dog.breed) 
      return "Unknown";

    const breedData = dogBreeds.find(
      (item) => item.Breed.toLowerCase() === dog.breed.toLowerCase()
    );

    if (!breedData) 
      return "Unknown";

    const overweightMale = Number(breedData["Overweight_Male(lbs)"]) || 0;
    const overweightFemale = Number(breedData["Overweight_Female(lbs)"]) || 0;
    const weight = Number(dog.weight) || 0;

    const isOverweight =
      (dog.gender === "male" && weight >= overweightMale) ||
      (dog.gender === "female" && weight >= overweightFemale);

    return isOverweight ? "Overweight, Check with Doctor" : "Normal";
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.infoContainer}>
          <Text style={styles.text}>Breed: {dogInfo.breed}</Text>
          <Text style={styles.text}>Weight Status: {getWeightStatus(dogInfo)}</Text>
        </View>

        {dogInfo.image && (
          <Image source={{ uri: dogInfo.image }} style={styles.dogImage} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flexDirection: "row", 
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10, 
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgb(221,221,221)",
    shadowColor: "rgb(0,0,0)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingRight: 10,
  },
  dogImage: {
    width: 100,
    height: 100,
    borderRadius: 45,
    marginLeft: 10, 
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgb(51,51,51)",
    marginBottom: 5,
  },
});

export default DogInfoPage;
