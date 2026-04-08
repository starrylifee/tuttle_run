import { useEffect, useState } from 'react';
import { MAX_MOVE_CM, MIN_MOVE_CM } from '../../data/gameData';
import type { CommandDraft, GameCommand, RotationDirection } from '../../types/game';
import { formatCommandLabel } from '../../utils/commands';

type CommandType = 'move' | 'catch';

const ROTATION_OPTIONS: Array<{
  value: string;
  label: string;
  rotation: RotationDirection;
  angle: number;
}> = [
  { value: 'none:0', label: '회전 없음', rotation: 'none', angle: 0 },
  { value: 'left:90', label: '왼쪽 90°', rotation: 'left', angle: 90 },
  { value: 'right:90', label: '오른쪽 90°', rotation: 'right', angle: 90 },
];

interface CommandPanelProps {
  level: number;
  draft: CommandDraft;
  commands: GameCommand[];
  isRunning: boolean;
  activeCommandIndex: number | null;
  onDraftChange: <Key extends keyof CommandDraft>(key: Key, value: CommandDraft[Key]) => void;
  onAddMoveCommand: () => void;
  onAddCatchCommand: () => void;
  onRemoveCommand: (index: number) => void;
  onRunCommands: () => void;
  onResetLevel: () => void;
  onGiveUpLevel: () => void;
}

export function CommandPanel({
  level,
  draft,
  commands,
  isRunning,
  activeCommandIndex,
  onDraftChange,
  onAddMoveCommand,
  onAddCatchCommand,
  onRemoveCommand,
  onRunCommands,
  onResetLevel,
  onGiveUpLevel,
}: CommandPanelProps) {
  const [commandType, setCommandType] = useState<CommandType>('move');

  const selectedRotationValue =
    draft.rotation === 'none' ? 'none:0' : `${draft.rotation}:${draft.angle}`;

  useEffect(() => {
    const isValidRotation = ROTATION_OPTIONS.some((option) => option.value === selectedRotationValue);

    if (!isValidRotation) {
      onDraftChange('rotation', 'none');
      onDraftChange('angle', 0);
    }
  }, [onDraftChange, selectedRotationValue]);

  function handleRotationChange(value: string) {
    const nextRotation =
      ROTATION_OPTIONS.find((option) => option.value === value) ?? ROTATION_OPTIONS[0];

    onDraftChange('rotation', nextRotation.rotation);
    onDraftChange('angle', nextRotation.angle);
  }

  function handleAddCommand() {
    if (commandType === 'catch') {
      onAddCatchCommand();
      return;
    }

    onAddMoveCommand();
  }

  return (
    <section className="surface-card command-panel">
      <div className="surface-card__header">
        <div>
          <p className="surface-card__eyebrow">명령 패널</p>
          <h2>명령어 블록</h2>
        </div>
        <span className="surface-card__badge">레벨 {level}</span>
      </div>

      <div className="command-panel__controls">
        <label className="field">
          <span>명령</span>
          <div className="command-builder">
            <select
              value={commandType}
              onChange={(event) => setCommandType(event.target.value as CommandType)}
              disabled={isRunning}
            >
              <option value="move">이동</option>
              <option value="catch">보물 잡기</option>
            </select>

            {commandType === 'move' ? (
              <div className="field__inline command-builder__distance">
                <input
                  type="number"
                  min={MIN_MOVE_CM}
                  max={MAX_MOVE_CM}
                  step={1}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={draft.distanceCm}
                  onChange={(event) => onDraftChange('distanceCm', Number(event.target.value))}
                  disabled={isRunning}
                />
                <strong>cm</strong>
              </div>
            ) : (
              <div className="command-builder__spacer" aria-hidden="true" />
            )}

            <button
              className="button button--primary command-builder__button"
              onClick={handleAddCommand}
              disabled={isRunning}
            >
              명령입력
            </button>
          </div>
        </label>

        <label className="field">
          <span>회전 방향</span>
          <select
            value={selectedRotationValue}
            onChange={(event) => handleRotationChange(event.target.value)}
            disabled={isRunning || commandType === 'catch'}
          >
            {ROTATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="command-panel__stack">
        <span className="command-panel__stack-title">명령 스택</span>
        <div className="command-list">
          {commands.length === 0 ? (
            <div className="command-list__empty">아직 쌓인 명령이 없어요.</div>
          ) : (
            commands.map((command, index) => (
              <div
                key={`${command.type}-${index}`}
                className={[
                  'command-item',
                  command.type === 'catch' ? 'command-item--catch' : 'command-item--move',
                  activeCommandIndex === index ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div>
                  <span className="command-item__step">{index + 1}</span>
                  <p>{formatCommandLabel(command)}</p>
                </div>
                <button onClick={() => onRemoveCommand(index)} disabled={isRunning} aria-label="명령 제거">
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="command-panel__actions">
        <button className="button button--primary" onClick={onRunCommands} disabled={isRunning}>
          {isRunning ? '실행 중...' : '명령 실행'}
        </button>
        <button className="button button--subtle" onClick={onResetLevel} disabled={isRunning}>
          초기화
        </button>
      </div>

      <button className="link-button command-panel__give-up" onClick={onGiveUpLevel} disabled={isRunning}>
        포기하고 정답 보기
      </button>
    </section>
  );
}
