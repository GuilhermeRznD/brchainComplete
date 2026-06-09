// src/screens/RecuperarSenhaSucesso.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native'; 
import Button from '../../components/Button';
import Colors from '../../constants/colors';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../App';
import ScreenContainer from '../../components/ScreenContainer';
import { styles as sharedStyles } from '../styles/telaLoginStyles'; 

type Props = {
  navigation: StackNavigationProp<AuthStackParamList , 'RecuperarSenhaSucesso'>;
};

const RecuperarSenhaSucesso: React.FC<Props> = ({ navigation }) => {
  const goToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    
    <ScreenContainer>
      <View style={sharedStyles.card}> 
        <Text style={styles.title}>Nova senha criada com sucesso!</Text>
        <Button
          title="Voltar para a página inicial"
          onPress={goToLogin}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  
  title: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default RecuperarSenhaSucesso;