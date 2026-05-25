import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  Image,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import i18n from '../i18n/config';
const { width, height } = Dimensions.get('window');

type Product = {
  id: string;
  name: string;
  price: number;
  rating: string;
  image: string;
  sold: string;
  colors: string[];
  description: string;
  category: string;
  createdAt?: Timestamp;
  ownerEmail: string;
  globalId: string; 
};

type Props = NativeStackScreenProps<RootStackParamList, 'Search'> & {
  tabOffset: Animated.Value;
};

const bgImages = [
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287046/ecommerce-profile/vzy5fc1ystdezhg1hhzl.jpg',
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287070/ecommerce-profile/yex5pbkdxwpaf4nvf8yh.jpg',
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287077/ecommerce-profile/ogyrbfjaxyguxfooncbf.jpg',
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287084/ecommerce-profile/dgx951by5fupyh2dcvpw.jpg',
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287093/ecommerce-profile/s7gpnx6slqnlhj3ikspa.jpg',
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287098/ecommerce-profile/q5rtiyj3dhyvjezwpxbm.jpg',
];

export default function SearchScreen({ navigation, tabOffset }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [bgUrl, setBgUrl] = useState('');

  
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
    };
  }, []);

  // 🌌 Random background
  useEffect(() => {
    const load = async () => {
      const selected = bgImages[Math.floor(Math.random() * bgImages.length)];
      setBgUrl(selected);
    };

    load();

    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // 🔄 Load all products
  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const items: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setAllProducts(items);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔍 Search logic
  const handleSearch = (text: string) => {
    setQuery(text);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const words = text.toLowerCase().split(' ').filter(Boolean);
    const filtered = allProducts.filter(product =>
      words.every(word =>
        product.name.toLowerCase().includes(word) ||
        product.category.toLowerCase().includes(word)
      )
    );
    setResults(filtered);
  };

  return (
    <ImageBackground source={{ uri: bgUrl }} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        {/* 🔍 Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder={i18n.t('Search on products')}
              placeholderTextColor="#aaa"
              value={query}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        {/* 🧾 Results */}
        <Animated.FlatList
          data={results.slice(0, 5)}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: tabOffset } } }],
            { useNativeDriver: false }
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
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
          ListEmptyComponent={() =>
            query ? <Text style={styles.noResults}>{i18n.t('No matching products')}</Text> : null
          }
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 12, 12, 0.65)',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  searchWrapper: {
    marginTop: 50,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1c1c1c',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 8,
    color: '#fff',
    fontSize: 14,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  card: {
    width: '48%',
    backgroundColor: '#292929',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 4,
    color: '#e6ddc4',
  },
  price: {
    fontSize: 13,
    color: '#c1a36d',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#c1a36d',
  },
  noResults: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 30,
  },
});
