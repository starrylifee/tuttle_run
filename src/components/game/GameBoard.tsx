import {
  LEVELS,
  MAP_HEIGHT,
  MAP_HEIGHT_CM,
  MAP_WIDTH,
  MAP_WIDTH_CM,
  OBSTACLES,
} from '../../data/gameData';
import type { LevelConfig, PathSegment, TurtleState } from '../../types/game';

interface GameBoardProps {
  level: number;
  currentLevel: LevelConfig;
  turtle: TurtleState;
  pathSegments: PathSegment[];
  isRunning: boolean;
  flashObstacleId: string | null;
  boundaryPulse: boolean;
  treasureCollected: boolean;
}

function toXPercent(value: number) {
  return `${(value / MAP_WIDTH) * 100}%`;
}

function toYPercent(value: number) {
  return `${(value / MAP_HEIGHT) * 100}%`;
}

export function GameBoard({
  level,
  currentLevel,
  turtle,
  pathSegments,
  isRunning,
  flashObstacleId,
  boundaryPulse,
  treasureCollected,
}: GameBoardProps) {
  return (
    <div className="board-frame">
      <div className={`board ${boundaryPulse ? 'board--warning' : ''}`}>
        <div className="board__backdrop" />
        <div className="board__grid" />

        <div className="board__header">
          <span className="board__chip">지도 {MAP_WIDTH_CM}cm × {MAP_HEIGHT_CM}cm</span>
          <span className="board__chip">레벨 {level}</span>
        </div>

        {OBSTACLES.map((obstacle) => (
          <div
            key={obstacle.id}
            className={[
              'board__obstacle',
              `board__obstacle--${obstacle.tone}`,
              obstacle.shape === 'ellipse' ? 'board__obstacle--ellipse' : '',
              flashObstacleId === obstacle.id ? 'is-hit' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: toXPercent(obstacle.x),
              top: toYPercent(obstacle.y),
              width: toXPercent(obstacle.width),
              height: toYPercent(obstacle.height),
            }}
          >
            <span>{obstacle.name}</span>
          </div>
        ))}

        <svg className="board__paths" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true">
          {pathSegments.map((segment, index) => (
            <line
              key={`${segment.from.x}-${segment.from.y}-${index}`}
              x1={segment.from.x}
              y1={segment.from.y}
              x2={segment.to.x}
              y2={segment.to.y}
            />
          ))}
        </svg>

        <div
          className="board__catch-zone"
          style={{
            left: toXPercent(currentLevel.treasure.x),
            top: toYPercent(currentLevel.treasure.y),
          }}
        />

        <div
          className={`board__treasure ${treasureCollected ? 'is-collected' : ''}`}
          style={{
            left: toXPercent(currentLevel.treasure.x),
            top: toYPercent(currentLevel.treasure.y),
          }}
          aria-label="보물"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="#f29900" strokeWidth="1.1">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        <div
          className={`board__turtle ${isRunning ? 'is-moving' : ''}`}
          style={{
            left: toXPercent(turtle.x),
            top: toYPercent(turtle.y),
            transform: `translate(-50%, -50%) rotate(${turtle.angle}deg)`,
          }}
          aria-label="거북이"
        >
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="35" fill="#5bb974" stroke="#1e8e3e" strokeWidth="4" />
            <circle cx="50" cy="25" r="12" fill="#5bb974" stroke="#1e8e3e" strokeWidth="2" />
            <circle cx="46" cy="22" r="2" fill="#1f1f1f" />
            <circle cx="54" cy="22" r="2" fill="#1f1f1f" />
            <path
              d="M30 40 L20 30 M70 40 L80 30 M30 70 L20 80 M70 70 L80 80"
              stroke="#1e8e3e"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="board-meta">
        <div>
          <span className="board-meta__label">단계 이름</span>
          <strong>{currentLevel.label}</strong>
        </div>
        <div>
          <span className="board-meta__label">진행 상태</span>
          <strong>{level === LEVELS.length ? '마지막 단계' : `${level}단계 진행 중`}</strong>
        </div>
      </div>
    </div>
  );
}
