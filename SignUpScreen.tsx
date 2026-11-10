import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Header from './Header';
import { supabase } from './supabase';

export default function SignUpScreen({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  // Validações de senha dinâmicas
  const temOitoCaracteres = senha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

  const handleSignUp = async () => {
    // 1. Validações locais de formulário
    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      Alert.alert(
        'Atenção',
        'Por favor, preencha todos os campos obrigatórios.',
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro de validação', 'As senhas não coincidem.');
      return;
    }

    if (!temOitoCaracteres || !temMaiuscula || !temNumero || !temEspecial) {
      Alert.alert(
        'Senha fraca',
        'A senha deve atender a todos os requisitos de segurança indicados.',
      );
      return;
    }

    try {
      setLoading(true);

      // 2. Registro no Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            full_name: nome.trim(),
          },
        },
      });

      if (signUpError) throw signUpError;

      // 3. Salvar o perfil na tabela 'profiles' do banco de dados (se houver usuário retornado)
      if (data?.user) {
        const { error: profileError } = await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            nome: nome.trim(),
            email: email.trim(),
            created_at: new Date().toISOString(),
          },
        ]);

        if (profileError) {
          console.warn(
            'Aviso ao registrar perfil no banco:',
            profileError.message,
          );
        }

        Alert.alert(
          'Conta Criada!',
          'Sua conta foi registrada com sucesso! Faça login para acessar o app.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
      }
    } catch (error: any) {
      let mensagemErro = error.message || 'Falha ao criar conta.';

      // Tratamento de mensagens comuns em português
      if (mensagemErro.includes('User already registered')) {
        mensagemErro = 'Este e-mail já está cadastrado em nosso sistema.';
      } else if (mensagemErro.includes('invalid format')) {
        mensagemErro = 'Por favor, insira um e-mail com formato válido.';
      }

      Alert.alert('Erro no Cadastro', mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#006400" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Topo Verde Padronizado com Mensagem Motivacional */}
        <View style={styles.topSection}>
          <Header />
          <View style={styles.bannerTextWrapper}>
            <Text style={styles.bannerTitle}>Faça parte da mudança.</Text>
            <Text style={styles.bannerSubtitle}>
              Crie sua conta e comece a registrar suas{'\n'}ações sustentáveis.
            </Text>
          </View>
        </View>

        {/* Card Branco com Arredondamento Superior */}
        <View style={styles.cardContainer}>
          <Text style={styles.formTitle}>Criar conta</Text>
          <Text style={styles.formSubtitle}>
            Preencha seus dados para começar.
          </Text>

          {/* Campo: Nome Completo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nome completo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </View>

          {/* Campo: E-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              E-mail <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Campo: Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Senha <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          {/* Campo: Confirmar Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Confirmar senha <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Repita sua senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />
          </View>

          {/* Indicadores Dinâmicos de Requisitos de Senha */}
          <View style={styles.validationBox}>
            <Text
              style={[
                styles.validationText,
                temOitoCaracteres ? styles.valid : styles.invalid,
              ]}
            >
              • Mínimo de 8 caracteres
            </Text>
            <Text
              style={[
                styles.validationText,
                temMaiuscula ? styles.valid : styles.invalid,
              ]}
            >
              • Pelo menos 1 letra maiúscula
            </Text>
            <Text
              style={[
                styles.validationText,
                temNumero ? styles.valid : styles.invalid,
              ]}
            >
              • Pelo menos 1 número
            </Text>
            <Text
              style={[
                styles.validationText,
                temEspecial ? styles.valid : styles.invalid,
              ]}
            >
              • Pelo menos 1 caractere especial
            </Text>
          </View>

          {/* Botão Principal de Cadastro */}
          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.8}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Criar minha conta</Text>
            )}
          </TouchableOpacity>

          {/* Link para Redirecionamento de Login */}
          <View style={styles.footerLinkRow}>
            <Text style={styles.footerText}>Já possui uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLinkText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#006400',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    backgroundColor: '#006400',
    paddingBottom: 35,
  },
  bannerTextWrapper: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#D0E1D4',
    lineHeight: 18,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A252C',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#667085',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#344054',
    marginBottom: 6,
  },
  required: {
    color: '#D92D20',
  },
  input: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#101828',
  },
  validationBox: {
    marginTop: 4,
    marginBottom: 24,
  },
  validationText: {
    fontSize: 12,
    lineHeight: 18,
  },
  invalid: {
    color: '#D92D20',
  },
  valid: {
    color: '#006400',
    fontWeight: '600',
  },
  submitButton: {
    height: 48,
    backgroundColor: '#006400',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#667085',
  },
  footerLinkText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#006400',
  },
});
