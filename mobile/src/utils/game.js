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

export function winner(board) {
  for (const [a, b, c] of winLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { symbol: board[a], line: [a, b, c] };
    }
  }

  if (board.every(Boolean)) {
    return { symbol: 'DRAW', line: [] };
  }

  return null;
}

export function emptyCells(board) {
  return board
    .map((value, index) => (value ? null : index))
    .filter((value) => value !== null);
}

export function getSmartAiMove(board, aiSymbol = 'O', humanSymbol = 'X') {
  const available = emptyCells(board);

  if (available.length === 0) return null;

  const minimax = (currentBoard, isMaximizing) => {
    const result = winner(currentBoard);

    if (result?.symbol === aiSymbol) return 10;
    if (result?.symbol === humanSymbol) return -10;
    if (result?.symbol === 'DRAW') return 0;

    const cells = emptyCells(currentBoard);

    if (isMaximizing) {
      let bestScore = -Infinity;

      for (const cell of cells) {
        currentBoard[cell] = aiSymbol;
        const score = minimax(currentBoard, false);
        currentBoard[cell] = null;
        bestScore = Math.max(score, bestScore);
      }

      return bestScore;
    }

    let bestScore = Infinity;

    for (const cell of cells) {
      currentBoard[cell] = humanSymbol;
      const score = minimax(currentBoard, true);
      currentBoard[cell] = null;
      bestScore = Math.min(score, bestScore);
    }

    return bestScore;
  };

  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const cell of available) {
    board[cell] = aiSymbol;
    const score = minimax(board, false);
    board[cell] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = cell;
    }
  }

  return bestMove;
}

export function createInitialLocalState(mode, playerName) {
  const isAi = mode === 'ai';

  return {
    mode,
    players: {
      X: {
        name: playerName || 'Dev Player',
        avatar: '</>',
      },
      O: {
        name: isAi ? 'CodeBot IA' : 'Jugador 2',
        avatar: isAi ? 'AI' : '{}',
      },
    },
    board: Array(9).fill(null),
    turn: 'X',
    round: 1,
    scores: { X: 0, O: 0 },
    roundWinner: null,
    matchWinner: null,
    winningLine: [],
    message: 'Inicia la primera ronda. Planea tu jugada.',
  };
}

export function resetLocalRound(state) {
  return {
    ...state,
    board: Array(9).fill(null),
    turn: state.round % 2 === 1 ? 'X' : 'O',
    roundWinner: null,
    winningLine: [],
    message: 'Nueva ronda iniciada. Mantén la estrategia.',
  };
}