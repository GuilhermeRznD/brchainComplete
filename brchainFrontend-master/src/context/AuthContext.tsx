import React, { createContext, useState, useContext, ReactNode } from 'react';
interface User {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'user'; //as duas funções
}
// Define o que o Contexto vai fornecer
interface AuthContextData {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}
//  Cria o Contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);
// Cria o "Provedor" 
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Simulação de login
  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  // O isLoggedIn é calculado com base no usuário
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}