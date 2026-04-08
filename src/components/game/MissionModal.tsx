import { ModalShell } from './ModalShell';

interface MissionModalProps {
  isOpen: boolean;
  level: number;
  levelTitle: string;
  goalText: string;
  onClose: () => void;
}

export function MissionModal({
  isOpen,
  level,
  levelTitle,
  goalText,
  onClose,
}: MissionModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      eyebrow={`현재 목표 ${level}`}
      title={levelTitle}
      onClose={onClose}
      actions={
        <button className="button button--primary" onClick={onClose}>
          시작할게요
        </button>
      }
    >
      <div className="modal-copy">
        <p>{goalText}</p>
      </div>

      <div className="modal-tags">
        <span>정수 cm만 입력</span>
        <span>지도 밖으로는 못 가요</span>
        <span>마지막에 보물 잡기</span>
      </div>
    </ModalShell>
  );
}
