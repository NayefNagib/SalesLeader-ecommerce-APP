import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import i18n from '../i18n/config';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'ReadOnlyProfile'>;

type Product = {
  id: string;
  name: string;
  price: number;
  rating: string;
  image: any;
  sold: string;
  colors: string[];
  description: string;
  createdAt?: Timestamp;
  ownerEmail: string;
  globalId: string;
};

type FontAwesomeIconName =
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'whatsapp'
  | 'link';

const getIconName = (platform: string): FontAwesomeIconName => {
  switch (platform) {
    case 'instagram': return 'instagram';
    case 'twitter': return 'twitter';
    case 'facebook': return 'facebook';
    case 'whatsapp': return 'whatsapp';
    default: return 'link';
  }
};

export default function ReadOnlyProfileScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!email) {
        setError(i18n.t('No user email provided.'));
        return;
      }
      try {
        const userRef = doc(db, 'users', email);
        const snap = await getDoc(userRef);
        if (snap.exists()) setProfile(snap.data());
        else setError('User profile not found.');
      } catch (err) {
        setError(i18n.t('Failed to fetch user profile.'));
      }
    };

    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('ownerEmail', '==', email));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ ...(doc.data() as Product), id: doc.id }));
        setProducts(fetched);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchProducts();
  }, [email]);

  const openLink = async (url: string) => {
    if (!url) return;
    const prefixed = url.startsWith('http') ? url : `https://${url}`;
    const supported = await Linking.canOpenURL(prefixed);
    if (supported) Linking.openURL(prefixed);
    else Alert.alert(i18n.t('Error'), `Cannot open link: ${prefixed}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Image
        source={{ uri: profile?.backgroundImageUrl?.trim() || 'https://cdn.pixabay.com/photo/2022/01/22/13/31/background-6957584_1280.png' }}
        style={styles.backgroundImage}
      />
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: profile?.profileImageUrl?.trim() || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
          style={styles.profileImage}
        />
      </View>
      <Text style={styles.name}>{profile?.username?.trim() || email?.split('@')[0] || 'Unnamed User'}</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.bioText}>{error ? error : profile?.bio || 'No bio available'}</Text>

      {/* Social Media Section */}
      <View style={styles.socialContainer}>
        <Text style={styles.sectionTitle}>{i18n.t('🔗 Social Media')}</Text>
        {(['instagram', 'twitter', 'facebook', 'whatsapp'] as const).map((platform) => {
          const value = profile?.[platform]?.trim();
          if (!value) return null; // only show if exists
          return (
            <TouchableOpacity
              key={platform}
              style={styles.socialCard}
              onPress={() => openLink(value)}
            >
              <View style={styles.iconTextRow}>
                <FontAwesome name={getIconName(platform)} size={20} style={styles.icon} />
                <Text style={styles.socialText}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}: {value}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderProducts = () => {
    if (loading) {
      return (
        <SkeletonPlaceholder borderRadius={12}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 20 }}>
            {Array(6).fill(0).map((_, index) => (
              <View key={index} style={{ width: '48%', height: 180, marginBottom: 16 }} />
            ))}
          </View>
        </SkeletonPlaceholder>
      );
    }

    if (products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#fff" />
          <Text style={styles.emptyText}>{i18n.t('No products available')}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={products}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
          >
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
              <Text style={styles.productRating}>⭐ {item.rating}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={[]}
        ListHeaderComponent={renderHeader}
        renderItem={null}
        ListFooterComponent={
          <LinearGradient
            colors={['#3e2723', '#4e342e', '#6d4c41']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {renderProducts()}
          </LinearGradient>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: '#efcda5ff',
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: 160,
  },
  profileContainer: {
    marginTop: -40,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: { marginTop: 10, fontWeight: 'bold', fontSize: 18 },
  email: { color: '#777', fontSize: 14 },
  bioText: { color: '#555', fontStyle: 'italic', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
  socialContainer: { marginTop: 30, width: '100%', paddingHorizontal: 20 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  socialCard: { backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12, elevation: 3 },
  iconTextRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 10, color: '#000' },
  socialText: { fontSize: 16, color: '#333' },

  gradientBackground: { flex: 1, paddingTop: 20 ,borderTopLeftRadius: 30,  // curve left
    borderTopRightRadius: 30, // curve right
    overflow: 'hidden',  },
  productCard: { width: '48%', backgroundColor: '#f5f0e6', borderRadius: 16, padding: 10, marginBottom: 16 },
  productImage: { width: '100%', height: 120, borderRadius: 10 },
  productName: { fontWeight: 'bold', fontSize: 14, color: '#896a45ff', textAlign: 'center', marginTop: 5 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  productPrice: { color: '#896a45ff', fontSize: 13 },
  productRating: { color: '#896a45ff', fontSize: 13 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: '#fff', marginTop: 10, fontSize: 16 },
});
