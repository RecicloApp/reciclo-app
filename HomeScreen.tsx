import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Image,
} from 'react-native';
import BottomNav from './BottomNav';
import { supabase } from './supabase';

export default function HomeScreen({ navigation }: any) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [userName, setUserName] = useState('Yurihsb03');

  // Busca os dados do usuário direto do auth.getUser() (igual à ProfileScreen)
  const loadUserData = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        if (user.user_metadata) {
          const nameFound =
            user.user_metadata.full_name ||
            user.email?.split('@')[0] ||
            'Usuário';
          const avatarFound = user.user_metadata.avatar_url || null;

          setUserName(nameFound);
          setAvatarUri(avatarFound);
        }
      }
    } catch (error) {
      console.log('Erro ao buscar dados do usuário na Home:', error);
    }
  };

  useEffect(() => {
    loadUserData();

    // Atualiza a foto e o nome sempre que você voltar para a Home
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.mainWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#E8ECE9" />

        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.logoText}>ReCiclo</Text>

          {/* Botão de Perfil integrado com a mesma foto e nome da ProfileScreen */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileHeaderButton}
            activeOpacity={0.8}
          >
            <View style={styles.userIconButton}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.userAvatarImage}
                />
              ) : (
                <Text style={styles.userIconText}>👤</Text>
              )}
            </View>
            <Text style={styles.headerUserName} numberOfLines={1}>
              {userName}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Título Principal */}
        <View style={styles.heroSection}>
          <Text style={styles.tagline}>
            🍃 PEQUENAS AÇÕES, GRANDES MUDANÇAS.
          </Text>
          <Text style={styles.heroTitle}>
            Recicle de forma simples. Transforme o seu impacto.
          </Text>
          <Text style={styles.heroSubtitle}>
            Encontre pontos de coleta, registre suas reciclagens e acompanhe
            suas ações sustentáveis em um só lugar.
          </Text>
        </View>

        {/* Box do Mapa / Pontos de Coleta */}
        <TouchableOpacity
          style={styles.mapCardContainer}
          onPress={() => navigation.navigate('PontosDeColeta')}
          activeOpacity={0.9}
        >
          <View style={styles.mapCardInner}>
            <View style={styles.mapCardHeaderRow}>
              <Text style={styles.mapCardTitle}>
                Pontos de coleta perto de você
              </Text>
              <Text style={styles.mapCardActionLink}>Ver mapa →</Text>
            </View>

            <View style={styles.mapMockPlaceholder}>
              <Text style={styles.mapMockText}>
                🗺️ Toque para abrir o mapa e locais próximos
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Seção de Passos / Funcionalidades */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            🌱 Tudo o que você precisa para reciclar melhor.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate('PontosDeColeta')}
          activeOpacity={0.8}
        >
          <Text style={styles.featureNumber}>01 🍃</Text>
          <Text style={styles.featureTitle}>Encontre um ponto de coleta</Text>
          <Text style={styles.featureDescription}>
            Localize pontos adequados e veja os materiais aceitos.
          </Text>
        </TouchableOpacity>

        <View style={styles.featureCard}>
          <Text style={styles.featureNumber}>02 ♻️</Text>
          <Text style={styles.featureTitle}>Registre sua reciclagem</Text>
          <Text style={styles.featureDescription}>
            Mantenha um registro das suas ações sustentáveis.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureNumber}>03 🌳</Text>
          <Text style={styles.featureTitle}>Acompanhe seu impacto</Text>
          <Text style={styles.featureDescription}>
            Veja indicadores, pontuação e conquistas.
          </Text>
        </View>
      </ScrollView>

      {/* Barra de Navegação Inferior Padronizada */}
      <BottomNav currentRoute="Home" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#E8ECE9',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006400',
  },
  profileHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#DDE3E0',
    maxWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#006400',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
  },
  userIconText: {
    fontSize: 16,
  },
  headerUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  heroSection: {
    marginBottom: 25,
  },
  tagline: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 8,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  mapCardContainer: {
    backgroundColor: '#006400',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  mapCardInner: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  mapCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  mapCardActionLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#006400',
  },
  mapMockPlaceholder: {
    backgroundColor: '#F0F2F1',
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#E2E8F4',
  },
  mapMockText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  featureCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDE3E0',
  },
  featureNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
