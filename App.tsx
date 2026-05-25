import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AppNavigator from "./types/AppNavigator";
import { User } from "firebase/auth";
import { FavoriteProvider } from "./context/FavoriteContext";
import { CartProvider } from "./context/CartContext";
import { TabOffsetContext } from "./context/TabOffsetContext";
import { initI18n } from "./i18n/config";
import { UserProvider } from "./context/UserContext";
import Toast, { ErrorToast } from "react-native-toast-message";
import { auth } from "./firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import SplashLoader from './SplashLoader';

const Tab = createBottomTabNavigator();

export default function App() {
  // ====== App State ======
  const [i18nReady, setI18nReady] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const tabOffset = new Animated.Value(0);

  // ====== Firebase Auth ======
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.email) {
        await AsyncStorage.setItem("userEmail", firebaseUser.email);
        setUser(firebaseUser);
      } else {
        setUser(null);
        await AsyncStorage.removeItem("userEmail");
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  // ====== i18n Load ======
  useEffect(() => {
    const load = async () => {
      await initI18n();
      setI18nReady(true);
    };
    load();
  }, []);

  // ====== Toast Config ======
  const toastConfig = {
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: "#EF4444", backgroundColor: "#FFF1F2" }}
        text1Style={{
          fontSize: 15,
          fontWeight: "600",
          color: "#B91C1C",
        }}
      />
    ),
  };
const initialRoute = "Home";
 return (
    <View style={styles.container}>
      {/* MainApp always mounted, hidden until ready */}
      <View style={{ flex: 1, display: ready && !initializing && i18nReady ? "flex" : "none" }}>
        <UserProvider>
          <FavoriteProvider>
            <CartProvider>
              <TabOffsetContext.Provider value={tabOffset}>
                {/* 👇 Use dynamic route instead of hardcoded "Home" */}
                {initialRoute && (
                  <AppNavigator initialRouteName={initialRoute} />
                )}
              </TabOffsetContext.Provider>
              <Toast config={toastConfig} />
            </CartProvider>
          </FavoriteProvider>
        </UserProvider>
      </View>

      {/* SplashLoader always mounted, hides itself when ready */}
      {!ready || initializing || !i18nReady ? (
        <SplashLoader onReady={() => setReady(true)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
