import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import Colors from '../constants/colors';

type Props = {
  code: string;
  setCode: (code: string) => void;
  length?: number;
};

const TokenInput: React.FC<Props> = ({ code, setCode, length = 4 }) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const codeDigits = Array.from({ length }, (_, index) => {
    return code[index] || '';
  });

  return (
    <View style={styles.container}>
      <Pressable style={styles.boxesContainer} onPress={handlePress}>
        {codeDigits.map((digit, index) => (
          <View
            key={index}
            style={[
              styles.box,
              isFocused && index === code.length && styles.boxFocused,
            ]}
          >
            <Text style={styles.boxText}>{digit}</Text>
          </View>
        ))}
      </Pressable>

      
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={setCode}
        maxLength={length}
        keyboardType="number-pad"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.hiddenInput} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  box: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  boxFocused: {
    borderColor: Colors.primary,
  },
  boxText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default TokenInput;