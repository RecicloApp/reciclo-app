import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WebView from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from './supabase';
import BottomNav from './BottomNav';
import Header from './Header'; // Importando o cabeçalho padronizado

interface PontoColeta {
  id: string;
  nome: string;
  endereco: string;
  horario: string;
  distancia: string;
  latitude: number;
  longitude: number;
}

const DADOS_PONTOS: PontoColeta[] = [
  {
    id: '1',
    nome: 'Estação de Metarreciclagem',
    endereco: 'Quadra D6 Lote 20 - Gama, Brasília - DF',
    horario: 'Seg - Sáb: 9h às 18h',
    distancia: '1,0 km',
    latitude: -15.6012,
    longitude: -48.0605,
  },
  {
    id: '2',
    nome: 'Papa Entulho de Santa Maria Norte',
    endereco: 'Santa Maria, Brasília - DF',
    horario: 'Seg - Sex: 7h às 18h',
    distancia: '6,6 km',
    latitude: -15.9525,
    longitude: -48.0189,
  },
  {
    id: '3',
    nome: 'Bio Reciclagem - Coleta de Óleo',
    endereco: 'St. de Chácaras QSC 19 - Taguatinga, DF',
    horario: 'Seg - Sáb: 8h às 18h',
    distancia: '19,9 km',
    latitude: -15.8351,
    longitude: -48.0572,
  },
];

