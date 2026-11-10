// BottomNav.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomNavProps {
  currentRoute:
    | 'Home'
    | 'PontosDeColeta'
    | 'Reciclagem'
    | 'Impact'
    | 'PontosRecompensas'
    | 'Profile';
  navigation: any;
}

export default function BottomNav({
  currentRoute,
  navigation,
}: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 4 : 18;

  return (
    <View style={[styles.bottomNav, { paddingBottom: bottomPadding }]}>
      {/* Botão Início */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.7}
      >
        <Icon
          name={currentRoute === 'Home' ? 'home' : 'home-outline'}
          size={24}
          color={currentRoute === 'Home' ? '#005B29' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            currentRoute === 'Home' && styles.navTextActive,
          ]}
        >
          Início
        </Text>
      </TouchableOpacity>

      {/* Botão Coletas / Pontos de Coleta */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('PontosDeColeta')}
        activeOpacity={0.7}
      >
        <Icon
          name={
            currentRoute === 'PontosDeColeta'
              ? 'map-marker'
              : 'map-marker-outline'
          }
          size={24}
          color={currentRoute === 'PontosDeColeta' ? '#005B29' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            currentRoute === 'PontosDeColeta' && styles.navTextActive,
          ]}
        >
          Coletas
        </Text>
      </TouchableOpacity>

      {/* Botão Reciclagem (à esquerda do Impacto) */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Reciclagem')}
        activeOpacity={0.7}
      >
        <Icon
          name="recycle"
          size={24}
          color={currentRoute === 'Reciclagem' ? '#005B29' : '#005B29'}
        />
        <Text
          style={[
            styles.navText,
            currentRoute === 'Reciclagem' && styles.navTextActive,
          ]}
        >
          Reciclagem
        </Text>
      </TouchableOpacity>

      {/* Botão Impacto */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Impact')}
        activeOpacity={0.7}
      >
        <Icon
          name="leaf"
          size={24}
          color={currentRoute === 'Impact' ? '#005B29' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            currentRoute === 'Impact' && styles.navTextActive,
          ]}
        >
          Impacto
        </Text>
      </TouchableOpacity>

      {/* Botão Loja / Pontos de Recompensas */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('PontosRecompensas')}
        activeOpacity={0.7}
      >
        <Icon
          name={
            currentRoute === 'PontosRecompensas'
              ? 'storefront'
              : 'storefront-outline'
          }
          size={24}
          color={currentRoute === 'PontosRecompensas' ? '#005B29' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            currentRoute === 'PontosRecompensas' && styles.navTextActive,
          ]}
        >
          Loja
        </Text>
      </TouchableOpacity>

      {/* Botão Perfil */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.7}
      >
        <Icon
          name={currentRoute === 'Profile' ? 'account' : 'account-outline'}
          size={24}
          color={currentRoute === 'Profile' ? '#005B29' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            currentRoute === 'Profile' && styles.navTextActive,
          ]}
        >
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 11,
    color: '#666',
    marginTop: 3,
  },
  navTextActive: {
    color: '#005B29',
    fontWeight: 'bold',
  },
});
