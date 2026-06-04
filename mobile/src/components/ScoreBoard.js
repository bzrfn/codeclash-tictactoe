import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ScoreBoard({ players = {}, scores = { X: 0, O: 0 }, round = 1, colors }) {
  return (
    <View style={[styles.box, { backgroundColor: colors.soft, borderColor: colors.glassBorder }]}>
      <View style={styles.player}>
        <Text style={[styles.label, { color: colors.muted }]}>X · {players.X?.name || 'Jugador X'}</Text>
        <Text style={[styles.score, { color: colors.primary }]}>{scores.X || 0}</Text>
      </View>

      <View style={[styles.center, { borderColor: colors.grid }]}>
        <Text style={[styles.vs, { color: colors.accent }]}>RONDA</Text>
        <Text style={[styles.round, { color: colors.text }]}>{round}/5</Text>
      </View>

      <View style={styles.player}>
        <Text style={[styles.label, { color: colors.muted }]}>O · {players.O?.name || 'Jugador O'}</Text>
        <Text style={[styles.score, { color: colors.secondary }]}>{scores.O || 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  player: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
  },
  score: {
    fontSize: 36,
    fontWeight: '900',
    marginTop: 4,
  },
  center: {
    width: 82,
    height: 82,
    borderWidth: 1,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  vs: {
    fontSize: 10,
    fontWeight: '900',
  },
  round: {
    fontSize: 22,
    fontWeight: '900',
  },
});