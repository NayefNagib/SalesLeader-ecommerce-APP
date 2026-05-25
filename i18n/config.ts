import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en';
import ar from './ar';

const i18n = new I18n({
  en,
  ar,
});

i18n.enableFallback = true;

export const initI18n = async () => {
  const lang = await AsyncStorage.getItem('appLanguage');
  i18n.locale = lang || 'en';
};

export const changeLanguage = async (lang: 'en' | 'ar') => {
  await AsyncStorage.setItem('appLanguage', lang);
  i18n.locale = lang;
};

export default i18n;
