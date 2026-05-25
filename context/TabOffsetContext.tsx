// context/TabOffsetContext.tsx
import React, { createContext } from 'react';
import { Animated } from 'react-native';

export const TabOffsetContext = createContext<Animated.Value | null>(null);
