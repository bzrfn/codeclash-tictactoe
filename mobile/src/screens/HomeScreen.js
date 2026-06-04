import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useGame } from '../context/GameContext';
import { palette } from '../styles/theme';
import PixelButton from '../components/PixelButton';
import GlassTabBar from '../components/GlassTabBar';
import { socket } from '../services/socket';
import { createInitialLocalState } from '../utils/game';

export default function HomeScreen({ navigation }) {
  const { theme, profile, updateProfile } = useGame();
  const colors = palette[theme];

  const [name, setName] = useState(profile.name);
  const [joinCode, setJoinCode] = useState('');

  const saveName = async () => {
    await updateProfile({
      name: name.trim() || 'Dev Player',
    });
  };

  const connect = async () => {
    if (!socket.connected) socket.connect();

    await updateProfile({
      name: name.trim() || 'Dev Player',
    });
  };

  const create = async () => {
    await connect();

    socket.emit(
      'createRoom',
      {
        name: name.trim() || 'Dev Player',
        avatar: profile.avatar,
      },
      (res) => {
        if (res?.ok) {
          navigation.navigate('Lobby', {
            roomCode: res.code,
            symbol: 'X',
          });
        } else {
          Alert.alert('Error de sala', res?.message || 'No se pudo crear la mesa.');
        }
      }
    );
  };

  const join = async () => {
    if (joinCode.trim().length < 4) {
      Alert.alert('Código requerido', 'Escribe el código generado por el otro jugador.');
      return;
    }

    await connect();

    socket.emit(
      'joinRoom',
      {
        code: joinCode.trim().toUpperCase(),
        name: name.trim() || 'Dev Player',
        avatar: profile.avatar,
      },
      (res) => {
        if (res?.ok) {
          navigation.navigate('Lobby', {
            roomCode: res.code,
            symbol: 'O',
          });
        } else {
          Alert.alert('Mesa no disponible', res?.message || 'No se pudo unir a la partida.');
        }
      }
    );
  };

  const playVsAi = async () => {
    await saveName();

    const initialState = createInitialLocalState('ai', name.trim() || 'Dev Player');

    navigation.navigate('Game', {
      mode: 'ai',
      roomCode: 'LOCAL-IA',
      symbol: 'X',
      state: initialState,
    });
  };

  const playLocal = async () => {
    await saveName();

    const initialState = createInitialLocalState('local', name.trim() || 'Dev Player');

    navigation.navigate('Game', {
      mode: 'local',
      roomCode: 'LOCAL-2P',
      symbol: 'X',
      state: initialState,
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <View style={[styles.hero, { backgroundColor: colors.bg2, borderColor: colors.grid }]}>
          <Text style={[styles.logo, { color: colors.accent }]}>CodeClash</Text>
          <Text style={[styles.title, { color: colors.text }]}>Tic Tac Toe</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Juego de mesa digital con IA, modo local y partidas por código.
          </Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <View>
            <Text style={[styles.smallLabel, { color: colors.muted }]}>JUGADOR</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.muted}
              style={[styles.nameInput, { color: colors.text, borderColor: colors.grid }]}
            />
          </View>

          <View style={[styles.avatar, { backgroundColor: colors.soft, borderColor: colors.glassBorder }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>{profile.avatar || '♙'}</Text>
          </View>
        </View>

        <Text style={[styles.section, { color: colors.text }]}>Elige modo de juego</Text>

        <View style={styles.modeGrid}>
          <View style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.grid }]}>
            <Text style={[styles.modeIcon, { color: colors.accent }]}>♟</Text>
            <Text style={[styles.modeTitle, { color: colors.text }]}>Contra IA</Text>
            <Text style={[styles.modeSub, { color: colors.muted }]}>Rival inteligente con estrategia Minimax.</Text>
            <PixelButton title="JUGAR" onPress={playVsAi} colors={colors} />
          </View>

          <View style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.grid }]}>
            <Text style={[styles.modeIcon, { color: colors.accent }]}>♙</Text>
            <Text style={[styles.modeTitle, { color: colors.text }]}>Local 2P</Text>
            <Text style={[styles.modeSub, { color: colors.muted }]}>Dos jugadores en el mismo dispositivo.</Text>
            <PixelButton title="JUGAR" variant="outline" onPress={playLocal} colors={colors} />
          </View>
        </View>

        <View style={[styles.onlineCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Text style={[styles.onlineTitle, { color: colors.text }]}>Mesa multijugador</Text>
          <Text style={[styles.onlineSub, { color: colors.muted }]}>
            Genera un código o entra con el código de otro jugador.
          </Text>

          <PixelButton title="GENERAR CÓDIGO" onPress={create} colors={colors} />

          <TextInput
            autoCapitalize="characters"
            maxLength={6}
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="AB12CD"
            placeholderTextColor={colors.muted}
            style={[
              styles.codeInput,
              {
                color: colors.text,
                borderColor: colors.grid,
              },
            ]}
          />

          <PixelButton title="ENTRAR A MESA" variant="secondary" onPress={join} colors={colors} />
        </View>

        <Text style={[styles.footer, { color: colors.muted }]}>
          Serie máxima de 5 rondas. Gana quien llegue primero a 3 victorias.
        </Text>
      </ScrollView>

      <GlassTabBar navigation={navigation} active="Home" colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  page: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 118,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 22,
    marginBottom: 16,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  smallLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nameInput: {
    minWidth: 230,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
    fontSize: 17,
    fontWeight: '900',
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
  },
  section: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modeCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 26,
    padding: 14,
  },
  modeIcon: {
    fontSize: 32,
    fontWeight: '900',
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  modeSub: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
    minHeight: 50,
  },
  onlineCard: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 18,
  },
  onlineTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  onlineSub: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 10,
  },
  codeInput: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginVertical: 10,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 5,
    textAlign: 'center',
  },
  footer: {
    marginTop: 18,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '700',
  },
});