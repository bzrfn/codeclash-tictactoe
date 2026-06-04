import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CodeCard({ code, colors }) {
  return (
    <View style={[styles.card, { borderColor: colors.glassBorder, backgroundColor: colors.soft }]}>
      <Text style={[styles.label, { color: colors.muted }]}>CÓDIGO DE MESA</Text>
      <Text selectable style={[styles.code, { color: colors.accent }]}>
        {code || '----'}
      </Text>
      <Text style={[styles.hint, { color: colors.muted }]}>
        Compártelo para conectar al segundo jugador.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginVertical: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  code: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 8,
    marginVertical: 6,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});