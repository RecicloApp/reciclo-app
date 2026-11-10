import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Header() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoWrapper}>
        <View style={styles.logoRow}>
          <Text style={styles.logoTextMain}>Re</Text>
          <View style={styles.logoLeafContainer}>
            <Icon name="leaf" size={24} color="#ffffff" />
          </View>
          <Text style={styles.logoTextMain}>ciclo</Text>
          <View style={styles.logoRecycleBadge}>
            <Icon name="recycle" size={16} color="#006400" />
          </View>
        </View>
        <View style={styles.logoSubtitleRow}>
          <View style={styles.logoLine} />
          <Text style={styles.logoSubtitleText}>
            PEQUENAS AÇÕES, GRANDES MUDANÇAS.
          </Text>
          <View style={styles.logoLine} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#006400',
    // Dá o espaçamento no teto considerando a barra de status do Android/iOS
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 10 : 35,
    // Aumenta a espessura para baixo
    paddingBottom: 28,
    paddingHorizontal: 20,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoWrapper: {
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextMain: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -1,
  },
  logoLeafContainer: {
    marginHorizontal: 1,
  },
  logoRecycleBadge: {
    marginLeft: 6,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    width: 260,
  },
  logoLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#81c784',
  },
  logoSubtitleText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.8,
    marginHorizontal: 4,
  },
});
