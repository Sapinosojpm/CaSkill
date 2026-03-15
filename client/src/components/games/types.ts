export type GameFinishHandler = (result: {
  score: number;
  durationSeconds: number;
  clientMeta: Record<string, unknown>;
}) => void;
