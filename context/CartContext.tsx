import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/navigation';

type CartContextType = {
  cartItems: Product[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (product: Product) => Promise<void>;
  isInCart: (product: Product) => boolean;
  toggleCartItem: (product: Product) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<Product[]>([]);

  useEffect(() => {
    const loadCart = async () => {
      const storedCart = await AsyncStorage.getItem('cartItems');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    };
    loadCart();
  }, []);

  const saveCart = async (items: Product[]) => {
    setCartItems(items);
    
    await AsyncStorage.setItem('cartItems', JSON.stringify(items));
  };     

  const addToCart = async (product: Product) => { 
    const updatedCart = [...cartItems, product]; 
    setCartItems(updatedCart);
    AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
    await saveCart(updatedCart);
  };

  const removeFromCart = async (product: Product) => {
    const updatedCart = cartItems.filter((item) => item.id !== product.id);
    AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart)); 
    await saveCart(updatedCart);
  };
useEffect(() => {
  AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));
}, [cartItems]);

  const isInCart = (product: Product) => {
    return cartItems.some((item) => item.id === product.id);
  };

  const toggleCartItem = async (product: Product) => {
    if (isInCart(product)) {
      await removeFromCart(product);
    } else {
      await addToCart(product);
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, isInCart, toggleCartItem }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
