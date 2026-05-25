import React, { useState, useEffect ,useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutAnimation,
  Platform,
  UIManager,
  
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { ImageBackground } from 'react-native';
import { Timestamp, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { RootStackParamList } from '../types/navigation';
import { useRoute } from '@react-navigation/native';
import { ToastAndroid  } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // or any icon library
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { getFirestore,  where, onSnapshot } from "firebase/firestore";
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import i18n from '../i18n/config';
import { onAuthStateChanged } from "firebase/auth";
const { width } = Dimensions.get('window');


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'> & {
  tabOffset: Animated.Value;
};

type Product = {
  id: string;
  name: string;
  price: number;
  rating: string;
  image: string;
  sold: string;
  colors: string[];
  description: string;  
  category?: string;
  createdAt?: Timestamp;
   ownerEmail: string; // ADD THIS — used to notify seller
  globalId: string; // ADD THIS — needed for cart reference
};


export default function HomeScreen({ tabOffset }: Props) {
  const navigation = useNavigation<Navigation>();
  const [isAuthenticated, setIsAuthenticated] = useState(!!auth.currentUser?.email);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [username, setUsername] = useState<string>('Visitor');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
const route = useRoute();
const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
const user = auth.currentUser;
const scrollHintOpacity = useRef(new Animated.Value(1)).current;
const [showScrollHint, setShowScrollHint] = useState(true);
const scrollRef = useRef<ScrollView>(null);
const [refreshing, setRefreshing] = useState(false);
const isHidden = useRef(false);
const tabBarHeight = useBottomTabBarHeight();
const lastScrollY = useRef(0);

const userEmail = auth.currentUser?.email;
const [unreadCount, setUnreadCount] = useState(0);
useEffect(() => {
  
  const timeout = setTimeout(() => {
    Animated.timing(scrollHintOpacity, {
      toValue: 0,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => setShowScrollHint(false));
  }, 3000); 

  return () => clearTimeout(timeout);
}, []);
useEffect(() => {
    // Animate scroll slightly to the right then back
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: 30, animated: true });

      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: 0, animated: true });
      }, 2000); // Wait 1s before scrolling//////////////////////////////////// back
    }, 1000); // Delay before scroll starts

    return () => clearTimeout(timer);
  }, []);
useFocusEffect(
  React.useCallback(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        const user = auth.currentUser;
        const isLoggedIn = !!user?.email;
        setIsAuthenticated(isLoggedIn);

        // 🛒 Fetch products
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const items: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setAllProducts(items);
        setFilteredProducts(items);

        // 🧑‍ Fetch user info if logged in
        if (isLoggedIn) {
          const userRef = doc(db, 'users', user.email!);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setUsername(data.username || i18n.t('Visitor'));
            setProfileImageUrl(data.profileImageUrl || null);
          }
        } else {
          setUsername(i18n.t('Visitor'));
          setProfileImageUrl(null); 
        }

      } catch (error) {
        console.error('❌ Error fetching data on focus:', error);
      }
    };

    fetchData();
  }, [])
);

useEffect(() => {
  const id = (route.params as { navigateToProductId?: string })?.navigateToProductId;

  if (id) {
    // search for product with that ID
    const product = allProducts.find(p => p.id === id); // <- replace with your actual product list

    if (product) {
      nav.navigate('ProductDetails', { product });
    } else {
      ToastAndroid.show('Product not found', ToastAndroid.SHORT);
    }
  }
}, [route]);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!auth.currentUser?.email) return;
      const userRef = doc(db, 'users', auth.currentUser.email);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUsername(data.username || i18n.t('Visitor'));
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    const fetchProfileImage = async () => {
      const user = auth.currentUser;
      if (!user?.email) return;
      try {
        const userDocRef = doc(db, 'users', user.email);
        const snapshot = await getDoc(userDocRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProfileImageUrl(data.profileImageUrl || null);
        }
      } catch (error) {
        console.log('Error fetching profile image:', error);
      }
    };
    fetchProfileImage();
  }, []);
  const [loading, setLoading] = useState(true);



const db = getFirestore();

