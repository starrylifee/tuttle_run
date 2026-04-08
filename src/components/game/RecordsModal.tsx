import type { GameRecord } from '../../types/game';
import { formatDateTime, formatDuration } from '../../utils/time';
import { ModalShell } from './ModalShell';

interface RecordsModalProps {
  isOpen: boolean;
  bestTimeText: string;
  records: GameRecord[];
  onClose: () => void;
}

export function RecordsModal({
  isOpen,
  bestTimeText,
  records,
  onClose,
}: RecordsModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      eyebrow="기록 보기"
      title="기록 보관함"
      onClose={onClose}
      size="wide"
      actions={
        <button className="button button--primary" onClick={onClose}>
          닫기
        </button>
      }
    >
      <div className="records-modal__summary">
        <div>
          <span>최고 기록</span>
          <strong>{bestTimeText}</strong>
        </div>
        <div>
          <span>저장 위치</span>
          <strong>브라우저 로컬 스토리지</strong>
        </div>
      </div>

      <div className="records-modal__list">
        {records.length === 0 ? (
          <div className="records-modal__empty">아직 저장된 완료 기록이 없습니다.</div>
        ) : (
          records.map((record, index) => (
            <article key={record.id} className="records-modal__item">
              <div>
                <span>{index === 0 ? '최고 기록' : `${index + 1}위 기록`}</span>
                <strong>{formatDuration(record.durationMs)}</strong>
              </div>
              <small>{formatDateTime(record.completedAt)}</small>
            </article>
          ))
        )}
      </div>
    </ModalShell>
  );
}
