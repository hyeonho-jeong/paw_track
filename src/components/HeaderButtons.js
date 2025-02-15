import React, { useContext } from "react";
import { View, Button, StyleSheet } from "react-native";
import { AuthContext } from "../../AuthContext"; // ✅ AuthContext 가져오기

const HeaderButtons = ({ navigation }) => {
  const { isLoggedIn, handleLogout } = useContext(AuthContext); // ✅ 전역 로그인 상태 가져오기

  const handleLoginPress = () => {
    if (isLoggedIn) {
      handleLogout(); // ✅ 로그아웃 시 AuthContext에서 상태 업데이트
      navigation.reset({ index: 0, routes: [{ name: "Login" }] }); // ✅ 로그인 페이지로 이동
    } else {
      navigation.navigate("Login"); // ✅ 로그인 페이지로 이동
    }
  };

  return (
    <View style={styles.headerButtons}>
      <Button title={isLoggedIn ? "Logout" : "Login"} onPress={handleLoginPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 10,
  },
});

export default HeaderButtons;
