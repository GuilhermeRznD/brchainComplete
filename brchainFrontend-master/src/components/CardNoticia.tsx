// src/components/CardNoticia.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
const placeholderImg = require('../../assets/imagem.png');

// Definindo os tipos de dados para a notícia
export interface Noticia {
  id: string;
  type: string;
  date: string;
  source: string;
  title: string;
  imageUri?: string | null; 
  category?: string; 
}

interface CardNoticiaProps {
  item: Noticia;
  onPress: () => void;
}

const CardNoticia: React.FC<CardNoticiaProps> = ({ item, onPress }) => {
  const imageSource = item.imageUri ? { uri: item.imageUri } : placeholderImg;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={imageSource} style={styles.imagemCard} />
      
      <View style={styles.overlay}>
        <View style={[styles.tag, { backgroundColor: getCategoryColor(item.category || item.type) }]}>
          <Text style={styles.textoTag}>{item.category || item.type || 'Notícia'}</Text>
        </View>
        <Text style={styles.infoCard}>
          {item.source} | Publicado em {item.date}
        </Text>
        <Text style={styles.tituloCard}>{item.title}</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#fff"
          style={styles.iconeSeta}
        />
      </View>
    </TouchableOpacity>
  );
};

const getCategoryColor = (type: string = '') => {
  switch (type.toLowerCase()) {
    // Topicos (chips do topo)
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
    // Categorias (fallback quando topico nao foi definido)
    case 'notícias':
    case 'notícia':
      return '#1F6A56';
    case 'dicas de saúde':
      return '#FFC042';
    default:
      return Colors.primary;
  }
};

export const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    backgroundColor: '#fff',
  },
  imagemCard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover', 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end',
    padding: 15,
  },
  tag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  textoTag: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 5,
  },
  tituloCard: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  iconeSeta: {
    position: 'absolute',
    right: 15,
    bottom: 15,
  },
});

export default CardNoticia;