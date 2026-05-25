import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n/config';
const bgImages = [
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287046/ecommerce-profile/vzy5fc1ystdezhg1hhzl.jpg',
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287062/ecommerce-profile/mff6wvvsvbb1zctgodr7.jpg',
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287070/ecommerce-profile/yex5pbkdxwpaf4nvf8yh.jpg',
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287077/ecommerce-profile/ogyrbfjaxyguxfooncbf.jpg',

  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287093/ecommerce-profile/s7gpnx6slqnlhj3ikspa.jpg',
  'https://res.cloudinary.com/dprgtj9du/image/upload/v1753287098/ecommerce-profile/q5rtiyj3dhyvjezwpxbm.jpg',
];

export default function PaymentMethodScreen() {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const [gaveTotal, setGaveTotal] = useState(0);
  const [gotTotal, setGotTotal] = useState(0);
  const [bgUrl, setBgUrl] = useState('');

  const user = auth.currentUser;

  useEffect(() => {
    const load = async () => {
      const selected = bgImages[Math.floor(Math.random() * bgImages.length)];
      setBgUrl(selected);

      if (!user?.email) return;
      const docRef = doc(db, 'users', user.email);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setProfileUrl(data.profileImageUrl || '');
      }

      const payRef = doc(db, 'payments', user.email);
      const paySnap = await getDoc(payRef);
      if (paySnap.exists()) {
        setPaymentMethod(paySnap.data().method || '');
        setIsSaved(true);
      }

      
      const now = new Date();
      const lastMonth = now.getMonth() - 1;
      const txRef = collection(db, 'payments', user.email, 'transactions');
      const txSnap = await getDocs(txRef);
      let gave = 0, got = 0;
      txSnap.forEach(doc => {
        const tx = doc.data();
        const date = new Date(tx.timestamp);
        if (date.getMonth() === lastMonth) {
          if (tx.type === 'gave') gave += tx.amount;
          if (tx.type === 'got') got += tx.amount;
        }
      });
      setGaveTotal(gave);
      setGotTotal(got);
    };

    load();
  }, []);

  const saveMethod = async () => {
    if (!user?.email || !paymentMethod.trim()) return;
    await setDoc(doc(db, 'payments', user.email), { method: paymentMethod });
    setIsSaved(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollWrapper}>
      <Image source={{ uri: bgUrl }} style={styles.background} />
      <View style={styles.overlay} />

      {profileUrl ? (
        <Image source={{ uri: profileUrl }} style={styles.avatar} />
      ) : null}

      <View style={styles.container}>
        {!isSaved ? (
          <>
            <Text style={styles.title}>{i18n.t('Set Your Payment Method')}</Text>
            <TextInput
              placeholder="e.g. PayPal, Visa, Wise"
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              style={styles.input}
            />
            <TouchableOpacity onPress={saveMethod} style={styles.button}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.title}>Your Payment Method</Text>
            <Text style={styles.readonly}>{paymentMethod}</Text>

            <Text style={styles.subtitle}>Last Month</Text>
            <Text style={styles.info}>💸 Gave: ${gaveTotal}</Text>
            <Text style={styles.info}>💰 Got: ${gotTotal}</Text>

            <TouchableOpacity onPress={() => setIsSaved(false)}>
              <Text style={{ marginTop: 20, color: '#fff' }}>
                Edit Payment Method
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  scrollWrapper: {
    flexGrow: 1,
    backgroundColor: '#000',
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000040',
  },
  container: {
    padding: 24,
    paddingTop: 120,
    alignItems: 'center',
    zIndex: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
    top: 40,
    right: 20,
    borderColor: '#fff',
    borderWidth: 2,
    zIndex: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 24,
  },
  input: {
    width: '100%',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  readonly: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  info: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
});
