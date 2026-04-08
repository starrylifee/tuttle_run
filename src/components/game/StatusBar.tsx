interface StatusBarProps {
  level: number;
  totalLevels: number;
  elapsedText: string;
  commandCount: number;
  unitText: string;
}

export function StatusBar({
  level,
  totalLevels,
  elapsedText,
  commandCount,
  unitText,
}: StatusBarProps) {
  return (
    <section className="status-grid">
      <article className="status-card">
        <span className="status-card__label">레벨</span>
        <strong>
          {level} / {totalLevels}
        </strong>
      </article>

      <article className="status-card">
        <span className="status-card__label">시간</span>
        <strong>{elapsedText}</strong>
      </article>

      <article className="status-card">
        <span className="status-card__label">명령</span>
        <strong>{commandCount}개</strong>
      </article>

      <article className="status-card">
        <span className="status-card__label">단위</span>
        <strong>{unitText}</strong>
      </article>
    </section>
  );
}
