// FavoriteContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Product = {
  name: string;
  price: number;
  rating: string;
  image: any;
  sold: string;
  colors: string[];
  description: string;
};

type FavoriteContextType = {
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (product: Product) => boolean;
};

const FavoriteContext = createContext<FavoriteContextType>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
});

export const useFavorites = () => useContext(FavoriteContext);

export const FavoriteProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);

  const FAVORITES_KEY = '@favorite_products';

  // Load from storage
  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load favorites from storage', e);
    }
  };

  // Save to storage
  const saveFavorites = async (newFavorites: Product[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  };

  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.name === product.name);
      const updated = exists
        ? prev.filter((p) => p.name !== product.name)
        : [...prev, product];
      saveFavorites(updated);
       AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (product: Product) =>
    favorites.some((p) => p.name === product.name);

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
