import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import { useGame } from '../context/GameContext';
import { palette } from '../styles/theme';
import CodeCard from '../components/CodeCard';
import PixelButton from '../components/PixelButton';
import { socket } from '../services/socket';

export default function LobbyScreen({ route, navigation }) {
  const { theme } = useGame();
  const colors = palette[theme];

  const { roomCode, symbol } = route.params;
  const [players, setPlayers] = useState({});

  useEffect(() => {
    socket.emit('roomState', { code: roomCode }, (response) => {
      if (response?.state) setPlayers(response.state.players);
    });

    socket.on('roomUpdate', (state) => setPlayers(state.players));

    socket.on('startGame', (state) => {
      navigation.replace('Game', {
        mode: 'online',
        roomCode,
        symbol,
        state,
      });
    });

    socket.on('playerLeft', (payload) => {
      Alert.alert('Jugador desconectado', payload?.message || 'El otro jugador salió de la sala.');
    });

    return () => {
      socket.off('roomUpdate');
      socket.off('startGame');
      socket.off('playerLeft');
    };
  }, [roomCode, symbol, navigation]);

  const start = () => {
    socket.emit('startGame', { code: roomCode }, (response) => {
      if (!response?.ok) {
        Alert.alert('Espera al segundo jugador', response?.message || 'Faltan jugadores.');
      }
    });
  };

  const leave = () => {
    socket.emit('leaveRoom', { code: roomCode, symbol });
    navigation.replace('Home');
  };

  return (
    <View style={[styles.page, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Lobby de Compilación</Text>
      <Text style={[styles.sub, { color: colors.muted }]}>
        Conecta a los dos jugadores antes de iniciar la ronda.
      </Text>

      <CodeCard code={roomCode} colors={colors} />

      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.grid }]}>
        <Text style={[styles.item, { color: colors.primary }]}>
          X: {players.X?.name || 'Esperando host...'}
        </Text>

        <Text style={[styles.item, { color: colors.secondary }]}>
          O: {players.O?.name || 'Esperando invitado...'}
        </Text>
      </View>

      {symbol === 'X' ? (
        <PixelButton
          title="INICIAR PARTIDA"
          onPress={start}
          colors={colors}
          disabled={!players.O}
        />
      ) : (
        <Text style={[styles.wait, { color: colors.muted }]}>
          Esperando a que el host inicie...
        </Text>
      )}

      <PixelButton title="SALIR DEL LOBBY" variant="secondary" onPress={leave} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 22,
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
  },
  sub: {
    fontSize: 15,
    marginVertical: 8,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginVertical: 10,
  },
  item: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 8,
  },
  wait: {
    textAlign: 'center',
    marginVertical: 14,
    fontWeight: '800',
  },
});