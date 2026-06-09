import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AdminStackParamList } from '../../navigation/AdminStackNavigator';
import Colors from '../../constants/colors';
import AdminHeader from '../../components/AdminHeader';
import SearchBar from '../../components/SearchBar';
import AdminListItem from '../../components/AdminListItem';
import { styles } from '../styles/telaListaNoticias'; 

type Props = {
  navigation: StackNavigationProp<AdminStackParamList, 'TelaListaNoticias'>;
};

const TelaListaNoticias: React.FC<Props> = ({ navigation }) => {
  const [busca, setBusca] = useState('');
  const [noticias, setNoticias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      
      // Define a URL base dinâmica do ambiente local (.env)
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      // Rota para buscar os artigos no seu backend Python
      const API_URL = `${baseUrl}/public/articles?limit=100`;

      fetch(API_URL)
        .then(r => r.json())
        .then(data => {
            // Mapeia os dados tratando as chaves vindas do FastAPI/MongoDB
            const formatadas = data.map((item: any) => ({
                id: item._id || item.id,
                title: item.title || item.titulo || '',
                imageUrl: item.image_url || item.imagem || ''
            }));
            setNoticias(formatadas);
        })
        .catch(err => console.error("Erro ao buscar lista admin:", err))
        .finally(() => setIsLoading(false));
    }, [])
  );

  const noticiasFiltradas = noticias.filter(item =>
    item.title && item.title.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Notícias Publicadas"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => console.log('Abrir menu lateral')}
      />

      <View style={styles.contentContainer}>
        <SearchBar
          value={busca}
          onChangeText={setBusca}
        />

        <View style={styles.listHeader}>
          <Text style={styles.filterText}>Filtrar por...</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => navigation.navigate('TelaAdicionarNoticia')}
          >
            <MaterialCommunityIcons name="plus-circle" size={20} color={Colors.primary} />
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 20}} />
        ) : (
            <FlatList
              data={noticiasFiltradas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AdminListItem
                  title={item.title}
                  imageUrl={item.imageUrl} 
                  onPress={() => 
                    navigation.navigate('TelaEditarRemoverNoticia', { noticiaId: item.id }) 
                  }
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhuma notícia encontrada.</Text>
              }
            />
        )}
      </View>
    </View>
  );
};

export default TelaListaNoticias;