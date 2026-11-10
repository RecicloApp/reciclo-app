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
  Platform,
} from 'react-native';
import { Calendar, ChevronDown, Camera } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomNav from './BottomNav';
import { supabase } from './supabase';
import Header from './Header'; // Importando o cabeçalho padronizado

export default function ReciclagemScreen({ navigation }: any) {
  const [dataColeta, setDataColeta] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

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

  // Função disparada ao selecionar uma data no calendário nativo
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');

    if (selectedDate) {
      setDateObj(selectedDate);
      const dia = String(selectedDate.getDate()).padStart(2, '0');
      const mes = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const ano = selectedDate.getFullYear();
      setDataColeta(`${dia}/${mes}/${ano}`);
    }
  };

  // Máscara para Data digitada manualmente: DD/MM/AAAA
  const formatarData = (value: string) => {
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 8) cleanValue = cleanValue.slice(0, 8);

    if (cleanValue.length > 4) {
      return `${cleanValue.slice(0, 2)}/${cleanValue.slice(
          2,
          4,
      )}/${cleanValue.slice(4, 8)}`;
    } else if (cleanValue.length > 2) {
      return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
    }
    return cleanValue;
  };

  // Máscara para Peso: Aceita apenas números e ponto/vírgula
  const formatarPeso = (value: string) => {
    let cleanValue = value.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    return cleanValue;
  };

  // Validação de data (impedindo datas futuras)
  const isDataFuturaOuInvalida = (dataStr: string) => {
    if (dataStr.length !== 10) return true;

    const [dia, mes, ano] = dataStr.split('/').map(Number);
    const dataDigitada = new Date(ano, mes - 1, dia);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (
        dataDigitada.getFullYear() !== ano ||
        dataDigitada.getMonth() + 1 !== mes ||
        dataDigitada.getDate() !== dia
    ) {
      return true; // Data inexistente
    }

    return dataDigitada > hoje;
  };

  const handleRegistrarColeta = async () => {
    if (!dataColeta || !tipoMaterial || !peso) {
      Alert.alert('Atenção', 'Preencha a data, o tipo de material e o peso.');
      return;
    }

    if (isDataFuturaOuInvalida(dataColeta)) {
      Alert.alert(
          'Data Inválida',
          'Por favor, escolha uma data válida que seja do dia de hoje para trás.',
      );
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

      const pesoNumerico = parseFloat(peso);

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
      navigation.navigate('PontosRecompensas');
    } catch (error: any) {
      Alert.alert('Erro ao registrar', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#006400" />

        {/* Cabeçalho Verde Padronizado */}
        <Header />

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
                  keyboardType="numeric"
                  maxLength={10}
                  value={dataColeta}
                  onChangeText={text => setDataColeta(formatarData(text))}
              />
              <TouchableOpacity onPress={() => setShowPicker(true)} activeOpacity={0.6}>
                <Calendar color="#006400" size={22} />
              </TouchableOpacity>
            </View>
          </View>

          {showPicker && (
              <DateTimePicker
                  value={dateObj}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={onChangeDate}
              />
          )}

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
                keyboardType="decimal-pad"
                value={peso}
                onChangeText={text => setPeso(formatarPeso(text))}
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