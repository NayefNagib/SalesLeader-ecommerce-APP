import React, { useRef, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated } from 'react-native';
import AnimatedTabBar from '../components/AnimatedTabBar';
import ProfileStack from './ProfileStack';
import HomeStack from './RootStack';
import Dummy from '../screens/Dummy';
import FavoritesScreen from '../screens/FavoritesScreen';
import CartScreen from '../screens/CartScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { RootStackParamList } from './navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Tab = createBottomTabNavigator();
type AppNavigatorProps = {
  initialRouteName?: keyof RootStackParamList;
};
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AppNavigator: React.FC<AppNavigatorProps> = ({ initialRouteName }) => {
  const tabOffset = useRef(new Animated.Value(0)).current;
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        try {
          const docRef = doc(firestore, 'users', user.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.profileImage) {
              setProfileImageUrl(data.profileImage);
            } else {
              setProfileImageUrl(null);
            }
          } else {
            setProfileImageUrl(null);
          }
        } catch (error) {
          console.error('Failed to fetch profile image:', error);
        }
      } else {
        setProfileImageUrl(null); // Reset on logout
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      
        
      <Tab.Navigator
      
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <AnimatedTabBar
            {...props}
            tabOffset={tabOffset}
            profileImageUrl={profileImageUrl}
          />
        )}
      >
        <Tab.Screen name="Home">
          {(props) => <HomeStack {...props} tabOffset={tabOffset} />}
        </Tab.Screen>

        <Tab.Screen name="Cart">
          {(props) => <CartScreen {...props} tabOffset={tabOffset} />}
        </Tab.Screen>

        <Tab.Screen name="Grid" component={Dummy} />

        <Tab.Screen name="Favorites">
          {(props) => <FavoritesScreen {...props} tabOffset={tabOffset} />}
        </Tab.Screen>

        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>
      
    </NavigationContainer>
  );
}
export default AppNavigator;