useEffect(() => {
  if (!userEmail) return;

  const q = query(
    collection(db, "users", userEmail, "notifications"),
    where("read", "==", false)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    setUnreadCount(snapshot.size);
  });

  return () => unsubscribe();
}, [userEmail]);
  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setAllProducts(items);
      setFilteredProducts(items);
    };
    fetchProducts();
  }, []);
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user?.email) {
      try {
        const userRef = doc(db, "users", user.email);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setUsername(data.username || i18n.t("Visitor"));
          setProfileImageUrl(data.profileImageUrl || null);
        }
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
      }
    } else {
      setUsername(i18n.t("Visitor"));
      setProfileImageUrl(null);
    }
  });

  return () => unsubscribe();
}, []);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > scrollOffset ? 1 : -1;
    setScrollOffset(currentOffset);
const currentY = event.nativeEvent.contentOffset.y;
    const deltaY = currentY - lastScrollY.current;
 // Only apply logic when scroll amount is noticeable
    if (Math.abs(deltaY) < 5) return;

    Animated.timing(tabOffset, {
      toValue: direction > 0 ? 100 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };
useEffect(() => {
  const loadProducts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const products: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setFilteredProducts(products);
      setAllProducts(products);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  loadProducts();
}, []);
  const categories = [i18n.t('All'), i18n.t('Shoeses'), i18n.t('t-shirts'), i18n.t('dresses'), i18n.t('pants'), i18n.t('shirt')];

  return (
    
     <SafeAreaView style={styles.container}>
    {/* 🔮 Animated SVG-like Background */}
    <Animated.View
      style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: 250,
        backgroundColor: '#b58ae4',
        top: -250,
        left: -100,
        opacity: 0.4,
        zIndex: -1,
      }}
      
    />
    <Animated.View
    style={{
      position: 'absolute',
      width: 500,
      height: 500,
      borderRadius: 250,
      backgroundColor: '#b58ae4',
      top: -250,
      left: -100,
      opacity: 0.4,
      zIndex: -1,
    }}
  />

  <Animated.View
    style={{
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: '#d8b4fe',
      top: 100,
      right: -80,
      opacity: 0.25,
      zIndex: -1,
    }}
  />

  <Animated.View
    style={{
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: '#a78bfa',
      bottom: -80,
      left: -60,
      opacity: 0.3,
      zIndex: -1,
    }}
  />

  <Animated.View
    style={{
      position: 'absolute',
      width: 350,
      height: 350,
      borderRadius: 175,
      backgroundColor: '#c084fc',
      bottom: -150,
      right: -100,
      opacity: 0.2,
      zIndex: -1,
    }}/>
      <ScrollView showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity
  onPress={() => {
    if (user) {
      navigation.getParent()?.navigate('Profile');
 // if logged in
    } else {
      navigation.getParent()?.navigate('Profile');
 // if not logged in
    }
  }}
>
  <Image
    source={{
      uri: profileImageUrl?.trim()
        ? profileImageUrl
        : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    }}
    style={styles.avatar}
  />
</TouchableOpacity>

            <Text style={styles.welcomeText}>
              {i18n.t('Welcome,')}{"\n"}
              <Text style={styles.userName}>{username}</Text>
            </Text>
          </View>
          <View style={styles.iconRow}>
           <TouchableOpacity
  style={styles.iconButton}
  onPress={() => navigation.navigate('Search')}
>
  <Ionicons name="search" size={24} color="#333" />
</TouchableOpacity>

   <TouchableOpacity
   
  onPress={() => {
    
    if (user) {
      navigation.navigate('Notification', { email: '' });
    } else {
      Toast.show({
        type: 'error',
        text1: i18n.t('You need to create an account'),
        visibilityTime: 2500,
        topOffset: 50,
        position: 'top',
      });
    }
  }}
  
>
  {unreadCount > 0 && (
    <View style={styles.redBadge}>
      <Text style={styles.redBadgeText}>{unreadCount}</Text>
    </View>
  )}
  <Ionicons name="notifications-outline" size={24} color="#333" />
