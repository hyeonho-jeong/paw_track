import React from "react";
import { 
  View, StyleSheet, ScrollView, KeyboardAvoidingView, 
  TouchableWithoutFeedback, Keyboard, Platform 
} from "react-native";
import HeaderButtons from "../components/HeaderButtons";

const RightPage = ({ navigation }) => {
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.outerContainer}>
          {/* ✅ 항상 우측 상단에 위치하도록 HeaderButtons 포함 */}
          <View style={styles.headerContainer}>
            <HeaderButtons navigation={navigation} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              {/* 추가 컨텐츠를 위한 공간 확보 */}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  headerContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10, // ✅ 버튼이 항상 위쪽에 배치되도록 설정
  },

  scrollContainer: { 
    flexGrow: 1, 
    paddingTop: 50, // ✅ 헤더가 가려지지 않도록 여백 추가
  },

  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20, 
  },
});

export default RightPage;
