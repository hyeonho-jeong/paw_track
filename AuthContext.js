import React, { createContext, useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth is not initialized.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      if (!auth) 
        return;
      await signOut(auth);
      setIsLoggedIn(false);
      setUser(null);
    } 
    catch (error) 
    {
      console.error("Logout failed:", error.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="rgb(0,122,255)" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, loading, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
