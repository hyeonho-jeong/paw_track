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
    console.log("✅ Firebase 인증 상태 감지 시작...");

    if (!auth) {
      console.error("🚨 Firebase auth is not initialized.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("🔄 로그인 상태 변경 감지됨:", currentUser);

      if (currentUser) {
        console.log("✅ 로그인된 사용자:", currentUser.uid);
      } else {
        console.log("🔴 로그인된 사용자가 없습니다.");
      }

      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      if (!auth) return;
      await signOut(auth);
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, loading, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
