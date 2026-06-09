import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AdminStackParamList } from '../../navigation/AdminStackNavigator';
import Colors from '../../constants/colors'; 
import AdminHeader from '../../components/AdminHeader';
import Button from '../../components/Button';

import { styles } from '../styles/telaRemoverNoticiaStyles';

type Props = {
  navigation: StackNavigationProp<AdminStackParamList, 'TelaRemoverNoticia'>;
  route: RouteProp<AdminStackParamList, 'TelaRemoverNoticia'>;
};

const TelaRemoverNoticia: React.FC<Props> = ({ navigation, route }) => {
  const { noticiaId } = route.params;
  const [nomeDoItem, setNomeDoItem] = useState('Carregando...');
  const [loading, setLoading] = useState(false);

  // Define a URL base dinâmica do ambiente local (.env)
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Busca os detalhes da notícia para exibir no preview
    fetch(`${baseUrl}/articles/${noticiaId}`)
      .then(r => r.json())
      .then(data => {
        // Trata a resposta lendo a chave 'title' do padrão do backend Python
        setNomeDoItem(data.title || data.titulo || 'Item sem título');
      })
      .catch(() => setNomeDoItem('Erro ao carregar nome do item'));
  }, [noticiaId, baseUrl]);


  const handleRemover = async () => {
    setLoading(true);
    // Rota padrão REST no backend Python para deletar um artigo específico
    const API_URL = `${baseUrl}/articles/${noticiaId}`;

    try {
        const response = await fetch(API_URL, {
            method: 'DELETE',
        });

        if (response.ok) {
            Alert.alert('Sucesso', 'Notícia removida!');
            navigation.navigate('TelaListaNoticias'); 
        } else {
            const data = await response.json().catch(() => ({}));
            Alert.alert('Erro', data.detail || 'Não foi possível remover a notícia.');
        }
    } catch (error) {
        console.error("Erro de Conexão:", error);
        Alert.alert('Erro', 'Falha na conexão com a API.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Remover Notícia"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => {}}
      />
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {/* Caixa de preview do item */}
        <View style={styles.itemBox}>
          <Text style={styles.itemText}>{nomeDoItem}</Text>
        </View>

        {/* Texto de Confirmação */}
        <Text style={styles.warningText}>
          Você tem certeza que deseja deletar esse produto?
          Essa ação é irreversível
        </Text>

        {/* Botões de Ação */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          
          <Button 
            title={loading ? "Removendo..." : "Remover"}
            onPress={handleRemover} 
            variant="primary"
            style={styles.removerButton}
            disabled={loading} 
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default TelaRemoverNoticia;