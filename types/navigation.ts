// Product type
import { Timestamp } from "firebase/firestore";
import { Animated } from "react-native";
export type Product = {
  id: string;
  name: string;
  price: number;
  rating: string;
  image: any;
  sold: string;
  colors: string[];
  description: string;
  createdAt?: Timestamp;
  
   ownerEmail: string; // ADD THIS — used to notify seller
  globalId: string; // ADD THIS — needed for cart reference
  quantity?: number ;
};

// This is not "products" — this is buyer info
export type BuyerInfo = {
  country: string;
  governorate: string;
  city: string;
  phone: string;
  buyeremail: string;
}; 

// Navigation Types
export type RootStackParamList = {
  Home: {
    navigateToProductId?: string;
  } | undefined;

  ProductDetails: {
    product: Product;
  };

  ProductDetail: {
    product: Product;
  };

  BuyerLocation: {
    product: Product;
    
  };

  OrderSummary: {
    product: Product;
    buyerInfo: BuyerInfo;
  };

  Search: undefined;
  MainTabs: undefined;

  PopularProducts: {
    tabOffset: Animated.Value;
  };
Notification:{
    email: string;
      id?: string;
      title?: string;
      message?: string;
      read?: boolean; // 👈 now TypeScript knows about it
    
  };
  LanguageSelection: undefined; // <-- add this
  ReadOnlyProfile: {
    email: string;
  };
   OrderDetails: {
    buyerInfo: any;
    buyerProfile: any;
    product: any;
    quantity: number;
  };
  
  Cart: undefined;
    Login: undefined;
  Profile: undefined;
};

// types/tab.ts
export type RootTabParamList = {
  Home: undefined;
  Cart: undefined;
  Grid: undefined;
  Favorites: undefined;
  Profile: undefined;
  
};

// types/navigation.ts
export type ProfileStackParamList = {
  AuthGate: undefined;
  Register: undefined;
  Profile: undefined;
  Login: undefined;
  SocialMedia: undefined;
  EditProfile: undefined;
  AuthLoading: undefined;
  Payment: undefined;
  MyStore: undefined;
  ProductDetails: { product: Product };
  

};
