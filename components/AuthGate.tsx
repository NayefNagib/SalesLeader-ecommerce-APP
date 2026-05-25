// components/AuthGate.tsx
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import ProfileScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import { User } from 'firebase/auth';

export default function AuthGate() {
  const [user, setUser] = useState<User | null>(null);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  if (checking) return null; // or splash/loading screen

  return user ? <ProfileScreen /> : <LoginScreen />;
}
