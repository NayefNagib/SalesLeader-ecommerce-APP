import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '../i18n/config';

const { width, height } = Dimensions.get('window');

type Props = {
  tabOffset: Animated.Value;
};

export default function FavoriteScreen({ tabOffset }: Props) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;
  const bgColor = useRef(new Animated.Value(0)).current;

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const FAVORITES_KEY = 'favorites';

  const fetchFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      setFavorites(parsed);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    const updated = favorites.filter((item) => item.id !== itemId);
    setFavorites(updated);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  // Fetch once on mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Re-fetch whenever screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
    }, [])
  );

  // Animated background pulse
  useEffect(() => {
    Animated.loop(
      Animated.timing(bgColor, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  if (!user?.email) {
    return (
      <LinearGradient
        colors={['#e5e5e5', '#ffffff', '#ef4444']}
        style={styles.gradientBackground}
      >
        <View style={styles.centered}>
          <Text style={styles.text}>{i18n.t('Please')}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              (navigation as any).navigate('Profile', { screen: 'ProfileHome' })
            }
          >
            <Text style={styles.buttonText}>{i18n.t('Go to Login')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#ef4444" />
    );

  return (
    <LinearGradient
      colors={['#f3f4f6', '#ffffff', '#ef4444']}
      style={styles.gradientBackground}
    >
      <Svg
        width={width * 1.5}
        height={height * 1.5}
        style={[StyleSheet.absoluteFill, { left: -width * 0.25, top: -height * 0.25 }]}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <Circle
            key={i}
            cx={Math.random() * width * 1.5}
            cy={Math.random() * height * 1.5}
            r={30 + Math.random() * 60}
            fill={['#e5e7eb', '#f87171', '#fef2f2'][i % 3]}
            opacity={0.15 + Math.random() * 0.15}
          />
        ))}
      </Svg>

      <Text style={styles.title}>{i18n.t('❤️ Your Favorites')}</Text>

      <Animated.FlatList
        data={favorites}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: tabOffset } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>${item.price?.toFixed(2)}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleRemove(item.id)}>
                <Ionicons name="heart-dislike" size={20} color="#f87171" />
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
                <Ionicons name="eye" size={20} color="#60a5fa" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{i18n.t('No favorites saved yet')}</Text>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginTop: 30,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 60,
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
    elevation: 3,
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
    marginTop: 8,
  },
  price: {
    fontSize: 13,
    color: '#334155',
    marginVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  text: {
    fontSize: 22,
    color: '#eb1010ff',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#e92626ff',
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
