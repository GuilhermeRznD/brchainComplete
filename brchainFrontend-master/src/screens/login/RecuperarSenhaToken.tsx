import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { styles } from '../styles/telaLoginStyles';
import TokenInput from '../../components/TokenInput'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../../App';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'RecuperarSenhaToken'>;
  route: RouteProp<AuthStackParamList, 'RecuperarSenhaToken'>;
};

const RecuperarSenhaToken: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleContinue = async () => {
    if (token.length !== 6) {
        Alert.alert('Erro', 'O código deve ter 6 dígitos.');
        return;
    }

    setIsLoading(true);

    // URL dinâmica mapeada pelo ambiente/script .bat
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const API_URL = `${baseUrl}/auth/verify-token`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token }),
        });

        const data = await response.json();

        if (response.ok) { // Status 200
            Alert.alert('Sucesso!', 'Código verificado. Prossiga para nova senha.');
            navigation.navigate('RecuperarSenhaNovaSenha', { email, token });
        } else {
            Alert.alert('Erro', data.detail || data.message || 'Token inválido ou expirado. Tente novamente.');
        }

    } catch (error) {
        console.error("Erro de Rede:", error);
        Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor API.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Logo />
        <Text style={styles.title}>Recuperação de senha</Text>
        <Text style={styles.subtitle}>
          Um token foi enviado para o seu email para a recuperação de senha.
          {'\n'}Digite o código abaixo:
        </Text>

        <TokenInput code={token} setCode={setToken} />

        <Button 
          title={!isLoading ? "Continuar" : undefined}
          onPress={handleContinue}
          disabled={isLoading || token.length !== 6} 
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.text}>Continuar</Text>
          )}
        </Button>
      </View>
    </ScreenContainer>
  );
};

export default RecuperarSenhaToken;