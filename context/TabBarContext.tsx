// context/TabBarContext.tsx
import React, { createContext, useRef, useState } from 'react';
import { Animated } from 'react-native';

type TabBarContextType = {
  tabOffset: Animated.Value;
  toggleTab: () => void;
};

export const TabBarContext = createContext<TabBarContextType>({
  tabOffset: new Animated.Value(0),
  toggleTab: () => {},
});

export const TabBarProvider = ({ children }: { children: React.ReactNode }) => {
  const tabOffset = useRef(new Animated.Value(0)).current;
  const isHidden = useRef(false); // ← track visibility manually

  const toggleTab = () => {
    Animated.timing(tabOffset, {
      toValue: isHidden.current ? 0 : 100, // ← if hidden, show; if visible, hide
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      isHidden.current = !isHidden.current;
    });
  };

  return (
    <TabBarContext.Provider value={{ tabOffset, toggleTab }}>
      {children}
    </TabBarContext.Provider>
  );
};
