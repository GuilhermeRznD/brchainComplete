import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AdminStackParamList } from '../../navigation/AdminStackNavigator';
import AdminHeader from '../../components/AdminHeader';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { styles } from '../styles/telaAdicionarNoticiaStyles'; // Reusa estilos

type Props = {
  navigation: StackNavigationProp<AdminStackParamList, 'TelaEditarNoticia'>;
  route: RouteProp<AdminStackParamList, 'TelaEditarNoticia'>;
};

const TelaEditarNoticia: React.FC<Props> = ({ navigation, route }) => {
  const { noticiaId } = route.params;
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Define a URL base dinâmica do ambiente
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
      // Busca a notícia específica diretamente no backend Python
      fetch(`${baseUrl}/articles/${noticiaId}`)
        .then(r => r.json())
        .then(data => {
            // Ajustado para ler o padrão em inglês vindo do MongoDB/FastAPI
            setTitulo(data.title || data.titulo || '');
            setDescricao(data.body || '');
            setImagemUrl(data.image_url || data.imagem || '');
        })
        .catch(err => {
            console.error("Erro ao buscar notícia:", err);
            Alert.alert('Erro', 'Não foi possível carregar os dados da notícia.');
        });
  }, [noticiaId, baseUrl]);

  const handleAtualizar = async () => {
    setLoading(true);
    
    // Rota típica de atualização no padrão REST da API FastAPI
    const API_URL = `${baseUrl}/articles/${noticiaId}`;

    try {
        const response = await fetch(API_URL, {
            method: 'PUT', // Ou 'PATCH', dependendo de como está no seu backend
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: titulo,
                body: descricao,
                image_url: imagemUrl
            })
        });

        const data = await response.json();

        if (response.ok) {
            Alert.alert('Sucesso', 'Notícia atualizada!');
            navigation.pop(2); 
        } else {
            Alert.alert('Erro', data.detail || data.message || 'Falha ao atualizar.');
        }
    } catch (error) {
        console.error("Erro de Conexão:", error);
        Alert.alert('Erro', 'Falha ao conectar com o servidor.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader title="Editar Notícia" showBackButton={true} onBackPress={() => navigation.goBack()} onMenuPress={() => {}} />
      
      <ScrollView style={styles.scrollContainer}>
        <FormInput label="Título" value={titulo} onChangeText={setTitulo} />
        <FormInput label="Descrição" value={descricao} onChangeText={setDescricao} multiline={true} style={styles.textArea} />
        <FormInput label="URL da Imagem" value={imagemUrl} onChangeText={setImagemUrl} />
        
        <View style={styles.footerButtons}>
          <Button title="Cancelar" onPress={() => navigation.goBack()} variant="secondary" />
          <Button title={loading ? "Salvando..." : "Salvar"} onPress={handleAtualizar} variant="primary" disabled={loading} />
        </View>
      </ScrollView>
    </View>
  );
};

export default TelaEditarNoticia;