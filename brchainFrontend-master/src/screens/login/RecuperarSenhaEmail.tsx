import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Logo from '../../components/Logo';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { styles } from '../styles/telaLoginStyles'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../App';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'RecuperarSenhaEmail'>;
};

const RecuperarSenhaEmail: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); 

  const handleContinue = async () => { 
    if (!email) {
        Alert.alert('Erro', 'Por favor, digite o e-mail.');
        return;
    }

    setIsLoading(true);

    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const API_URL = `${baseUrl}/auth/forgot-password`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) { 
            Alert.alert('Sucesso!', 'Verifique seu e-mail para o código de recuperação.');
            navigation.navigate('RecuperarSenhaToken', { email: email });
        } else if (response.status === 404) {
            navigation.navigate('RecuperarSenhaEmailNaoEncontrado', { email: email });
        } else {
            Alert.alert('Erro', data.detail || data.message || 'Falha na solicitação. Tente novamente.');
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
          Digite o e-mail que está vinculado à sua conta para recuperar sua senha.
        </Text>

        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />

        <View style={{ marginTop: 10 }}>
          <Button 
            title={!isLoading ? "Continuar" : undefined}
            onPress={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.text}>Continuar</Text>
            )}
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default RecuperarSenhaEmail;