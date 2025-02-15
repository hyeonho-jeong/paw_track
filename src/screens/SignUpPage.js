import React, { useState } from 'react';
import { 
  View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator, 
  ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignUpPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 6) return '비밀번호는 최소 6자 이상이어야 합니다.';
    if (!/\d/.test(password) || !/[a-zA-Z]/.test(password))
      return '비밀번호는 숫자와 문자를 포함해야 합니다.';
    return '';
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }
  
    if (password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }
  
    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    } else {
      setPasswordError('');
    }
  
    setIsLoading(true);
  
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email.trim());
      if (signInMethods.length > 0) {
        throw new Error('이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.');
      }
  
      // ✅ Firebase Authentication에서 회원가입 진행
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user; // ✅ 회원가입한 사용자 정보 가져오기
  
      console.log("✅ 회원가입 성공! 현재 사용자 UID:", user.uid);
  
      // ✅ Firestore에 사용자 정보 저장 (users/{userId})
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });
  
      console.log("✅ Firestore에 사용자 정보 저장 완료!");
  
      // ✅ 회원가입 후 자동 로그인
      await signInWithEmailAndPassword(auth, email.trim(), password);
  
      Alert.alert('성공', '회원가입이 완료되었습니다.');
      navigation.navigate('MainTabs'); // ✅ 회원가입 후 로그인 없이 메인 화면으로 이동
    } catch (error) {
      console.error('회원가입 오류:', error.message);
      let errorMessage = '회원가입 중 문제가 발생했습니다.';
  
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식을 입력해주세요.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.';
      }
  
      Alert.alert('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>

            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <TextInput
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
            />
            <TextInput
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="password"
              autoCapitalize="none"
              style={styles.input}
            />

            {isLoading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : (
              <Button title="회원가입" onPress={handleSignUp} />
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 }, // ✅ 스크롤 가능하도록 설정
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { marginVertical: 10, padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', fontSize: 16 },
  errorText: { color: 'red', fontSize: 14, marginBottom: 10, textAlign: 'center' },
});

export default SignUpPage;
