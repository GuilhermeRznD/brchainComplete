import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Colors from '../../constants/colors';
import Button from '../../components/Button';
import { styles } from '../styles/telaLoginStyles';
import ScreenContainer from '../../components/ScreenContainer';
import Logo from '../../components/Logo';
import FormInput from '../../components/FormInput';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../App'; 
import { useAuth } from '../../context/AuthContext';
import { API_URL, ENDPOINTS } from '../../constants/api';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>; 

const TelaLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth(); 

  const handleLogin = async () => { 
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha o e-mail e a senha.');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.login}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (response.ok) {
        login({
          id: data.userId,
          nome: data.userName,
          email: email,
          role: data.userRole,
        });
      } else {
        Alert.alert('Erro no Login', data?.detail || data?.message || 'E-mail ou senha inválidos.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Erro de Conexão',
        `Não foi possível conectar à API em ${API_URL}. Verifique se o servidor Python está rodando e se o IP no .env (EXPO_PUBLIC_API_URL) está correto.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('CadastroUsuario');
  };

  const handleForgotPassword = () => {
    navigation.navigate('RecuperarSenhaEmail');
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Logo />
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>
          Efetue o login abaixo ou crie uma conta.
        </Text>

        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading} 
        />

        <FormInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          iconName={showPassword ? 'eye-off' : 'eye'}
          onIconPress={() => setShowPassword(!showPassword)}
          editable={!isLoading} 
        />

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <Button 
          title={!isLoading ? "Login" : undefined}
          onPress={handleLogin} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.text}>Login</Text>
          )}
        </Button>

        <Button
          title="Cadastre-se"
          onPress={handleRegister}
          variant="secondary"
        />
        <View style={{ height: 30 }} /> 
      </View>
    </ScreenContainer>
  );
};

export default TelaLogin;