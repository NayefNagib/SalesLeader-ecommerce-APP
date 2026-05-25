// CartScreen.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '../i18n/config';
import { useCart } from '../context/CartContext'; // ✅ use CartContext
import { auth } from '../firebaseConfig';
import { useState } from 'react';
const { width } = Dimensions.get('window');

type Props = {
  tabOffset: Animated.Value;
};

export default function CartScreen({ tabOffset }: Props) {
  const { cartItems, removeFromCart } = useCart(); // ✅ subscribe to context
  const navigation = useNavigation();
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
const [loading, setLoading] = useState(true);
  const totalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(totalOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!cartItems) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1e293b" />;
  }
 const user = auth.currentUser;
if (!user?.email) {
    return (
      <LinearGradient
        colors={['#e5e7eb', '#ffffff', '#1e293b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.centered}
      >
        <Text style={styles.text}>{i18n.t('Please login to view your cart')}</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() =>
            (navigation as any).navigate('Profile', { screen: 'ProfileHome' })
          }
        >
          <Text style={styles.buttonText}>{i18n.t('Go to Login')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }


  
  return (
    <LinearGradient
      colors={['#f9fafb', '#e5e7eb', '#1e293b']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container1}
    >
      {/* Total top-left */}
      <Animated.View style={[styles.totalWrapper, { opacity: totalOpacity }]}>
        <Text style={styles.totalText}>
          {i18n.t('🛹 Total: $')}
          {total.toFixed(2)}
        </Text>
      </Animated.View>

      <Animated.FlatList
        data={cartItems}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: tabOffset } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <View style={{ flex: 1, marginTop: 8 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <Text style={styles.rating}>⭐ {item.rating}</Text>
            </View>
            {/* Actions row */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => removeFromCart(item)}>
                <Ionicons name="trash" size={22} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: 'Home',
                      params: {
                        screen: 'ProductDetails',
                        params: { product: item },
                      },
                    })
                  )
                }
              >
                <Ionicons name="eye" size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View>
            <Text style={styles.emptyText}>{i18n.t('Your cart is empty 🧊')}</Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container1: {
    flex: 1,
  },
  totalWrapper: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 6,
    zIndex: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 30,
    paddingTop: 100, // space below total
    paddingHorizontal: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    marginHorizontal: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  price: {
    fontSize: 13,
    color: '#334155',
  },
  rating: {
    fontSize: 12,
    color: '#475569',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#334155',
    marginTop: 50,
    fontSize: 18,
    fontWeight: '600',
  },
 
  text: {
    fontSize: 22,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
