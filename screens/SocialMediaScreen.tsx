import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Image,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import i18n from '../i18n/config';
export default function SocialMediaScreen() {
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      const user = auth.currentUser;
      if (!user?.email) return;

      const userRef = doc(db, "users", user.email);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setInstagram(data.instagram || "");
        setTwitter(data.twitter || "");
        setFacebook(data.facebook || "");
        setWhatsapp(data.whatsapp || "");
        setIsEditing(false);
      }
    };


    fetchLinks();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user?.email) return;

    try {
      await setDoc(
        doc(db, "users", user.email),
        { instagram, twitter, facebook, whatsapp },
        { merge: true }
      );
      setIsEditing(false);
      Alert.alert(i18n.t("Success"), i18n.t("Social media links saved!"));
    } catch (error) {
      console.error("Error saving links:", error);
      Alert.alert("Error", "Failed to save links.");
    }
  };

  const extractUsername = (url: string) => {
    if (!url) return "";
    const cleanUrl = url.replace(/\/+$/, "");
    const parts = cleanUrl.split("/");
    return "@" + parts[parts.length - 1];
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(i18n.t("Copied"), i18n.t(`copied to clipboard`));
  };

  const renderLink = (label: string, url: string, iconUri: string) => (
    <View style={styles.linkBox}>
      <View style={styles.row}>
        <Image source={{ uri: iconUri }} style={styles.icon} />
        <Text style={styles.label}>{label}:</Text>
      </View>
      {url ? (
        <TouchableOpacity
          onPress={() => Linking.openURL(url)}
          onLongPress={() => copyToClipboard(extractUsername(url))}
        >
          <Text style={styles.link}>{extractUsername(url)}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.notSet}>{i18n.t('Not set')}</Text>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={["#4B2E2A", "#8B0000", "#3B1C1C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{i18n.t('Social Media Links')}</Text>

        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              placeholder={i18n.t('Instagram URL')}
              placeholderTextColor="#ccc"
              value={instagram}
              onChangeText={setInstagram}
            />
            <TextInput
              style={styles.input}
              placeholder={i18n.t("Twitter URL")}
              placeholderTextColor="#ccc"
              value={twitter}
              onChangeText={setTwitter}
            />
            <TextInput
              style={styles.input}
              placeholder={i18n.t("Facebook URL")}
              placeholderTextColor="#ccc"
              value={facebook}
              onChangeText={setFacebook}
            />
            <TextInput
              style={styles.input}
              placeholder={i18n.t("WhatsApp Number or link")}
              placeholderTextColor="#ccc"
              value={whatsapp}
              onChangeText={setWhatsapp}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>{i18n.t('Save')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {renderLink(
              "Instagram",
              instagram,
              "https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
            )}
            {renderLink(
              "Twitter",
              twitter,
              "https://cdn-icons-png.flaticon.com/512/733/733579.png"
            )}
            {renderLink(
              "Facebook",
              facebook,
              "https://cdn-icons-png.flaticon.com/512/733/733547.png"
            )}
            {renderLink(
              "WhatsApp",
              whatsapp,
              "https://cdn-icons-png.flaticon.com/512/733/733585.png"
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.saveText}>{i18n.t('Edit')}</Text>
            </TouchableOpacity>
          </>
        )}
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#FFD700", // gold title
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  saveButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  saveText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkBox: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 6,
    color: "#FFD700",
  },
  link: {
    color: "#fff",
    textDecorationLine: "underline",
    fontSize: 16,
    marginTop: 6,
  },
  notSet: {
    color: "#ccc",
    fontStyle: "italic",
    marginTop: 6,
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
