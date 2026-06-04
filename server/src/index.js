import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import { rooms, baseRoom, check, resetRound } from './game.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

app.get('/', (_, res) => {
  res.json({
    app: 'CodeClash Tic Tac Toe',
    status: 'online',
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
});

io.on('connection', (socket) => {
  socket.on('createRoom', (payload, callback) => {
    const room = baseRoom({
      id: socket.id,
      name: payload.name,
      avatar: payload.avatar,
    });

    rooms.set(room.code, room);
    socket.join(room.code);

    callback({ ok: true, code: room.code });
    io.to(room.code).emit('roomUpdate', room);
  });

  socket.on('joinRoom', ({ code, name, avatar }, callback) => {
    const room = rooms.get(code);

    if (!room) {
      return callback({ ok: false, message: 'El código no existe.' });
    }

    if (room.players.O) {
      return callback({ ok: false, message: 'La sala ya tiene dos jugadores.' });
    }

    room.players.O = {
      id: socket.id,
      name,
      avatar,
    };

    socket.join(code);

    callback({ ok: true, code });
    io.to(code).emit('roomUpdate', room);
  });

  socket.on('roomState', ({ code }, callback) => {
    const room = rooms.get(code);

    callback({
      ok: !!room,
      state: room,
    });
  });

  socket.on('startGame', ({ code }, callback) => {
    const room = rooms.get(code);

    if (!room?.players.O) {
      return callback({
        ok: false,
        message: 'Falta el segundo jugador para iniciar la partida.',
      });
    }

    io.to(code).emit('startGame', room);
    callback({ ok: true });
  });

  socket.on('makeMove', ({ code, index, symbol }, callback) => {
    const room = rooms.get(code);

    if (!room || room.matchWinner) {
      return callback({ ok: false, message: 'La partida ya no está activa.' });
    }

    const player = room.players[symbol];

    if (!player || player.id !== socket.id) {
      return callback({ ok: false, message: 'Jugador inválido para esta sala.' });
    }

    if (room.turn !== symbol) {
      return callback({
        ok: false,
        message: 'Espera tu turno. Tu rival está realizando su movimiento.',
      });
    }

    if (room.board[index]) {
      return callback({
        ok: false,
        message: 'Casilla ocupada. Selecciona otra posición.',
      });
    }

    room.board[index] = symbol;

    const result = check(room.board);

    if (result) {
      room.roundWinner = result.winner;
      room.winningLine = result.line;

      if (result.winner !== 'DRAW') {
        room.scores[result.winner] += 1;
        room.message = `${room.players[result.winner]?.name || result.winner} ganó la ronda.`;
      } else {
        room.message = 'Empate técnico. Nadie completó una línea ganadora.';
      }

      if (room.scores.X === 3 || room.scores.O === 3 || room.round === 5) {
        if (room.scores.X > room.scores.O) room.matchWinner = 'X';
        if (room.scores.O > room.scores.X) room.matchWinner = 'O';

        io.to(code).emit('matchFinished', room);
      } else {
        io.to(code).emit('gameState', room);
      }
    } else {
      room.turn = symbol === 'X' ? 'O' : 'X';
      room.message = room.turn === 'X' ? 'Turno de X.' : 'Turno de O.';
      io.to(code).emit('gameState', room);
    }

    callback({ ok: true });
  });

  socket.on('nextRound', ({ code }, callback) => {
    const room = rooms.get(code);

    if (!room || !room.roundWinner) {
      return callback({
        ok: false,
        message: 'La ronda sigue activa.',
      });
    }

    if (room.matchWinner) {
      return callback({
        ok: false,
        message: 'La serie terminó.',
      });
    }

    room.round += 1;
    resetRound(room);

    io.to(code).emit('gameState', room);
    callback({ ok: true });
  });

  socket.on('leaveRoom', ({ code, symbol }) => {
    const room = rooms.get(code);

    if (!room) return;

    io.to(code).emit('playerLeft', {
      symbol,
      message: `${room.players[symbol]?.name || 'Un jugador'} abandonó la partida.`,
    });

    rooms.delete(code);
  });

  socket.on('disconnect', () => {
    for (const [code, room] of rooms.entries()) {
      for (const symbol of ['X', 'O']) {
        if (room.players[symbol]?.id === socket.id) {
          io.to(code).emit('playerLeft', {
            symbol,
            message: `${room.players[symbol]?.name || 'Un jugador'} perdió la conexión.`,
          });

          rooms.delete(code);
        }
      }
    }
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`CodeClash server on ${process.env.PORT || 4000}`);
});