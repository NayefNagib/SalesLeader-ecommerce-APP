import React, { useRef, useEffect, useState,useCallback } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
 
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';

type AnimatedTabBarPropsWithOffset = BottomTabBarProps & {
  tabOffset: Animated.Value;
  profileImageUrl?: string | null;
};

const fallbackUrl = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const AnimatedTabBar = ({
  state,
  descriptors,
  navigation,
  tabOffset,
}: AnimatedTabBarPropsWithOffset) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const user = auth.currentUser;

  const fetchProfileImage = async () => {
    if (user?.email) {
      const userRef = doc(db, 'users', user.email);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return data.profileImageUrl || fallbackUrl;
      }
    }
    return fallbackUrl;
  };

  useEffect(() => {
    const loadProfileImage = async () => {
      const url = await fetchProfileImage();
      setProfileImageUrl(url);
    };

    loadProfileImage();
    
  }, []);
useFocusEffect(
  useCallback(() => {
    const refreshProfileImage = async () => {
      const url = await fetchProfileImage();
      setProfileImageUrl(url); // ✅ actually updates the image
    };

    refreshProfileImage();
  }, [])
);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
    if (newUser?.email) {
      const userRef = doc(db, 'users', newUser.email);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfileImageUrl(data.profileImageUrl || fallbackUrl);
      } else {
        setProfileImageUrl(fallbackUrl);
      }
    } else {
      setProfileImageUrl(fallbackUrl); // if user logged out
    }
  });

  return () => unsubscribe();
}, []);
  // Optional: add listener for navigation state changes

  return (
    <Animated.View
  key={profileImageUrl} // 🔁 re-render when image URL changes
  style={[styles.tabBar, { transform: [{ translateY: tabOffset }] }]}
>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconTranslate = useRef(new Animated.Value(0)).current;
        const iconScale = useRef(new Animated.Value(1)).current;

        const handleIconPress = () => {
          Animated.sequence([
            Animated.parallel([
              Animated.timing(iconTranslate, {
                toValue: -6,
                duration: 120,
                useNativeDriver: true,
              }),
              Animated.timing(iconScale, {
                toValue: 1.3,
                duration: 120,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(iconTranslate, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
              }),
              Animated.timing(iconScale, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
          onPress();
        };

        const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
          Home: 'home',
          Cart: 'cart',
          Grid: 'add',
          Favorites: 'heart',
          Profile: 'person',
        };

        const routeName = route.name;
        const iconName = iconMap[routeName];

        return (
          <TouchableWithoutFeedback key={index} onPress={handleIconPress}>
            <Animated.View
              style={{
                alignItems: 'center',
                transform: [
                  { translateY: iconTranslate },
                   { scale: iconScale },
                ],
              }}
            >
              {routeName === 'Profile' && profileImageUrl ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    marginBottom: -4,
                    borderWidth: isFocused ? 2 : 1,
                    borderColor: isFocused ? '#fff' : '#b3fbffff',
                  }}
                />
              ) : (
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? '#fff' : '#b3ebffff'}
                  style={{ marginBottom: -4 }}
                />
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        );
      })}
    </Animated.View>
  );
};

export default AnimatedTabBar;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 17,
    paddingHorizontal: 17,
    backgroundColor: '#040e4aff',
    position: 'absolute',
    left: 20,
    right: 30,
    bottom: 25,
    borderRadius: 50,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
