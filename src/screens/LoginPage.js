import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../AuthContext';

const LoginPage = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 🔹 실제 인증 없이 로그인 성공 처리
      setTimeout(() => {
        setIsLoggedIn(true);
        setError('');
        Alert.alert('로그인 성공', '메인 페이지로 이동합니다.');
        navigation.replace('MainTabs');
        setIsLoading(false);
      }, 1000); // 🔹 테스트용 딜레이 (1초)
    } catch (error) {
      console.error('Login Error:', error.message);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="로그인" onPress={handleLogin} />
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupButton}>
        <Text style={styles.signupText}>계정이 없으신가요? 회원가입</Text>
        <Button title="Go to Main" onPress={() => navigation.replace("MainTabs")} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default LoginPage;