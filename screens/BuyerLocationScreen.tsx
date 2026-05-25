import Animated, { FadeInUp } from 'react-native-reanimated';
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getAuth } from 'firebase/auth';
import Svg, { Circle } from 'react-native-svg';
import i18n from '../i18n/config';
import Toast from 'react-native-toast-message';
type Props = NativeStackScreenProps<RootStackParamList, 'BuyerLocation'>;

const { width, height } = Dimensions.get('window');

export default function BuyerLocationScreen({ navigation, route }: Props) {
  const { product } = route.params;
  const [country, setCountry] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const user =getAuth().currentUser?.email || 'guest';

  const handleContinue = () => {
    if (!country || !governorate || !city || !phone) {
     return ToastAndroid.show((i18n.t('Please fill all fields')), ToastAndroid.SHORT);
    };
    
    navigation.navigate('OrderSummary', {
      product: product, // fixed typo
      buyerInfo: { country, governorate, city, phone ,buyeremail: user },
    });
  };
 
  return (
    <View style={styles.root}>
      {/* Background Bubbles */}
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        <Circle cx={width * 0.2} cy={height * 0.2} r="100" fill="rgba(0,0,0,0.1)" />
        <Circle cx={width * 0.8} cy={height * 0.4} r="120" fill="rgba(0,0,0,0.15)" />
        <Circle cx={width * 0.5} cy={height * 0.8} r="90" fill="rgba(0,0,0,0.1)" />
      </Svg>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          <Animated.Text entering={FadeInUp.delay(200)} style={styles.title}>
            {i18n.t('Enter Your Delivery Info')}
          </Animated.Text>

          <TextInput
            placeholder={i18n.t("Country")}
            value={country}
            onChangeText={setCountry}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TextInput
            placeholder={i18n.t("Governorate")}
            value={governorate}
            onChangeText={setGovernorate}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TextInput
            placeholder={i18n.t("City")}
            value={city}
            onChangeText={setCity}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TextInput
            placeholder={i18n.t("Phone Number")}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>{i18n.t('Continue')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentContainer: {
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
