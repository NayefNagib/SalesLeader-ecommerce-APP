import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  ImageBackground,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import i18n from '../i18n/config';
type Props = NativeStackScreenProps<RootStackParamList, 'OrderSummary'>;

export default function OrderSummaryScreen({ route, navigation }: Props) {
  const { product, buyerInfo } = route.params;
  const [loading, setLoading] = useState(false);

  const appFee = product.price * 0.1;
  if (product.quantity === undefined) { product.quantity = 1; }
  const total = product.price * product.quantity  + appFee;

  const handleBuy = async () => {
    setLoading(true);
    const user = getAuth().currentUser;

    if (!user || !user.email) {
      ToastAndroid.show(i18n.t('Please log in first'), ToastAndroid.SHORT);
      setLoading(false);
      return;
    }

    const buyerEmail = user.email;

    try {
      // Get buyer profile
      const buyerDocRef = doc(db, 'users', buyerEmail);
      const buyerSnap = await getDoc(buyerDocRef);
      const buyerProfile = buyerSnap.exists() ? buyerSnap.data() : {};
   
      // Notify seller
      const sellerEmail = product.ownerEmail; // or product.ownerEmail if that's how you're storing it
      if (sellerEmail) {
        const sellerNotifRef = collection(db, 'users', sellerEmail, 'notifications');
        await addDoc(sellerNotifRef, {
          type: i18n.t('purchase'),
          title: i18n.t('New Order 📦'),
          message: i18n.t(`${buyerProfile.username || buyerEmail} wants to buy your product.`),
          createdAt: serverTimestamp(),
          buyerInfo,
          buyerProfile,
          product,
          read: false,
        });
      }

      // Add to buyer cart (optional)
      const cartRef = doc(db, 'users', buyerEmail, 'cart', product.id);
      await setDoc(cartRef, {
        ...product,
        addedAt: serverTimestamp(),
      });

      // Notify buyer
      const buyerNotifRef = collection(db, 'users', buyerEmail, 'notifications');
      await addDoc(buyerNotifRef, {
        type: i18n.t('confirmation'),
        title: i18n.t('Order Confirmed 🎉'),
        message: i18n.t('Your order has been placed The seller will contact you soon'),
        createdAt: serverTimestamp(),
        product,
        buyerInfo,
        read: false,
      });

      ToastAndroid.show(i18n.t('Order placed successfully'), ToastAndroid.SHORT);
      navigation.navigate('Home');
    } catch (err) {
      console.error(i18n.t('Order error:'), err);
      ToastAndroid.show(i18n.t('Something went wrong.'), ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/nnn.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{i18n.t('Order Summary')}</Text>
          <Text style={styles.line}>{i18n.t('💰 Product Price:')} ${product.price.toFixed(2)}</Text>
          <Text style={styles.line}>{i18n.t('📱 App Fee:')} ${appFee.toFixed(2)}</Text>
          <Text style={styles.total}>{i18n.t('Total:')} ${total.toFixed(2)}</Text>
          <Text style={styles.codNotice}>{i18n.t('💵 Cash on Delivery')}</Text>

          <TouchableOpacity
            style={styles.buyButton}
            onPress={handleBuy}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buyText}>{i18n.t('Buy Now')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1e3a8a',
  },
  line: {
    fontSize: 16,
    marginBottom: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },
  codNotice: {
    fontSize: 14,
    color: '#444',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 15,
  },
  buyButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
