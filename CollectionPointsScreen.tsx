import React, { useState } from 'react';
import {
    Text,
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    FlatList,
} from 'react-native';

const INITIAL_POINTS = [
    {
        id: '1',
        name: 'Estação de Metarreciclagem',
        address: 'Quadra 06 Lote 20 - Gama, Brasília - DF',
        hours: 'Seg - Sáb: 8h às 18h',
        distance: '1,0 km',
    },
    {
        id: '2',
        name: 'Papa Entulho de Santa Maria Norte',
        address: 'Santa Maria, Brasília - DF',
        hours: 'Seg - Sex: 7h às 19h',
        distance: '6,6 km',
    },
    {
        id: '3',
        name: 'Bio Reciclagem - Coleta de Óleo de Cozinha Usado',
        address: 'St. de Chácaras QSC 19 - Taguatinga, Brasília - DF',
        hours: 'Seg - Sáb: 9h às 18h',
        distance: '10,9 km',
    },
    {
        id: '4',
        name: 'FACA COLETA',
        address: 'St. E Sul QSE 20 - TAGUATINGA SUL, Brasília - DF',
        hours: 'Seg - Sáb: 8h às 17h',
        distance: '17,9 km',
    },
    {
        id: '5',
        name: 'GL Reciclagem',
        address: 'QN 503, S/N Conjunto 04 Lote 01 - Samambaia, Brasília - DF',
        hours: 'Seg - Sáb: 8h às 18h',
        distance: '15,5 km',
    },
];

