import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { styles } from './styles';
import { supabase } from './supabase';

import SignUpScreen from './SignUpScreen'; // Import da nova tela de cadastro
import ForgotPasswordScreen from './ForgotPasswordScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import HomeScreen from './HomeScreen';
import PontosDeColeta from './PontosDeColeta';
import ImpactScreen from './ImpactScreen';
import ProfileScreen from './ProfileScreen';
import ReciclagemScreen from './ReciclagemScreen';
import PontosRecompensasScreen from './PontosRecompensasScreen';

function LoginScreenComponent({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Validações da senha em tempo real
  const hasMinLength = senha.length >= 8;
  const hasUpperCase = /[A-Z]/.test(senha);
  const hasNumber = /\d/.test(senha);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Informe seu e-mail e senha.');
      return;
    }

    if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      Alert.alert('Atenção', 'A senha não atende aos requisitos de segurança.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (error) {
        Alert.alert('Erro ao entrar', error.message);
      } else {
        navigation.replace('Home');
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Ocorreu um erro inesperado.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#006400" />

      <View style={styles.header}>
        <Text style={styles.logoText}>ReCiclo</Text>
        <Text style={styles.subLogoText}>
          Pequenas ações, grandes mudanças.
        </Text>

        <Text style={styles.headerTitle}>Faça parte da mudança.</Text>
        <Text style={styles.headerSubtitle}>
          Crie sua conta e comece a registrar suas{'\n'}ações sustentáveis.
        </Text>
      </View>

      <View style={styles.formArea}>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>Entre para continuar no ReCiclo.</Text>

        <Text style={styles.label}>E-mail *</Text>
        <TextInput
          style={styles.input}
          placeholder="seuemail@exemplo.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <View style={{ marginBottom: 10 }}>
          {!hasMinLength && (
            <Text style={{ color: 'red', fontSize: 12 }}>
              • Mínimo de 8 caracteres
            </Text>
          )}
          {!hasUpperCase && (
            <Text style={{ color: 'red', fontSize: 12 }}>
              • Pelo menos 1 letra maiúscula
            </Text>
          )}
          {!hasNumber && (
            <Text style={{ color: 'red', fontSize: 12 }}>
              • Pelo menos 1 número
            </Text>
          )}
          {!hasSpecialChar && (
            <Text style={{ color: 'red', fontSize: 12 }}>
              • Pelo menos 1 caractere especial
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text
            style={{
              color: '#006400',
              textAlign: 'right',
              marginTop: 4,
              marginBottom: 15,
            }}
          >
            Esqueceu sua senha?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem conta? </Text>
          {/* Navegação direcionada para SignUpScreen */}
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreenComponent} />
          {/* Rota configurada para SignUpScreen */}
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="PontosDeColeta" component={PontosDeColeta} />
          <Stack.Screen name="Impact" component={ImpactScreen} />
          <Stack.Screen name="Reciclagem" component={ReciclagemScreen} />
          <Stack.Screen
            name="PontosRecompensas"
            component={PontosRecompensasScreen}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
