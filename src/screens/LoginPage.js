import React, { useState, useContext } from 'react';
import { 
  View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity, 
  TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform, ActivityIndicator, ScrollView 
} from 'react-native';
import { AuthContext } from '../../AuthContext';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError(''); // 기존 에러 메시지 초기화

    try {
      console.log("🚀 Attempting to log in with:", email, password);

      // ✅ Firebase 인증을 통한 로그인 처리
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      console.log("✅ Firebase Login successful! User UID:", user.uid);

      // 로그인 성공 후에만 상태 변경
      setIsLoggedIn(true);
      Alert.alert('Login Successful', 'Redirecting to the main page.');
      navigation.replace('MainTabs'); // ✅ 로그인 성공 시 MainTabs로 이동
    } catch (error) {
      console.error('❌ Login Error:', error.code, error.message);

      let errorMessage = 'Login failed. Please check your email and password.';

      // 🔹 Firebase 오류 코드에 따라 사용자 친화적인 메시지 제공
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else {
        errorMessage = error.message;
      }

      setError(errorMessage);
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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              autoCapitalize="none"
              style={styles.input}
            />

            {isLoading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : (
              <Button title="Login" onPress={handleLogin} />
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupButton}>
              <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>

            {/* ✅ MainPage로 가는 버튼 추가 */}
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip Login & Go to Main Page</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginVertical: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  signupButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    color: 'blue',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  skipButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  skipText: {
    color: '#FF4500',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginPage;
