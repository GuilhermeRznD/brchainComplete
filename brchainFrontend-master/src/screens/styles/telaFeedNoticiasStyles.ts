import { StyleSheet } from 'react-native';
import Colors from '../../constants/colors';

export const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: Colors.cardBackground, 
  },
  scrollView: {
    flex: 1,
  },
  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 10, 
  },
  tituloPrincipal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  subtituloPrincipal: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});