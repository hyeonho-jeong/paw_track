import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LeftPage from "../screens/LeftPage";
import MainPage from "../screens/MainPage";
import RightPage from "../screens/RightPage";
import { Ionicons } from "@expo/vector-icons"; // ✅ 아이콘 추가

const Tab = createBottomTabNavigator();

// ✅ FloatingButton 컴포넌트 (우측 하단 & 항상 "Right" 탭보다 위에 위치)
const FloatingButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => {
        console.log("Navigating to AddDogPage...");
        navigation.navigate("AddDogPage"); 
      }} 
    >
      <Ionicons name="add" size={30} color="white" />
      <Text style={styles.fabText}>Add Dog</Text>
    </TouchableOpacity>
  );
};

const BottomTabNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { position: "absolute", height: 60 }, // ✅ 탭 바 높이 조정
        }}
      >
        <Tab.Screen name="Left" component={LeftPage} />
        <Tab.Screen name="Main" component={MainPage} />
        <Tab.Screen name="Right" component={RightPage} />
      </Tab.Navigator>

      {/* ✅ Floating Button이 항상 "Right" 탭보다 위에 위치하도록 조정 */}
      <FloatingButton />
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 80, // ✅ 탭 바보다 위에 위치하도록 설정
    right: 20, // ✅ 우측 정렬
    backgroundColor: 'rgb(240,82,34)', // ✅ 버튼 색상 (파란색)
    width: 65,
    height: 65,
    borderRadius: 32.5, // ✅ 동그라미 버튼
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  fabText: {
    color: "white",
    fontSize: 10,
    marginTop: 2,
  },
});

export default BottomTabNavigator;
