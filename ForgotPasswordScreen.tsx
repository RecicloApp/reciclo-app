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

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Atenção', 'Por favor, informe um e-mail válido.');
      return;
    }

    try {
      setLoading(true);

      // Envia o e-mail de recuperação com o deep link apontando para a tela de redefinição
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'recicloapp://reset-password',
      });

      if (error) throw error;

      Alert.alert(
        'E-mail enviado!',
        'Enviamos as instruções e o link de recuperação para o seu e-mail.',
        [
          {
            text: 'Ir para redefinição',
            onPress: () => navigation.navigate('ResetPassword'),
          },
        ],
      );
    } catch (err: any) {
      let mensagem = err.message || 'Ocorreu um erro ao enviar o e-mail.';
      if (mensagem.includes('Rate limit exceeded')) {
        mensagem = 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.';
      }
      Alert.alert('Erro', mensagem);
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
            <Text style={styles.bannerTitle}>Recuperar senha.</Text>
            <Text style={styles.bannerSubtitle}>
              Digite seu e-mail cadastrado para receber{'\n'}as instruções de recuperação.
            </Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.formTitle}>Esqueceu a senha?</Text>
          <Text style={styles.formSubtitle}>
            Enviaremos um link para redefinição no seu e-mail.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              E-mail <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.8}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar e-mail de recuperação</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerLinkRow}>
            <Text style={styles.footerText}>Lembrou da senha? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLinkText}>Voltar para o login</Text>
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
    marginBottom: 20,
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
    marginTop: 10,
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
    marginTop: 24,
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