import { useEffect, useState } from 'react';
import { ModalShell } from './ModalShell';

const ADMIN_PASSWORD = 'shindap';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPassword('');
    setErrorMessage('');
  }, [isOpen]);

  function handleSubmit() {
    if (password === ADMIN_PASSWORD) {
      setPassword('');
      setErrorMessage('');
      onSuccess();
      return;
    }

    setErrorMessage('비밀번호가 맞지 않아요.');
  }

  return (
    <ModalShell
      isOpen={isOpen}
      eyebrow="관리자 확인"
      title="정답 보기를 열어 주세요"
      onClose={onClose}
      actions={
        <>
          <button className="button button--subtle" onClick={onClose}>
            취소
          </button>
          <button className="button button--primary" onClick={handleSubmit}>
            정답 보기
          </button>
        </>
      }
    >
      <div className="modal-copy">
        <p>정답 보기는 관리자만 열 수 있어요. 관리자 비밀번호를 입력해 주세요.</p>
      </div>

      <label className="field password-modal__field">
        <span>관리자 비밀번호</span>
        <input
          type="password"
          value={password}
          autoComplete="off"
          autoFocus
          onChange={(event) => {
            setPassword(event.target.value);
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />
      </label>

      {errorMessage ? <p className="password-modal__error">{errorMessage}</p> : null}
    </ModalShell>
  );
}
