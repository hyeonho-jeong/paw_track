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
    if (password.length < 6) return 'Password must be at least 6 characters long.';
    if (!/\d/.test(password) || !/[a-zA-Z]/.test(password))
      return 'Password must include both numbers and letters.';
    return '';
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
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
        throw new Error('This email is already in use. Please use a different email.');
      }
  
      // ✅ Register user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user; 

      console.log("✅ Sign-up successful! User UID:", user.uid);
  
      // ✅ Save user info in Firestore (users/{userId})
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });
  
      console.log("✅ User information saved in Firestore!");
  
      // ✅ Auto-login after sign-up
      await signInWithEmailAndPassword(auth, email.trim(), password);
  
      Alert.alert('Success', 'Sign-up completed successfully.');
      navigation.navigate('MainTabs'); // ✅ Navigate to main screen after sign-up
    } catch (error) {
      console.error('Sign-up error:', error.message);
      let errorMessage = 'An error occurred during sign-up.';
  
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters long.';
      }
  
      Alert.alert('Error', errorMessage);
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
            <Text style={styles.title}>Sign Up</Text>

            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

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
            <TextInput
              placeholder="Confirm Password"
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
              <Button title="Sign Up" onPress={handleSignUp} />
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { marginVertical: 10, padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', fontSize: 16 },
  errorText: { color: 'red', fontSize: 14, marginBottom: 10, textAlign: 'center' },
});

export default SignUpPage;
