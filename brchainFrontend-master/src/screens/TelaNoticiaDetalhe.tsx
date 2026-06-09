import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { styles } from './styles/telaNoticiaDetalheStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../constants/api';

type DetalheScreenRouteProp = RouteProp<HomeStackParamList, 'Detalhe'>;
type DetalheScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Detalhe'>;

const TelaNoticiaDetalhe: React.FC = () => {
  const navigation = useNavigation<DetalheScreenNavigationProp>();
  const route = useRoute<DetalheScreenRouteProp>();
  
  // Captura as duas variáveis enviadas pela navegação com segurança
  const { noticiaId, userEmail } = route.params as any;

  const [titulo, setTitulo] = useState<string>('Carregando...');
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isSendingFeedback, setIsSendingFeedback] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/articles/${noticiaId}`, { headers: { Accept: 'application/json' } })
      .then((r) => {
        if (!r.ok) throw new Error(`Notícia não encontrada (HTTP ${r.status}).`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTitulo(data.title || 'Sem título');
        setSourceUrl(data.url || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg(err instanceof Error ? err.message : 'Erro ao buscar notícia.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMeta(false);
      });
    return () => {
      cancelled = true;
    };
  }, [noticiaId]);

  const handleLikePress = async () => {
    if (isSendingFeedback) return;

    const novaAcao = isLiked ? 'nao_gostei' : 'gostei';
    setIsSendingFeedback(true);

    const emailUsuario = userEmail || 'joao@gmail.com';

    try {
      // Rota exata mapeada no FastAPI: /feed/{user_id}/feedback
      const response = await fetch(`${API_URL}/feed/${encodeURIComponent(emailUsuario)}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          article_id: noticiaId,
          action: novaAcao,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao registrar interação no servidor.');
      }

      setIsLiked(!isLiked);
      
      if (novaAcao === 'gostei') {
        Alert.alert('Sucesso', 'Gosto registrado! O feed se adaptará aos seus interesses.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar sua curtida. Tente novamente.');
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <SafeAreaView style={styles.areaSegura} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { flex: 1, marginRight: 10 }]} numberOfLines={1}>
          {titulo}
        </Text>

        {!isLoadingMeta && !errorMsg && sourceUrl && (
          <TouchableOpacity 
            onPress={handleLikePress} 
            style={{ padding: 5 }}
            disabled={isSendingFeedback}
          >
            {isSendingFeedback ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <MaterialCommunityIcons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={26} 
                color={isLiked ? "#E53935" : Colors.textPrimary} 
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {isLoadingMeta && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!isLoadingMeta && errorMsg && (
        <View style={{ padding: 20 }}>
          <Text style={{ color: '#B71C1C', fontWeight: 'bold', marginBottom: 8 }}>
            {errorMsg}
          </Text>
        </View>
      )}

      {!isLoadingMeta && !errorMsg && sourceUrl && (
        <WebView
          source={{ uri: sourceUrl }}
          startInLoadingState
          renderLoading={() => (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff',
              }}
            >
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ marginTop: 10, color: Colors.textSecondary }}>
                Carregando matéria...
              </Text>
            </View>
          )}
          allowsBackForwardNavigationGestures
          decelerationRate={0.998}
        />
      )}

      {!isLoadingMeta && !errorMsg && !sourceUrl && (
        <View style={{ padding: 20 }}>
          <Text style={{ color: Colors.textSecondary }}>
            Esta notícia não tem URL original disponível para leitura.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TelaNoticiaDetalhe;