import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Image,
} from 'react-native';
import { supabase } from './supabase';
import BottomNav from './BottomNav';
import Header from './Header'; // Importando o cabeçalho padronizado

export default function ImpactScreen({ navigation }: any) {
  // TODOS OS HOOKS DECLARADOS NO TOPO ABSOLUTO (Nunca dentro de condições)
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [totalKg, setTotalKg] = useState(0);
  const [totalColetas, setTotalColetas] = useState(0);
  const [dadosMensais, setDadosMensais] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [selectedPeriod, setSelectedPeriod] = useState('Mês');

  const periods = ['Hoje', 'Semana', 'Mês', 'Ano', 'Total'];
  const mesesNomes = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  useEffect(() => {
    fetchUserDataAndColetas();
  }, []);

  const fetchUserDataAndColetas = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        if (user.user_metadata) {
          setNome(user.user_metadata.full_name || 'Usuário');
          setAvatarUri(user.user_metadata.avatar_url || null);
        }

        const { data: coletas, error: coletaError } = await supabase
          .from('coletas')
          .select('*')
          .eq('user_id', user.id);

        if (!coletaError && coletas) {
          let somaKgTotal = 0;
          const mensaisTemp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

          coletas.forEach(item => {
            const pesoItem = Number(item.peso) || 0;
            somaKgTotal += pesoItem;

            if (item.data_coleta) {
              let mesIndex = -1;
              if (item.data_coleta.includes('/')) {
                const partes = item.data_coleta.split('/');
                if (partes.length >= 2) {
                  mesIndex = parseInt(partes[1], 10) - 1;
                }
              } else if (item.data_coleta.includes('-')) {
                const partes = item.data_coleta.split('-');
                if (partes.length >= 2) {
                  mesIndex = parseInt(partes[1], 10) - 1;
                }
              }

              if (mesIndex >= 0 && mesIndex < 12) {
                mensaisTemp[mesIndex] += pesoItem;
              }
            }
          });

          setTotalKg(somaKgTotal);
          setTotalColetas(coletas.length);
          setDadosMensais(mensaisTemp);
        }
      }
    } catch (error: any) {
      console.log('Erro ao buscar dados:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const maxBarValue = Math.max(...dadosMensais, 35);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#006400" />

      {/* Cabeçalho Verde Padronizado */}
      <Header />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Saudação */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greetingText}>Olá,</Text>
          <Text style={styles.userNameText}>{nome || 'Seu nome!'}</Text>
          <Text style={styles.welcomeSubtitle}>
            Pequenas ações, grandes mudanças.{'\n'}
            Veja como você está contribuindo para um futuro mais sustentável.
          </Text>
        </View>

        {/* Seletor de Período (Abas) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.periodContainer}
        >
          {periods.map(period => {
            const isSelected = selectedPeriod === period;
            return (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  isSelected && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodText,
                    isSelected && styles.periodTextActive,
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Cards de Métricas Principais */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>♻️</Text>
            <Text style={styles.metricValue}>{totalKg.toFixed(1)} kg</Text>
            <Text style={styles.metricLabel}>Materiais reciclados</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🍃</Text>
            <Text style={styles.metricValue}>{totalColetas}</Text>
            <Text style={styles.metricLabel}>Coletas realizadas</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>☁️</Text>
            <Text style={styles.metricValue}>
              {(totalKg * 1.5).toFixed(1)} kg
            </Text>
            <Text style={styles.metricLabel}>CO₂ evitado</Text>
          </View>
        </View>

        {/* Banner Motivacional */}
        <View style={styles.bannerContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              Pequenas ações, grandes mudanças.
            </Text>
            <Text style={styles.bannerSubtitle}>
              Continue reciclando e construindo um mundo melhor
            </Text>
          </View>
          <View style={styles.bannerEarth}>
            <Text style={{ fontSize: 36 }}>🌍</Text>
          </View>
        </View>

        {/* Seção Seu Progresso (Meta) */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Seu progresso</Text>
            <TouchableOpacity>
              <Text style={styles.linkAction}>Ver detalhes ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContent}>
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercent}>
                  {Math.min(Math.round((totalKg / 30) * 100), 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressMetaLabel}>Meta do mês</Text>
              <Text style={styles.progressMetaValues}>
                {totalKg.toFixed(1)} kg de 30 kg
              </Text>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min((totalKg / 30) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressRemaining}>
                {totalKg >= 30
                  ? 'Meta atingida parabéns! 🎉'
                  : `Faltam ${(30 - totalKg).toFixed(
                      1,
                    )} kg para atingir sua meta!`}
              </Text>
            </View>
          </View>
        </View>

        {/* Impacto Equivalente Dinâmico */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Impacto equivalente</Text>
          <Text style={styles.sectionSubTitle}>
            Seu esforço gera resultados reais.
          </Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🌲</Text>
            <Text style={styles.metricValue}>{Math.floor(totalKg / 10)}</Text>
            <Text style={styles.metricLabel}>Árvores preservadas</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>💧</Text>
            <Text style={styles.metricValue}>
              {Math.floor(totalKg * 7.5)} L
            </Text>
            <Text style={styles.metricLabel}>de água economizada</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>💡</Text>
            <Text style={styles.metricValue}>
              {Math.floor(totalKg * 5)} kWh
            </Text>
            <Text style={styles.metricLabel}>de energia economizada</Text>
          </View>
        </View>

        {/* Histórico de Impacto (Gráfico de Barras Vinculado ao Banco de Dados) */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Histórico de impacto</Text>
            <TouchableOpacity>
              <Text style={styles.linkAction}>Ver por período ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chartBarsRow}>
              {mesesNomes.map((mes, index) => {
                const valorMes = dadosMensais[index];
                const alturaBarra =
                  maxBarValue > 0
                    ? Math.max((valorMes / maxBarValue) * 70, 4)
                    : 4;
                const isCurrentMonth = index === new Date().getMonth();

                return (
                  <View key={mes} style={styles.chartBarWrapper}>
                    {valorMes > 0 && (
                      <View style={styles.chartTooltip}>
                        <Text style={styles.chartTooltipText}>
                          {valorMes} kg
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.chartBar,
                        { height: alturaBarra },
                        isCurrentMonth && { backgroundColor: '#2E8B57' },
                      ]}
                    />
                    <Text style={styles.chartLabel}>{mes}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Conquistas */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Conquistas</Text>
            <TouchableOpacity>
              <Text style={styles.linkAction}>Ver todas ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsRow}
          >
            <View style={styles.achievementCard}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>🍃</Text>
              <Text style={styles.achievementTitle}>Primeira coleta</Text>
              <Text style={styles.achievementSub}>
                {totalColetas > 0
                  ? 'Você deu o primeiro passo!'
                  : 'Aguardando 1ª coleta'}
              </Text>
              <Text style={styles.achievementDate}>
                {totalColetas > 0 ? 'Conquistado' : 'Bloqueado'}
              </Text>
            </View>

            <View style={styles.achievementCard}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>🏅</Text>
              <Text style={styles.achievementTitle}>5 coletas</Text>
              <Text style={styles.achievementSub}>
                Constância gera impacto!
              </Text>
              <Text style={styles.achievementDate}>
                {totalColetas >= 5 ? 'Conquistado' : `${totalColetas}/5`}
              </Text>
            </View>

            <View style={styles.achievementCard}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>♻️</Text>
              <Text style={styles.achievementTitle}>10 kg reciclados</Text>
              <Text style={styles.achievementSub}>Você já reciclou 10 kg!</Text>
              <Text style={styles.achievementDate}>
                {totalKg >= 10 ? 'Conquistado' : `${totalKg.toFixed(1)}/10 kg`}
              </Text>
            </View>

            <View style={[styles.achievementCard, styles.achievementLocked]}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>🔒</Text>
              <Text style={styles.achievementTitle}>50 kg reciclados</Text>
              <Text style={styles.achievementSub}>Continue assim!</Text>
              <View style={styles.lockProgressBar}>
                <View
                  style={[
                    styles.lockProgressFill,
                    {
                      width: `${Math.min((totalKg / 50) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.achievementDate}>
                {totalKg.toFixed(1)}/50 kg
              </Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Barra de Navegação Inferior Fixa */}
      <BottomNav navigation={navigation} currentRoute="Impact" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECE9',
  },
  contentContainer: {
    paddingBottom: 110,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 16,
    color: '#444',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  periodContainer: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDE3E0',
  },
  periodButtonActive: {
    backgroundColor: '#006400',
    borderColor: '#006400',
  },
  periodText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  metricCard: {
    backgroundColor: '#FFF',
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE3E0',
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  bannerContainer: {
    backgroundColor: '#006400',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#D0E1D4',
    fontSize: 11,
    lineHeight: 15,
  },
  bannerEarth: {
    marginLeft: 10,
  },
  cardSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDE3E0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
  },
  linkAction: {
    fontSize: 12,
    color: '#006400',
    fontWeight: 'bold',
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircleContainer: {
    marginRight: 16,
  },
  progressCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 5,
    borderColor: '#006400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006400',
  },
  progressInfo: {
    flex: 1,
  },
  progressMetaLabel: {
    fontSize: 11,
    color: '#666',
  },
  progressMetaValues: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E2E8E4',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#006400',
  },
  progressRemaining: {
    fontSize: 10,
    color: '#777',
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionSubTitle: {
    fontSize: 11,
    color: '#666',
  },
  chartContainer: {
    marginTop: 10,
    paddingTop: 10,
  },
  chartBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  chartBar: {
    width: 12,
    backgroundColor: '#006400',
    borderRadius: 4,
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 9,
    color: '#666',
  },
  chartTooltip: {
    position: 'absolute',
    top: -22,
    backgroundColor: '#006400',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chartTooltipText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  achievementsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  achievementCard: {
    backgroundColor: '#F8F9F8',
    borderWidth: 1,
    borderColor: '#E2E8E4',
    borderRadius: 10,
    padding: 10,
    width: 130,
    marginRight: 10,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementSub: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  achievementDate: {
    fontSize: 8,
    color: '#999',
  },
  lockProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8E4',
    borderRadius: 2,
    marginVertical: 4,
    overflow: 'hidden',
  },
  lockProgressFill: {
    height: '100%',
    backgroundColor: '#006400',
  },
});
