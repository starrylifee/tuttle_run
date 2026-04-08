import { mapUnitsToCm } from '../../data/gameData';
import type { LevelConfig, StageSolutionReason } from '../../types/game';
import { formatCommandLabel } from '../../utils/commands';
import { ModalShell } from './ModalShell';

interface StageSolutionModalProps {
  isOpen: boolean;
  level: number;
  levelData: LevelConfig;
  reason: StageSolutionReason;
  onClose: () => void;
  onPrimaryAction: () => void;
  onRetryAction?: () => void;
  primaryLabel: string;
}

function formatCm(value: number) {
  return mapUnitsToCm(value).toFixed(1);
}

export function StageSolutionModal({
  isOpen,
  level,
  levelData,
  reason,
  onClose,
  onPrimaryAction,
  onRetryAction,
  primaryLabel,
}: StageSolutionModalProps) {
  const bodyText =
    reason === 'success'
      ? '이 단계를 마쳤어요. 기준 정답 코드는 아래와 같아요.'
      : '이 단계는 여기서 멈췄어요. 기준 정답 코드를 보고 다시 도전하거나 다음으로 넘어갈 수 있어요.';

  return (
    <ModalShell
      isOpen={isOpen}
      eyebrow={reason === 'success' ? `레벨 ${level} 완료` : `레벨 ${level} 정답 보기`}
      title={levelData.label}
      onClose={onClose}
      size="wide"
      actions={
        <>
          {onRetryAction ? (
            <button className="button button--subtle" onClick={onRetryAction}>
              다시 도전
            </button>
          ) : null}
          <button className="button button--primary" onClick={onPrimaryAction}>
            {primaryLabel}
          </button>
        </>
      }
    >
      <div className="modal-copy">
        <p>{bodyText}</p>
      </div>

      <div className="solution-modal__summary">
        <div>
          <span>보물 위치</span>
          <strong>
            x {levelData.treasure.x}, y {levelData.treasure.y}
          </strong>
          <small>
            ({formatCm(levelData.treasure.x)}cm, {formatCm(levelData.treasure.y)}cm)
          </small>
        </div>
        <div>
          <span>기준 정답</span>
          <strong>{levelData.solution.length}줄</strong>
          <small>마지막 줄까지 그대로 넣으면 됩니다.</small>
        </div>
      </div>

      <div className="solution-modal__list">
        {levelData.solution.map((command, index) => (
          <article key={`${command.type}-${index}`} className="solution-modal__item">
            <span>{index + 1}</span>
            <strong>{formatCommandLabel(command)}</strong>
          </article>
        ))}
      </div>
    </ModalShell>
  );
}
