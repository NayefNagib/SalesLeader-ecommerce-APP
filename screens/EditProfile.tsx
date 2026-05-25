import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../types/navigation";
import { LinearGradient } from "expo-linear-gradient";
import i18n from '../i18n/config';
export default function EditProfileScreen() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  useEffect(() => {
    const fetchProfile = async () => {
     const user = auth.currentUser;
      if (!user?.email) return;

      const docRef = doc(db, "users", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsername(data.username || "");
        setBio(data.bio || "");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user?.email) return;

    try {
      const userRef = doc(db, "users", user.email);
      await updateDoc(userRef, {
        username,
        bio,
      });

      Alert.alert(i18n.t("Success"), i18n.t("Profile updated"));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(i18n.t("Error"), error.message || i18n.t("Failed to update profile"));
    }
  };

  return (
    <LinearGradient
      colors={["#0a0a0f", "#0d1b2a", "#000000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>{i18n.t('Edit Profile')}</Text>

        <Text style={styles.label}>{i18n.t('Username')}</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholder={i18n.t('Edit Profile')}
          placeholderTextColor="rgba(255,255,255,0.5)"
        />

        <Text style={styles.label}>{i18n.t('Bio')}</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={[styles.input, { height: 100 }]}
          placeholder={i18n.t('Enter your bio')}
          placeholderTextColor="rgba(255,255,255,0.5)"
          multiline
        />

        <Text style={styles.label}>{i18n.t('Email (Read-only)')}</Text>
        <TextInput
          value={email}
          editable={false}
          style={[styles.input, { opacity: 0.6 }]}
          placeholder={i18n.t('Email')}
          placeholderTextColor="rgba(255,255,255,0.4)"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>{i18n.t('Save Changes')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e0e0e0",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
    color: "#d1d5db", // dark white tone
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)", // soft glowing edge
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.05)", // frosted glass effect
    color: "#fff",
  },
  button: {
    backgroundColor: "#1e293b",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#fff",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: "#f8fafc",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
