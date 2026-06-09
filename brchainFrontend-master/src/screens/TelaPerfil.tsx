import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; 
import Button from '../components/Button';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';


type PerfilScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const TelaPerfil: React.FC = () => {
  const navigation = useNavigation<PerfilScreenNavigationProp>();
  const { user, logout } = useAuth();

  const handleManageNews = () => {
    navigation.navigate('AdminStack');
  };

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Perfil</Text>
        
        {user && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Nome:</Text>
            <Text style={styles.infoValor}>{user.nome}</Text>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValor}>{user.email}</Text>
            <Text style={styles.infoLabel}>Função:</Text>
            <Text style={styles.infoValor}>{user.role}</Text>
          </View>
        )}

        {user?.role === 'admin' && (
          <Button
            title="Gerenciar Notícias (ADM)"
            onPress={handleManageNews}
            variant="primary"
          />
        )}

        <View style={{ marginTop: 20 }}>
          <Button
            title="Sair"
            onPress={logout}
            variant="secondary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  infoBox: {
    marginBottom: 30,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  infoValor: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});

export default TelaPerfil;