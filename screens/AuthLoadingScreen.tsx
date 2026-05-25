import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types/navigation';

export default function AuthLoadingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        navigation.reset({ index: 0, routes: [{ name: 'Profile' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0f172a" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
