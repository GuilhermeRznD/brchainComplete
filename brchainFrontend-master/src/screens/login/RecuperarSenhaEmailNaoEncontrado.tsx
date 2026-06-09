import React from 'react';
import { View, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { styles } from '../styles/telaLoginStyles';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../../App';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList , 'RecuperarSenhaEmailNaoEncontrado'>;
  route: RouteProp<AuthStackParamList, 'RecuperarSenhaEmailNaoEncontrado'>;
};

const RecuperarSenhaEmailNaoEncontrado: React.FC<Props> = ({ navigation, route }) => {
  // Pega o email que foi passado como parâmetro para esta tela
  const { email } = route.params;

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Logo />
        <Text style={styles.title}>Recuperação de senha</Text>
        <Text style={styles.subtitle}>
          Não encontramos nenhuma conta com o e-mail {'\n'}
          <Text style={{ fontWeight: 'bold' }}>{email}</Text>
          {'\n'} Deseja criar uma nova conta?
        </Text>

        <Button
          title="Cadastre-se"
          onPress={() => navigation.navigate('CadastroUsuario')}
          variant="secondary"
        />
        <Button
          title="Digitar o email novamente"
          onPress={() => navigation.goBack()} // Volta para a tela anterior
        />
      </View>
    </ScreenContainer>
  );
};

export default RecuperarSenhaEmailNaoEncontrado;