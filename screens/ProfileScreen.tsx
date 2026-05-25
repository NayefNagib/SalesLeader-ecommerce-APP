import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types/navigation';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setDoc } from 'firebase/firestore';
import i18n from '../i18n/config';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import { Modal } from 'react-native'; // Add this to<Text>{i18n.t('')}</Text> your imports
import { useUser } from '../context/UserContext';
import {  onSnapshot } from "firebase/firestore";
export default function ProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const user = auth.currentUser;
const [username, setUsername] = useState('');
const [showLangModal, setShowLangModal] = useState(false);
const { setProfileImageUrl } = useUser();

useEffect(() => {
  const fetchUserData = async () => {
    const user = auth.currentUser;
    const isLoggedIn = user;

    if (isLoggedIn && user.email) {
      const userRef = doc(db, 'users', user.email);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        setUsername(data.username || <Text>{i18n.t('Visitor')}</Text>);
        setProfileImageUrl(data.profileImageUrl || null);
      }
    } else {
      setUsername('Visitor');
      setProfileImageUrl(null);
    }
  };

  fetchUserData();
}, []);

  useEffect(() => {
  if (!user?.email) return;

  const userRef = doc(db, "users", user.email);

  // real-time listener
  const unsubscribe = onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      setProfileImage(data.profileImageUrl || null);
      setBgImage(data.backgroundImageUrl || null);
      setBio(data.bio || "");        // <-- will always update now
      setUsername(data.username || "");
    }
  });

  return () => unsubscribe();
}, [user]);

