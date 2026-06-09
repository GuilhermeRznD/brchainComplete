import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import Colors from '../constants/colors';
interface Props extends TextInputProps {
  // podemos adicionar mais props se necessário
}

const SearchBar: React.FC<Props> = (props) => {
  return (
    <View style={styles.container}>
      <Feather name="search" size={20} color={Colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="O que deseja buscar?"
        placeholderTextColor={Colors.textSecondary}
        {...props} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', 
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    marginVertical: 15, 
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
});

export default SearchBar;