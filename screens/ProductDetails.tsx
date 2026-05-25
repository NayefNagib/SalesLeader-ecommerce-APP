import React, {
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useFavorites } from '../context/FavoriteContext';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';
import { updateDoc } from 'firebase/firestore';
import { Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LayoutAnimation } from 'react-native';
import { onSnapshot } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { KeyboardAvoidingView } from 'react-native';
import EmojiSelector from 'react-native-emoji-selector';
import { Platform } from 'react-native';
import { FlatList } from 'react-native';
 import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
 import { User } from 'firebase/auth';
import {  query, orderBy } from 'firebase/firestore';
 import { Share } from 'react-native';
import i18n from '../i18n/config';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { LinearGradient } from "expo-linear-gradient";
type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;
type Comment = {
  id: string;
  userId: string;
  text: string;
 createdAt: Timestamp;// or use `Timestamp` from Firestore if preferred
  likes: string[];
  profileImage: string | null;
  username: string;
 repliesCount?: number; // optional, for replies count  
};

export default function ProductDetails({ navigation }: Props) {
  const { params } = useRoute<RouteProp<RootStackParamList, 'ProductDetails'>>();
  const product = params?.product;
const [ratingModalVisible, setRatingModalVisible] = useState(false);
const [ratingInput, setRatingInput] = useState('');
const [replies, setReplies] = useState<{ [commentId: string]: any[] }>({});
const [repliesVisible, setRepliesVisible] = useState<{ [commentId: string]: boolean }>({});
const subscribedComments = useRef<{ [commentId: string]: boolean }>({});
const placeholder = 'https://via.placeholder.com/100';
  const [quantity, setQuantity] = useState(1);

  const [ownerInfo, setOwnerInfo] = useState<{
    username: string;
    profileImageUrl: string;
    ownerEmail:string;
  } | null>(null);

const { toggleFavorite, isFavorite } = useFavorites();

  const {cartItems, addToCart, removeFromCart, isInCart } = useCart();
  const inCart = isInCart(product);
  const user = getAuth().currentUser;
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState('');
  const heartRef = useRef<Animatable.View | null>(null);
   const { toggleCartItem } = useCart();
  const [liked, setLiked] = useState(false);
  
useEffect(() => {
  const checkIfFavorite = async () => {
    const stored = await AsyncStorage.getItem('favorites');
    const favorites = stored ? JSON.parse(stored) : [];
    const isFav = favorites.some((item: any) => item.id === product.id);
    setLiked(isFav);
  };
  checkIfFavorite();
}, []);


useEffect(() => {
    const exists = isInCart(product);
    setButtonText(exists ? i18n.t('Remove from Cart') : i18n.t('Add to Cart'));
  }, [cartItems]);

const cartTextRef = useRef<Animatable.Text | null>(null);
const [cartLabel, setCartLabel] = useState('');

useEffect(() => {
  const inCart = isInCart(product);
  setCartLabel(inCart ? i18n.t('Remove from Cart') : i18n.t('Add to Cart'));
}, [cartItems]);

const handleCartToggle = async () => {
  await toggleCartItem(product); 
  ToastAndroid.show(
    isInCart(product) ? i18n.t('Removed from Cart') : i18n.t('Added to cart 🛒'),
    ToastAndroid.SHORT
  );
  cartTextRef.current?.pulse?.(400);
};

  useFocusEffect(
  useCallback(() => {
    const fetchOwnerInfo = async () => {
      try {
        // Step 1: Fetch the product from Firestore by its ID
        const productRef = doc(db, 'products', product.id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          console.log('Product not found in Firestore.');
          return;
        }

        const productData = productSnap.data();
        const ownerEmail = productData.ownerEmail || productData.email;

        if (!ownerEmail) {
          console.log('No owner email found.');
          return;
        }

        // Step 2: Fetch const cartRef = doc(db, 'users', user.email, 'cart', product.id);the user data from `users/{ownerEmail}`
        const userRef = doc(db, 'users', ownerEmail);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setOwnerInfo({
            username: userData.username || 'Unknown Seller',
            profileImageUrl: userData.profileImage || userData.profileImageUrl || '',
            ownerEmail:userData.ownerEmail || ownerEmail || '',
          });
        } else {
          console.log('User document does not exist.');
        }
      } catch (err) {
        console.log('Error fetching owner info:', err);
      }
    };

    fetchOwnerInfo();
  }, [product.id])
);
const handleBuyNow = async () => {
  const user = getAuth().currentUser;
 product.quantity = quantity ;
  if (!user) {
    Toast.show({
      type: i18n.t('error'),
      text1: i18n.t('You need to create an account'),
    });
    return;
  }
  navigation.navigate('BuyerLocation', { product });

  // 2. Increment sold count in Firestore
  const productRef = doc(db, 'products', product.id);
  const productSnap = await getDoc(productRef);
  if (productSnap.exists()) {
    const currentSold = productSnap.data().sold || 0;
    await updateDoc(productRef, {
      sold: currentSold + 1,
    });
  }
}
const handleGoToOwnerProfile = (email: string) => {
  navigation.navigate('ReadOnlyProfile', { email }); // or route name you used
};

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });

    return () => {
      parent?.setOptions({ tabBarStyle: { display: 'flex' } });
    };
  }, [navigation]);

  const increaseQty = () => setQuantity((prev) => prev + 1);
  const decreaseQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));


  if (!product || !product.id) {
    return (
      <View style={styles.centered}>
        <Text>{i18n.t('Invalid product')}</Text>
      </View>
    );
  }

  const handleToggleFavorite = async () => {
  heartRef.current?.pulse?.(300);

  try {
    const stored = await AsyncStorage.getItem('favorites');
    let favorites = stored ? JSON.parse(stored) : [];

    const exists = favorites.find((item: any) => item.id === product.id);

    if (exists) {
      favorites = favorites.filter((item: any) => item.id !== product.id);
      setLiked(false);
      ToastAndroid.show(i18n.t('Removed from favorites 💔'), ToastAndroid.SHORT);
    } else {
      favorites.push(product);
      setLiked(true);
      ToastAndroid.show(i18n.t('Added to favorites ❤️'), ToastAndroid.SHORT);
    }

    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
  }
};
///////////////////////////////////////////////////////////////////////comments////////////////////////////////////////////////////////////////
const auth = getAuth();

