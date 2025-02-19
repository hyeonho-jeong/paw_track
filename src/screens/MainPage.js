import React, { useState, useEffect, useContext } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView, Image 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../AuthContext";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";

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
      "삭제 확인",
      "정말 이 강아지를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          onPress: async () => {
            try {
              const dogRef = doc(db, "users", user.uid, "dogs", dogId);
              await deleteDoc(dogRef);
              console.log(`✅ 강아지 ${dogId} 삭제 완료!`);
            } catch (error) {
              console.error("🚨 강아지 삭제 오류:", error);
              Alert.alert("Error", "강아지를 삭제하는 중 오류가 발생했습니다.");
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
        <Text style={styles.title}>🐶 강아지 리스트</Text>
        <ScrollView>
          {dogInfo.map((dog) => (
            <View key={dog.id} style={styles.dogItem}>
              {/* ✅ 강아지 정보 터치 시 상세 페이지로 이동 */}
              <TouchableOpacity 
                style={styles.dogInfo} 
                onPress={() => navigation.navigate("DogDetail", { dog })}
              >
                <View style={styles.dogInfoContainer}>
                  {/* ✅ 이미지 표시: 없으면 기본 🐾 아이콘 */}
                  {dog.image ? (
                    <Image source={{ uri: dog.image }} style={styles.dogImage} />
                  ) : (
                    <Text style={styles.defaultIcon}>🐾</Text>
                  )}
                  <Text style={styles.dogName}>{dog.name}</Text>
                </View>
              </TouchableOpacity>

              {/* ✅ 삭제 버튼 */}
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeleteDog(dog.id)}
              >
                <Text style={styles.deleteButtonText}>삭제</Text>
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
    paddingTop: 50, // ✅ 상태바 높이만큼 여백 추가
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
    borderRadius: 25, // ✅ 둥근 이미지 적용
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
