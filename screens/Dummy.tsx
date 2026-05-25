import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  Animated, 
  Easing,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import  WheelColorPicker  from 'react-native-wheel-color-picker';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import i18n from '../i18n/config';

declare module 'react-native-wheel-color-picker';

const categories = [i18n.t('Shoeses'), i18n.t('T-Shirts'), i18n.t('Dresses'), i18n.t('Pants'), i18n.t('Shirt')];

export default function Dummy() {
  const user = auth.currentUser;
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [colors, setColors] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
const [currentColor, setCurrentColor] = useState<string>('#ff0000');
const [showColorPicker, setShowColorPicker] = useState(false);
const [hasInteracted, setHasInteracted] = useState(false);
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
const [isAuthenticated, setIsAuthenticated] = useState(!!auth.currentUser?.email);

useFocusEffect(
  React.useCallback(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!auth.currentUser?.email);
    };

    checkAuth(); // recheck every time screen is focused
  }, [])
);

  // Animated background like login screen
  const bgColor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(bgColor, {
        toValue: 1,
        duration: 10000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const interpolatedBackground = bgColor.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 0.85, 0.95, 1],
    outputRange: [
      '#db5eddff',
      '#f8f375ff',
      '#c32bf1ff',
      '#3dcad7ff',
      '#c32bf1ff',
      '#f8f375ff',
      '#db5eddff',
    ],
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      const cloudinaryUrl = await uploadToCloudinary(localUri);
      if (cloudinaryUrl) setImageUrl(cloudinaryUrl);
    }
  };
const handleSubmit = async () => {
  if (!user?.email) {
    ToastAndroid.show(i18n.t('Please create an account first'), ToastAndroid.LONG);
    return;
  }

  if (!name || !price || !description || !imageUrl) {
    ToastAndroid.show(i18n.t('Please fill all fields'), ToastAndroid.SHORT);
    return;
  }

  const finalCategory = customCategory.trim() !== '' ? customCategory : category;

  // ✅ Let Firestore generate the global product ID
  const globalProductRef = doc(collection(db, 'products'));
  const globalProductId = globalProductRef.id;

  const productData = {
    id: globalProductId, // 👈 Use the generated ID here
    name,
    price: parseFloat(price),
    rating: parseFloat(rating),
    colors: selectedColors,
    description,
    image: imageUrl,
    category: finalCategory,
    createdAt: serverTimestamp(),
    ownerEmail: user.email,
  };

  try {
    // ✅ Save product globally
    await setDoc(globalProductRef, productData);

    // ✅ Save reference under user's subcollection
    await setDoc(doc(db, 'users', user.email, 'products', globalProductId), {
      globalId: globalProductId,
    });

    // 🧹 Clear form
    setName('');
    setPrice('');
    setRating('');
    setColors('');
    setDescription('');
    setCustomCategory('');
    setImageUrl(null);
    setSelectedColors([]);

    ToastAndroid.show(i18n.t('Product posted!'), ToastAndroid.SHORT);

    // 🧠 Fetch product again and navigate
    const globalProductSnap = await getDoc(doc(db, 'products', globalProductId));

    if (globalProductSnap.exists()) {
      const data = globalProductSnap.data();

      navigation.navigate('Home', {
  navigateToProductId: globalProductId, // 👈 pass the ID to Home
});

    } else {
      ToastAndroid.show('Failed to locate product after post', ToastAndroid.SHORT);
    }
  } catch (error) {
    console.error('❌ Error uploading product:', error);
    ToastAndroid.show('Upload failed, try again.', ToastAndroid.LONG);
  }
};



  if (!isAuthenticated) { 
    return (
      <Animated.View style={[styles.centered, { backgroundColor: interpolatedBackground }]}>
        <Text style={styles.text}>{i18n.t('Please create an account first')}</Text>
        <TouchableOpacity
            style={styles.button}
             onPress={() =>
    (navigation as any).navigate('Profile', {
      screen: 'ProfileHome'})
  }
          >
            <Text style={styles.buttonText}>{i18n.t('Go to Login')}</Text>
          </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: interpolatedBackground }]}>
  <ScrollView contentContainerStyle={styles.innerContainer} showsVerticalScrollIndicator={false}>
    
    {/* Title */}
    <Text style={styles.title}>{i18n.t('Your Store')}</Text>

    {/* Image Upload Box */}
    <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.preview} />
      ) : (
        <Text style={styles.uploadText}>{i18n.t('Tap to Upload Product Image')}</Text>
      )}
    </TouchableOpacity>

    {/* Inputs with compact layout */}
    <View style={styles.row}>
      <TextInput
        placeholder={i18n.t("Product Name")}
        value={name}
        onChangeText={setName}
        style={[styles.input, styles.squareInput]}
      />
      <TextInput
        placeholder={i18n.t("Price In Dollar $")}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={[styles.input, styles.squareInput]}
      />
    </View>

    <View style={styles.row}>
     <TextInput
  placeholder={i18n.t("Unrated yet")}
  value={rating ?? ''} // if null → empty input, so placeholder shows
  editable={false}     // makes it read-only
  selectTextOnFocus={false}
  style={[styles.input, styles.squareInput, { color: '#999' }]} // gray text for consistency
