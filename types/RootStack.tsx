// navigation/RootStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProductDetails from '../screens/ProductDetails';
import SearchScreen from '../screens/SearchScreen';
import { RootStackParamList } from '../types/navigation';
import { Animated } from 'react-native';
import PopularProductsScreen from '../screens/PopularProductsScreen';
import NotificationScreen from '../screens/notifications';
import ReadOnlyProfileScreen from '../screens/ReadOnlyProfileScreen';
import BuyerLocationScreen from '../screens/BuyerLocationScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import LanguageSelectionScreen from "../screens/LanguageSelectionScreen";
type HomeStackProps = {
  tabOffset: Animated.Value;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function HomeStack({ tabOffset }: HomeStackProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home">
        {(props) => <HomeScreen {...props} tabOffset={tabOffset} />}
      </Stack.Screen>

      <Stack.Screen name="ProductDetails">
        {(props) => <ProductDetails {...props} />}
      </Stack.Screen>

      <Stack.Screen name="Search"  options={{
    animation: 'none', // makes it instant
  }}>
        {(props) => <SearchScreen {...props} tabOffset={tabOffset} />}
      </Stack.Screen>
      <Stack.Screen
    name="PopularProducts"
    component={PopularProductsScreen}
    options={{
    animation: 'none', // makes it instant
  }}
  />
<Stack.Screen name="BuyerLocation" component={BuyerLocationScreen} />
<Stack.Screen name="ReadOnlyProfile" component={ReadOnlyProfileScreen} />
<Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
<Stack.Screen name="Notification" component={NotificationScreen} />
<Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
 <Stack.Screen
    name="LanguageSelection"
    component={LanguageSelectionScreen}
    options={{ headerShown: false }}
  />
    </Stack.Navigator>

    
  );
}
