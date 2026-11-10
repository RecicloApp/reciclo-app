import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import BottomNav from './BottomNav';
import Header from './Header'; // Importando o cabeçalho padronizado

export default function PontosRecompensasScreen({ navigation }: any) {
  // Hooks declarados rigorosamente no topo
  const [totalPontos, setTotalPontos] = useState(0);
  const [historicoTransacoes, setHistoricoTransacoes] = useState<any[]>([]);
  const [modalImpostosVisible, setModalImpostosVisible] = useState(false);

  // Lista de impostos gerais da realidade brasileira
  const impostosDisponiveis = [
    {
      id: '1',
      nome: 'IPTU (Urbano)',
      custo: 500,
      desconto: '5% de abatimento na parcela',
    },
    {
      id: '2',
      nome: 'IPVA (Automotivo)',
      custo: 800,
      desconto: '10% de abatimento na parcela',
    },
    {
      id: '3',
      nome: 'IRPF (Imposto de Renda)',
      custo: 1200,
      desconto: '15% de abatimento na guia',
    },
    {
      id: '4',
      nome: 'Licenciamento / Taxas DETRAN',
      custo: 400,
      desconto: '5% de abatimento',
    },
    {
      id: '5',
      nome: 'ITCMD (Transmissão Causa Mortis/Doação)',
      custo: 1000,
      desconto: '12% de abatimento',
    },
  ];

  useEffect(() => {
    carregarPontosEHistorico();

    // Executa toda vez que a tela ganha foco (quando você clica no menu e volta para ela)
    const unsubscribe = navigation?.addListener?.('focus', () => {
      carregarPontosEHistorico();
    });

    return unsubscribe;
  }, [navigation]);

  const carregarPontosEHistorico = async () => {
    try {
      // 1. Carrega o total de pontos já gastos e o histórico de resgates salvos no celular
      const gastosSalvos = await AsyncStorage.getItem('@reciclo_pontos_gastos');
      const historicoSalvo = await AsyncStorage.getItem(
        '@reciclo_historico_resgates',
      );

      const totalPontosGastos = gastosSalvos ? JSON.parse(gastosSalvos) : 0;
      const listaResgatesSalvos = historicoSalvo
        ? JSON.parse(historicoSalvo)
        : [];

      // 2. Busca o histórico de coletas no Supabase para somar os pontos ganhos
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let ganhoTotalColetas = 0;
      let historicoColetas: any[] = [];

      if (user) {
        const { data: coletas, error } = await supabase
          .from('coletas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && coletas && coletas.length > 0) {
          historicoColetas = coletas.map(item => {
            const peso = Number(item.peso) || 0;
            const pontosGanho = Math.round(peso * 100);
            ganhoTotalColetas += pontosGanho;

            return {
              id: `coleta-${item.id}`,
              pontos: `+${pontosGanho} pontos`,
              descricao: `Reciclagem de ${item.tipo_material || 'material'}`,
              data: item.data_coleta || 'Recente',
              positivo: true,
            };
          });
        }
      }

      // Se for a primeira vez e não tiver coletas, mantemos a base visual inicial (1.280 pts)
      const baseInicial = ganhoTotalColetas > 0 ? ganhoTotalColetas : 1280;
      const saldoCalculado = Math.max(baseInicial - totalPontosGastos, 0);

      setTotalPontos(saldoCalculado);

      // Une as transações de gastos salvos no dispositivo com o histórico de coletas
      if (listaResgatesSalvos.length > 0) {
        setHistoricoTransacoes([...listaResgatesSalvos, ...historicoColetas]);
      } else if (historicoColetas.length > 0) {
        setHistoricoTransacoes(historicoColetas);
      } else {
        // Histórico padrão inicial
        setHistoricoTransacoes([
          {
            id: '1',
            pontos: '+120 pontos',
            descricao: 'Reciclagem de plástico',
            data: '12 de abr. de 2024',
            positivo: true,
          },
          {
            id: '2',
            pontos: '+200 pontos',
            descricao: 'Entrega em ponto de coleta',
            data: '10 de abr. de 2024',
            positivo: true,
          },
          {
            id: '3',
            pontos: '-300 pontos',
            descricao: 'Resgate de Ecobag',
            data: '08 de abr. de 2024',
            positivo: false,
          },
        ]);
      }
    } catch (err: any) {
      console.log('Erro ao carregar dados salvos:', err.message);
    }
  };

  // Função auxiliar para salvar a compra/gasto permanentemente no armazenamento do celular
  const registrarGastoEHistorico = async (
    custoPontos: number,
    descricaoItem: string,
  ) => {
    try {
      const gastosSalvos = await AsyncStorage.getItem('@reciclo_pontos_gastos');
      const historicoSalvo = await AsyncStorage.getItem(
        '@reciclo_historico_resgates',
      );

      const totalGastosAtual = gastosSalvos ? JSON.parse(gastosSalvos) : 0;
      const listaHistoricoAtual = historicoSalvo
        ? JSON.parse(historicoSalvo)
        : [];

      const novoTotalGastos = totalGastosAtual + custoPontos;
      const novoItemHistorico = {
        id: `gasto-${Date.now()}`,
        pontos: `-${custoPontos} pontos`,
        descricao: descricaoItem,
        data: 'Hoje',
        positivo: false,
      };

      const novaListaHistorico = [novoItemHistorico, ...listaHistoricoAtual];

      // Salva no AsyncStorage
      await AsyncStorage.setItem(
        '@reciclo_pontos_gastos',
        JSON.stringify(novoTotalGastos),
      );
      await AsyncStorage.setItem(
        '@reciclo_historico_resgates',
        JSON.stringify(novaListaHistorico),
      );

      // Atualiza o estado da tela
      setTotalPontos(prev => Math.max(prev - custoPontos, 0));
      setHistoricoTransacoes(prev => [novoItemHistorico, ...prev]);
    } catch (err: any) {
      console.log('Erro ao salvar transação localmente:', err.message);
    }
  };

  const handleResgatarRecompensa = (nomeItem: string, custoPontos: number) => {
    if (totalPontos < custoPontos) {
      Alert.alert(
        'Pontos Insuficientes',
        `Você precisa de ${custoPontos} pontos para resgatar "${nomeItem}". Seu saldo atual é de ${totalPontos} pontos.`,
      );
      return;
    }

    Alert.alert(
      'Confirmar Resgate',
      `Deseja trocar ${custoPontos} pontos por "${nomeItem}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resgatar',
          onPress: async () => {
            await registrarGastoEHistorico(
              custoPontos,
              `Resgate de ${nomeItem}`,
            );
            Alert.alert(
              'Comprado!',
              `Parabéns! O seu resgate de "${nomeItem}" foi concluído com sucesso.`,
            );
          },
        },
      ],
    );
  };

  const handleConfirmarAbatimentoImposto = (
    imposto: (typeof impostosDisponiveis)[0],
  ) => {
    if (totalPontos < imposto.custo) {
      Alert.alert(
        'Pontos Insuficientes',
        `Você precisa de ${imposto.custo} pontos para abater o ${imposto.nome}. Saldo atual: ${totalPontos} pontos.`,
      );
      return;
    }

    Alert.alert(
      'Confirmar Pagamento / Abatimento',
      `Deseja utilizar ${imposto.custo} pontos para abater ${imposto.desconto} no ${imposto.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar com Pontos',
          onPress: async () => {
            await registrarGastoEHistorico(
              imposto.custo,
              `Abatimento: ${imposto.nome} (${imposto.desconto})`,
            );
            setModalImpostosVisible(false);
            Alert.alert(
              'Pagamento Registrado!',
              `Abatimento no ${imposto.nome} aplicado com sucesso!`,
            );
          },
        },
      ],
    );
  };

  const metaProximoNivel = 1500;
  const progressoPorcentagem = Math.min(
    Math.round((totalPontos / metaProximoNivel) * 100),
    100,
  );
  const pontosFaltantes = Math.max(metaProximoNivel - totalPontos, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#006400" />

      {/* Cabeçalho Verde Padronizado */}
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título Principal */}
        <Text style={styles.mainTitle}>Pontos e Recompensas</Text>
        <Text style={styles.mainSubtitle}>
          Acompanhe seus pontos e troque por benefícios sustentáveis.
        </Text>

        {/* Card de Saldo */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceLeft}>
            <View style={styles.iconContainer}>
              <Icon name="leaf" size={32} color="#006400" />
            </View>
            <View>
              <Text style={styles.balanceLabel}>Seu saldo de pontos</Text>
              <Text style={styles.balanceValue}>
                {totalPontos.toLocaleString()} pontos
              </Text>
              <View style={styles.badge}>
                <Icon
                  name="leaf"
                  size={12}
                  color="#006400"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.badgeText}>Nível Verde</Text>
              </View>
            </View>
          </View>

          <View style={styles.balanceRight}>
            <Text style={styles.progressText}>
              Faltam {pontosFaltantes} pontos{'\n'}para o próximo nível
            </Text>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressoPorcentagem}%` },
                ]}
              />
            </View>
            <Text style={styles.progressSubText}>
              {totalPontos.toLocaleString()} / 1.500 pontos
            </Text>
          </View>
        </View>

        {/* Recompensas Disponíveis */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recompensas disponíveis</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todas &gt;</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        >
          <View style={styles.rewardCard}>
            <Icon
              name="ticket-percent"
              size={40}
              color="#2e7d32"
              style={styles.rewardIcon}
            />
            <Text style={styles.rewardTitle}>Cupom de desconto</Text>
            <Text style={styles.rewardPoints}>300 pontos</Text>
            <TouchableOpacity
              style={styles.redeemButton}
              onPress={() => handleResgatarRecompensa('Cupom de desconto', 300)}
            >
              <Text style={styles.redeemButtonText}>Resgatar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rewardCard}>
            <Icon
              name="flower"
              size={40}
              color="#8d6e63"
              style={styles.rewardIcon}
            />
            <Text style={styles.rewardTitle}>Muda de planta</Text>
            <Text style={styles.rewardPoints}>500 pontos</Text>
            <TouchableOpacity
              style={styles.redeemButton}
              onPress={() => handleResgatarRecompensa('Muda de planta', 500)}
            >
              <Text style={styles.redeemButtonText}>Resgatar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rewardCard}>
            <Icon
              name="shopping"
              size={40}
              color="#a1887f"
              style={styles.rewardIcon}
            />
            <Text style={styles.rewardTitle}>Ecobag ReCiclo</Text>
            <Text style={styles.rewardPoints}>800 pontos</Text>
            <TouchableOpacity
              style={styles.redeemButton}
              onPress={() => handleResgatarRecompensa('Ecobag ReCiclo', 800)}
            >
              <Text style={styles.redeemButtonText}>Resgatar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rewardCard}>
            <Icon
              name="bottle-soda-classic"
              size={40}
              color="#2e7d32"
              style={styles.rewardIcon}
            />
            <Text style={styles.rewardTitle}>Garrafa reutilizável</Text>
            <Text style={styles.rewardPoints}>1.200 pontos</Text>
            <TouchableOpacity
              style={styles.redeemButton}
              onPress={() =>
                handleResgatarRecompensa('Garrafa reutilizável', 1200)
              }
            >
              <Text style={styles.redeemButtonText}>Resgatar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Como Ganhar Mais Pontos */}
        <Text style={styles.sectionTitle}>Como ganhar mais pontos</Text>
        <View style={styles.howToContainer}>
          <View style={styles.howToCard}>
            <Icon name="recycle" size={32} color="#006400" />
            <Text style={styles.howToTitle}>Recicle materiais</Text>
            <Text style={styles.howToDesc}>
              Separe e destine corretamente seus resíduos.
            </Text>
          </View>

          <View style={styles.howToCard}>
            <Icon name="map-marker" size={32} color="#006400" />
            <Text style={styles.howToTitle}>Leve aos pontos de coleta</Text>
            <Text style={styles.howToDesc}>
              Entregue seus materiais nos pontos parceiros.
            </Text>
          </View>

          <View style={styles.howToCard}>
            <Icon name="account-group" size={32} color="#006400" />
            <Text style={styles.howToTitle}>Participe de campanhas</Text>
            <Text style={styles.howToDesc}>
              Fique de olho nas campanhas especiais e ganhe pontos extras.
            </Text>
          </View>
        </View>

        {/* Histórico Recente */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Histórico recente</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todas &gt;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
          {historicoTransacoes.map((item, index) => (
            <View key={item.id || index} style={styles.historyItem}>
              <View
                style={[
                  styles.historyIconCircle,
                  { backgroundColor: item.positivo ? '#2e7d32' : '#d32f2f' },
                ]}
              >
                <Icon
                  name={item.positivo ? 'plus' : 'minus'}
                  size={16}
                  color="#fff"
                />
              </View>
              <View style={styles.historyInfo}>
                <Text
                  style={
                    item.positivo
                      ? styles.historyPointsPositive
                      : styles.historyPointsNegative
                  }
                >
                  {item.pontos}
                </Text>
                <Text style={styles.historyDesc}>{item.descricao}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyDate}>{item.data}</Text>
                <Icon name="chevron-right" size={18} color="#999" />
              </View>
            </View>
          ))}
        </View>

        {/* Botão de Abatimento em Impostos */}
        <View style={styles.taxSection}>
          <TouchableOpacity
            style={styles.taxButton}
            activeOpacity={0.8}
            onPress={() => setModalImpostosVisible(true)}
          >
            <Icon name="file-percent" size={24} color="#fff" />
            <Text style={styles.taxButtonText}>
              Abater Porcentagem nos Impostos
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Impostos do Governo */}
      <Modal
        visible={modalImpostosVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalImpostosVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pagamento de Impostos</Text>
            <Text style={styles.modalSubtitle}>
              Selecione qual tributo brasileiro você deseja abater com seus
              pontos acumulados:
            </Text>

            {impostosDisponiveis.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.taxOptionCard}
                onPress={() => handleConfirmarAbatimentoImposto(item)}
              >
                <View style={styles.taxOptionLeft}>
                  <Text style={styles.taxOptionName}>{item.nome}</Text>
                  <Text style={styles.taxOptionDiscount}>{item.desconto}</Text>
                </View>
                <View style={styles.taxOptionBadge}>
                  <Text style={styles.taxOptionBadgeText}>
                    {item.custo} pts
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalImpostosVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav currentRoute="PontosRecompensas" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8ECE9' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginTop: 8 },
  mainSubtitle: { fontSize: 13, color: '#666', marginTop: 2, marginBottom: 16 },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  balanceLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  balanceLabel: { fontSize: 12, color: '#666' },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006400',
    marginVertical: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, color: '#006400', fontWeight: 'bold' },
  balanceRight: { flex: 1, alignItems: 'flex-end', paddingLeft: 8 },
  progressText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
    marginBottom: 6,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#006400',
    borderRadius: 4,
  },
  progressSubText: { fontSize: 10, color: '#888', marginTop: 6 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12,
  },
  seeAllText: { fontSize: 13, color: '#006400', fontWeight: 'bold' },
  horizontalList: { marginBottom: 24 },
  rewardCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    width: 140,
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rewardIcon: { marginVertical: 8 },
  rewardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    height: 32,
  },
  rewardPoints: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#006400',
    marginVertical: 6,
  },
  redeemButton: {
    borderWidth: 1,
    borderColor: '#006400',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  redeemButtonText: { color: '#006400', fontSize: 12, fontWeight: 'bold' },
  howToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  howToCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    elevation: 1,
  },
  howToTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  howToDesc: { fontSize: 10, color: '#666', textAlign: 'center' },
  historyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: { flex: 1 },
  historyPointsPositive: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  historyPointsNegative: { fontSize: 13, fontWeight: 'bold', color: '#d32f2f' },
  historyDesc: { fontSize: 12, color: '#666' },
  historyRight: { alignItems: 'flex-end' },
  historyDate: { fontSize: 10, color: '#999', marginBottom: 2 },
  taxSection: { marginTop: 24, marginBottom: 10 },
  taxButton: {
    backgroundColor: '#006400',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
  },
  taxButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 6,
  },
  modalSubtitle: { fontSize: 13, color: '#666', marginBottom: 16 },
  taxOptionCard: {
    backgroundColor: '#F5F7F6',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDE3E0',
  },
  taxOptionLeft: {
    flex: 1,
    marginRight: 8,
  },
  taxOptionName: { fontSize: 13, fontWeight: 'bold', color: '#222' },
  taxOptionDiscount: { fontSize: 11, color: '#2e7d32', marginTop: 2 },
  taxOptionBadge: {
    backgroundColor: '#006400',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'center',
  },
  taxOptionBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  closeModalButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeModalButtonText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
});