/>
     <View style={styles.colorPreviewRow}>
  {selectedColors.map((color, i) => (
    <View
      key={i}
      style={[styles.colorDot, { backgroundColor: color }]}
    />
  ))}
  <TouchableOpacity style={styles.addColorBtn} onPress={() => setShowColorPicker(true)}>
    <Text style={styles.addColorText}>{i18n.t('+ Add Color')}</Text>
  </TouchableOpacity>
</View>
    </View>

    <TextInput
      placeholder={i18n.t("Description")}
      value={description}
      onChangeText={setDescription}
      multiline
      style={[styles.input, styles.rectangleInput]}
    />

    {/* Category Picker */}
    <TouchableOpacity style={styles.input} onPress={() => setShowCategoryModal(true)}>
      <Text style={{ color: '#444' }}>{category}</Text>
    </TouchableOpacity>

    <TextInput
      placeholder={i18n.t("Or enter custom category")}
      value={customCategory}
      onChangeText={setCustomCategory}
      style={[styles.input, styles.squareInput]}
    />

    {/* Save Button */}
    <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
      <Text style={styles.saveText}>{i18n.t('Save Product')}</Text>
    </TouchableOpacity>
  </ScrollView>


<Modal visible={showColorPicker} transparent animationType="fade">
  <View style={styles.pickerModal}>
    <View style={{ height: 300, width: 300 }}>
      <WheelColorPicker
        color={currentColor}
        onColorChange={(color: string) => setCurrentColor(color)}
      />
    </View>

    {/* Confirm button instead of onColorChangeComplete */}
    <View style={styles.actionsRow}>
  {/* ✅ Confirm Button */}
  <TouchableOpacity
    onPress={() => {
      setSelectedColors([...selectedColors, currentColor]);
      setShowColorPicker(false);
    }}
    style={[styles.confirmBtn, { backgroundColor: currentColor }]}
    activeOpacity={0.8}
  >
    <Text style={styles.confirmText}>{i18n.t('Confirm')}</Text>
  </TouchableOpacity>

  {/* ❌ Cancel Button */}
  <TouchableOpacity
    onPress={() => setShowColorPicker(false)}
    style={styles.cancelBtn}
    activeOpacity={0.8}
  >
    <Text style={styles.cancelText}>{i18n.t('Cancel')}</Text>
  </TouchableOpacity>
</View>
  </View>
</Modal>

  {/* Modal Picker (unchanged) */}
  <Modal visible={showCategoryModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{i18n.t('Select Category')}</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.modalItem}
            activeOpacity={0.7}
            onPress={() => {
              setCategory(item);
              setShowCategoryModal(false);
            }}
          >
            <Text style={styles.modalItemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        onPress={() => setShowCategoryModal(false)}
        style={styles.modalCancel}
        activeOpacity={0.7}
      >
        <Text style={styles.modalCancelText}>{i18n.t('Cancel')}</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
</Animated.View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 20,
    paddingTop: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  imageBox: {
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  uploadText: {
    color: '#444',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  title: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#222',
  marginBottom: 10,
  textAlign: 'center',
},

row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 10,
  marginBottom: 12,
},

squareInput: {
  flex: 1,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  paddingHorizontal: 10,
  paddingVertical: 8,
},

rectangleInput: {
  height: 100,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 12,
  padding: 12,
  marginBottom: 14,
},
colorPreviewRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
  flexWrap: 'wrap',
  gap: 8,
},

colorDot: {
  width: 28,
  height: 28,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '#ccc',
},

addColorBtn: {
  paddingVertical: 6,
  paddingHorizontal: 10,
  backgroundColor: '#0f172a',
  borderRadius: 8,
},

addColorText: {
  color: '#fff',
  fontWeight: 'bold',
},

pickerModal: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  paddingHorizontal: 20,
},

colorPreview: {
  width: 50,
  height: 50,
  borderRadius: 25,
  borderWidth: 2,
  borderColor: '#fff',
  marginTop: 20,
},
button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  
  text: {
    fontSize: 22,
    color: '#ffff',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  actionsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 16,
},

confirmBtn: {
  flex: 1,
  paddingVertical: 12,
  marginRight: 8,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 3, // Android shadow
  shadowColor: '#000', // iOS shadow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
},

confirmText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
},

cancelBtn: {
  flex: 1,
  paddingVertical: 12,
  marginLeft: 8,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#ccc',
  alignItems: 'center',
  justifyContent: 'center',
},

cancelText: {
  color: '#333',
  fontWeight: '600',
  fontSize: 16,
},


modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalContent: {
  width: '85%',
  maxHeight: '70%',
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 20,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 5,
},

modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 12,
  textAlign: 'center',
  color: '#333',
},

modalItem: {
  paddingVertical: 14,
  paddingHorizontal: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},

modalItemText: {
  fontSize: 16,
  color: '#444',
},

modalCancel: {
  marginTop: 16,
  paddingVertical: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#f00',
  alignItems: 'center',
},

modalCancelText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#f00',
},
}); 