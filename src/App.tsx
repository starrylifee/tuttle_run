import { useEffect, useState } from 'react';
import { CommandPanel } from './components/game/CommandPanel';
import { GameBoard } from './components/game/GameBoard';
import { GuideModal } from './components/game/GuideModal';
import { MissionModal } from './components/game/MissionModal';
import { RecordsModal } from './components/game/RecordsModal';
import { ResultModal } from './components/game/ResultModal';
import { StageSolutionModal } from './components/game/StageSolutionModal';
import { StatusBar } from './components/game/StatusBar';
import { ToastViewport } from './components/game/ToastViewport';
import { LEVELS } from './data/gameData';
import { useGameEngine } from './hooks/useGameEngine';
import { formatDuration } from './utils/time';

const GUIDE_STORAGE_KEY = 'turtle-school-guide-seen:v1';

function App() {
  const game = useGameEngine();
  const [isGuideOpen, setIsGuideOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(GUIDE_STORAGE_KEY) !== '1';
  });
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [lastMissionLevel, setLastMissionLevel] = useState<number | null>(null);
  const solutionLevelData = game.stageSolution ? LEVELS[game.stageSolution.level - 1] : null;

  useEffect(() => {
    if (game.resultOpen || isGuideOpen) {
      return;
    }

    if (lastMissionLevel !== game.level) {
      setIsMissionOpen(true);
      setLastMissionLevel(game.level);
    }
  }, [game.level, game.resultOpen, isGuideOpen, lastMissionLevel]);

  function openGuide() {
    setIsMissionOpen(false);
    setIsRecordsOpen(false);
    setIsGuideOpen(true);
  }

  function closeGuide() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GUIDE_STORAGE_KEY, '1');
    }

    setIsGuideOpen(false);
  }

  function openMission() {
    setIsGuideOpen(false);
    setIsRecordsOpen(false);
    setIsMissionOpen(true);
    setLastMissionLevel(game.level);
  }

  function openRecords() {
    setIsGuideOpen(false);
    setIsMissionOpen(false);
    setIsRecordsOpen(true);
  }

  return (
    <>
      <div className="app-shell">
        <header className="app-topbar">
          <div className="app-topbar__brand">
            <div className="app-topbar__mark">T</div>
            <h1>거북이 학교 보물찾기</h1>
          </div>

          <div className="app-topbar__status">
            <StatusBar
              level={game.level}
              totalLevels={LEVELS.length}
              elapsedText={game.elapsedText}
              commandCount={game.commands.length}
              unitText="정수 cm"
            />
          </div>

          <div className="app-topbar__actions">
            <button className="button button--subtle button--compact" onClick={openGuide}>
              학습 안내
            </button>
            <button className="button button--subtle button--compact" onClick={openMission}>
              현재 목표
            </button>
            <button className="button button--subtle button--compact" onClick={openRecords}>
              기록 보기
            </button>
          </div>
        </header>

        <main className="app-grid">
          <section className="surface-card surface-card--board">
            <GameBoard
              currentLevel={game.currentLevel}
              level={game.level}
              turtle={game.turtle}
              pathSegments={game.pathSegments}
              isRunning={game.isRunning}
              flashObstacleId={game.flashObstacleId}
              boundaryPulse={game.boundaryPulse}
              treasureCollected={game.treasureCollected}
            />
          </section>

          <aside className="app-sidebar">
            <CommandPanel
              level={game.level}
              draft={game.draft}
              commands={game.commands}
              isRunning={game.isRunning}
              activeCommandIndex={game.activeCommandIndex}
              onDraftChange={game.updateDraft}
              onAddMoveCommand={game.addMoveCommand}
              onAddCatchCommand={game.addCatchCommand}
              onRemoveCommand={game.removeCommand}
              onRunCommands={game.runCommands}
              onResetLevel={game.resetLevel}
              onGiveUpLevel={game.giveUpLevel}
            />
          </aside>
        </main>
      </div>

      <ToastViewport toasts={game.toasts} onDismiss={game.dismissToast} />

      <GuideModal isOpen={isGuideOpen} onClose={closeGuide} />

      <MissionModal
        isOpen={isMissionOpen}
        level={game.level}
        levelTitle={game.currentLevel.label}
        goalText={game.currentLevel.goal}
        onClose={() => setIsMissionOpen(false)}
      />

      <RecordsModal
        isOpen={isRecordsOpen}
        bestTimeText={game.bestRecord ? formatDuration(game.bestRecord.durationMs) : '기록 없음'}
        records={game.records}
        onClose={() => setIsRecordsOpen(false)}
      />

      {game.stageSolution && solutionLevelData ? (
        <StageSolutionModal
          isOpen
          level={game.stageSolution.level}
          levelData={solutionLevelData}
          reason={game.stageSolution.reason}
          onClose={
            game.stageSolution.reason === 'success'
              ? game.continueAfterStageSolution
              : game.retryAfterGiveUp
          }
          onPrimaryAction={game.continueAfterStageSolution}
          onRetryAction={
            game.stageSolution.reason === 'giveup' ? game.retryAfterGiveUp : undefined
          }
          primaryLabel={
            game.stageSolution.reason === 'success'
              ? game.stageSolution.level === LEVELS.length
                ? '결과 보기'
                : '다음 단계로'
              : game.stageSolution.level === LEVELS.length
                ? '처음부터 다시'
                : '다음 단계로'
          }
        />
      ) : null}

      <ResultModal
        isOpen={game.resultOpen}
        finalTimeText={game.finalTimeMs ? formatDuration(game.finalTimeMs) : '00:00'}
        bestTimeText={game.bestRecord ? formatDuration(game.bestRecord.durationMs) : '기록 없음'}
        onRestart={game.restartGame}
      />
    </>
  );
}

export default App;
