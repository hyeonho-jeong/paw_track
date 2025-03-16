import React, { useState, useContext } from 'react';
import { 
  View, TextInput, StyleSheet, Alert, Text, TouchableOpacity, 
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
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      setIsLoggedIn(true);
      Alert.alert('Login Successful', 'Redirecting to the main page.');
      navigation.replace('MainTabs');
      } 
    catch (error) {
      let errorMessage = 'Login failed. Please check your email and password.';
      
      if (error.code === 'auth/user-not-found') 
        {
        errorMessage = 'No account found with this email.';
        } 
      else if (error.code === 'auth/wrong-password') 
        {
        errorMessage = 'Incorrect password. Please try again.';
        }  
      else if (error.code === 'auth/invalid-email') 
        {
        errorMessage = 'Invalid email format.';
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
            <Text style={styles.title}>Sign in</Text>

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

            <TouchableOpacity onPress={handleLogin} style={styles.loginButton} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign in</Text>
              )}
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupButton}>
              <Text style={styles.signupButtonText}>  Sign Up  </Text>
            </TouchableOpacity>


              <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>MainPage</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 
  },
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

  loginButton: {
    backgroundColor: 'rgb(238,117,11)',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', 
    marginTop: 20,
  },

  signupButton: {
    backgroundColor: 'white',   
    borderColor: 'rgb(238,117,11)',  
    borderWidth: 2,   
    paddingVertical: 12,
    paddingHorizontal: 40, 
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,              
    marginHorizontal: 5,   
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  signupButtonText: {
    color: 'rgb(238,117,11)', 
    fontSize: 16,
    fontWeight: 'bold',
  },

  skipButton: {
    backgroundColor: 'white',  
    borderWidth: 2,           
    borderColor: 'rgb(238,117,11)',  
    paddingVertical: 12,
    paddingHorizontal: 40, 
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,              
    marginHorizontal: 5,   
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  skipButtonText: {
    color: 'rgb(238,117,11)', 
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default LoginPage;