export default function PontosDeColeta({ navigation }: any) {
  const [busca, setBusca] = useState('');
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>({
    latitude: -15.7942,
    longitude: -47.8822,
  });
  const [pontoSelecionado, setPontoSelecionado] = useState<PontoColeta | null>(
    null,
  );
  const [distanciaCalculada, setDistanciaCalculada] = useState<string | null>(
    null,
  );

  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState('Você');

  const webViewRef = useRef<WebView>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchUserProfile = async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user || !isMounted) return;

          if (user.user_metadata) {
            if (user.user_metadata.full_name) {
              setUserName(user.user_metadata.full_name);
            }

            const avatar =
              user.user_metadata.avatar_url ||
              user.user_metadata.avatar ||
              user.user_metadata.picture;

            if (avatar) {
              setUserAvatar(avatar);
            }
          }
        } catch (error) {
          console.log('Erro ao buscar dados do perfil:', error);
        }
      };

      fetchUserProfile();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestLocationPermission();

    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        if (webViewRef.current) {
          const script = `updateUserLocation(${latitude}, ${longitude}, "${
            userAvatar || ''
          }", "${userName}");`;
          webViewRef.current.injectJavaScript(script);
        }
      },
      error => console.log('Erro de GPS:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        timeout: 20000,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [userAvatar, userName]);

  const pontosFiltrados = DADOS_PONTOS.filter(
    ponto =>
      ponto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      ponto.endereco.toLowerCase().includes(busca.toLowerCase()),
  );

  const selecionarPontoETracarRota = async (ponto: PontoColeta) => {
    if (!userLocation) {
      Alert.alert('Aviso', 'Aguardando o sinal de GPS para traçar a rota.');
      return;
    }

    setPontoSelecionado(ponto);

    if (webViewRef.current) {
      const scriptAnimar = `centralizarMapa(${ponto.latitude}, ${ponto.longitude}, 15);`;
      webViewRef.current.injectJavaScript(scriptAnimar);
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${ponto.longitude},${ponto.latitude}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanciaKm = (route.distance / 1000).toFixed(1) + ' km';
        setDistanciaCalculada(distanciaKm);

        const coords = route.geometry.coordinates.map((c: [number, number]) => [
          c[1],
          c[0],
        ]);

        if (webViewRef.current) {
          const scriptRota = `drawRoute(${JSON.stringify(coords)});`;
          webViewRef.current.injectJavaScript(scriptRota);
        }
      }
    } catch (error) {
      console.log('Erro ao buscar rota:', error);
    }
  };

  const centralizarNaMinhaLocalizacao = () => {
    if (userLocation && webViewRef.current) {
      const script = `centralizarMapa(${userLocation.latitude}, ${userLocation.longitude}, 15);`;
      webViewRef.current.injectJavaScript(script);
    } else {
      Alert.alert('Aviso', 'Aguardando sinal de GPS...');
    }
  };

  const initialLat = userLocation ? userLocation.latitude : -15.7942;
  const initialLng = userLocation ? userLocation.longitude : -47.8822;

  const primeiraLetra = userName ? userName.charAt(0).toUpperCase() : 'V';
  const avatarUrlSeguro = userAvatar ? userAvatar.trim() : '';

  const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                html, body { width: 100%; height: 100%; margin: 0; padding: 0; background: #E8ECE9; overflow: hidden; }
                #map { width: 100%; height: 100%; }
                .profile-marker {
                    width: 44px; height: 44px; border-radius: 50%; border: 3px solid #006400;
                    background-color: #006400; color: #FFF; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.4);
                    display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;
                }
                .profile-marker img { width: 100%; height: 100%; object-fit: cover; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map', { 
                    zoomControl: false,
                    dragging: true,
                    tap: true,
                    touchZoom: true,
                    scrollWheelZoom: true
                }).setView([${initialLat}, ${initialLng}], 14);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);

                var pontos = ${JSON.stringify(pontosFiltrados)};
                pontos.forEach(function(p) {
                    L.marker([p.latitude, p.longitude]).addTo(map)
                        .bindPopup("<b>" + p.nome + "</b><br>" + p.endereco);
                });

                var userMarker = null;
                var routePolyline = null;

                function updateUserLocation(lat, lng, customAvatar, customName) {
                    var avatarUrl = customAvatar || "${avatarUrlSeguro}";
                    var fallbackInitial = "${primeiraLetra}";
                    var currentUserName = customName || "${userName}";
                    
                    var htmlContent = "";
                    if (avatarUrl && avatarUrl !== "null" && avatarUrl !== "") {
                        htmlContent = '<img src="' + avatarUrl + '" onerror="this.style.display=\\'none\\'; this.parentNode.innerText=\\'' + fallbackInitial + '\\';" />';
                    } else {
                        htmlContent = fallbackInitial;
                    }

                    var userIcon = L.divIcon({
                        className: '',
                        html: '<div class="profile-marker">' + htmlContent + '</div>',
                        iconSize: [44, 44],
                        iconAnchor: [22, 22]
                    });

                    if (!userMarker) {
                        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map)
                            .bindPopup("<b>" + currentUserName + "</b><br>Você está aqui");
                    } else {
                        userMarker.setLatLng([lat, lng]);
                        userMarker.setIcon(userIcon);
                        userMarker.setPopupContent("<b>" + currentUserName + "</b><br>Você está aqui");
                    }
                }

                function centralizarMapa(lat, lng, zoomLevel) {
                    map.flyTo([lat, lng], zoomLevel || 15, {
                        duration: 1.5,
                        easeLinearity: 0.25
                    });
                }

                function drawRoute(coords) {
                    if (routePolyline) {
                        map.removeLayer(routePolyline);
                    }
                    routePolyline = L.polyline(coords, { color: '#006400', weight: 5, opacity: 0.8 }).addTo(map);
                }

                updateUserLocation(${initialLat}, ${initialLng}, "${avatarUrlSeguro}", "${userName}");
            </script>
        </body>
        </html>
    `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006400" barStyle="light-content" />

      {/* Cabeçalho Verde Padronizado */}
      <Header />

      {/* Lista Principal contendo o Mapa e os Cards */}
      <FlatList
        data={pontosFiltrados}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            {/* Saudação */}
            <View style={styles.welcomeSection}>
              <Text style={styles.greetingText}>Encontre</Text>
              <Text style={styles.userNameText}>Pontos de Coleta</Text>
              <Text style={styles.welcomeSubtitle}>
                Localize os ecopontos mais próximos para descartar seus
                materiais corretamente.
              </Text>
            </View>

            {/* Caixa de Busca */}
            <View style={styles.searchFilterRow}>
              <View style={styles.searchBox}>
                <Icon
                  name="magnify"
                  size={20}
                  color="#666"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por endereço ou bairro"
                  placeholderTextColor="#888"
                  value={busca}
                  onChangeText={setBusca}
                />
              </View>
            </View>

            {/* Mapa */}
            <View style={styles.mapContainer}>
              <WebView
                ref={webViewRef}
                source={{ html: mapHtml }}
                style={styles.map}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scrollEnabled={false}
              />
              <TouchableOpacity
                style={styles.gpsButton}
                onPress={centralizarNaMinhaLocalizacao}
              >
                <Icon name="crosshairs-gps" size={22} color="#006400" />
              </TouchableOpacity>
            </View>

            {pontoSelecionado && (
              <View style={styles.routeInfoBox}>
                <Icon
                  name="navigation"
                  size={18}
                  color="#006400"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.routeInfoText}>
                  Rota para{' '}
                  <Text style={{ fontWeight: 'bold' }}>
                    {pontoSelecionado.nome}
                  </Text>{' '}
                  • Distância:{' '}
                  <Text style={{ color: '#006400', fontWeight: 'bold' }}>
                    {distanciaCalculada || 'Calculando...'}
                  </Text>
                </Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Pontos mais próximos</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              pontoSelecionado?.id === item.id && styles.cardActive,
            ]}
            onPress={() => selecionarPontoETracarRota(item)}
          >
            <View style={styles.cardIconBox}>
              <Icon name="recycle" size={22} color="#FFF" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.nome}
              </Text>
              <Text style={styles.cardAddress} numberOfLines={1}>
                {item.endereco}
              </Text>
              <Text style={styles.cardSchedule}>
                <Icon name="clock-outline" size={12} color="#666" />{' '}
                {item.horario}
              </Text>
            </View>
            <View style={styles.cardRightContainer}>
              <Text style={styles.cardDistance}>{item.distancia}</Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Barra de Navegação Inferior Fixa Uniforme */}
      <BottomNav navigation={navigation} currentRoute="PontosDeColeta" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8ECE9',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  welcomeSection: {
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
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: '#DDE3E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  mapContainer: {
    width: '100%',
    height: 210,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDE3E0',
    backgroundColor: '#FFF',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  gpsButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  routeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1F5FE',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  routeInfoText: {
    fontSize: 12,
    color: '#01579B',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDE3E0',
  },
  cardActive: {
    borderColor: '#006400',
    borderWidth: 2,
    backgroundColor: '#F4FBF7',
  },
  cardIconBox: {
    width: 42,
    height: 42,
    backgroundColor: '#006400',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  cardAddress: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  cardSchedule: {
    fontSize: 10,
    color: '#666',
  },
  cardRightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cardDistance: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 4,
  },
});