export default function CollectionPointsScreen({ navigation }: any) {
    const [search, setSearch] = useState('');
    const [points, setPoints] = useState(INITIAL_POINTS);

    const handleSearch = (text: string) => {
        setSearch(text);
        if (text.trim() === '') {
            setPoints(INITIAL_POINTS);
        } else {
            const filtered = INITIAL_POINTS.filter(
                (p) =>
                    p.name.toLowerCase().includes(text.toLowerCase()) ||
                    p.address.toLowerCase().includes(text.toLowerCase())
            );
            setPoints(filtered);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#006400" />

            {/* Cabeçalho Verde */}
            <View style={styles.header}>
                <Text style={styles.logoText}>ReCiclo</Text>
                <TouchableOpacity style={styles.menuIconButton} activeOpacity={0.8}>
                    <Text style={styles.menuIconText}>≡</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Título da Seção */}
                <View style={styles.titleSection}>
                    <Text style={styles.screenTitle}>Pontos de coleta</Text>
                    <Text style={styles.screenSubtitle}>Encontre um ponto de coleta perto de você.</Text>
                </View>

                {/* Barra de Busca e Filtro */}
                <View style={styles.searchFilterRow}>
                    <View style={styles.searchBox}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por endereço ou bairro (ex.: Gama)"
                            placeholderTextColor="#888"
                            value={search}
                            onChangeText={handleSearch}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
                        <Text style={styles.filterIcon}>⚙️</Text>
                        <Text style={styles.filterText}>Filtros</Text>
                    </TouchableOpacity>
                </View>

                {/* Mapa Simulado com Grade e Pinos */}
                <View style={styles.mapContainer}>
                    <View style={styles.mapGridLineH1} />
                    <View style={styles.mapGridLineH2} />
                    <View style={styles.mapGridLineV1} />
                    <View style={styles.mapGridLineV2} />

                    {/* Pinos de Coleta no Mapa */}
                    <View style={[styles.mapPin, { top: '25%', left: '20%' }]}><Text style={styles.pinText}>♻️</Text></View>
                    <View style={[styles.mapPin, { top: '22%', left: '40%' }]}><Text style={styles.pinText}>♻️</Text></View>
                    <View style={[styles.mapPin, { top: '35%', left: '75%' }]}><Text style={styles.pinText}>♻️</Text></View>
                    <View style={[styles.mapPin, { top: '55%', left: '21%' }]}><Text style={styles.pinText}>♻️</Text></View>
                    <View style={[styles.mapPin, { top: '60%', left: '55%' }]}><Text style={styles.pinText}>♻️</Text></View>

                    {/* Marcador da Posição Atual do Usuário */}
                    <View style={styles.userLocationDot} />

                    {/* Botão de Localização no canto inferior direito do mapa */}
                    <View style={styles.mapTargetButton}>
                        <Text style={styles.targetIcon}>🎯</Text>
                    </View>
                </View>

                {/* Seção Lista de Pontos Próximos */}
                <Text style={styles.listSectionTitle}>Pontos mais próximos</Text>

                {points.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.pointCard} activeOpacity={0.8}>
                        <View style={styles.cardLeft}>
                            <View style={styles.cardThumbPlaceholder}>
                                <View style={styles.thumbBoxInner} />
                            </View>
                            <View style={styles.cardTexts}>
                                <Text style={styles.pointName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.pointAddress} numberOfLines={1}>{item.address}</Text>
                                <Text style={styles.pointHours}>{item.hours}</Text>
                            </View>
                        </View>
                        <View style={styles.cardRight}>
                            <Text style={styles.pointDistance}>{item.distance}</Text>
                            <Text style={styles.arrowIcon}>›</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Barra de Navegação Inferior (Tab Bar) */}
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.tabIcon}>🏠</Text>
                    <Text style={styles.tabText}>Início</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} activeOpacity={0.8}>
                    <Text style={[styles.tabIcon, styles.activeTabColor]}>📍</Text>
                    <Text style={[styles.tabText, styles.activeTabText]}>Coletas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} activeOpacity={0.8}>
                    <Text style={styles.tabIcon}>♻️</Text>
                    <Text style={styles.tabText}>Reciclagem</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} activeOpacity={0.8}>
                    <Text style={styles.tabIcon}>🍃</Text>
                    <Text style={styles.tabText}>Impacto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.tabIcon}>👤</Text>
                    <Text style={styles.tabText}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8ECE9',
    },
    header: {
        backgroundColor: '#006400',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 25,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    menuIconButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIconText: {
        fontSize: 26,
        color: '#FFF',
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 90,
    },
    titleSection: {
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
    searchFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
        borderWidth: 1,
        borderColor: '#DDE3E0',
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 12,
        color: '#333',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 45,
        borderWidth: 1,
        borderColor: '#DDE3E0',
        gap: 6,
    },
    filterIcon: {
        fontSize: 13,
    },
    filterText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',
    },
    mapContainer: {
        height: 220,
        backgroundColor: '#DDECE4',
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#C5D8CE',
    },
    mapGridLineH1: {
        position: 'absolute',
        top: '30%',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#C5D8CE',
        transform: [{ rotate: '5deg' }],
    },
    mapGridLineH2: {
        position: 'absolute',
        top: '65%',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#C5D8CE',
        transform: [{ rotate: '-3deg' }],
    },
    mapGridLineV1: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '35%',
        width: 2,
        backgroundColor: '#C5D8CE',
        transform: [{ rotate: '15deg' }],
    },
    mapGridLineV2: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '70%',
        width: 2,
        backgroundColor: '#C5D8CE',
        transform: [{ rotate: '-10deg' }],
    },
    mapPin: {
        position: 'absolute',
        backgroundColor: '#006400',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    pinText: {
        fontSize: 12,
    },
    userLocationDot: {
        position: 'absolute',
        top: '48%',
        left: '48%',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#2F80ED',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    mapTargetButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: '#FFF',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    targetIcon: {
        fontSize: 16,
    },
    listSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 12,
    },
    pointCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDE3E0',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    cardThumbPlaceholder: {
        width: 50,
        height: 36,
        backgroundColor: '#5C8271',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    thumbBoxInner: {
        width: 24,
        height: 14,
        backgroundColor: '#8EAFA0',
        borderRadius: 3,
    },
    cardTexts: {
        flex: 1,
    },
    pointName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#222',
    },
    pointAddress: {
        fontSize: 11,
        color: '#666',
        marginTop: 1,
    },
    pointHours: {
        fontSize: 10,
        color: '#888',
        marginTop: 2,
    },
    cardRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    pointDistance: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#006400',
    },
    arrowIcon: {
        fontSize: 18,
        color: '#999',
        marginTop: 2,
    },
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#DDE3E0',
        elevation: 10,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    tabIcon: {
        fontSize: 18,
        marginBottom: 2,
    },
    activeTabColor: {
        color: '#006400',
    },
    tabText: {
        fontSize: 10,
        color: '#777',
    },
    activeTabText: {
        color: '#006400',
        fontWeight: 'bold',
    },
});