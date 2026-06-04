import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  Vibration,
  ScrollView,
} from 'react-native';

import { useGame } from '../context/GameContext';
import { palette } from '../styles/theme';
import ScoreBoard from '../components/ScoreBoard';
import PixelButton from '../components/PixelButton';
import { socket } from '../services/socket';
import { winner, getSmartAiMove, resetLocalRound } from '../utils/game';
import { playSound } from '../services/sound';

export default function GameScreen({ route, navigation }) {
  const {
    theme,
    settings,
    registerMatchResult,
    registerOnlineMatch,
  } = useGame();

  const colors = palette[theme];

  const {
    roomCode,
    symbol,
    state: initial,
    mode = 'online',
  } = route.params;

  const [state, setState] = useState(initial);
  const [resultModal, setResultModal] = useState(null);
  const [notice, setNotice] = useState('');

  const finalHandledRef = useRef(false);
  const me = symbol;

  useEffect(() => {
    if (mode !== 'online') return;

    const onGameState = (serverState) => {
      setState(serverState);
      setNotice('');
    };

    const onMatchFinished = (serverState) => {
      setState(serverState);
      setNotice('');
      handleFinalResult(serverState);
    };

    const onPlayerLeft = (payload) => {
      setNotice(payload?.message || 'El rival abandonó la partida.');

      setResultModal({
        title: 'Partida abandonada',
        message: 'El otro jugador salió de la mesa. La partida se cerró automáticamente.',
        type: 'info',
      });

      playSound('invalid', settings);
    };

    socket.on('gameState', onGameState);
    socket.on('matchFinished', onMatchFinished);
    socket.on('playerLeft', onPlayerLeft);

    return () => {
      socket.off('gameState', onGameState);
      socket.off('matchFinished', onMatchFinished);
      socket.off('playerLeft', onPlayerLeft);
    };
  }, [mode, me, settings]);

  useEffect(() => {
    if (mode !== 'ai') return;
    if (!state || state.matchWinner || state.roundWinner) return;
    if (state.turn !== 'O') return;

    const timeout = setTimeout(() => {
      const move = getSmartAiMove([...state.board], 'O', 'X');

      if (move !== null) {
        makeLocalMove(move, 'O');
      }
    }, 650);

    return () => clearTimeout(timeout);
  }, [state, mode]);

  const vibrate = () => {
    if (settings.vibration) {
      Vibration.vibrate(60);
    }
  };

  const getOpponent = (finalState) => {
    const rivalSymbol = me === 'X' ? 'O' : 'X';
    return finalState?.players?.[rivalSymbol] || null;
  };

  const getLocalResult = (finalState) => {
    const winnerSymbol = finalState.matchWinner;

    if (!winnerSymbol) return 'draw';
    if (winnerSymbol === me) return 'win';
    return 'loss';
  };

  const handleFinalResult = async (finalState) => {
    if (finalHandledRef.current) return;
    finalHandledRef.current = true;

    const winnerSymbol = finalState.matchWinner;
    const isDraw = !winnerSymbol;
    const didWin = winnerSymbol === me;
    const result = getLocalResult(finalState);

    if (mode === 'online') {
      const opponent = getOpponent(finalState);

      await registerOnlineMatch({
        opponent: {
          id: opponent?.id,
          socketId: opponent?.id,
          playerId: opponent?.playerId,
          name: opponent?.name,
          avatar: opponent?.avatar,
        },
        result,
      });
    } else {
      await registerMatchResult(result);
    }

    await playSound(
      isDraw ? 'draw' : didWin ? 'matchWin' : 'matchLoss',
      settings
    );

    setResultModal({
      title: isDraw ? 'Empate general' : didWin ? 'Victoria de serie' : 'Derrota de serie',
      message: buildFinalMessage(finalState, didWin, isDraw),
      type: didWin ? 'win' : isDraw ? 'draw' : 'loss',
    });
  };

  const buildFinalMessage = (finalState, didWin, isDraw) => {
    if (isDraw) {
      return `La serie terminó igualada.\n\nMarcador final:\nX ${finalState.scores.X} - O ${finalState.scores.O}\n\nNo hubo campeón definitivo. El resultado fue guardado en tus estadísticas.`;
    }

    if (didWin) {
      return `Ganaste la serie al mejor de 5 partidas.\n\nMarcador final:\nX ${finalState.scores.X} - O ${finalState.scores.O}\n\nResultado registrado en tu perfil. Si jugaste por código, el rival fue agregado a tu ranking local.`;
    }

    return `Tu rival ganó la serie.\n\nMarcador final:\nX ${finalState.scores.X} - O ${finalState.scores.O}\n\nLa partida quedó registrada en tu historial local. Si jugaste por código, el rival fue agregado a tu ranking.`;
  };

  const tap = async (index) => {
    vibrate();

    if (mode === 'online') {
      socket.emit(
        'makeMove',
        {
          code: roomCode,
          index,
          symbol: me,
        },
        async (response) => {
          if (!response?.ok && response?.message) {
            setNotice(response.message);
            await playSound('invalid', settings);
          }
        }
      );

      return;
    }

    if (mode === 'ai') {
      if (state.turn !== 'X') {
        setNotice('Espera tu turno. CodeBot IA está calculando su jugada.');
        await playSound('invalid', settings);
        return;
      }

      makeLocalMove(index, 'X');
      return;
    }

    makeLocalMove(index, state.turn);
  };

  const makeLocalMove = async (index, currentSymbol) => {
    if (!state || state.matchWinner) return;

    if (state.roundWinner) {
      setNotice('La ronda ya terminó. Presiona “Siguiente partida”.');
      await playSound('invalid', settings);
      return;
    }

    if (state.board[index]) {
      setNotice('Casilla ocupada. Selecciona otra posición del tablero.');
      await playSound('invalid', settings);
      return;
    }

    const updatedBoard = [...state.board];
    updatedBoard[index] = currentSymbol;

    await playSound('move', settings);

    const result = winner(updatedBoard);

    if (result) {
      const updatedScores = { ...state.scores };
      let message = '';

      if (result.symbol === 'DRAW') {
        message = 'Empate técnico. Nadie completó una línea ganadora en esta ronda.';
        await playSound('draw', settings);
      } else {
        updatedScores[result.symbol] += 1;
        message = `${state.players[result.symbol]?.name || result.symbol} ganó la ronda con una línea estratégica.`;
        await playSound('roundWin', settings);
      }

      const roundLimitReached = state.round === 5;
      const reachedThree = updatedScores.X === 3 || updatedScores.O === 3;

      let matchWinner = null;

      if (reachedThree || roundLimitReached) {
        if (updatedScores.X > updatedScores.O) matchWinner = 'X';
        if (updatedScores.O > updatedScores.X) matchWinner = 'O';
      }

      const finalState = {
        ...state,
        board: updatedBoard,
        scores: updatedScores,
        roundWinner: result.symbol,
        winningLine: result.line,
        matchWinner,
        message,
      };

      setState(finalState);
      setNotice('');

      if (matchWinner || roundLimitReached) {
        handleFinalResult(finalState);
      }

      return;
    }

    setState({
      ...state,
      board: updatedBoard,
      turn: currentSymbol === 'X' ? 'O' : 'X',
      message: currentSymbol === 'X' ? 'Turno de O.' : 'Turno de X.',
    });

    setNotice('');
  };

  const next = () => {
    vibrate();

    if (mode === 'online') {
      socket.emit('nextRound', { code: roomCode }, (response) => {
        if (!response?.ok) {
          setNotice(response?.message || 'No disponible.');
          playSound('invalid', settings);
        }
      });

      return;
    }

    if (!state.roundWinner) {
      setNotice('La ronda sigue activa.');
      playSound('invalid', settings);
      return;
    }

    const nextState = resetLocalRound({
      ...state,
      round: state.round + 1,
    });

    setState(nextState);
    setNotice('');
    playSound('tap', settings);
  };

  const leaveMatch = () => {
    Alert.alert(
      'Abandonar partida',
      '¿Seguro que deseas salir de esta partida? El progreso actual se cerrará.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abandonar',
          style: 'destructive',
          onPress: () => {
            if (mode === 'online') {
              socket.emit('leaveRoom', { code: roomCode, symbol: me });
            }

            navigation.replace('Home');
          },
        },
      ]
    );
  };

  const closeResult = () => {
    setResultModal(null);
    navigation.replace('Home');
  };

  const getStatus = () => {
    if (!state) return '';

    if (state.matchWinner) {
      return `Campeón: ${state.players[state.matchWinner]?.name || state.matchWinner}`;
    }

    if (state.roundWinner === 'DRAW') {
      return 'Empate técnico en la ronda';
    }

    if (state.roundWinner) {
      return `Ronda ganada por ${state.players[state.roundWinner]?.name || state.roundWinner}`;
    }

    if (mode === 'online') {
      return state.turn === me ? 'Tu turno' : 'Turno del rival';
    }

    if (mode === 'ai') {
      return state.turn === 'X' ? 'Tu turno' : 'CodeBot IA está pensando';
    }

    return `Turno de ${state.players[state.turn]?.name || state.turn}`;
  };

  const getMessage = () => {
    if (notice) return notice;

    if (state?.matchWinner) {
      return 'La serie terminó. Revisa el resultado final.';
    }

    if (state?.roundWinner === 'DRAW') {
      return 'Ronda empatada. Ningún jugador completó línea.';
    }

    if (state?.roundWinner) {
      return 'Ronda finalizada. Puedes avanzar a la siguiente partida.';
    }

    if (mode === 'online') {
      return state.turn === me
        ? 'Selecciona una casilla disponible para realizar tu movimiento.'
        : 'Espera el movimiento del rival.';
    }

    if (mode === 'ai') {
      return state.turn === 'X'
        ? 'Selecciona una casilla antes de que la IA tome ventaja.'
        : 'CodeBot IA está analizando el tablero.';
    }

    return 'Jugador actual: selecciona una casilla disponible.';
  };

  const cell = (value, index) => (
    <Pressable
      key={index}
      onPress={() => tap(index)}
      style={[
        styles.cell,
        { borderColor: colors.grid, backgroundColor: colors.card },
        state?.winningLine?.includes(index) && {
          borderColor: colors.accent,
          borderWidth: 3,
        },
      ]}
    >
      <Text style={[styles.mark, { color: value === 'X' ? colors.primary : colors.secondary }]}>
        {value === 'X' ? 'X' : value === 'O' ? 'O' : ''}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.page, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: colors.primary }]}>CODECLASH ARENA</Text>

        <ScoreBoard
          players={state.players}
          scores={state.scores}
          round={state.round}
          colors={colors}
        />

        <View style={[styles.statusBox, { backgroundColor: colors.card, borderColor: colors.grid }]}>
          <Text style={[styles.status, { color: colors.text }]}>{getStatus()}</Text>
          <Text style={[styles.message, { color: colors.muted }]}>
            {getMessage()}
          </Text>
        </View>

        <View style={styles.board}>{state.board.map(cell)}</View>

        <Text style={[styles.code, { color: colors.muted }]}>
          Sala: {roomCode} | Modo: {mode === 'online' ? 'Multijugador' : mode === 'ai' ? 'Contra IA' : 'Local 2P'}
        </Text>

        {state.roundWinner && !state.matchWinner ? (
          <PixelButton title="SIGUIENTE PARTIDA" onPress={next} colors={colors} />
        ) : null}

        <PixelButton title="ABANDONAR PARTIDA" variant="danger" onPress={leaveMatch} colors={colors} />
      </ScrollView>

      <Modal visible={!!resultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.grid }]}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>
              {resultModal?.title}
            </Text>

            <Text style={[styles.modalText, { color: colors.text }]}>
              {resultModal?.message}
            </Text>

            <PixelButton title="CERRAR Y VOLVER AL INICIO" onPress={closeResult} colors={colors} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    padding: 18,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  statusBox: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginVertical: 12,
  },
  status: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '700',
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    width: 330,
  },
  cell: {
    width: 104,
    height: 104,
    borderWidth: 1,
    borderRadius: 22,
    margin: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    fontSize: 54,
    fontWeight: '900',
  },
  code: {
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
    fontWeight: '700',
  },
});