import React, { useState, useEffect, useContext } from "react";
import { 
  View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Image, Dimensions, 
  ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { db } from "../../firebase";
import { useNavigation } from "@react-navigation/native"; 
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AuthContext } from "../../AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AddDogPage = () => {
  const navigation = useNavigation(); 
  const { user } = useContext(AuthContext); // ✅ useContext는 함수 내부에서 호출해야 함
  console.log("🔍 현재 로그인된 사용자:", user);
  
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [image, setImage] = useState(null);
  const [breeds, setBreeds] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    try {
      const dogBreeds = require("../../assets/dogBreeds.json");
      if (Array.isArray(dogBreeds) && dogBreeds.length > 0) {
        setBreeds(dogBreeds);
      }
    } catch (error) {
      console.error("Error loading dogBreeds.json:", error);
    }
  }, []);

  const validateFields = () => {
    const errors = {};
  
    console.log("🔥 유효성 검사 시작!");
    console.log("👉 현재 입력된 값:", { name, breed, gender, age, weight });
  
    if (!name.trim()) {
      errors.name = "Name is required";
      console.log("❌ Name is missing");
    }
    if (!breed) {
      errors.breed = "Breed is required";
      console.log("❌ Breed is missing");
    }
    if (!gender) {
      errors.gender = "Gender is required";
      console.log("❌ Gender is missing");
    }
  
    const ageNum = Number(age);
    const weightNum = Number(weight);
  
    if (!age || isNaN(ageNum) || ageNum < 0) {
      errors.age = "Valid age is required";
      console.log("❌ Invalid age:", age);
    }
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      errors.weight = "Valid weight is required";
      console.log("❌ Invalid weight:", weight);
    }
  
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `dog_images/${new Date().toISOString()}`);

      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Image upload failed:", error.message);
      return null;
    }
  };

  const saveDogInfo = async () => {
    if (!user) {
      Alert.alert("Error", "No user is signed in.");
      return;
    }

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      console.log("🔥 Firestore에 저장 전 데이터:", {
        userId: user.uid,
        name,
        breed,
        gender,
        age: Number(age),
        weight: Number(weight),
        image: imageUrl,
        createdAt: new Date(),
      });

      const dogsCollectionRef = collection(db, "users", user.uid, "dogs");
      await addDoc(dogsCollectionRef, {
        userId: user.uid,
        name,
        breed,
        gender,
        age: Number(age),
        weight: Number(weight),
        image: imageUrl,
        createdAt: new Date(),
      });

      console.log("✅ Firestore에 데이터 저장 완료!");

      Alert.alert("Success", "Dog information saved successfully!");
      navigation.navigate("MainTabs"); 
    } catch (error) {
      console.error("Error saving dog info:", error.message);
      Alert.alert("Error", `Failed to save dog information: ${error.message}`);
    }
  };

  const handleSave = async () => {
    console.log("🛑 handleSave() 실행됨");
    if (!validateFields()) {
      console.log("❌ 유효성 검사 실패!");
      return;
    }
    console.log("✅ 유효성 검사 통과, saveDogInfo() 실행 예정");
    await saveDogInfo();
  };
  

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) { // ✅ `result.cancelled` 제거
      setImage(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <Text style={styles.imagePlaceholder}>+</Text>
              )}
            </TouchableOpacity>

            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />

            <TouchableOpacity onPress={() => setShowPicker(!showPicker)} style={styles.input}>
              <Text>{breed || "Select Breed"}</Text>
            </TouchableOpacity>
            {showPicker && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={breed}
                  onValueChange={(value) => {
                    setBreed(value);
                    setShowPicker(false);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Breed" value="" />
                  {breeds.map((breedItem, index) => (
                    <Picker.Item key={index} label={breedItem.Breed} value={breedItem.Breed} />
                  ))}
                </Picker>
              </View>
            )}

            <TextInput style={styles.input} placeholder="Year old" value={age} onChangeText={setAge} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Weight (lbs)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
            <View style={styles.genderContainer}>
  <TouchableOpacity
    style={[styles.genderButton, gender === "male" ? styles.genderSelected : null]}
    onPress={() => setGender("male")}
  >
    <Text style={[styles.genderText, gender === "male" ? styles.genderTextSelected : null]}>
      Male
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.genderButton, gender === "female" ? styles.genderSelected : null]}
    onPress={() => setGender("female")}
  >
    <Text style={[styles.genderText, gender === "female" ? styles.genderTextSelected : null]}>
      Female
    </Text>
  </TouchableOpacity>
</View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  imageContainer: { alignSelf: "center", width: 100, height: 100, borderRadius: 50, backgroundColor: "#ccc", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  image: { width: 100, height: 100, borderRadius: 50 },
  input: { height: 50, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, paddingHorizontal: 10, backgroundColor: "white", justifyContent: "center", marginBottom: 10 },
  genderContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  saveButton: { backgroundColor: "#007AFF", padding: 12, borderRadius: 5, alignItems: "center", marginTop: 20 },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  genderContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginBottom: 10 
  },
  genderButton: { 
    padding: 10, 
    borderRadius: 5, 
    borderWidth: 1, 
    borderColor: "#ccc", 
    width: "40%", 
    alignItems: "center" 
  },
  genderSelected: { 
    backgroundColor: "#007AFF", 
    borderColor: "#007AFF" 
  },
  genderText: { 
    color: "#000" 
  },
  genderTextSelected: { 
    color: "#fff"  // 선택된 버튼의 글씨 색상을 흰색으로 변경
  },
});

export default AddDogPage;
