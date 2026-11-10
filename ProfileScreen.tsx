import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { supabase } from './supabase';
import { launchImageLibrary } from 'react-native-image-picker';
import BottomNav from './BottomNav';
import Header from './Header'; // Importando o cabeçalho padronizado

export default function ProfileScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        setEmail(user.email || '');
        if (user.user_metadata) {
          setNome(user.user_metadata.full_name || '');
          setAvatarUri(user.user_metadata.avatar_url || null);
        }
      }
    } catch (error: any) {
      console.log('Erro ao buscar dados do usuário:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAndUploadImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
      },
      async response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Erro', 'Não foi possível carregar a imagem.');
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (asset.uri) {
            await uploadImageToSupabase(
              asset.uri,
              asset.fileName || 'avatar.jpg',
            );
          }
        }
      },
    );
  };

  const uploadImageToSupabase = async (uri: string, fileName: string) => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const fileExt = fileName.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: fileExt === 'png' ? 'image/png' : 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUri(publicUrl);
      Alert.alert('Sucesso', 'Foto de perfil atualizada e salva na nuvem!');
    } catch (error: any) {
      console.log('Detalhes do erro de upload:', error);
      Alert.alert('Erro no upload', error.message || 'Falha ao enviar imagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Erro', 'Insira um e-mail válido.');
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (email !== user?.email) {
        if (!currentPassword) {
          setLoading(false);
          Alert.alert(
            'Atenção',
            'Para alterar o e-mail, digite sua senha atual.',
          );
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: currentPassword,
        });

        if (signInError) {
          setLoading(false);
          Alert.alert(
            'Erro',
            'Senha atual incorreta. Não foi possível alterar o e-mail.',
          );
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({
        email: email,
        data: { full_name: nome },
      });

      if (error) throw error;

      Alert.alert(
        'Sucesso',
        email !== user?.email
          ? 'Perfil atualizado! Verifique sua caixa de entrada para confirmar o novo e-mail.'
          : 'Perfil atualizado com sucesso!',
      );
      setIsEditing(false);
      setCurrentPassword('');
    } catch (error: any) {
      Alert.alert('Erro ao atualizar', error.message || 'Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!novaSenha || novaSenha.length < 6) {
      Alert.alert('Aviso', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;

      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setIsChangingPassword(false);
      setNovaSenha('');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Encerrar sessão', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const handleInviteWhatsApp = () => {
    const message = encodeURIComponent(
      '🌱 Olá! Estou usando o app ReCiclo para transformar meu impacto ambiental reciclando de forma simples. Baixe você também e faça parte dessa mudança! ♻️ Baixe aqui: https://play.google.com/store/apps/details?id=com.recicloapp',
    );
    const url = `whatsapp://send?text=${message}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Linking.openURL(`https://api.whatsapp.com/send?text=${message}`);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('Erro ao abrir o WhatsApp:', err));
  };

  if (loading && !email) {
    return (
      <View style={[styles.container, styles.centerLoader]}>
        <ActivityIndicator size="large" color="#006400" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#006400" />

      {/* Cabeçalho Verde Padronizado */}
      <Header />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Título da Seção */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Meu perfil</Text>
          <Text style={styles.screenSubtitle}>
            Gerencie suas informações pessoais e segurança.
          </Text>
        </View>

        {/* Card do Avatar e Dados Principais */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            onPress={handlePickAndUploadImage}
            activeOpacity={0.8}
            style={styles.avatarContainer}
          >
            <View style={styles.avatarCircle}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarEmoji}>👤</Text>
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraEmoji}>📷</Text>
            </View>
          </TouchableOpacity>

          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.inputField}
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome"
              />
              <TextInput
                style={styles.inputField}
                value={email}
                onChangeText={setEmail}
                placeholder="Seu e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputHint}>
                * Para alterar o e-mail, digite sua senha atual abaixo:
              </Text>
              <TextInput
                style={styles.inputField}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Sua senha atual"
              />

              <View style={styles.editActionRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    setCurrentPassword('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{nome || 'Usuário sem nome'}</Text>
              <Text style={styles.userEmail}>{email}</Text>

              <TouchableOpacity
                style={styles.editProfileButton}
                activeOpacity={0.8}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editProfileButtonText}>Editar perfil</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Seção Dados da Conta & Segurança */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderTitle}>
            Dados da conta e segurança
          </Text>
          <Text style={styles.sectionHeaderSubtitle}>
            Modifique sua senha e configurações de acesso.
          </Text>
        </View>

        <View style={styles.accountDataBox}>
          {/* Opção 1: Alterar Senha */}
          <View style={{ padding: 16 }}>
            <View style={styles.dataLeft}>
              <View style={styles.dataIconBg}>
                <Text>🔒</Text>
              </View>
              <View>
                <Text style={styles.dataLabel}>Alterar Senha</Text>
                <Text style={styles.dataValueSub}>
                  Insira uma nova senha se desejar
                </Text>
              </View>
            </View>

            {isChangingPassword ? (
              <View style={{ marginTop: 12 }}>
                <TextInput
                  style={styles.inputField}
                  secureTextEntry
                  placeholder="Nova senha (min. 6 caracteres)"
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setIsChangingPassword(false)}
                    style={styles.cancelBtn}
                  >
                    <Text style={{ color: '#666' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleUpdatePassword}
                    style={styles.miniSaveBtn}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                      Atualizar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsChangingPassword(true)}
                style={styles.inlineActionBtn}
              >
                <Text style={styles.dataActionText}>Modificar senha ✎</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          {/* Opção 2: Segurança e Privacidade */}
          <TouchableOpacity
            style={styles.dataRow}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'Segurança',
                'Sua conta está protegida por criptografia padrão do Supabase Auth.',
              )
            }
          >
            <View style={styles.dataLeft}>
              <View style={styles.dataIconBg}>
                <Text>🛡️</Text>
              </View>
              <View>
                <Text style={styles.dataLabel}>Segurança e Privacidade</Text>
                <Text style={styles.dataValueSub}>
                  Sessão ativa e criptografia de ponta
                </Text>
              </View>
            </View>
            <Text style={styles.dataArrow}>➔</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Opção 3: Sair da Conta */}
          <TouchableOpacity
            style={styles.dataRow}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.dataLeft}>
              <View style={[styles.dataIconBg, { backgroundColor: '#FDE8E8' }]}>
                <Text>🚪</Text>
              </View>
              <View>
                <Text style={[styles.dataLabel, { color: '#D9534F' }]}>
                  Encerrar Sessão
                </Text>
                <Text style={styles.dataValueSub}>
                  Sair da sua conta neste aparelho
                </Text>
              </View>
            </View>
            <Text style={[styles.dataArrow, { color: '#D9534F' }]}>➔</Text>
          </TouchableOpacity>
        </View>

        {/* Card Inferior - Convidar Amigos via WhatsApp */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteContent}>
            <View style={styles.inviteIconCircle}>
              <Text>🌱</Text>
            </View>
            <View style={styles.inviteTexts}>
              <Text style={styles.inviteTitle}>
                Pronto para fazer parte da mudança?
              </Text>
              <Text style={styles.inviteSubtitle}>
                Convide amigos e incentive mais pessoas a reciclarem.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.inviteButton}
            activeOpacity={0.9}
            onPress={handleInviteWhatsApp}
          >
            <Text style={styles.inviteButtonText}>
              Convidar amigos via WhatsApp
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de Navegação Inferior Fixa */}
      <BottomNav navigation={navigation} currentRoute="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECE9',
  },
  centerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: 110,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#DDE3E0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8E4',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 38,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#006400',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cameraEmoji: {
    fontSize: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  userEmail: {
    fontSize: 13,
    color: '#777',
    marginBottom: 16,
  },
  editProfileButton: {
    borderWidth: 1,
    borderColor: '#006400',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  editProfileButtonText: {
    color: '#006400',
    fontWeight: 'bold',
    fontSize: 14,
  },
  editContainer: {
    width: '100%',
  },
  inputField: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
    marginBottom: 10,
    fontSize: 14,
  },
  inputHint: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    marginTop: 4,
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cancelButton: {
    backgroundColor: '#DDD',
    borderRadius: 8,
    paddingVertical: 10,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#006400',
    borderRadius: 8,
    paddingVertical: 10,
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  accountDataBox: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 14,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#DDE3E0',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dataLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataIconBg: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataLabel: {
    fontSize: 12,
    color: '#006400',
    fontWeight: 'bold',
  },
  dataValueSub: {
    fontSize: 12,
    color: '#666',
  },
  inlineActionBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  dataActionText: {
    fontSize: 13,
    color: '#006400',
    fontWeight: 'bold',
  },
  cancelBtn: {
    padding: 6,
  },
  miniSaveBtn: {
    backgroundColor: '#006400',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dataArrow: {
    fontSize: 16,
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#EBEFEE',
    marginHorizontal: 16,
  },
  inviteCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDE3E0',
  },
  inviteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  inviteIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inviteTexts: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 2,
  },
  inviteSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  inviteButton: {
    backgroundColor: '#006400',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
