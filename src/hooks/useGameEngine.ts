import { useEffect, useState } from 'react';
import {
  cmToMapUnits,
  DEFAULT_COMMAND_DRAFT,
  LEVELS,
  MAX_MOVE_CM,
  MAX_RECORDS,
  MIN_MOVE_CM,
  OBSTACLES,
  TREASURE_CATCH_RADIUS,
  TURTLE_RADIUS,
} from '../data/gameData';
import type {
  CommandDraft,
  GameCommand,
  GameRecord,
  StageSolutionState,
  ToastMessage,
  ToastTone,
  TurtleState,
} from '../types/game';
import {
  distanceBetween,
  findCollisionOnPath,
  getBouncePoint,
  getPointAtDistance,
  getTravelDuration,
  normalizeAngle,
} from '../utils/geometry';
import {
  createDefaultStoredSession,
  loadStoredGameData,
  saveStoredGameData,
} from '../utils/storage';
import { formatDuration, getCurrentServerTimestamp } from '../utils/time';

const TOAST_DURATION = 2400;

function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function clampDistanceCm(value: number) {
  return Math.min(Math.max(Math.round(value), MIN_MOVE_CM), MAX_MOVE_CM);
}

function normalizeDistanceCmInput(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_COMMAND_DRAFT.distanceCm;
  }

  return clampDistanceCm(value);
}

function normalizeDraftAngle(rotation: CommandDraft['rotation'], _angle: number) {
  if (rotation === 'none') {
    return 0;
  }

  return 90;
}

