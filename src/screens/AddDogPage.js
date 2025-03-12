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
  const [showPicker, setShowPicker] = useState(false); 


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
        image: base64Image, 
        createdAt: new Date(),
      });


    } catch (error) {
      console.error("🚨 Firestore 저장 오류:", error);
      Alert.alert("Error", `Failed to save dog information: ${error.message}`);
    }
  };


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
    <KeyboardAvoidingView style={styles.outerContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Text style={styles.pageTitle}>Add Dog</Text>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity style={styles.mainPageButton} onPress={() => navigation.navigate("MainTabs")}>
              <Text style={styles.mainPageButtonText}>Go to MainPage</Text>
            </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  outerContainer: { 
    flex: 1, 
    backgroundColor: "rgb(238,117,11)", 
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  scrollContainer: { 
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  container: { 
    width: "95%",
    maxWidth: 450,
    backgroundColor: "white", 
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgb(238,117,11)", 
  },
  imageContainer: { 
    alignSelf: "center", 
    width: 150, 
    height: 150, 
    borderRadius: 100, 
    backgroundColor: "rgb(210,206,187)", 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 20 
  },
  image: { 
    width: 150, 
    height: 150, 
    borderRadius: 50,
    marginTop: 30,
    marginBottom: 30,
  },
  input: { 
    height: 50, 
    borderWidth: 1, 
    borderColor: "rgb(238,117,11)", 
    borderRadius: 5, 
    paddingHorizontal: 10, 
    backgroundColor: "white", 
    justifyContent: "center", 
    marginTop: 10,
    borderRadius: 50,
    marginBottom: 10 
  },
  genderContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginBottom: 10 
  },
  saveButton: { 
    backgroundColor: "rgb(238,117,11)", 
    padding: 12, 
    borderRadius: 25, 
    alignItems: "center", 
    marginTop: 20 
  },
  saveButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  genderButton: { 
    padding: 10, 
    borderRadius: 5, 
    borderWidth: 1, 
    borderRadius: 25,
    borderColor: "rgb(238,117,11)", 
    width: "40%", 
    alignItems: "center" 
  },
  mainPageButton: { 
    backgroundColor: "white", // ✅ 버튼 배경 흰색
    padding: 12, 
    borderRadius: 25, 
    alignItems: "center", 
    marginTop: 10, // ✅ "Save" 버튼과 간격 조절
    borderWidth: 2, // ✅ 테두리 추가
    borderColor: "rgb(238,117,11)", // ✅ 주황색 테두리
  },
  mainPageButtonText: { 
    color: "rgb(238,117,11)", // ✅ 텍스트 색상 주황색
    fontSize: 16, 
    fontWeight: "bold" 
  },
  genderSelected: { 
    backgroundColor: "rgb(238,117,11)", 
    borderColor: "rgb(238,117,11)" 
  },
  genderText: { 
    color: "#rgb(238,117,11)" 
  },
  genderTextSelected: { 
    color: "#fff" 
  },
  pageTitle: {
    fontSize: 28, 
    fontWeight: "bold", 
    color: "white", 
    textAlign: "center", 
    marginTop: 20, 
    marginBottom:5
  },
  
});

export default AddDogPage;
