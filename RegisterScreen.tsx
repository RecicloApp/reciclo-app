import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Calendar, ChevronDown, Camera } from 'lucide-react-native';
import BottomNav from './BottomNav';
import { supabase } from './supabase';
import Header from './Header';

export default function ReciclagemScreen({ navigation }: any) {
  const [dataColeta, setDataColeta] = useState('');
  const [tipoMaterial, setTipoMaterial] = useState('');
  const [isTipoOpen, setIsTipoOpen] = useState(false);
  const [peso, setPeso] = useState('');
  const [pontoEntrega, setPontoEntrega] = useState(
    'Estação de Metarreciclagem Gama',
  );
  const [loading, setLoading] = useState(false);

  const materiais = ['Plástico', 'Papel', 'Metal', 'Vidro', 'Eletrônico'];

  const handleSelectMaterial = (item: string) => {
    setTipoMaterial(item);
    setIsTipoOpen(false);
  };

  const handleRegistrarColeta = async () => {
    if (!dataColeta || !tipoMaterial || !peso) {
      Alert.alert('Atenção', 'Preencha a data, o tipo de material e o peso.');
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const pesoNumerico = parseFloat(peso.replace(',', '.'));

      const { error } = await supabase.from('coletas').insert([
        {
          user_id: user.id,
          data_coleta: dataColeta,
          tipo_material: tipoMaterial,
          peso: pesoNumerico,
          ponto_entrega: pontoEntrega,
        },
      ]);

      if (error) throw error;

      Alert.alert(
        'Sucesso!',
        'Coleta registrada com sucesso! Seus pontos e impacto foram atualizados.',
      );
      navigation.navigate('Impact');
    } catch (error: any) {
      Alert.alert('Erro ao registrar', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#006400" />

      {/* 1. Cabeçalho Verde Padronizado */}
      <Header />

      {/* 2. Conteúdo da Tela */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Cadastrar lixo reciclável</Text>
        <Text style={styles.subtitle}>
          Preencha os detalhes para registrar sua coleta e ganhar pontos.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Data da Coleta</Text>
          <View style={styles.inputWithIcon}>
            <TextInput
              style={styles.inputFlex}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#888"
              value={dataColeta}
              onChangeText={setDataColeta}
            />
            <Calendar color="#555" size={20} />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tipo de Material</Text>
          <TouchableOpacity
            style={styles.selectInput}
            activeOpacity={0.8}
            onPress={() => setIsTipoOpen(!isTipoOpen)}
          >
            <Text
              style={
                tipoMaterial
                  ? styles.selectTextSelected
                  : styles.selectTextPlaceholder
              }
            >
              {tipoMaterial || 'Selecione o material'}
            </Text>
            <ChevronDown color="#555" size={20} />
          </TouchableOpacity>

          {isTipoOpen && (
            <View style={styles.dropdownContainer}>
              {materiais.map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectMaterial(item)}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Peso Estimado (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2.5"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ponto de Entrega</Text>
          <TouchableOpacity style={styles.selectInput} activeOpacity={0.8}>
            <Text style={styles.selectTextSelected}>{pontoEntrega}</Text>
            <ChevronDown color="#555" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Foto do Material (Opcional)</Text>
          <TouchableOpacity style={styles.photoButton} activeOpacity={0.7}>
            <Camera color="#333" size={20} />
            <Text style={styles.photoButtonText}>Adicionar foto</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.8}
          onPress={handleRegistrarColeta}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Registrando...' : 'Registrar coleta'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 3. Rodapé Fixo */}
      <BottomNav currentRoute="Reciclagem" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8ECE9' },
  scrollContent: { padding: 20, paddingBottom: 90 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: { fontSize: 12, color: '#555555', marginBottom: 20 },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#EAECE9',
    fontSize: 14,
    color: '#000000',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#EAECE9',
  },
  inputFlex: { flex: 1, fontSize: 14, color: '#000000' },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#EAECE9',
  },
  selectTextPlaceholder: { fontSize: 14, color: '#666666' },
  selectTextSelected: { fontSize: 14, color: '#000000' },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 12 },
  dropdownItemText: { fontSize: 14, color: '#333333' },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    height: 48,
    backgroundColor: '#FAFAFA',
    gap: 8,
  },
  photoButtonText: { fontSize: 14, color: '#333333' },
  submitButton: {
    backgroundColor: '#006400',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