const handleOpenComment = () => {
  if (!auth.currentUser) {
    ToastAndroid.show(i18n.t("Please create an account first"), ToastAndroid.SHORT);
    return;
  }
  setIsCommentModalVisible(true);
};
type Props = {
  visible: boolean;
  onClose: () => void;
  productId: string;
  replyingTo: Comment | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<Comment | null>>;
};

const CommentModal: React.FC<Props> = ({
  visible,
  onClose,
  productId,
  replyingTo,
  setReplyingTo,
}) => {
  if (!visible) return null; // prevents rendering when hidden
  const [commentText, setCommentText] = useState('');
 const [comments, setComments] = useState<Comment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const user = getAuth().currentUser;
  
async function getProfileImageUrl() {
  if (!auth.currentUser) return null;
if (!auth.currentUser?.email) {
  console.error("User is not logged in or email is missing");
  return;
}
  const userDocRef = doc(db, "users", auth.currentUser.email);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data().profileImageUrl || null;
  }
  return null;
}

const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProfileImageUrl().then(url => setProfileImageUrl(url));
    if (!visible || !productId) return;

    setIsLoading(true);

    const unsubscribe = onSnapshot(collection(db, 'comments', productId, 'threads'), async (snapshot) => {
      const fetchedComments: Comment[] = await Promise.all(snapshot.docs.map(async (docSnap) => {
  const data = docSnap.data();
  const userDoc = await getDocs(collection(db, 'users'));
  const userInfo = userDoc.docs.find(d => d.id === data.userId)?.data() || {};

  return {
    id: docSnap.id,
    userId: data.userId,
    text: data.text,
    createdAt: data.createdAt,
    likes: data.likes || [],
    profileImage: userInfo.profileImageUrl || null,
    username: userInfo.username || data.userId,
  };
}));
      setComments(fetchedComments.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
       setIsLoading(false);
    }, (error) => {
      console.error('Error fetching comments:', error);
    });
    return unsubscribe;
  }, [visible, productId]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

  if (replyingTo) {
    // Save as a reply
    const replyRef = collection(
      db,
      'comments',
      productId,
      'threads',
      replyingTo.id,
      'replies'
    );
    await addDoc(replyRef, {
      userId: user?.email,
      text: commentText,
      profileImage: profileImageUrl || null,
      username: user?.displayName || user?.email?.split('@')[0],
      createdAt: serverTimestamp(),
      likes: [],
    });
    setReplyingTo(null);
  } else if (editingCommentId) {
    // Edit comment
    const docRef = doc(db, 'comments', productId, 'threads', editingCommentId);
    await updateDoc(docRef, { text: commentText });
    setEditingCommentId(null);
  } else {
    // Top-level comment
    const ref = collection(db, 'comments', productId, 'threads');
    await addDoc(ref, {
      userId: user?.email,
      text: commentText,
      profileImage: profileImageUrl || null,
      createdAt: serverTimestamp(),
      likes: [],
    });
  }

  setCommentText('');
  };
  
