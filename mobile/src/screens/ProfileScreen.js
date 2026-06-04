import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';

import { useGame } from '../context/GameContext';
import { palette } from '../styles/theme';
import PixelButton from '../components/PixelButton';
import GlassTabBar from '../components/GlassTabBar';

export default function ProfileScreen({ navigation }) {
  const { theme, profile, updateProfile, resetStats } = useGame();
  const colors = palette[theme];

  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);

  const stats = profile.stats || {
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  };

  const save = async () => {
    await updateProfile({
      name: name.trim() || 'Dev Player',
      avatar: avatar.trim() || '♙',
    });

    Alert.alert('Perfil actualizado', 'Tu perfil de jugador fue guardado.');
  };

  const reset = () => {
    Alert.alert(
      'Reiniciar estadísticas',
      '¿Deseas borrar tus estadísticas locales?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: resetStats,
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <Text style={[styles.title, { color: colors.accent }]}>Perfil</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>
          Personaliza tu identidad y revisa tus estadísticas locales.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <View style={[styles.avatarBox, { backgroundColor: colors.soft, borderColor: colors.glassBorder }]}>
            <Text style={[styles.avatar, { color: colors.accent }]}>{avatar || '♙'}</Text>
          </View>

          <Text style={[styles.label, { color: colors.muted }]}>NOMBRE DEL JUGADOR</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nombre del jugador"
            placeholderTextColor={colors.muted}
            style={[styles.input, { color: colors.text, borderColor: colors.grid }]}
          />

          <Text style={[styles.label, { color: colors.muted }]}>AVATAR / SÍMBOLO</Text>
          <TextInput
            value={avatar}
            onChangeText={setAvatar}
            placeholder="♙"
            placeholderTextColor={colors.muted}
            style={[styles.input, { color: colors.text, borderColor: colors.grid }]}
          />

          <Text style={[styles.id, { color: colors.muted }]}>ID Local: {profile.playerId}</Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.grid }]}>
          <Stat label="Jugadas" value={stats.played} colors={colors} />
          <Stat label="Ganadas" value={stats.wins} colors={colors} />
          <Stat label="Perdidas" value={stats.losses} colors={colors} />
          <Stat label="Empates" value={stats.draws} colors={colors} />
        </View>

        <PixelButton title="GUARDAR PERFIL" onPress={save} colors={colors} />
        <PixelButton title="REINICIAR ESTADÍSTICAS" variant="danger" onPress={reset} colors={colors} />
      </ScrollView>

      <GlassTabBar navigation={navigation} active="Profile" colors={colors} />
    </View>
  );
}

function Stat({ label, value, colors }) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.soft, borderColor: colors.glassBorder }]}>
      <Text style={[styles.statValue, { color: colors.accent }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  page: {
    padding: 22,
    paddingTop: 80,
    paddingBottom: 118,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
  },
  sub: {
    marginTop: 8,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 18,
    marginVertical: 16,
  },
  avatarBox: {
    width: 86,
    height: 86,
    borderWidth: 1,
    borderRadius: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 42,
    fontWeight: '900',
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginVertical: 10,
    fontSize: 16,
    fontWeight: '800',
  },
  id: {
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '800',
  },
  statsCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },
});