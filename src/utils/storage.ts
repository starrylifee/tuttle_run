import {
  DEFAULT_COMMAND_DRAFT,
  LEVELS,
  MAP_UNITS_PER_CM,
  MAX_MOVE_CM,
  MAX_RECORDS,
  MIN_MOVE_CM,
} from '../data/gameData';
import type {
  CommandDraft,
  GameCommand,
  GameRecord,
  PathSegment,
  StoredGameData,
  StoredSession,
  TurtleState,
} from '../types/game';

const STORAGE_KEY = 'turtle-school-treasure-run:v1';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeLevel(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(Math.round(value), 1), LEVELS.length);
}

function sanitizeTurtle(value: unknown, fallback: TurtleState): TurtleState {
  if (!isObject(value)) {
    return fallback;
  }

  const x = typeof value.x === 'number' ? value.x : fallback.x;
  const y = typeof value.y === 'number' ? value.y : fallback.y;
  const angle = typeof value.angle === 'number' ? value.angle : fallback.angle;

  return { x, y, angle };
}

function sanitizeDraft(value: unknown): CommandDraft {
  if (!isObject(value)) {
    return { ...DEFAULT_COMMAND_DRAFT };
  }

  const rotation =
    value.rotation === 'left' || value.rotation === 'right' || value.rotation === 'none'
      ? value.rotation
      : DEFAULT_COMMAND_DRAFT.rotation;

  return {
    rotation,
    angle: typeof value.angle === 'number' ? value.angle : DEFAULT_COMMAND_DRAFT.angle,
    distanceCm:
      typeof value.distanceCm === 'number'
        ? clampDistanceCm(value.distanceCm)
        : typeof value.distance === 'number'
          ? clampDistanceCm(Math.round(value.distance / MAP_UNITS_PER_CM))
          : DEFAULT_COMMAND_DRAFT.distanceCm,
  };
}

function clampDistanceCm(value: number) {
  return Math.min(Math.max(Math.round(value), MIN_MOVE_CM), MAX_MOVE_CM);
}

function sanitizeCommands(value: unknown): GameCommand[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<GameCommand[]>((commands, entry) => {
    if (!isObject(entry) || typeof entry.type !== 'string') {
      return commands;
    }

    if (entry.type === 'catch') {
      commands.push({ type: 'catch' });
      return commands;
    }

    if (entry.type !== 'move') {
      return commands;
    }

    const rotation =
      entry.rotation === 'left' || entry.rotation === 'right' || entry.rotation === 'none'
        ? entry.rotation
        : DEFAULT_COMMAND_DRAFT.rotation;

    commands.push({
      type: 'move',
      rotation,
      angle: typeof entry.angle === 'number' ? entry.angle : DEFAULT_COMMAND_DRAFT.angle,
      distanceCm:
        typeof entry.distanceCm === 'number'
          ? clampDistanceCm(entry.distanceCm)
          : typeof entry.distance === 'number'
            ? clampDistanceCm(Math.round(entry.distance / MAP_UNITS_PER_CM))
            : DEFAULT_COMMAND_DRAFT.distanceCm,
    });

    return commands;
  }, []);
}

function sanitizePathSegments(value: unknown): PathSegment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry) => isObject(entry) && isObject(entry.from) && isObject(entry.to))
    .map((entry) => ({
      from: {
        x: typeof entry.from.x === 'number' ? entry.from.x : 0,
        y: typeof entry.from.y === 'number' ? entry.from.y : 0,
      },
      to: {
        x: typeof entry.to.x === 'number' ? entry.to.x : 0,
        y: typeof entry.to.y === 'number' ? entry.to.y : 0,
      },
    }));
}

function sanitizeRecords(value: unknown): GameRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((record) => isObject(record))
    .map((record, index) => ({
      id: typeof record.id === 'string' ? record.id : `record-${index}`,
      completedAt:
        typeof record.completedAt === 'string' ? record.completedAt : new Date().toISOString(),
      durationMs: typeof record.durationMs === 'number' ? record.durationMs : 0,
    }))
    .sort((left, right) => left.durationMs - right.durationMs)
    .slice(0, MAX_RECORDS);
}

export function createDefaultStoredSession(level = 1): StoredSession {
  return {
    level,
    commands: [],
    turtle: { ...LEVELS[level - 1].start },
    pathSegments: [],
    runStartedAt: null,
    draft: { ...DEFAULT_COMMAND_DRAFT },
  };
}

export function createDefaultStoredGameData(): StoredGameData {
  return {
    session: createDefaultStoredSession(1),
    records: [],
  };
}

export function loadStoredGameData(): StoredGameData {
  if (typeof window === 'undefined') {
    return createDefaultStoredGameData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultStoredGameData();
    }

    const parsed = JSON.parse(raw) as Partial<StoredGameData>;
    const sessionSource: Partial<StoredSession> = isObject(parsed.session)
      ? (parsed.session as Partial<StoredSession>)
      : {};
    const level = sanitizeLevel(sessionSource.level);

    return {
      session: {
        level,
        commands: sanitizeCommands(sessionSource.commands),
        turtle: sanitizeTurtle(sessionSource.turtle, LEVELS[level - 1].start),
        pathSegments: sanitizePathSegments(sessionSource.pathSegments),
        runStartedAt:
          typeof sessionSource.runStartedAt === 'number' ? sessionSource.runStartedAt : null,
        draft: sanitizeDraft(sessionSource.draft),
      },
      records: sanitizeRecords(parsed.records),
    };
  } catch {
    return createDefaultStoredGameData();
  }
}

export function saveStoredGameData(data: StoredGameData) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors and keep the game usable.
  }
}