const [isOptionsVisible, setIsOptionsVisible] = useState(false);
const [selectedComment, setSelectedComment] = useState<{ id: string, text: string } | null>(null);
const [modalVisible, setModalVisible] = useState(false);
const handleLongPress = (commentId: string, userId: string, text: string) => {
  if (user?.email !== userId) return;
  setSelectedComment({ id: commentId, text });
  setIsOptionsVisible(true);
  
};

const handleEdit = () => {
  if (!selectedComment) return;
  setCommentText(selectedComment.text);
  setEditingCommentId(selectedComment.id);
  setIsOptionsVisible(false);
};

const handleDelete = async () => {
  if (!selectedComment) return;
  const docRef = doc(db, 'comments', productId, 'threads', selectedComment.id);
  await deleteDoc(docRef);
  setIsOptionsVisible(false);
};



  const toggleLike = async (commentId: string, likes: string[]) => {
    const docRef = doc(db, 'comments', productId, 'threads', commentId);
    const isLiked = likes.includes(user?.email ?? '');
    const updatedLikes = isLiked ? likes.filter(l => l !== user?.email) : [...likes, user?.email];
    await updateDoc(docRef, { likes: updatedLikes });
  };
const handleReply = async (
  productId: string,
  commentId: string,
  text: string,
  user: User 
  
) => {
  await addDoc(
    collection(db, 'products', productId, 'comments', commentId, 'replies'),
    {
      text,
      userEmail: user.email,
      userName: user.displayName || user.email?.split('@')[0],
      userImage: user.photoURL || null,
      timestamp: serverTimestamp(),
      likes: [],
    }
    
  );
  
};

