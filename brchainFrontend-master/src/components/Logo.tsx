import React from 'react';
import { Image, StyleSheet, ImageStyle } from 'react-native';

type Props = {
  style?: ImageStyle; 
};

const Logo: React.FC<Props> = ({ style }) => {
  return (
    <Image
      source={require('../../assets/brchain-logo.png')}
      style={[styles.logo, style]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 300,
    height: 100,
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default Logo;