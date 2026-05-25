import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import i18n from '../i18n/config';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
 let Ahmed= 0;
  const bgColor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(bgColor, {
        toValue: 1,
        duration: 10000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const interpolatedBackground = bgColor.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 0.88, 0.95, 1],
    outputRange: ['#db5eddff', '#f8f375ff', '#c32bf1ff', '#3dcad7ff', '#c32bf1ff', '#f8f375ff', '#db5eddff'],
  });
const handleRegister = async () => {
  if (password !== confirmPassword) {
    Alert.alert(
  i18n.t('error'),             // title
  i18n.t('passwords_do_not_match') // message
);

    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.email!), {
      username,
      email: user.email,
      bio: '',
      profileImageUrl: '',
      backgroundImageUrl: '',
    });

    // Save email locally for auto-login
    await AsyncStorage.setItem('userEmail', user.email!);

    // Navigate to Profile screen (reset navigation stack)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Profile' as never }],
    });
  } catch (err: any) {
    Alert.alert(i18n.t('Registration Failed'), err.message);
Ahmed = Ahmed + 1;
  }
  if ( Ahmed === 0) {
   Updates.reloadAsync();} 
};
  return (
    <Animated.View style={[styles.container, { backgroundColor: interpolatedBackground }]}>
      <Text style={styles.title}>{i18n.t('Register')}</Text>

      {/* Username */}
      <View style={styles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={i18n.t('Username')}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Email */}
      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={i18n.t("Email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={i18n.t("Password")}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={i18n.t("Confirm Password")}
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* Register Button */}
      <TouchableOpacity style={styles.signinButton} onPress={handleRegister}>
        <Text style={styles.signinText}>{i18n.t('Register')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f1f4',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
  },
  signinButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  signinText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
