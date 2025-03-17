import React, { useState, useContext } from 'react';
import { 
  View, TextInput, StyleSheet, Alert, Text, TouchableOpacity, 
  TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform, ActivityIndicator, ScrollView 
} from 'react-native';
import { AuthContext } from '../../AuthContext';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const SignupPage = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      setIsLoggedIn(true);
      Alert.alert('Signup Successful', 'Redirecting to the main page.');
      navigation.replace('MainTabs');
    } 
    catch (error) {
      let errorMessage = 'Signup failed. Please check your details.';
      
      if (error.code === 'auth/email-already-in-use') 
        {
          errorMessage = 'This email is already in use.';
        } 
      else if (error.code === 'auth/invalid-email') 
        {
        errorMessage = 'Invalid email format.';
        } 
      else if (error.code === 'auth/weak-password') 
        {
        errorMessage = 'Password should be at least 6 characters.';
        } 
      else 
      {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } 
    finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>

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

            <TouchableOpacity onPress={handleSignup} style={styles.signupButton} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
                          style={styles.mainPageButton} 
                          onPress={() => navigation.navigate("MainTabs")}
                        >
                          <Text style={styles.mainPageButtonText}>Go to MainPage</Text>
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
    backgroundColor: 'white',
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
    backgroundColor: 'rgb(238,117,11)',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainPageButton: { 
    backgroundColor: "white", 
    padding: 12, 
    borderRadius: 10, 
    borderRadius: 25,
    alignItems: "center", 
    marginTop: 10, 
    borderWidth: 2, 
    borderColor: "rgb(238,117,11)",
  },
  mainPageButtonText: { 
    color: "rgb(238,117,11)", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});

export default SignupPage;