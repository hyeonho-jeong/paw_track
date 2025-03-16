import React, { useContext } from "react";
import { View, Button, StyleSheet } from "react-native";
import { AuthContext } from "../../AuthContext"; 

const HeaderButtons = ({ navigation }) => {
  const { isLoggedIn, handleLogout } = useContext(AuthContext);

  const handleLoginPress = () => {
    if (isLoggedIn) {
      handleLogout(); 
      navigation.reset({ index: 0, routes: [{ name: "Login" }] }); 
    } 
    else 
    {
      navigation.navigate("Login"); 
    }
  };

  return (
    <View style={styles.headerButtons}>
      <Button 
        title={isLoggedIn ? "Sign out" : "Sign in"} 
        onPress={handleLoginPress} 
        color="rgb(238,117,11)" 
      />
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
