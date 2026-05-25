// SplashLoader.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';

SplashScreen.preventAutoHideAsync(); // keep splash visible

interface SplashLoaderProps {
  onReady: () => void;
}

export default function SplashLoader({ onReady }: SplashLoaderProps) {
  useEffect(() => {
    async function prepare() {
      try {
        // Preload fonts/images if needed
        // Example: await Font.loadAsync({ ... });
      } finally {
        onReady(); // notify App that JS is ready
        await SplashScreen.hideAsync(); // hide native splash
      }
    }
    prepare();
  }, []);

  return (
    <LinearGradient colors={['#001f3f', '#ffffff']} style={styles.container}>
      {/* Optional logo in the center */}
      <Image
        source={require('./assets/spla.png')} // replace with your logo
        style={styles.logo}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
});
