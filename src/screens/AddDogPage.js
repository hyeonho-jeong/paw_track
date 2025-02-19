import React, { useState, useContext, useEffect } from "react";
import { 
  View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Image, ScrollView, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { db } from "../../firebase";
import { useNavigation } from "@react-navigation/native"; 
import { collection, addDoc } from "firebase/firestore";
import { AuthContext } from "../../AuthContext";

const AddDogPage = () => {
  const navigation = useNavigation(); 
  const { user } = useContext(AuthContext);
  
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [image, setImage] = useState(null);
  const [breeds, setBreeds] = useState([]);
  const [showPicker, setShowPicker] = useState(false); // ✅ 품종 선택 토글 상태

  // ✅ JSON 파일에서 품종 불러오기
  useEffect(() => {
    try {
      const dogBreeds = require("../../assets/dogBreeds.json");
      if (Array.isArray(dogBreeds) && dogBreeds.length > 0) {
        setBreeds(dogBreeds);
      }
    } catch (error) {
      console.error("🚨 Error loading dogBreeds.json:", error);
    }
  }, []);

  // ✅ 1MB 이하로 이미지 압축하는 함수
  const compressImage = async (uri) => {
    try {
      let quality = 0.8;
      let fileSize = await getFileSize(uri);

      while (fileSize > 1000000 && quality > 0.1) {
        const compressedImage = await ImageManipulator.manipulateAsync(
          uri, [{ resize: { width: 800, height: 800 } }],
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );
        fileSize = await getFileSize(compressedImage.uri);
        uri = compressedImage.uri;
        quality -= 0.1;
      }
      return uri;
    } catch (error) {
      console.error("🚨 이미지 압축 실패:", error);
      return null;
    }
  };

  // ✅ 파일 크기 확인 함수
  const getFileSize = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  };

  // ✅ Base64 변환
  const convertToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  // ✅ Firestore에 강아지 정보 + 이미지 저장
  const saveDogInfo = async () => {
    if (!user) {
      Alert.alert("Error", "No user is signed in.");
      return;
    }

    if (!name || !breed || !gender || !age || !weight) {
      Alert.alert("Error", "모든 필수 정보를 입력하세요.");
      return;
    }

    try {
      let base64Image = null;
      if (image) {
        const compressedUri = await compressImage(image);
        base64Image = await convertToBase64(compressedUri);
      }

      await addDoc(collection(db, "users", user.uid, "dogs"), {
        userId: user.uid,
        name,
        breed,
        gender, 
        age: Number(age),
        weight: Number(weight),
        image: base64Image, // ✅ Firestore에 Base64로 저장
        createdAt: new Date(),
      });

      Alert.alert("Success", "Dog information saved successfully!");
      navigation.navigate("MainTabs");
    } catch (error) {
      console.error("🚨 Firestore 저장 오류:", error);
      Alert.alert("Error", `Failed to save dog information: ${error.message}`);
    }
  };

  // ✅ 사용자가 이미지 선택 시
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            {/* ✅ 이미지 선택 */}
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {image ? <Image source={{ uri: image }} style={styles.image} /> : <Text style={styles.imagePlaceholder}>+</Text>}
            </TouchableOpacity>

            {/* ✅ 입력 필드 */}
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />

            {/* ✅ 품종 선택 */}
            <TouchableOpacity onPress={() => setShowPicker(!showPicker)} style={styles.input}>
              <Text>{breed || "Select Breed"}</Text>
            </TouchableOpacity>
            {showPicker && (
              <View style={styles.pickerContainer}>
                <Picker selectedValue={breed} onValueChange={(value) => { setBreed(value); setShowPicker(false); }} style={styles.picker}>
                  <Picker.Item label="Select Breed" value="" />
                  {breeds.map((breedItem, index) => (
                    <Picker.Item key={index} label={breedItem.Breed} value={breedItem.Breed} />
                  ))}
                </Picker>
              </View>
            )}

            <TextInput style={styles.input} placeholder="Year old" value={age} onChangeText={setAge} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Weight (lbs)" value={weight} onChangeText={setWeight} keyboardType="numeric" />

            {/* ✅ 성별 선택 버튼 */}
            <View style={styles.genderContainer}>
              <TouchableOpacity style={[styles.genderButton, gender === "male" ? styles.genderSelected : null]} onPress={() => setGender("male")}>
                <Text style={[styles.genderText, gender === "male" ? styles.genderTextSelected : null]}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.genderButton, gender === "female" ? styles.genderSelected : null]} onPress={() => setGender("female")}>
                <Text style={[styles.genderText, gender === "female" ? styles.genderTextSelected : null]}>Female</Text>
              </TouchableOpacity>
            </View>

            {/* ✅ 저장 버튼 */}
            <TouchableOpacity style={styles.saveButton} onPress={saveDogInfo}>
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