const fetchReplies = (productId: string, commentId: string) => {
  const repliesRef = collection(db, 'products', productId, 'comments', commentId, 'replies');
  const q = query(repliesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    setReplies((prev) => ({
      ...prev,
      [commentId]: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    }));
  });
};
const toggleReplies = (commentId: string) => {
  setRepliesVisible(prev => ({
    ...prev,
    [commentId]: !prev[commentId],
  }));

  if (!subscribedComments.current[commentId]) {
    fetchReplies(productId, commentId); 
    subscribedComments.current[commentId] = true;
  }
};
 return (
  <>
    <Modal
  animationType="slide"
  transparent
  visible={visible}
  onRequestClose={onClose}
>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={{ flex: 1 }}
  >
    <View style={styles.overlay}>
      <View style={styles.bottomSheet}>
        
        {/* Drag handle */}
        <View style={styles.dragIndicator} />

        {/* Title */}
        <Text style={styles.title1}>{i18n.t('Comments')}</Text>

        {isLoading ? (
          <SkeletonPlaceholder>
            {[...Array(3)].map((_, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 20 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20 }} />
                <View style={{ marginLeft: 10 }}>
                  <View style={{ width: 200, height: 15, borderRadius: 4 }} />
                  <View
                    style={{
                      marginTop: 6,
                      width: 150,
                      height: 15,
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>
            ))}
          </SkeletonPlaceholder>
        ) :
        comments.length === 0 ? (
          <Text style={styles.placeholder}>{i18n.t('No comments yet Be the first')}</Text>
        ) : (
          
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
  onLongPress={() => setModalVisible(true)}
>
<TouchableOpacity
  onLongPress={() =>
    handleLongPress(item.id, item.userId, item.text)
  }
  delayLongPress={300} // makes it feel responsive
  activeOpacity={0.8}
>
              <View style={styles.commentItem}>
                <Image
                   source={{ uri: item.profileImage || placeholder }}
                  style={styles.profileImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                     <TouchableOpacity onPress={() => toggleLike(item.id, item.likes)}>
                      <Text style={styles.likes}>{item.likes.length} ❤️</Text>
                    </TouchableOpacity>

                  {/* Actions row 
                  <View style={styles.actionsRow}>
                    
                   {/* <TouchableOpacity onPress={() => toggleReplies(item.id)}>
                      <Text style={styles.viewReplies}>
                        {repliesVisible[item.id] ? 'Hide replies' : 'View replies'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setReplyingTo(item)}>
                      <Text style={styles.replyButton}>Reply</Text>
                    </TouchableOpacity>
                  </View>
*/}
                  {/* Replies */}
                  {repliesVisible[item.id] &&
                    replies[item.id]?.map((reply) => (
                      <View key={reply.id} style={styles.replyContainer}>
                        <Image
                          source={{ uri: reply.profileImage || placeholder }}
                          style={styles.replyAvatar}
                        />
                        <View>
                          <Text style={styles.replyName}>{reply.username}</Text>
                          <Text style={styles.replyText}>{reply.text}</Text>
                        </View>
                      </View>
                    ))}
                </View>
              </View>
              </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Input bar */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={i18n.t("Write a comment")}
            value={commentText}
            onChangeText={setCommentText}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={handleCommentSubmit}>
            <Text style={styles.sendBtn}>{i18n.t('Send')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </KeyboardAvoidingView>
</Modal>
 

{isOptionsVisible && (
  <Modal
    animationType="slide"
    transparent={true}
    visible={isOptionsVisible}
    onRequestClose={() => setIsOptionsVisible(false)}
  >
    <TouchableWithoutFeedback onPress={() => setIsOptionsVisible(false)}>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "#1c1c1e",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: 30,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 20,
            }}
            onPress={() => {
              Share.share({ message: selectedComment?.text || "" });
              setIsOptionsVisible(false);
            }}
          >
            <Icon name="share-outline" size={22} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, marginLeft: 10 }}>
              {i18n.t('Share')}
            </Text>
          </TouchableOpacity>

          {user?.email === comments.find(c => c.id === selectedComment?.id)?.userId && (
            <>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 20,
                }}
                onPress={handleEdit}
              >
                <Icon name="pencil-outline" size={22} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 16, marginLeft: 10 }}>
                  {i18n.t('Edit')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 20,
                }}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={22} color="red" />
                <Text style={{ color: "red", fontSize: 16, marginLeft: 10 }}>
                  {i18n.t('Delete')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
  
)}
</>
)};

