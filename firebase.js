import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyB5cq4ptgdb3pSRGsKnvc8CAagfC0rkV0U",
  authDomain: "newpawtrack.firebaseapp.com",
  projectId: "newpawtrack",
  storageBucket: "newpawtrack.appspot.com",
  messagingSenderId: "newpawtrack.appspot.com",
  appId: "1:252157188653:ios:88143472e3d657961b36a4",
};

// ✅ Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// ✅ Firebase 인증 초기화 (AsyncStorage 사용하여 로그인 유지)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
