// navigation/ProfileStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthGate from '../components/AuthGate';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import EditProfileScreen from '../screens/EditProfile';
import SocialMediaScreen from '../screens/SocialMediaScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import MyStoreScreen from '../screens/MyStoreScreen';
import { ProfileStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
       <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="AuthGate" component={AuthGate} />
       <Stack.Screen name="EditProfile" component={EditProfileScreen} />
       <Stack.Screen name="SocialMedia" component={SocialMediaScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MyStore" component={MyStoreScreen} />
       <Stack.Screen name="Login" component={LoginScreen} />
       <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
