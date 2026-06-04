export const rooms = new Map();

export const winLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const code = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export function check(board) {
  for (const line of winLines) {
    const [a, b, c] = line;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        line,
      };
    }
  }

  return board.every(Boolean)
    ? {
        winner: 'DRAW',
        line: [],
      }
    : null;
}

export function baseRoom(host) {
  return {
    code: code(),
    players: {
      X: host,
    },
    board: Array(9).fill(null),
    turn: 'X',
    round: 1,
    scores: {
      X: 0,
      O: 0,
    },
    roundWinner: null,
    matchWinner: null,
    winningLine: [],
    message: 'Partida creada. Esperando al segundo jugador.',
  };
}

export function resetRound(room) {
  room.board = Array(9).fill(null);
  room.turn = room.round % 2 === 1 ? 'X' : 'O';
  room.roundWinner = null;
  room.winningLine = [];
  room.message = 'Nueva ronda iniciada. La serie continúa.';
}