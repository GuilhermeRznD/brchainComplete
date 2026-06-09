import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../App';
import ScreenContainer from '../../components/ScreenContainer';
import Logo from '../../components/Logo';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { styles } from '../styles/telaLoginStyles';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator } from 'react-native'; 

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'CadastroUsuario'>;
};

const CadastroUsuario: React.FC<Props> = ({ navigation }) => {
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [confirmarSenha, setConfirmarSenha] = useState<string>('');
  
  const [showSenha, setShowSenha] = useState<boolean>(false);
  const [showConfirmarSenha, setConfirmarSenhaShow] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login } = useAuth(); 

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }
    
    setIsLoading(true);

    
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    const API_URL = `${baseUrl}/auth/register`; 

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nome,
          email: email,
          phone: telefone || "",
          password: senha,
        }),
      });

      const data = await response.json();

      if (response.ok || response.status === 201) {
        Alert.alert('Sucesso!', 'Sua conta foi criada. Faça o login para continuar.');
        navigation.navigate('Login'); 
      } else if (response.status === 409) {
        Alert.alert('Erro no Cadastro', 'Este email já está cadastrado.');
      } else {
        Alert.alert('Erro', data.detail || data.message || 'Falha ao cadastrar usuário. Tente novamente.');
      }

    } catch (error) {
      console.error(error);
      Alert.alert(
        'Erro de Conexão', 
        `Não foi possível conectar à API em ${API_URL}. Verifique as configurações.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Logo />

        <Text style={styles.title}>Cadastro</Text>
        <Text style={styles.subtitle}>
          Crie uma conta no aplicativo da BRChain e acompanhe as novidades.
        </Text>

        <FormInput
          label="Nome"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          editable={!isLoading}
        />

        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />

        <FormInput
          label="Telefone (Opcional)"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          editable={!isLoading}
        />

        <FormInput
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!showSenha}
          iconName={showSenha ? 'eye-off' : 'eye'}
          onIconPress={() => setShowSenha(!showSenha)}
          editable={!isLoading}
        />

        <FormInput
          label="Confirme sua senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!showConfirmarSenha}
          iconName={showConfirmarSenha ? 'eye-off' : 'eye'}
          onIconPress={() => setConfirmarSenhaShow(!showConfirmarSenha)}
          editable={!isLoading}
        />

        <View style={{ marginTop: 10 }}>
          <Button
            title={!isLoading ? "Continuar" : undefined}
            onPress={handleCadastro}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.text}>Continuar</Text>
            )}
          </Button>
        </View>
        
        <View style={{ height: 320 }} /> 
      </View>
    </ScreenContainer>
  );
};

export default CadastroUsuario;