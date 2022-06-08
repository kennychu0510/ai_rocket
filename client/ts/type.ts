export type Position = {
  x: number;
  y: number;
};

export type GameBoundary = {
  top: number;
  left: number;
  right: number;
  bot: number;
};

export type BlackholePairType = {
  blackhole1: Position;
  blackhole2: Position;
};

export type gameDOMelements = {
  totalScore: Element;
  currentScore: Element;
  timerMilliseconds: Element;
  timerSeconds: Element;
  aiStats: Element;
};

export type RocketColor = {
  r: number;
  g: number;
  b: number;
}
