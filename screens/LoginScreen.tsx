import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Image,
  
} from 'react-native';
import { useLayoutEffect } from 'react';
import i18n from '../i18n/config';
//import { useGoogleAuth } from '../utils/googleSignIn';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Store image URLs locally
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as Updates from 'expo-updates';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  //const { promptAsync } = useGoogleAuth();
  //const [rememberMe, setRememberMe] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  // Animated background color
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
useLayoutEffect(() => {
  const parent = navigation.getParent();
  parent?.setOptions({
    tabBarStyle: { display: 'none' },
  });

  return () => {
    parent?.setOptions({
      tabBarStyle: {
        backgroundColor: 'transparent',
        position: 'absolute',
        borderTopWidth: 0,
      },
    });
  };
}, [navigation]);

  const interpolatedBackground = bgColor.interpolate({
    inputRange: [0, 0.25,0.5,0.75,0.85,0.95,1],
    outputRange: ['#db5eddff', '#f8f375ff', '#c32bf1ff', '#3dcad7ff', '#c32bf1ff', '#f8f375ff','#db5eddff'],
  });

  const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userEmail = userCredential.user.email;

    if (!userEmail) {
      throw new Error('Email is missing from user account.');
    }

    // ✅ Query the users collection to find the document with matching email
    const q = query(collection(db, 'users'), where('email', '==', userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const { profileImageUrl, backgroundImageUrl } = userDoc.data();

      // ✅ Store Cloudinary URLs locally
      await AsyncStorage.setItem('profileImageUrl', profileImageUrl || '');
      await AsyncStorage.setItem('backgroundImageUrl', backgroundImageUrl || '');
    }
// ✅ Store email locally
await AsyncStorage.setItem('userEmail', userEmail);

    // ✅ Navigate to Profile
    navigation.reset({
      index: 0,
      routes: [{ name: 'Profile' }],
    });
  } catch (err: any) {
    alert(i18n.t('Login Failed: ') + err.message);
  }
  Updates.reloadAsync(); 
};
  return (
    <Animated.View style={[styles.container, { backgroundColor: interpolatedBackground }]}>
      
      <Text style={styles.title}>{i18n.t('Sign in')}</Text>

      {/* Email Input */}
      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={i18n.t('Enter your email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
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

      {/* Remember Me + Forgot Password */}
      <View style={styles.optionsRow}>
       <Text style={styles.registerLink}>{i18n.t("Don't have an account ?")} <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={styles.registerLink1}>Sign up</Text></TouchableOpacity></Text>
      
       {/*} <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>*/}
      </View>

      {/* Sign in Button */}
      <TouchableOpacity style={styles.signinButton} onPress={handleLogin}>
        <Text style={styles.signinText}>{i18n.t('Sign in')}</Text>
      </TouchableOpacity>

      {/* Social Logins */}
      <View style={styles.dividerRow}>
        <View style={styles.line} />
         <View style={styles.line} />
        <View style={styles.line} />
      </View>
{/*<TouchableOpacity style={styles.socialButton}>
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' }} style={styles.socialIcon} />
        </TouchableOpacity>*/}
      {/*<View style={styles.socialRow}>
        
        <TouchableOpacity style={styles.socialButton} onPress={() => promptAsync()}>
        <Image
          source={{
            uri: 'https://static.vecteezy.com/system/resources/previews/016/716/465/non_2x/gmail-icon-free-png.png',
          }}
          style={styles.socialIcon}
        />
      </TouchableOpacity>
       
      </View>*/}
{/*} <TouchableOpacity style={styles.socialButton}>
          <Image source={{ uri: '' }} style={styles.socialIcon} />
        </TouchableOpacity>*/}
      {/* Register link */}
      
        
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    alignItems: 'center',
  },
 
  rememberText: {
    marginLeft: 4,
    color: '#444',
  },
  forgotText: {
    color: '#1e40af',
  },
  signinButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  signinText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 8,
    color: '#555',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    alignItems: 'center',
  },
  socialIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  registerLink: {
    textAlign: 'center',
    color: '#555',
    fontWeight: 'bold',
  },
  registerLink1: {
    textAlign: 'center',
    color: '#555',
    fontWeight: 'bold',
    top:4,
  },
});
