export type RotationDirection = 'left' | 'right' | 'none';
export type ToastTone = 'success' | 'error' | 'info';
export type ObstacleShape = 'rect' | 'ellipse';
export type StageSolutionReason = 'success' | 'giveup';

export interface Point {
  x: number;
  y: number;
}

export interface TurtleState extends Point {
  angle: number;
}

export interface PathSegment {
  from: Point;
  to: Point;
}

export interface MoveCommand {
  type: 'move';
  rotation: RotationDirection;
  angle: number;
  distanceCm: number;
}

export interface CatchCommand {
  type: 'catch';
}

export type GameCommand = MoveCommand | CatchCommand;

export interface CommandDraft {
  rotation: RotationDirection;
  angle: number;
  distanceCm: number;
}

export interface Obstacle {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: ObstacleShape;
  tone: string;
}

export interface LevelConfig {
  id: number;
  label: string;
  start: TurtleState;
  treasure: Point;
  goal: string;
  solution: GameCommand[];
}

export interface GameRecord {
  id: string;
  completedAt: string;
  durationMs: number;
}

export interface StoredSession {
  level: number;
  commands: GameCommand[];
  turtle: TurtleState;
  pathSegments: PathSegment[];
  runStartedAt: number | null;
  draft: CommandDraft;
}

export interface StoredGameData {
  session: StoredSession;
  records: GameRecord[];
}

export interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
}

export interface StageSolutionState {
  level: number;
  reason: StageSolutionReason;
}

export interface CollisionResult {
  kind: 'obstacle' | 'boundary';
  safePoint: Point;
  collisionPoint: Point;
  obstacle?: Obstacle;
}
