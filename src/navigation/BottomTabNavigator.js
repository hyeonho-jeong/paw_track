import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LeftPage from "../screens/LeftPage";
import MainPage from "../screens/MainPage";
import RightPage from "../screens/RightPage";
import { Ionicons } from "@expo/vector-icons"; 

const Tab = createBottomTabNavigator();

const FloatingButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        navigation.navigate("AddDogPage"); 
      }} 
    >
      <Ionicons name="add" size={30} color="white" />
      <Text style={styles.buttonText}>Add Dog</Text>
    </TouchableOpacity>
  );
};

const BottomTabNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions=
        {{
          headerShown: false,
          tabBarStyle: { position: "absolute", height: 60 }, 
          tabBarActiveTintColor: "rgb(240,82,34)", 
          tabBarInactiveTintColor: "rgb(210,206,187)",
        }}
      >
        <Tab.Screen name="History" component={LeftPage} />
        <Tab.Screen name="Main" component={MainPage} />
        <Tab.Screen name="Ranking" component={RightPage} />
      </Tab.Navigator>

      <FloatingButton />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 80, 
    right: 20, 
    backgroundColor: 'rgb(240,82,34)', 
    width: 65,
    height: 65,
    borderRadius: 32.5, 
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgb(0,0,0)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 10,
    marginTop: 2,
  },
});

export default BottomTabNavigator;
