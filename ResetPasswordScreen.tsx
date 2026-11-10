import React, { useState, useEffect } from 'react';
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

export default function ResetPasswordScreen({ navigation }: any) {
  // TODOS OS HOOKS DECLARADOS RIGOROSAMENTE NO TOPO ABSOLUTO
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessaoPronta, setSessaoPronta] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setSessaoPronta(true);
        }
      },
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessaoPronta(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Validações em tempo real
  const temOitoCaracteres = novaSenha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(novaSenha);
  const temNumero = /[0-9]/.test(novaSenha);
  const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(novaSenha);

  const handleUpdatePassword = async () => {
    if (!novaSenha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha ambos os campos de palavra-passe.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert(
        'Erro de validação',
        'As palavras-passe digitadas não coincidem.',
      );
      return;
    }

    if (!temOitoCaracteres || !temMaiuscula || !temNumero || !temEspecial) {
      Alert.alert(
        'Palavra-passe fraca',
        'A nova palavra-passe precisa atender a todos os critérios de segurança.',
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) throw error;

      Alert.alert(
        'Palavra-passe Alterada!',
        'A sua palavra-passe foi atualizada com sucesso! Faça login com a nova palavra-passe.',
        [
          {
            text: 'Ir para o Login',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              }),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert(
        'Erro ao alterar palavra-passe',
        err.message ||
          'A sessão de recuperação expirou. Solicite um novo e-mail.',
      );
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
        <View style={styles.topSection}>
          <Header />
          <View style={styles.bannerTextWrapper}>
            <Text style={styles.bannerTitle}>Nova Palavra-passe.</Text>
            <Text style={styles.bannerSubtitle}>
              Crie uma nova palavra-passe segura para aceder{'\n'}à sua conta no
              ReCiclo.
            </Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.formTitle}>Redefinir palavra-passe</Text>
          <Text style={styles.formSubtitle}>
            Digite e confirme a sua nova palavra-passe abaixo.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nova palavra-passe <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a nova palavra-passe"
              placeholderTextColor="#999"
              secureTextEntry
              value={novaSenha}
              onChangeText={setNovaSenha}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Confirmar nova palavra-passe{' '}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Repita a nova palavra-passe"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />
          </View>

          {/* Checklist Dinâmico de Segurança */}
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

          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.8}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                Alterar a minha palavra-passe
              </Text>
            )}
          </TouchableOpacity>
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
});
