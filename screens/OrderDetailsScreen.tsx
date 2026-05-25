import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '../i18n/config';
type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

export default function OrderDetailsScreen({ route, navigation }: Props) {
  const { buyerInfo, buyerProfile, product, quantity } = route.params;

  return (
    <LinearGradient
      colors={['#0a0a23', '#000', '#b8860b']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{i18n.t('Order Details')}</Text>

        {/* Buyer Info */}  
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{i18n.t('Buyer Information')}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ReadOnlyProfile', { email: buyerInfo?.buyeremail })
              }
            >
              <Image
                source={{
                  uri:
                    buyerProfile?.profileImageUrl ||
                    'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                }}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <Text style={styles.username}>
              {buyerProfile?.username || 'Unknown Buyer'}
            </Text>
          </View>
          <Text style={styles.text}>{i18n.t('📍 Country:')} {buyerInfo?.country}</Text>
          <Text style={styles.text}>{i18n.t('🏛 Governorate: ')}{buyerInfo?.governorate}</Text>
          <Text style={styles.text}>{i18n.t('🏙 City:')} {buyerInfo?.city}</Text>
          <Text style={styles.text}>{i18n.t('📞 Phone:')} {buyerInfo?.phone}</Text>
        </View>

        {/* Product Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{i18n.t('Product Ordered')}</Text>
          <Image source={{ uri: product?.image }} style={styles.productImage} />
          <Text style={styles.text}>{i18n.t('🛍 Name:')} {product?.name}</Text> 
          <Text style={styles.text}>{i18n.t('🔢 Quantity:')} {quantity}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(10, 10, 35, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginRight: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  productImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
});