const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  return (
   
    <ScrollView style={styles.container}>
       <LinearGradient
   colors={["#FFFFFF", "#eaad63ff", "#87CEEB", "#87CEEB"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={{ flex: 1 }}
>
      <Image source={{ uri: product.image }} style={styles.image} />

      <View style={styles.content}>
        {/* Title and Favorite */}
        <View style={styles.titleRow}> 
          <Text style={styles.title}>{product.name}</Text>
 </View>
 <View  style={{
    position: 'absolute',
    right: 10, 
    top: 25,   
    flexDirection: 'row',
    alignItems: 'center',
  }}>
          <Animatable.View ref={heartRef}style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={handleToggleFavorite} style={{right: 14, marginRight: 10  }}>
              <Ionicons
  name={liked ? 'heart' : 'heart-outline'}
  size={28}
  color={liked ? 'red' : '#444'}
/>
            </TouchableOpacity>

           <TouchableOpacity onPress={handleOpenComment}style={{right: 10}} >
  <Ionicons name="chatbubbles-outline" size={24} color="black" />
</TouchableOpacity>
<CommentModal
  visible={isCommentModalVisible}
  onClose={() => setIsCommentModalVisible(false)}
  productId={product.id} // make sure 'product' is loaded before this renders
  replyingTo={replyingTo}
  setReplyingTo={setReplyingTo}
/>
          </Animatable.View>
       </View>

        {ownerInfo && (
          <View style={{ position: 'absolute', top: 60, right: 20, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ position: 'absolute', top: 50, flexDirection: 'row', alignItems: 'center' }}><Text style={styles.ownerName}>{ownerInfo.username}</Text></View>
            <TouchableOpacity onPress={() => navigation.navigate('ReadOnlyProfile', { email: ownerInfo.ownerEmail })} >
            <Image
              source={{ uri: ownerInfo.profileImageUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png', }}
              style={styles.ownerImage}
            />
            </TouchableOpacity>
            
          </View>
        )}

        {/* Sold and Rating */}
        <View style={styles.subRow}>
          <Text style={styles.sold}>{i18n.t('Sold:')} {product.sold || 0}</Text>
          <TouchableOpacity
  onPress={() => {
    const user = getAuth().currentUser;

    if (!user) {
      Toast.show({
        type: 'error',
        text1: i18n.t('You need to create an account'),
      });
      return;
    }

    setRatingModalVisible(true);
  }}
>
  <Text style={styles.rating}>⭐ {product.rating || i18n.t('unrated yet')}</Text>
  <Text style={styles.rating}>{i18n.t('Rate it !')} </Text>
</TouchableOpacity>

        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>{i18n.t('Description')}</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Colors */}
        <Text style={styles.sectionTitle}>{i18n.t('Available Colors')}</Text>
        <View style={styles.colorRow}>
          {product.colors.map((color, index) => (
            <View
              key={index}
              style={[styles.colorDot, { backgroundColor: color.toLowerCase() }]}
            />
          ))}
        </View>

        {/* Quantity Selectconst handleBuyNow = () => {
  const user = getAuth().currentUser;

  if (!user) {
    Toast.show({
      type: 'error',
      text1: 'You need to create an account to continue',
    });
    return;
  }
or */}
        <Text style={styles.sectionTitle}>{i18n.t('Quantity')}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.qtyButton} onPress={decreaseQty}>
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyButton} onPress={increaseQty}>
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Price and Action Buttons */}
        <View style={styles.footer}>
          <Text style={styles.price}>${(product.price * quantity).toFixed(2)}</Text>
          <View style={{ gap: 10 }}>
            <TouchableOpacity
              style={[styles.cartButton, { backgroundColor: '#6C4AB6' }]}
              onPress={() => {
                const user = getAuth().currentUser;
             if (user?.email === product.ownerEmail) {
      Toast.show({
        type: 'error',
        text1: i18n.t('ownProductError'),
      });
      return;
    }
                if (!user) {
                  ToastAndroid.show(i18n.t('⚠️ You must create an account to buy'), ToastAndroid.SHORT);
                  return;
                }
                
               handleBuyNow();
              }}
            >
              <Text style={styles.cartButtonText}>{i18n.t('Buy Now')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartButton} onPress={() => {
    const user = getAuth().currentUser;

    if (!user) {
      Toast.show({
        type: 'error',
        text1: i18n.t('pleaseCreateAccount'),
      });
      return;
    }

    handleCartToggle();
  }}>
              <Animatable.Text ref={cartTextRef} style={styles.cartButtonText}>
              <Text>{cartLabel}</Text>  
              </Animatable.Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
  visible={ratingModalVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setRatingModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>{i18n.t('Rate Product')}</Text>
      <TextInput
        placeholder={i18n.t("Enter a rating between 1 and 5")}
        style={styles.modalInput}
        keyboardType="numeric"
        value={ratingInput}
        onChangeText={setRatingInput}
      />
      <TouchableOpacity
        style={styles.modalButton}
        onPress={async () => {
          const rating = parseInt(ratingInput);

          if (isNaN(rating) || rating < 1 || rating > 5) {
            Toast.show({
              type: 'error',
              text1: i18n.t('Rating must be between 1 and 5'),
            });
            return;
          }

          try {
            const productRef = doc(db, 'products', product.id);
            const productSnap = await getDoc(productRef);
            if (!productSnap.exists()) return;

            const currentData = productSnap.data();
            const ratings: number[] = currentData.ratings || [];
            ratings.push(rating);

            const avg =
              ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length;

            await updateDoc(productRef, {
              ratings,
              rating: avg.toFixed(1),
            });

            Toast.show({
              type: 'success',
              text1: i18n.t(`Thanks for rating! ⭐`),
            });

            setRatingModalVisible(false);
            setRatingInput('');
          } catch (error) {
            console.error(error);
            Toast.show({
              type: 'error',
              text1: i18n.t('Failed to rate the product'),
            });
          }
        }}
      >
        <Text style={styles.modalButtonText}>{i18n.t('Submit Rating')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setRatingModalVisible(false)}
        style={[styles.modalButton, { backgroundColor: '#ccc' }]}
      >
        <Text style={styles.modalButtonText}>{i18n.t('Cancel')}</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

  </LinearGradient>
    </ScrollView>
  
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 320,
    resizeMode: 'contain',
    marginTop: -5,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    marginTop: -20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  subRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 20,
  },
  sold: {
    color: '#666',
    fontSize: 14,
  },
  rating: {
    fontSize: 14,
    color: '#444',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
  marginVertical: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 4,
},
rowBetween: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},
  description: {
    color: '#555',
    lineHeight: 20,
  },
  colorRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 24,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    bottom: 40,
  },
  cartButton: {
    backgroundColor: '#1E1E2E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    bottom: 77,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  ownerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
   
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 20,
  width: '80%',
  alignItems: 'center',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 12,
},
modalInput: {
  width: '100%',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 10,
  marginBottom: 16,
  fontSize: 16,
},
modalButton: {
  backgroundColor: '#007bff',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  marginTop: 8,
  width: '100%',
  alignItems: 'center',
},
modalButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},

centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
 modalContainer1: { flex: 1, padding: 16, backgroundColor: '#fff' },
  
  emojiToggle: { fontSize: 24 },
 
replyItem: {
  flexDirection: 'row',
  alignItems: 'center',
},


 container1: {
    backgroundColor: 'white',
  },
  // ... other styles
  replyingToBanner: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    marginBottom: 8,
  },

  
  
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    paddingBottom: 10,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
    alignSelf: 'center',
    marginVertical: 8,
  },
  title1: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  placeholder: {
    color: '#aaa',
    textAlign: 'center',
    paddingVertical: 20,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: { color: '#fff', fontWeight: 'bold' },
  commentText: { color: '#ddd' },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  likes: { color: '#ff5a5f' },
  viewReplies: { color: '#4da6ff' },
  replyButton: { color: '#4da6ff' },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    paddingLeft: 46,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  replyName: { color: '#fff', fontWeight: 'bold' },
  replyText: { color: '#ddd' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#333',    
  },
  input: {
    flex: 1,
    color: '#fff',
    paddingHorizontal: 10,
  },
  sendBtn: { color: '#4da6ff', fontWeight: 'bold', paddingHorizontal: 8 },
});
