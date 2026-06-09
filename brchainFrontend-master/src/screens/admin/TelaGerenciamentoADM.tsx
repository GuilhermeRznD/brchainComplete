import React from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles } from '../styles/telaGerenciamentoADMStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: StackNavigationProp<any>; 
};

const TelaGerenciamentoADM: React.FC<Props> = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#1B5E20', '#A5D6A7']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('TelaGerenciarNoticias')}>
            <Text style={styles.menuItem}>Gerenciar Notícias</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => { /* Navegar para Gerenciar Artigos */ }}>
            <Text style={styles.menuItem}>Gerenciar Artigos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => { /* Navegar para Dicas de Saúde */ }}>
            <Text style={styles.menuItem}>Gerenciar Dicas de Saúde</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TelaGerenciamentoADM;