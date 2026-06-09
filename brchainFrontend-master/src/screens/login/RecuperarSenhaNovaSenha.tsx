import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Logo from '../../components/Logo';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { styles } from '../styles/telaLoginStyles';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useRoute } from '@react-navigation/native'; 
import { AuthStackParamList } from '../../../App';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList , 'RecuperarSenhaNovaSenha'>;
};

const RecuperarSenhaNovaSenha: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<RouteProp<AuthStackParamList, 'RecuperarSenhaNovaSenha'>>(); 
  const { email, token } = route.params; 

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); 

  const handleConfirm = async () => { 
    if (!password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha os campos de senha.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }

    setIsLoading(true);

    // URL dinâmica baseada nas configurações do ecossistema local (.env)
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const API_URL = `${baseUrl}/auth/reset-password`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email, 
          token: token, 
          password: password, // Ajustado para o padrão do backend em inglês
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigation.navigate('RecuperarSenhaSucesso');
      } else {
        Alert.alert('Erro', data.detail || data.message || 'Falha ao resetar a senha. Tente o fluxo novamente.');
        navigation.navigate('Login'); 
      }
    } catch (error) {
      console.error("Erro de Conexão:", error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Logo />
        <Text style={styles.title}>Recuperação de senha</Text>
        <Text style={styles.subtitle}>Crie uma nova senha para sua conta.</Text>

        <FormInput
          placeholder="Nova senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
          iconName={showPass ? 'eye-off' : 'eye'}
          onIconPress={() => setShowPass(!showPass)}
          editable={!isLoading}
        />
        <FormInput
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPass}
          iconName={showConfirmPass ? 'eye-off' : 'eye'}
          onIconPress={() => setShowConfirmPass(!showConfirmPass)}
          editable={!isLoading}
        />

        <View style={{ marginTop: 10 }}>
          <Button
            title={!isLoading ? "Confirmar" : undefined}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.text}>Confirmar</Text>
            )}
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default RecuperarSenhaNovaSenha;