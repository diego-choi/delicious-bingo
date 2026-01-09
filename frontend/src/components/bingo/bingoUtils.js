// 12개의 빙고 라인 (가로 5, 세로 5, 대각선 2)
export const WINNING_LINES = [
  // 가로
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // 세로
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // 대각선
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

/**
 * 완료된 빙고 라인 계산
 * @param {Array} cells - 셀 배열
 * @returns {Array} 완료된 라인의 배열
 */
export function getCompletedLines(cells) {
  const activatedPositions = new Set(
    cells.filter((cell) => cell.is_activated).map((cell) => cell.position)
  );

  return WINNING_LINES.filter((line) =>
    line.every((pos) => activatedPositions.has(pos))
  );
}

/**
 * 하이라이트 해야 할 셀 위치 계산
 * @param {Array} completedLines - 완료된 라인 배열
 * @returns {Set} 하이라이트 할 위치 Set
 */
export function getHighlightedPositions(completedLines) {
  const positions = new Set();
  completedLines.forEach((line) => {
    line.forEach((pos) => positions.add(pos));
  });
  return positions;
}
