import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

type Props = {
  filtroAtivo: string;
  setFiltroAtivo: (filtro: string) => void;
  filtros: string[];
};

const FilterChips: React.FC<Props> = ({
  filtroAtivo,
  setFiltroAtivo,
  filtros,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filtros.map((filtro) => {
          const isAtivo = filtroAtivo === filtro;
          const cor = getCategoryColor(filtro);
          
          return (
            <TouchableOpacity
              key={filtro}
              style={[
                styles.chip,
                isAtivo
                  ? { backgroundColor: cor, borderColor: cor }
                  : styles.chipInativo,
              ]}
              onPress={() => setFiltroAtivo(isAtivo ? '' : filtro)}
            >
              <Text style={isAtivo ? styles.textoAtivo : styles.textoInativo}>
                {filtro}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const getCategoryColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'nutrição':
      return '#90D788';
    case 'exercícios':
      return '#FFC042';
    case 'saúde mental':
      return '#B388FF';
    case 'prevenção':
      return '#50D8E8';
    case 'bem-estar':
      return '#1F6A56';
    default:
      return Colors.primary;
  }
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    marginVertical: 15,
  },
  chip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
  },
  chipInativo: {
    backgroundColor: '#fff',
    borderColor: '#E0E0E0',
  },
  textoAtivo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textoInativo: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default FilterChips;