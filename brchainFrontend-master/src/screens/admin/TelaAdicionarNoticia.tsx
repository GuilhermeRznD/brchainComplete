import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/AdminStackNavigator';
import AdminHeader from '../../components/AdminHeader';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { styles } from '../styles/telaAdicionarNoticiaStyles';

type Props = {
  navigation: StackNavigationProp<AdminStackParamList, 'TelaAdicionarNoticia'>;
};

const TelaAdicionarNoticia: React.FC<Props> = ({ navigation }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState(''); 
  const [link, setLink] = useState(''); 
  const [categoria, setCategoria] = useState(''); 
  const [imagemUrl, setImagemUrl] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (!titulo || !descricao) {
      Alert.alert('Erro', 'Título e Descrição são obrigatórios.');
      return;
    }
    
    setLoading(true);

    // URL dinâmica sintonizada com o ecossistema local (.env)
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    // Rota padrão do FastAPI para criação/ingestão de artigos
    const API_URL = `${baseUrl}/articles`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: titulo,
                body: descricao,
                url: link || "",
                topic: categoria || 'Geral', // Traduzido type -> topic comum em schemas de notícias
                image_url: imagemUrl || ""
            })
        });

        const data = await response.json();

        if (response.ok || response.status === 201) {
            Alert.alert('Sucesso', 'Notícia adicionada!');
            navigation.goBack();
        } else {
            Alert.alert('Erro', data.detail || data.message || 'Falha ao salvar notícia.');
        }
    } catch (error) {
        console.error("Erro de Conexão:", error);
        Alert.alert('Erro', 'Falha ao conectar com o servidor para salvar a notícia.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Adicionar Notícia"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => {}}
      />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
        <FormInput label="Título" value={titulo} onChangeText={setTitulo} />
        <FormInput 
            label="Descrição (Corpo)" 
            value={descricao} 
            onChangeText={setDescricao} 
            multiline={true} 
            numberOfLines={4} 
            style={styles.textArea} 
        />
        <FormInput label="Link Original" value={link} onChangeText={setLink} />
        <FormInput label="Categoria" value={categoria} onChangeText={setCategoria} placeholder="Ex: Saúde, Dicas" />
        <FormInput label="URL da Imagem" value={imagemUrl} onChangeText={setImagemUrl} />
        
        <View style={styles.footerButtons}>
          <Button title="Cancelar" onPress={() => navigation.goBack()} variant="secondary" />
          <Button title={loading ? "Salvando..." : "Salvar"} onPress={handleSalvar} variant="primary" disabled={loading} />
        </View>
      </ScrollView>
    </View>
  );
};

export default TelaAdicionarNoticia;