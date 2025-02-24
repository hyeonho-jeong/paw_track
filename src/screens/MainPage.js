import React, { useState, useEffect, useContext } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView, Image 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../AuthContext";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import HeaderButtons from "../components/HeaderButtons";

const MainPage = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [dogInfo, setDogInfo] = useState([]);

  useEffect(() => {
    if (!user) return;

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

  const handleDeleteDog = async (dogId) => {
    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to delete this dog?",
      [
        { text: "Cancel", style: "cancel" }, // ✅ "취소" → "Cancel"
        {
          text: "Delete", // ✅ "삭제" → "Delete"
          onPress: async () => {
            try {
              const dogRef = doc(db, "users", user.uid, "dogs", dogId);
              await deleteDoc(dogRef);
              console.log(`✅ Dog ${dogId} deleted successfully!`);
            } catch (error) {
              console.error("🚨 Error deleting dog:", error);
              Alert.alert("Error", "An error occurred while deleting the dog.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Dog List</Text> {/* ✅ "강아지 리스트" → "Dog List" */}
        <ScrollView>
        <HeaderButtons navigation={navigation} />
          {dogInfo.map((dog) => (
            <View key={dog.id} style={styles.dogItem}>
              <TouchableOpacity 
                style={styles.dogInfo} 
                onPress={() => navigation.navigate("DogDetail", { dog })}
              >
                <View style={styles.dogInfoContainer}>
                  {dog.image ? (
                    <Image source={{ uri: dog.image }} style={styles.dogImage} />
                  ) : (
                    <Text style={styles.defaultIcon}>🐾</Text>
                  )}
                  <Text style={styles.dogName}>{dog.name}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeleteDog(dog.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text> {/* ✅ "삭제" → "Delete" */}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: { 
    flex: 1, 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    backgroundColor: "#fff",
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center",
  },
  dogItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#f9c2ff",
    borderRadius: 10,
  },
  dogInfo: { flex: 1 },
  dogInfoContainer: { 
    flexDirection: "row", 
    alignItems: "center",
  },
  dogImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 25,
    marginRight: 10, 
  },
  defaultIcon: { 
    fontSize: 30, 
    marginRight: 10, 
  },
  dogName: { 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "bold" 
  },
});

export default MainPage;
