import {
  formatPreciseDateTime,
  formatPreciseDateTimeForFile,
  getCurrentServerTimestamp,
} from '../../utils/time';

interface ResultModalProps {
  isOpen: boolean;
  finalTimeText: string;
  bestTimeText: string;
  completedAt: string | null;
  onRestart: () => void;
}

async function downloadCertificate(finalTimeText: string, completedAt: string | null) {
  const resolvedCompletedAt = completedAt ?? new Date().toISOString();
  const savedAt = await getCurrentServerTimestamp();
  const completedAtText = formatPreciseDateTime(resolvedCompletedAt);
  const savedAtText = formatPreciseDateTime(savedAt);
  const fileStamp = formatPreciseDateTimeForFile(savedAt);
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  const gradient = context.createLinearGradient(0, 0, 1200, 900);
  gradient.addColorStop(0, '#f8fbff');
  gradient.addColorStop(1, '#eef3fd');

  context.fillStyle = gradient;
  context.fillRect(0, 0, 1200, 900);

  context.fillStyle = '#ffffff';
  context.strokeStyle = '#d2e3fc';
  context.lineWidth = 16;
  context.beginPath();
  context.roundRect(80, 80, 1040, 740, 32);
  context.fill();
  context.stroke();

  context.fillStyle = '#1f1f1f';
  context.textAlign = 'center';
  context.font = '700 64px "Roboto Flex", "Noto Sans KR", sans-serif';
  context.fillText('거북이 학교 보물찾기 인증서', 600, 220);

  context.fillStyle = '#5f6368';
  context.font = '500 32px "Noto Sans KR", sans-serif';
  context.fillText('모든 레벨의 보물을 정확한 이동과 회전으로 완주했습니다.', 600, 330);
  context.fillText('기록은 브라우저 로컬 스토리지에도 함께 저장됩니다.', 600, 382);

  context.fillStyle = '#1a73e8';
  context.font = '800 94px "Roboto Flex", sans-serif';
  context.fillText(finalTimeText, 600, 555);

  context.fillStyle = '#5f6368';
  context.font = '500 28px "Noto Sans KR", sans-serif';
  context.fillText(`완료 시각 ${completedAtText}`, 600, 674);
  context.fillText(`JPG 저장 시각 ${savedAtText}`, 600, 722);
  context.fillText('거북이 보물찾기 교실', 600, 770);

  const link = document.createElement('a');
  link.download = `거북이_보물찾기_기록_${fileStamp}.jpg`;
  link.href = canvas.toDataURL('image/jpeg', 0.92);
  link.click();
}

export function ResultModal({
  isOpen,
  finalTimeText,
  bestTimeText,
  completedAt,
  onRestart,
}: ResultModalProps) {
  if (!isOpen) {
    return null;
  }

  const completedAtText = formatPreciseDateTime(completedAt ?? new Date().toISOString());

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <p className="modal-card__eyebrow">완료</p>
        <h2>모든 보물을 찾았습니다</h2>
        <p className="modal-card__copy">
          이번 기록은 <strong>{finalTimeText}</strong> 입니다. 현재 최고 기록은 {bestTimeText}입니다.
        </p>
        <p className="modal-card__detail">마지막 완료 시각 {completedAtText}</p>

        <div className="modal-card__time">{finalTimeText}</div>

        <div className="modal-card__actions">
          <button
            className="button button--primary"
            onClick={() => {
              void downloadCertificate(finalTimeText, completedAt);
            }}
          >
            기록 JPG 다운로드
          </button>
          <button className="button button--subtle" onClick={onRestart}>
            새 게임 시작
          </button>
        </div>
      </div>
    </div>
  );
}
