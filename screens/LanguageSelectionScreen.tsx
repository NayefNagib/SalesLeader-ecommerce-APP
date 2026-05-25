import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
// 👇 import your changeLanguage function
import { changeLanguage } from "../i18n/config"; // adjust the path to where your i18n function lives

type Props = NativeStackScreenProps<RootStackParamList, "LanguageSelection">;

export default function LanguageSelectionScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await AsyncStorage.getItem("appLanguage");
      if (lang) {
        changeLanguage(lang as 'en' | 'ar'); // make sure app is initialized with stored language
        navigation.replace("Home");
      } else {
        setLoading(false);
      }
    };
    checkLanguage();
  }, [navigation]);

  const selectLanguage = async (lang: string) => {
  await AsyncStorage.setItem("appLanguage", lang);
  await AsyncStorage.setItem("hasSeenLanguageScreen", "true"); // 👈 save flag
  changeLanguage(lang as "en" | "ar");
  navigation.replace("Home");
};

  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your language</Text>
      <TouchableOpacity style={styles.button} onPress={() => selectLanguage("en")}>
        <Text>English</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => selectLanguage("ar")}>
        <Text>العربية</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, marginBottom: 20 },
  button: {
    padding: 15,
    backgroundColor: "#ddd",
    marginVertical: 10,
    borderRadius: 10,
  },
});
