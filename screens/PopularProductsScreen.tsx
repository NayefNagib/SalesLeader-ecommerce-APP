import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import i18n from '../i18n/config';
const { width, height } = Dimensions.get('window');

type Product = {
 id: string;
       name: string;
       price: number;
       rating: string ;
       image: any;
       sold: string;
       colors: string[];
       description: string;
       createdAt?: Timestamp;
        ownerEmail: string; // ADD THIS — used to notify seller
  globalId: string; // ADD THIS — needed for cart reference
};

type Props = NativeStackScreenProps<RootStackParamList, 'PopularProducts'>;

export default function PopularProductsScreen({ navigation, route }: Props) {
  const { tabOffset } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill}>
        {Array.from({ length: 25 }).map((_, i) => (
          <Circle
            key={i}
            cx={Math.random() * width}
            cy={Math.random() * height}
            r={40 + Math.random() * 80}
            fill={['#a5d8ff', '#74c0fc', '#cfe2ff'][i % 3]}
            opacity={0.35 + Math.random() * 0.25}
          />
        ))}
      </Svg>

      <Text style={styles.title}>{i18n.t('Popular Products')}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#555" style={{ marginTop: 100 }} />
      ) : (
        <Animated.FlatList
          data={products}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: tabOffset } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('ProductDetails', { product: item })
              }
            >
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="gold" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a1f44',
    position: 'absolute',
    top: 25,
    left: 16,
    zIndex: 10,
  },
  listContent: {
    paddingTop: 80,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
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
    fontWeight: '600',
    marginVertical: 4,
    color: '#111827',
  },
  price: {
    fontSize: 13,
    color: '#1f2937',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
  },
});
