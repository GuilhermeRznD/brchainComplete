import React from 'react';
import { View, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AdminHeader from '../../components/AdminHeader';
import MenuListItem from '../../components/MenuListItem';
import { styles } from '../styles/telaGerenciarNoticiasStyles';


import { AdminStackParamList } from '../../navigation/AdminStackNavigator';

type Props = {
  navigation: StackNavigationProp<AdminStackParamList, 'TelaGerenciarNoticias'>;
};

const TelaGerenciarNoticias: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <AdminHeader
        title="Gerenciar Notícias"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => console.log('Abrir menu lateral')}
      />

      <ScrollView>
        <MenuListItem
          text="Notícias Publicadas"
          onPress={() => navigation.navigate('TelaListaNoticias')}
        />
        <MenuListItem
          text="Ver Notícias"
          onPress={() => console.log('Ir para Ver Notícias')}
        />
        <MenuListItem
          text="Ver Relatórios"
          onPress={() => console.log('Ir para Ver Relatórios')}
        />
      </ScrollView>
    </View>
  );
};

export default TelaGerenciarNoticias;