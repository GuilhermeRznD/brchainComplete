import React from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AdminStackParamList } from '../../navigation/AdminStackNavigator';
import AdminHeader from '../../components/AdminHeader';
import Button from '../../components/Button';
import { styles } from '../styles/telaRemoverNoticiaStyles';

type Props = {
  navigation: StackNavigationProp<AdminStackParamList, 'TelaEditarRemoverNoticia'>;
  route: RouteProp<AdminStackParamList, 'TelaEditarRemoverNoticia'>;
};

const TelaEditarRemoverNoticia: React.FC<Props> = ({ navigation, route }) => {
  const { noticiaId } = route.params;

  const handleRemover = async () => {
    // Define a URL base dinâmica do ambiente
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    // Rota padrão REST no backend Python para deletar um artigo específico
    const API_URL = `${baseUrl}/articles/${noticiaId}`;

    try {
        const response = await fetch(API_URL, {
            method: 'DELETE',
        });

        if (response.ok) {
            Alert.alert('Sucesso', 'Notícia removida!');
            navigation.pop(2); 
        } else {
            const data = await response.json().catch(() => ({}));
            Alert.alert('Erro', data.detail || data.message || 'Falha ao remover.');
        }
    } catch (error) {
        console.error("Erro de Conexão:", error);
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader title="Remover Notícia" showBackButton={true} onBackPress={() => navigation.goBack()} onMenuPress={() => {}} />
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.warningText}>Tem certeza que deseja deletar esta notícia? A ação é irreversível.</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
          <Button title="Remover" onPress={handleRemover} variant="primary" style={styles.removerButton} />
        </View>
      </ScrollView>
    </View>
  );
};

export default TelaEditarRemoverNoticia;