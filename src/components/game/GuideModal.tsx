import { ModalShell } from './ModalShell';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      eyebrow="학습 안내"
      title="이 순서대로 해 보세요"
      onClose={onClose}
      actions={
        <button className="button button--primary" onClick={onClose}>
          시작하기
        </button>
      }
    >
      <div className="modal-copy">
        <p>처음에는 아래 순서만 따라 하면 돼요.</p>
      </div>

      <div className="modal-steps">
        <article className="modal-step">
          <strong>1. 명령 고르기</strong>
          <p>먼저 이동할지, 보물을 잡을지 골라 주세요.</p>
        </article>
        <article className="modal-step">
          <strong>2. 방향과 거리 정하기</strong>
          <p>필요하면 회전 방향을 고르고, 이동 거리를 정수 cm로 넣어 주세요.</p>
        </article>
        <article className="modal-step">
          <strong>3. 스택 확인 후 실행하기</strong>
          <p>명령 순서를 확인한 뒤 실행하면 거북이가 그대로 움직여요.</p>
        </article>
      </div>
    </ModalShell>
  );
}
