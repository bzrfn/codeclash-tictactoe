import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function PixelButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  colors,
}) {
  const getStyle = () => {
    if (variant === 'secondary') {
      return {
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
      };
    }

    if (variant === 'outline') {
      return {
        backgroundColor: colors.soft,
        borderColor: colors.glassBorder || colors.grid,
      };
    }

    if (variant === 'danger') {
      return {
        backgroundColor: colors.danger || colors.secondary,
        borderColor: colors.danger || colors.secondary,
      };
    }

    return {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    };
  };

  const textColor = variant === 'primary' ? '#2b1a10' : colors.text;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        getStyle(),
        {
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          shadowColor: colors.primary,
        },
      ]}
    >
      <Text style={[styles.txt, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginVertical: 7,
    borderWidth: 1,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  txt: {
    fontWeight: '900',
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
});