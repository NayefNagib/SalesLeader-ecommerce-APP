// utils/authCheck.ts
import { auth } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkAutoLogin = async (): Promise<string | null> => {
  const user = auth.currentUser;

  if (user?.email) {
    return user.email;
  }

  const savedEmail = await AsyncStorage.getItem('userEmail');
  return savedEmail;
};
