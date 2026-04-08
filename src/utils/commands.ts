import type { GameCommand } from '../types/game';

export function formatCommandLabel(command: GameCommand) {
  if (command.type === 'catch') {
    return '보물 잡기';
  }

  const directionLabel =
    command.rotation === 'left'
      ? `왼쪽 ${command.angle}°`
      : command.rotation === 'right'
        ? `오른쪽 ${command.angle}°`
        : '회전 없이';

  return `${directionLabel} 후 ${command.distanceCm}cm 이동`;
}
