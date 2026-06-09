import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TelaFeedNoticias from '../screens/TelaFeedNoticias';
import TelaNoticiaDetalhe from '../screens/TelaNoticiaDetalhe';

// Definindo os tipos de rota para esta pilha
export type HomeStackParamList = {
  Feed: undefined; // Tela principal do feed
  Detalhe: { noticiaId: string }; // Tela de detalhe, que recebe um ID
};

const Stack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, 
      }}
      initialRouteName="Feed"
    >
      <Stack.Screen name="Feed" component={TelaFeedNoticias} />
      <Stack.Screen name="Detalhe" component={TelaNoticiaDetalhe} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;