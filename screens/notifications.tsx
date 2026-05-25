import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { RootStackParamList } from '../types/navigation';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {  where, getDocs, writeBatch } from "firebase/firestore";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { updateDoc } from 'firebase/firestore';
import i18n from '../i18n/config';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notification'>;

const NotificationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userEmail = auth.currentUser?.email;

const [unreadCount, setUnreadCount] = useState(0);
useEffect(() => {
  const unsubscribe = navigation.addListener("focus", () => {
    markAllAsRead(userEmail!);
  });

  return unsubscribe;
}, [navigation, userEmail]);
  useEffect(() => {
    if (!userEmail) return;

    const q = query(
      collection(db, 'users', userEmail, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setNotifications(notifData);
      setLoading(false);

      
       // Count unread notifications

    const unread = notifData.filter(n => n.read === false).length;
    setUnreadCount(unread);
    });

    return unsubscribe;
  }, [userEmail]);


// ✅ Only reset unread count when user opens notification screen
useFocusEffect(
  useCallback(() => {
    if (!userEmail) return;

    const markAsRead = async () => {
      const q = query(
        collection(db, "users", userEmail, "notifications"),
        where("read", "==", false)
      );
      const snap = await getDocs(q);
      snap.forEach(async (doc) => {
        await updateDoc(doc.ref, { read: true });
      });
    };

    markAsRead();
  }, [userEmail])

);

  const handleDelete = async (id: string) => {
    if (!userEmail) return;
    try {
      await deleteDoc(doc(db, 'users', userEmail, 'notifications', id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
const markAllAsRead = async (userEmail: string) => {
  if (!userEmail) return;

  const q = query(
    collection(db, "users", userEmail, "notifications"),
    where("read", "==", false)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
};

  const renderItem = ({ item }: { item: any }) => {
  const currentEmail = auth.currentUser?.email;
  const sellerEmail = item.product?.ownerEmail; // make sure you store sellerEmail in Firestore
  const buyerEmail = item.buyerInfo?.buyeremail;   // buyer's email

  // SELLER notification UI
  if (currentEmail === sellerEmail) {
    return (
    <TouchableOpacity
    style={{ marginBottom: 16 }}
    onPress={() =>
      navigation.navigate('OrderDetails', {
        buyerInfo: item.buyerInfo,
        buyerProfile: item.buyerProfile,
        product: item.product,
        quantity: item.product.quantity || 1, 
      })
    }
  >
    <LinearGradient
      colors={['#1e3c72', '#2a0a0a']} // Dark Blue → Dark Red
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >

      <Image
        source={{
          uri:
            item.buyerProfile?.profileImageUrl ||
            'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        }}
        style={styles.avatar}
      />

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.title}>
          {item.buyerProfile?.username || 'Someone'} {i18n.t('wants to buy your product')}
        </Text>
        <Text style={styles.subtitle}>{i18n.t('Product:')} {item.product?.name || 'Unknown'}</Text>
        <Text style={styles.subtitle}>
          {i18n.t('Location:')} {item.buyerInfo?.country || ''}, {item.buyerInfo?.city || ''}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('ReadOnlyProfile', {
              email: item.buyerProfile?.email || '',
            })
          }
        >
          <Text style={styles.buttonText}>{i18n.t('View Buyer Profile')}</Text>
        </TouchableOpacity>
      </View>

      <Image
        source={{
          uri:
            item.product?.image ||
            'https://cdn-icons-png.flaticon.com/512/679/679922.png',
        }}
        style={styles.productImage}
      />

      {/* Delete Button */}
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
    </TouchableOpacity>
   );
  }
// BUYER notification UI
else if (currentEmail === buyerEmail) {
  return (
    <LinearGradient
      colors={['#1e3c72', '#2a0a0a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Image
        source={{
          uri:
            item.product?.image ||
            'https://cdn-icons-png.flaticon.com/512/679/679922.png',
        }}
        style={styles.productImage}
      />

      <View style={{ flex: 1, marginLeft: 10 }}>
        {/* Title from Firestore */}
        <Text style={styles.title}>{item.title || 'Notification'}</Text>

        {/* Message from Firestore */}
        <Text style={styles.subtitle}>{item.message || ''}</Text>

        {/* Optional: Product name if available */}
        <Text style={styles.subtitle}>
          {i18n.t('Product:')} {item.product?.name || 'Unknown'}
        </Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}


  else {
    return null;}
};
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <LinearGradient
        colors={['#0a0a23', '#2a0a0a']}
        style={styles.gradient}
      >
        <View style={styles.center}>
          <Text style={[styles.title, { color: '#fff' }]}>{i18n.t('No notifications yet')}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0a0a23', '#2a0a0a']} // Dark navy → Dark red
      style={styles.gradient}
    >
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </LinearGradient>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
    position: 'relative',
    top: 40,
    
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#fff',
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 14, color: '#ddd', marginTop: 4 },
  button: {
    marginTop: 8,
    backgroundColor: '#1e3c72',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: { color: 'white', fontWeight: '600' },
  deleteBtn: {
    marginLeft: 8,
    backgroundColor: '#b22222',
    padding: 6,
    borderRadius: 8,
  },
});