</TouchableOpacity>
          </View>
        </View>

        {/* Banner */}
        {showScrollHint && (
  <Animated.View
    style={{
      position: 'absolute',
      top: 140, // Adjust depending on layout
      left: 20,
      right: 20,
      zIndex: 1000,
      flexDirection: 'row',
      justifyContent: 'center',
      opacity: scrollHintOpacity,
    }}
    pointerEvents="none"
  >
    <MaterialIcons name="keyboard-double-arrow-right" size={50} color="white" style={{ opacity: 0.6 }} />
    
  </Animated.View>
)} 
        <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
         <View style={styles.banner}>
  <ImageBackground
    source={{
      uri: 'https://captaincreps.com/wp-content/uploads/2021/03/How-Does-The-AJ1-fit-compared-to-the-AF1-2-1.jpg',
    }}
    style={styles.bannerImage}
    imageStyle={styles.bannerImageStyle} // for rounded corners
  >
    <View style={styles.bannerContent}>
      <Text style={styles.bannerTitle}>{i18n.t("BRACE YOURSELF{'\n'}CREATE YOURS")}</Text>
      <TouchableOpacity
  style={styles.bannerButton}
  onPress={() => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: i18n.t('Please log in to create your store!'),
        visibilityTime: 2500,
        topOffset: 50,
        position: 'top',
      });
    } else {
       navigation.getParent()?.navigate('Grid'); // replace 'Dummy' with your real Add Store screen name
    }
  }}
>
  <Text style={styles.bannerButtonText}>{i18n.t("CREATE YOUR STORE NOW")}</Text>
</TouchableOpacity>
    </View>
  </ImageBackground>
</View>

<View style={styles.banner}>
  <ImageBackground
    source={{
      uri: 'https://cutestuff.co.in/cdn/shop/products/strongwomenslaygirl.png?v=1679291531',
    }}
    style={styles.bannerImage}
    imageStyle={styles.bannerImageStyle} // for rounded corners
  >
    <View style={styles.bannerContent}>
      <Text style={styles.bannerTitle}>{i18n.t("BRACE YOURSELF{'\n'}CREATE YOURS")}</Text>
       <TouchableOpacity
  style={styles.bannerButton}
  onPress={() => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: i18n.t('Please log in to create your store!'),
        visibilityTime: 2500,
        topOffset: 50,
        position: 'top',
      });
    } else {
      navigation.getParent()?.navigate('Grid');// replace 'Dummy' with your real Add Store screen name
    }
  }}
>
  <Text style={styles.bannerButtonText}>{i18n.t('CREATE YOUR STORE NOW')}</Text>
</TouchableOpacity>
    </View>
  </ImageBackground>