export function useGameEngine() {
  const [stored] = useState(() => loadStoredGameData());
  const [level, setLevel] = useState(stored.session.level);
  const [commands, setCommands] = useState<GameCommand[]>(stored.session.commands);
  const [draft, setDraft] = useState<CommandDraft>(stored.session.draft);
  const [turtle, setTurtle] = useState<TurtleState>(stored.session.turtle);
  const [pathSegments, setPathSegments] = useState(stored.session.pathSegments);
  const [runStartedAt, setRunStartedAt] = useState<number | null>(stored.session.runStartedAt);
  const [records, setRecords] = useState<GameRecord[]>(stored.records);
  const [isRunning, setIsRunning] = useState(false);
  const [activeCommandIndex, setActiveCommandIndex] = useState<number | null>(null);
  const [flashObstacleId, setFlashObstacleId] = useState<string | null>(null);
  const [boundaryPulse, setBoundaryPulse] = useState(false);
  const [treasureCollected, setTreasureCollected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [resultOpen, setResultOpen] = useState(false);
  const [finalTimeMs, setFinalTimeMs] = useState<number | null>(null);
  const [finalCompletedAt, setFinalCompletedAt] = useState<string | null>(null);
  const [pendingFinishedAtMs, setPendingFinishedAtMs] = useState<number | null>(null);
  const [stageSolution, setStageSolution] = useState<StageSolutionState | null>(null);
  const [now, setNow] = useState(Date.now());

  const currentLevel = LEVELS[level - 1] ?? LEVELS[0];
  const bestRecord = records[0] ?? null;
  const elapsedMs = finalTimeMs ?? (runStartedAt ? now - runStartedAt : 0);
  const elapsedText = formatDuration(elapsedMs);

  useEffect(() => {
    saveStoredGameData({
      session: {
        level,
        commands,
        turtle,
        pathSegments,
        runStartedAt,
        draft,
      },
      records,
    });
  }, [commands, draft, level, pathSegments, records, runStartedAt, turtle]);

  useEffect(() => {
    if (!runStartedAt || finalTimeMs !== null) {
      return undefined;
    }

    setNow(Date.now());

    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [finalTimeMs, runStartedAt]);

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function pushToast(message: string, tone: ToastTone) {
    const id = createId('toast');

    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, TOAST_DURATION);
  }

  function resetStageState(targetLevel: number) {
    setCommands([]);
    setDraft({ ...DEFAULT_COMMAND_DRAFT });
    setTurtle({ ...LEVELS[targetLevel - 1].start });
    setPathSegments([]);
    setActiveCommandIndex(null);
    setFlashObstacleId(null);
    setBoundaryPulse(false);
    setTreasureCollected(false);
  }

  function loadLevel(targetLevel: number) {
    setLevel(targetLevel);
    resetStageState(targetLevel);
  }

  function updateDraft<Key extends keyof CommandDraft>(key: Key, value: CommandDraft[Key]) {
    setDraft((current) => {
      const nextDraft = {
        ...current,
        [key]: key === 'distanceCm' ? normalizeDistanceCmInput(Number(value)) : value,
      };

      return {
        ...nextDraft,
        angle: normalizeDraftAngle(nextDraft.rotation, nextDraft.angle),
      };
    });
  }

  function addMoveCommand() {
    if (isRunning || stageSolution) {
      return;
    }

    const distanceCm = normalizeDistanceCmInput(draft.distanceCm);
    const angle = normalizeDraftAngle(draft.rotation, draft.angle);

    setCommands((current) => [
      ...current,
      {
        type: 'move',
        rotation: draft.rotation,
        angle,
        distanceCm,
      },
    ]);
  }

  function addCatchCommand() {
    if (isRunning || stageSolution) {
      return;
    }

    setCommands((current) => [...current, { type: 'catch' }]);
  }

  function removeCommand(index: number) {
    if (isRunning || stageSolution) {
      return;
    }

    setCommands((current) => current.filter((_, commandIndex) => commandIndex !== index));
  }

  function clearCommands() {
    if (isRunning || stageSolution) {
      return;
    }

    setCommands([]);
  }

  function resetLevel() {
    if (isRunning || stageSolution) {
      return;
    }

    resetStageState(level);
  }

  function restartGame() {
    if (isRunning) {
      return;
    }

    setStageSolution(null);
    setLevel(1);
    setCommands([]);
    setDraft({ ...DEFAULT_COMMAND_DRAFT });
    setTurtle({ ...LEVELS[0].start });
    setPathSegments([]);
    setRunStartedAt(null);
    setActiveCommandIndex(null);
    setFlashObstacleId(null);
    setBoundaryPulse(false);
    setTreasureCollected(false);
    setResultOpen(false);
    setFinalTimeMs(null);
    setFinalCompletedAt(null);
    setPendingFinishedAtMs(null);
    setNow(Date.now());

    saveStoredGameData({
      session: createDefaultStoredSession(1),
      records,
    });
  }

  function completeGame(startedAt: number) {
    const finishedAt = pendingFinishedAtMs ?? Date.now();
    const completedAt = finalCompletedAt ?? new Date(finishedAt).toISOString();
    const durationMs = Math.max(0, finishedAt - startedAt);
    const nextRecord: GameRecord = {
      id: createId('record'),
      completedAt,
      durationMs,
    };

    const nextRecords = [...records, nextRecord]
      .sort((left, right) => left.durationMs - right.durationMs)
      .slice(0, MAX_RECORDS);

    setRecords(nextRecords);
    setFinalTimeMs(durationMs);
    setFinalCompletedAt(completedAt);
    setPendingFinishedAtMs(null);
    setResultOpen(true);
    setStageSolution(null);
    setLevel(1);
    setCommands([]);
    setDraft({ ...DEFAULT_COMMAND_DRAFT });
    setTurtle({ ...LEVELS[0].start });
    setPathSegments([]);
    setRunStartedAt(null);
    pushToast('모든 보물을 찾았습니다!', 'success');

    saveStoredGameData({
      session: createDefaultStoredSession(1),
      records: nextRecords,
    });
  }

  function continueAfterStageSolution() {
    if (!stageSolution) {
      return;
    }

    const solvedLevel = stageSolution.level;
    const nextLevel = solvedLevel + 1;
    const reason = stageSolution.reason;

    setStageSolution(null);

    if (reason === 'success') {
      if (solvedLevel === LEVELS.length) {
        completeGame(runStartedAt ?? Date.now());
        return;
      }

      loadLevel(nextLevel);
      pushToast(`좋아요. 이제 레벨 ${nextLevel}로 넘어가요.`, 'info');
      return;
    }

    if (solvedLevel === LEVELS.length) {
      restartGame();
      return;
    }

    loadLevel(nextLevel);
    pushToast(`정답을 확인했어요. 이제 레벨 ${nextLevel}로 넘어가요.`, 'info');
  }

  function retryAfterGiveUp() {
    if (!stageSolution) {
      return;
    }

    const targetLevel = stageSolution.level;

    setStageSolution(null);
    loadLevel(targetLevel);
    pushToast('같은 단계를 다시 풀어 볼 수 있어요.', 'info');
  }

  function giveUpLevel() {
    if (isRunning || stageSolution || resultOpen) {
      return;
    }

    setStageSolution({ level, reason: 'giveup' });
  }

  async function runCommands() {
    if (isRunning || stageSolution) {
      return;
    }

    if (commands.length === 0) {
      pushToast('명령 스택에 먼저 넣어 주세요.', 'info');
      return;
    }

    const startedAt = runStartedAt ?? Date.now();
    let workingTurtle: TurtleState = { ...currentLevel.start };

    if (!runStartedAt) {
      setRunStartedAt(startedAt);
    }

    setIsRunning(true);
    setResultOpen(false);
    setFinalTimeMs(null);
    setTreasureCollected(false);
    setPathSegments([]);
    setTurtle(workingTurtle);
    setFlashObstacleId(null);
    setBoundaryPulse(false);

    await delay(200);

    try {
      for (const [index, command] of commands.entries()) {
        setActiveCommandIndex(index);

        if (command.type === 'move') {
          let nextAngle = workingTurtle.angle;

          if (command.rotation === 'left') {
            nextAngle -= command.angle;
          }

          if (command.rotation === 'right') {
            nextAngle += command.angle;
          }

          workingTurtle = {
            ...workingTurtle,
            angle: normalizeAngle(nextAngle),
          };
          setTurtle(workingTurtle);

          await delay(command.rotation === 'none' ? 120 : 260);

          const startPoint = { x: workingTurtle.x, y: workingTurtle.y };
          const mapDistance = cmToMapUnits(command.distanceCm);
          const collision = findCollisionOnPath(
            workingTurtle,
            mapDistance,
            OBSTACLES,
            TURTLE_RADIUS,
          );

          if (collision) {
            if (distanceBetween(startPoint, collision.safePoint) > 0.5) {
              setPathSegments((current) => [...current, { from: startPoint, to: collision.safePoint }]);
              workingTurtle = {
                ...workingTurtle,
                x: collision.safePoint.x,
                y: collision.safePoint.y,
              };
              setTurtle(workingTurtle);
              await delay(getTravelDuration(startPoint, collision.safePoint));
            }

            if (collision.kind === 'obstacle' && collision.obstacle) {
              setFlashObstacleId(collision.obstacle.id);
              pushToast(`쾅! ${collision.obstacle.name}에 부딪혔어요.`, 'error');
            } else {
              setBoundaryPulse(true);
              pushToast('지도 밖으로는 이동할 수 없어요.', 'error');
            }

            workingTurtle = {
              ...workingTurtle,
              ...getBouncePoint(collision.safePoint, workingTurtle.angle, 10, TURTLE_RADIUS),
            };
            setTurtle(workingTurtle);
            await delay(280);
            return;
          }

          const target = getPointAtDistance(startPoint, workingTurtle.angle, mapDistance);

          setPathSegments((current) => [...current, { from: startPoint, to: target }]);
          workingTurtle = {
            ...workingTurtle,
            x: target.x,
            y: target.y,
          };
          setTurtle(workingTurtle);
          await delay(getTravelDuration(startPoint, target));
          continue;
        }

        if (distanceBetween(workingTurtle, currentLevel.treasure) <= TREASURE_CATCH_RADIUS) {
          const finishedAt = Date.now();
          const fallbackCompletedAt = new Date(finishedAt).toISOString();

          setTreasureCollected(true);
          pushToast('보물을 잡았어요!', 'success');
          await delay(650);

          if (level === LEVELS.length) {
            setPendingFinishedAtMs(finishedAt);
            setFinalCompletedAt(fallbackCompletedAt);
            void getCurrentServerTimestamp().then((serverTimestamp) => {
              setFinalCompletedAt((current) =>
                current === fallbackCompletedAt ? serverTimestamp : current,
              );
            });
          }

          setStageSolution({ level, reason: 'success' });
          return;
        }

        pushToast('아직 보물을 잡기에는 거리가 멀어요.', 'error');
        await delay(250);
      }

      pushToast('아직 보물 잡기 명령이 없어요. 마지막에 넣고 다시 실행해 보세요.', 'info');
    } finally {
      setActiveCommandIndex(null);
      setIsRunning(false);
      setFlashObstacleId(null);
      setBoundaryPulse(false);
    }
  }

  return {
    level,
    currentLevel,
    turtle,
    pathSegments,
    commands,
    draft,
    runStartedAt,
    elapsedText,
    records,
    bestRecord,
    isRunning,
    activeCommandIndex,
    flashObstacleId,
    boundaryPulse,
    treasureCollected,
    toasts,
    resultOpen,
    finalTimeMs,
    finalCompletedAt,
    stageSolution,
    updateDraft,
    addMoveCommand,
    addCatchCommand,
    removeCommand,
    clearCommands,
    runCommands,
    resetLevel,
    restartGame,
    giveUpLevel,
    continueAfterStageSolution,
    retryAfterGiveUp,
    dismissToast,
  };
}
