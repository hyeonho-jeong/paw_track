import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider } from "./AuthContext";
import LoginPage from "./src/screens/LoginPage";
import SignUpPage from "./src/screens/SignUpPage"; // ✅ 회원가입 페이지 추가
import AddDogPage from "./src/screens/AddDogPage";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import DogDetailPage from "./src/screens/DogDetailPage";

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs">
        <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignUpPage} options={{ headerShown: true, title: "Sign Up" }} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="AddDogPage" component={AddDogPage} options={{ headerShown: true, title: "Add Dog" }} />
        <Stack.Screen name="DogDetail" component={DogDetailPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() { // ✅ 여기서 `export default function App()`을 한 번만 선언
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