</View>

        </ScrollView>

      {/* Categories */}
      <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{i18n.t('Categories')}</Text>
        
        </View>
      <View style={{ height: 34, marginTop: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((item, i) => {
            const isActive = activeCategoryIndex === i;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => {
                  setActiveCategoryIndex(i);
                  const selected = categories[i];
                  if (selected === 'All') {
                    setFilteredProducts(allProducts);
                  } else {
                    const filtered = allProducts.filter(p => p.category?.toLowerCase() === selected.toLowerCase());
                    setFilteredProducts(filtered);
                  }
                }}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Products */}
      <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{i18n.t('Products')}</Text>
          <TouchableOpacity
  activeOpacity={0.7}
  onPress={() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // smoother transition
    navigation.navigate('PopularProducts', { tabOffset });
  }}
>
  <Text style={styles.sectionLink}>{i18n.t('See All')}</Text>
</TouchableOpacity>

        </View>
      <View style={styles.gridContainer}>
         {loading ? (
    <SkeletonPlaceholder borderRadius={12}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {Array(6).fill(0).map((_, index) => (
          <View
            key={index}
            style={{
              width: '48%',
              height: 200,
              marginBottom: 16,
              borderRadius: 12,
            }}
          />
        ))}
      </View>
    </SkeletonPlaceholder>
  ): filteredProducts.length === 0 ? (
    // 🚫 Placeholder when no products
    <View style={styles.emptyState}>
      <Ionicons name="wifi-outline" size={64} color="#6b21a8" />
      <Text style={styles.emptyTitle}>{i18n.t('No Results')}</Text>
      <Text style={styles.emptySubtitle}>
        {i18n.t('There')}
      </Text>
    </View>
  )  : (
        filteredProducts.slice(0, 12).map((item: Product, index: number) => {
          const isNew =
            item.createdAt &&
            Date.now() - new Date(item.createdAt.seconds * 1000).getTime() < 1 * 24 * 60 * 60 * 1000;
          const badgeLabel = item.name.toLowerCase().includes('sale')
  ? 'SALE -40%'
  : isNew
  ? 'NEW'
  : null;
          return (
            <TouchableOpacity
              key={index}
              style={styles.popularCard}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
            >
  {badgeLabel && (
    <View style={styles.badgeContainer}>
      <Text style={styles.badgeText}>{badgeLabel}</Text>
    </View>
  )}
  <Image source={{ uri: item.image }} style={styles.popularImage} resizeMode="cover" />
  

  {/* 🆕 Name and Rating */}
  <View style={styles.nameRow}>
    <Text style={styles.productName}>{item.name}</Text>
    <Text style={styles.productRating}>⭐ {item.rating}</Text>
  </View>
  <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
</TouchableOpacity>
          );
        })
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Leave styles unchanged


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  welcomeText: {
    marginLeft: 8,
    color: '#555',
  },
  userName: {
    fontWeight: 'bold',
    color: '#000',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    marginLeft: 12,
  },
  banner: {
  width: 320,
  height: 150,
  borderRadius: 16,
  overflow: 'hidden',
  marginTop: 24,
  marginRight: 16,
},

  bannerTitle: {
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
  lineHeight: 22,
},
  bannerSubtitle: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 8,
  },
  bannerButton: {
  alignSelf: 'flex-start',
  backgroundColor: '#FF5A1F', // orange like in your screenshot
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 8,
  marginTop: 12,
},
  bannerButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 13,
},
  bannerImage: {
  flex: 1,
  justifyContent: 'space-between',
  padding: 16,
},
bannerImageStyle: {
  borderRadius: 16,
},
bannerContent: {
  flex: 1,
  justifyContent: 'space-between',
},

  sectionHeader: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionLink: {
    color: '#7C3AED',
  },
  categories: {
  marginTop: 12,
  
},
categoryChip: {
    paddingVertical: 6,
  paddingHorizontal: 14,
  backgroundColor: '#f5f3ff', // light purple background
  borderRadius: 999,
  marginRight: 10,
  borderWidth: 1,
  borderColor: '#ddd',
  justifyContent: 'center',
  alignItems: 'center',
},
categoryText: {
  color: '#7C3AED',
  fontSize: 13,
  fontWeight: '500',
},


  popularScroll: {
    marginTop: 12,
  },
  emptyState: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 40,
},
emptyTitle: {
  fontSize: 22,
  fontWeight: "bold",
  marginTop: 12,
  color: "#4c1d95", // deep purple/navy
},
emptySubtitle: {
  fontSize: 14,
  textAlign: "center",
  marginTop: 6,
  color: "#6b21a8", // lighter purple
},
popularCard: {
 
  
 
  
  
  
    width: '47%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 8,
  marginBottom: 14,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
  position: 'relative',
  alignItems: 'center',
},

popularImage: {
 
   width: '100%',
  height: 130,
  borderRadius: 10,
  marginBottom: 10,
},



productPrice: {
  
  marginTop: 2,
   color: '#111',
  fontSize: 13,
  fontWeight: 'bold',
  textAlign: 'center',
},

ratingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 2,
},

ratingText: {
  marginLeft: 4,
  fontSize: 11,
  color: '#555',
},

  ////////////////////////////////
 categoryChipActive: {
  backgroundColor: '#7C3AED', // deep purple
  borderColor: '#7C3AED',
},
categoryTextActive: {
  color: '#fff',
  fontWeight: '700',
},


gridContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginTop: 12,
},

badgeContainer: {
  position: 'absolute',
  top: 8,
  left: 8,
  backgroundColor: '#F97316', // orange for NEW, or change if SALE
  borderRadius: 6,
  paddingHorizontal: 6,
  paddingVertical: 2,
  zIndex: 2,
},

badgeText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: 'bold',
},


nameRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between', // or 'flex-start' if you want them close
  gap: 8, // if using React Native >= 0.71, otherwise use margin
},

productName: {
  fontSize: 12.5,
  fontWeight: 'bold',
  color: '#333',
},

productRating: {
  fontSize: 13,
  color: '#888',
},


redBadge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },



});
