import 'react-native-gesture-handler';
import React from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from './src/constants/colors';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Telas de Autenticação
import TelaLogin from './src/screens/login/TelaLogin';
import CadastroUsuario from './src/screens/login/CadastroUsuario';
import RecuperarSenhaEmail from './src/screens/login/RecuperarSenhaEmail';
import RecuperarSenhaEmailNaoEncontrado from './src/screens/login/RecuperarSenhaEmailNaoEncontrado';
import RecuperarSenhaToken from './src/screens/login/RecuperarSenhaToken';
import RecuperarSenhaNovaSenha from './src/screens/login/RecuperarSenhaNovaSenha';
import RecuperarSenhaSucesso from './src/screens/login/RecuperarSenhaSucesso';

// Telas Principais (App)
import HomeStackNavigator from './src/navigation/HomeStackNavigator';
import TelaPerfil from './src/screens/TelaPerfil';


import AdminStackNavigator from './src/navigation/AdminStackNavigator';

// Tipos do Stack de Autenticação
export type AuthStackParamList = {
  Login: undefined;
  CadastroUsuario: undefined;
  RecuperarSenhaEmail: undefined;
  RecuperarSenhaEmailNaoEncontrado: { email: string };
  RecuperarSenhaToken: { email: string };
  RecuperarSenhaNovaSenha: { email: string; token: string };
  RecuperarSenhaSucesso: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;  // O fluxo de Login
  AppStack: undefined;   // O fluxo principal (com abas)
  AdminStack: undefined; // O fluxo de Admin (Modal)
};

// Tipos do Tab (Rodapé)
export type AppTabParamList = {
  Home: undefined; 
  Feed: undefined; 
  Perfil: undefined; 
};

const AuthStackNav = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

function AuthStack() {
  return (
    <AuthStackNav.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <AuthStackNav.Screen name="Login" component={TelaLogin} />
      <AuthStackNav.Screen name="CadastroUsuario" component={CadastroUsuario} />
      <AuthStackNav.Screen name="RecuperarSenhaEmail" component={RecuperarSenhaEmail} />
      <AuthStackNav.Screen name="RecuperarSenhaEmailNaoEncontrado" component={RecuperarSenhaEmailNaoEncontrado} />
      <AuthStackNav.Screen name="RecuperarSenhaToken" component={RecuperarSenhaToken} />
      <AuthStackNav.Screen name="RecuperarSenhaNovaSenha" component={RecuperarSenhaNovaSenha} />
      <AuthStackNav.Screen name="RecuperarSenhaSucesso" component={RecuperarSenhaSucesso} />
    </AuthStackNav.Navigator>
  );
}

// Navegador de Abas (Bottom Tab)
function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          height: 80, 
          position: 'absolute',
          elevation: 0,
          paddingBottom: insets.bottom,
        },
        tabBarIcon: ({ focused }) => {
          let iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Feed') {
            iconName = focused ? 'newspaper-variant' : 'newspaper-variant-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'account' : 'account-outline';
          } else {
            iconName = 'help-circle';
          }
          return <MaterialCommunityIcons name={iconName} size={28} color="#fff" />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Feed" component={HomeStackNavigator} />
      <Tab.Screen name="Perfil" component={TelaPerfil} />
    </Tab.Navigator>
  );
}

// Decide qual fluxo mostrar com base no estado de autenticacao.
// Rota inicial OBRIGATORIA = Login (AuthStack). So liberamos o resto apos auth.
const RootNavigator: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        // Garante que, ao abrir o app, a tela inicial seja sempre Login.
        initialRouteName={isLoggedIn ? (isAdmin ? 'AdminStack' : 'AppStack') : 'AuthStack'}
      >
        {isLoggedIn ? (
          // Admins caem direto no painel administrativo;
          // usuarios comuns caem no feed (AppTabs).
          isAdmin ? (
            <RootStack.Group>
              <RootStack.Screen name="AdminStack" component={AdminStackNavigator} />
              <RootStack.Screen
                name="AppStack"
                component={AppTabs}
                options={{
                  presentation: 'modal',
                  cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                }}
              />
            </RootStack.Group>
          ) : (
            <RootStack.Group>
              <RootStack.Screen name="AppStack" component={AppTabs} />
              <RootStack.Screen
                name="AdminStack"
                component={AdminStackNavigator}
                options={{
                  presentation: 'modal',
                  cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                }}
              />
            </RootStack.Group>
          )
        ) : (
          <RootStack.Group>
            <RootStack.Screen name="AuthStack" component={AuthStack} />
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// A função principal agora só "provê" os contextos
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}