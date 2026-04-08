import type {
  CommandDraft,
  GameCommand,
  LevelConfig,
  Obstacle,
  RotationDirection,
} from '../types/game';

export const MAP_WIDTH = 600;
export const MAP_HEIGHT = 500;
export const MAP_UNITS_PER_CM = 10;
export const MAP_WIDTH_CM = MAP_WIDTH / MAP_UNITS_PER_CM;
export const MAP_HEIGHT_CM = MAP_HEIGHT / MAP_UNITS_PER_CM;
export const TURTLE_RADIUS = 16;
export const TREASURE_CATCH_RADIUS = 56;
export const MAX_RECORDS = 8;
export const MIN_MOVE_CM = 1;
export const MAX_MOVE_CM = 24;

export const DEFAULT_COMMAND_DRAFT: CommandDraft = {
  rotation: 'none',
  angle: 90,
  distanceCm: 5,
};

function move(rotation: RotationDirection, angle: number, distanceCm: number): GameCommand {
  return {
    type: 'move',
    rotation,
    angle,
    distanceCm,
  };
}

const catchCommand: GameCommand = { type: 'catch' };

export function cmToMapUnits(distanceCm: number) {
  return distanceCm * MAP_UNITS_PER_CM;
}

export function mapUnitsToCm(distance: number) {
  return distance / MAP_UNITS_PER_CM;
}

export const OBSTACLES: Obstacle[] = [
  { id: 'b-main', name: '본관', x: 100, y: 20, width: 120, height: 80, shape: 'rect', tone: 'main' },
  { id: 'b-parking', name: '주차장', x: 280, y: 30, width: 80, height: 50, shape: 'rect', tone: 'parking' },
  { id: 'b-gate', name: '교문', x: 450, y: 10, width: 60, height: 70, shape: 'rect', tone: 'gate' },
  { id: 'b-guard', name: '경비실', x: 520, y: 20, width: 70, height: 80, shape: 'rect', tone: 'guard' },
  { id: 'b-field', name: '운동장', x: 180, y: 250, width: 250, height: 120, shape: 'ellipse', tone: 'field' },
  { id: 'b-food', name: '급식실', x: 250, y: 400, width: 80, height: 80, shape: 'rect', tone: 'food' },
  { id: 'b-hall', name: '강당', x: 400, y: 380, width: 150, height: 100, shape: 'rect', tone: 'hall' },
  { id: 'b-garden', name: '텃밭', x: 50, y: 380, width: 80, height: 60, shape: 'rect', tone: 'garden' },
  { id: 'b-water', name: '수돗가', x: 60, y: 310, width: 60, height: 40, shape: 'rect', tone: 'water' },
];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    label: '주차장 아래 첫 보물',
    start: { x: 480, y: 100, angle: 180 },
    treasure: { x: 390, y: 150 },
    goal: '먼저 아래로 내려온 뒤 왼쪽으로 꺾어 첫 번째 보물을 잡아 보세요.',
    solution: [move('none', 0, 5), move('right', 90, 9), catchCommand],
  },
  {
    id: 2,
    label: '본관 옆 긴 직선',
    start: { x: 480, y: 100, angle: 180 },
    treasure: { x: 100, y: 120 },
    goal: '윗길을 따라 길게 이동해 왼쪽 끝 보물을 잡아 보세요.',
    solution: [move('none', 0, 2), move('right', 90, 14), move('none', 0, 24), catchCommand],
  },
  {
    id: 3,
    label: '강당 오른쪽 통로',
    start: { x: 480, y: 100, angle: 180 },
    treasure: { x: 555, y: 420 },
    goal: '오른쪽 통로를 지나 아래쪽 강당 옆 보물까지 가 보세요.',
    solution: [move('none', 0, 10), move('left', 90, 9), move('right', 90, 22), catchCommand],
  },
  {
    id: 4,
    label: '수돗가 위쪽 길',
    start: { x: 480, y: 100, angle: 180 },
    treasure: { x: 100, y: 280 },
    goal: '윗길로 간 뒤 아래로 내려와 수돗가 위쪽 보물을 잡아 보세요.',
    solution: [
      move('none', 0, 2),
      move('right', 90, 14),
      move('none', 0, 24),
      move('left', 90, 16),
      catchCommand,
    ],
  },
  {
    id: 5,
    label: '텃밭 가는 긴 길',
    start: { x: 480, y: 100, angle: 180 },
    treasure: { x: 160, y: 420 },
    goal: '운동장을 피해 왼쪽 아래 길로 돌아 마지막 보물을 잡아 보세요.',
    solution: [
      move('none', 0, 10),
      move('right', 90, 10),
      move('none', 0, 22),
      move('left', 90, 22),
      catchCommand,
    ],
  },
];
