import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ProfileStackParamList } from "../types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native"; 
import i18n from '../i18n/config';
type Props = NativeStackScreenProps<ProfileStackParamList, "MyStore">;

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

const MyStoreScreen: React.FC<Props> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const user = getAuth().currentUser;

  const fetchStoreProducts = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "products"),
        where("ownerEmail", "==", user.email)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Product)
      );
      setProducts(data);
    } catch (err) {
      console.error(i18n.t("Error fetching store products:"), err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(i18n.t("Delete Product"), i18n.t("Are you sure you want to delete this?"), [
      { text: i18n.t("Cancel"), style: "cancel" },
      {
        text: i18n.t("Delete"),
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingId(id);
            await deleteDoc(doc(db, "products", id));
            setProducts((prev) => prev.filter((p) => p.id !== id));
          } catch (err) {
            console.error("Error deleting product:", err);
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <LinearGradient
        colors={["#8B0000", "#001F3F"]} // red → dark navy
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() =>
            navigation.dispatch(
                                CommonActions.navigate({
                                  name: 'Home',
                                  params: {
                                    screen: 'ProductDetails',
                                    params: { product: item },
                                  },
                                })
                              )
          }
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.details}>
            <Text style={styles.cardText}>{item.name}</Text>
            <Text style={styles.cardText}>${item.price.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
          disabled={deletingId === item.id}
        >
          {deletingId === item.id ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="trash" size={20} color="white" />
          )}
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderSkeleton = () => (
    <SkeletonPlaceholder borderRadius={16}>
      <View style={styles.card}>
        <View style={styles.image} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ width: "60%", height: 20, marginBottom: 6 }} />
          <View style={{ width: "40%", height: 16 }} />
        </View>
      </View>
    </SkeletonPlaceholder>
  );

  return (
    <LinearGradient
      colors={["#001F3F", "#FFFFFF"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={{ flex: 1, padding: 16 }}>
        {loading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                {renderSkeleton()}
              </View>
            ))}
          </>
        ) : products.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="storefront" size={64} color="#FFD700" />
            <Text style={styles.placeholderText}>{i18n.t('No products in your store')}</Text>
            <Text style={{ color: "#FFD700", marginTop: 6 }}>
              {i18n.t('Add products to start selling 🚀')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 3,
    borderColor: "#FFD700", // gold border
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "blue", // blue glow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  },
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  cardText: {
    color: "#FFD700", // all gold text
    fontWeight: "600",
    fontSize: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#EEE",
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#B91C1C",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFD700",
    marginTop: 12,
  },
});

export default MyStoreScreen;