const changeLang = async (lang: 'en' | 'ar') => {
  await AsyncStorage.setItem('appLanguage', lang);
  (i18n as any).locale = lang; // Avoid TS error
  I18nManager.forceRTL(lang === 'ar');
  Updates.reloadAsync(); // Restart app to apply language
};

 const pickAndUploadImage = async (
  setImage: (url: string) => void,
  field: 'profileImage' | 'backgroundImage'
) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (!result.canceled && result.assets.length > 0 && auth.currentUser) {
    const localUri = result.assets[0].uri;

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(localUri);

    if (!cloudinaryUrl) return;

    // Update local state to show image
    setImage(cloudinaryUrl);
if (!auth.currentUser?.email) return;
    const userRef = doc(db, 'users', auth.currentUser.email);

    // Update Firestore document (merging fields)
    await setDoc(
      userRef,
      {
        email: auth.currentUser.email,
        [field === 'profileImage' ? 'profileImageUrl' : 'backgroundImageUrl']: cloudinaryUrl },
      { merge: true }
    );

    // Save to AsyncStorage so it loads instantly later
    await AsyncStorage.setItem(
      field === 'profileImage' ? 'profileImageUrl' : 'backgroundImageUrl',
      cloudinaryUrl
    );
  }
};


  const handleLogout = async () => {
    await signOut(auth);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    await AsyncStorage.removeItem('userEmail');
await AsyncStorage.removeItem('profileImageUrl');
await AsyncStorage.removeItem('backgroundImageUrl');
 Updates.reloadAsync(); 
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
     <View style={styles.header}>
  <Image
    source={{
      uri: bgImage?.trim()
        ? bgImage
        : 'https://cdn.pixabay.com/photo/2022/01/22/13/31/background-6957584_1280.png',
    }}
    style={styles.backgroundImage}
  />
  <TouchableOpacity
    style={styles.bgEditBtn}
    onPress={() => pickAndUploadImage(setBgImage, 'backgroundImage')}
  >
    <Ionicons name="camera" size={20} color="#fff" />
  </TouchableOpacity>

  <View style={styles.profileContainer}>
    <Image
      source={{
        uri: profileImage?.trim()
          ? profileImage
          : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      }}
      style={styles.profileImage}
    />
    <TouchableOpacity
      style={styles.profileEditBtn}
      onPress={() => pickAndUploadImage(setProfileImage, 'profileImage')}
    >
      <Ionicons name="pencil" size={16} color="#fff" />
    </TouchableOpacity>
  </View>

  <Text style={styles.name}>
  {username?.trim() !== '' ? username : user?.email?.split('@')[0] || <Text>{i18n.t('Unnamed User')}</Text>}
</Text>


  <Text style={styles.email}>{user?.email}</Text>
{isEditingBio ? (
  <View style={styles.bioEditContainer}>
    <TextInput
      style={styles.bioInput}
      placeholder={i18n.t('Enter your bio')}
      value={bio}
      onChangeText={setBio}
    />
    <TouchableOpacity
      onPress={async () => {
        const userEmail = user?.email;
        if (!userEmail) return;
        await setDoc(doc(db, 'users', userEmail), { bio }, { merge: true });
        setIsEditingBio(false);
      }}
      style={styles.bioSaveBtn}
    >
      <Text style={{ color: '#fff' }}>{i18n.t('Save')}</Text>
    </TouchableOpacity>
  </View>
) : (
  <TouchableOpacity onPress={() => setIsEditingBio(true)}>
    <Text style={styles.bioText}>
      {bio ? bio : <Text>{i18n.t('Tap to add a bio')}</Text>}
    </Text>
  </TouchableOpacity>
)}
  {/*///////////////////////////////{i18n.t('')}////////////////////////////<Text>{i18n.t('')}</Text>///////////////////////////////////////////////////////*/}
</View>


      <View style={styles.menu}>
        {[
          {icon: 'person-outline',text: <Text>{i18n.t('Edit Profile')}</Text>, onPress: () => navigation.navigate('EditProfile')},
          { icon: 'share-social-outline', text: <Text>{i18n.t('Social Media communicating info')}</Text>, onPress: () => navigation.navigate('SocialMedia') },
         // { icon: 'card-outline', text: 'Payment Method', onPress: () => navigation.navigate('Payment') },
         // { icon: 'cube-outline', text: 'My Orders' },
          { icon: 'language-outline', text: <Text>{i18n.t('Change Language')}</Text>, onPress: () => setShowLangModal(true)  },
          { icon: 'storefront-outline', text: <Text>{i18n.t('My Store')}</Text>, onPress: () => navigation.navigate('MyStore') },
        ].map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.menuItem} onPress={item.onPress}>
            <Ionicons name={item.icon as any} size={20} color="#555" />
            <Text style={styles.menuText}>{item.text}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>{i18n.t('Log out')}</Text>
        </TouchableOpacity>
      </View>
   <Modal visible={showLangModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{i18n.t('chooseLanguage')}</Text>

      <TouchableOpacity
        style={styles.langBtn}
        onPress={async () => {
          await changeLang('ar');
          setShowLangModal(false);
        }}
      >
        <Text style={styles.langText}>العربية</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.langBtn}
        onPress={async () => {
          await changeLang('en');
          setShowLangModal(false);
        }}
      >
        <Text style={styles.langText}>English</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={[styles.langBtn, { backgroundColor: '#ccc', marginTop: 10 }]}
        onPress={() => setShowLangModal(false)}
      >
        <Text style={[styles.langText, { color: '#333' }]}>
          {i18n.t('cancel') || 'Cancel'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: 160,
  },
  bgEditBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#0006',
    padding: 6,
    borderRadius: 20,
  },
  profileContainer: {
    marginTop: -40,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: '#333',
    padding: 4,
    borderRadius: 14,
  },
  name: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  email: {
    color: '#777',
    fontSize: 14,
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
/////////////////////////////////////////////////////////
bioText: {
  color: '#555',
  fontStyle: 'italic',
  fontSize: 14,
  marginTop: 8,
  textAlign: 'center',
},

bioEditContainer: {
  marginTop: 10,
  alignItems: 'center',
  gap: 8,
},

bioInput: {
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  minWidth: '80%',
  backgroundColor: '#f8f8f8',
},

bioSaveBtn: {
  backgroundColor: '#0f172a',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
},
///////////////////////////////////////
modalOverlay: {
  flex: 1,
  backgroundColor: '#0008',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 20,
  width: '80%',
  alignItems: 'center',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 16,
},
langBtn: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  backgroundColor: '#0f172a',
  borderRadius: 8,
  marginTop: 10,
  width: '100%',
  alignItems: 'center',
},
langText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},

});
