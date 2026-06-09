import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet,} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
type Props = {
  title: string; 
  onMenuPress: () => void; 
  showBackButton?: boolean;
  onBackPress?: () => void;
};

const AdminHeader: React.FC<Props> = ({
  title,
  onMenuPress,
  showBackButton = false,
  onBackPress,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} /> 
        )}

        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
          <MaterialCommunityIcons name="menu" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.cardBackground, 
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iconButton: {
    padding: 5,
    width: 40, 
    alignItems: 'center',
  },
  placeholder: {
    width: 40, 
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});

export default AdminHeader;