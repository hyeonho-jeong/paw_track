import React from "react";
import { 
  View, StyleSheet, ScrollView, KeyboardAvoidingView, 
  TouchableWithoutFeedback, Keyboard, Platform 
} from "react-native";
import HeaderButtons from "../components/HeaderButtons";

const LeftPage = ({ navigation }) => {
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* ✅ 헤더 버튼 추가 */}
            <HeaderButtons navigation={navigation} />
            {/* ✅ 추가 컨텐츠를 위한 공간 확보 */}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1 
  }, // ✅ 스크롤 가능하도록 설정

  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20, 
    backgroundColor: "#fff" 
  },
});

export default LeftPage;
