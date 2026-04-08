export function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

function pad(value: number, length = 2) {
  return value.toString().padStart(length, '0');
}

export function formatPreciseDateTime(dateString: string) {
  const date = new Date(dateString);

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

export function formatPreciseDateTimeForFile(dateString: string) {
  const date = new Date(dateString);

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}_${pad(date.getMilliseconds(), 3)}`;
}

export async function getCurrentServerTimestamp() {
  const fallback = new Date().toISOString();

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const response = await fetch(window.location.href, {
      method: 'HEAD',
      cache: 'no-store',
    });
    const headerValue = response.headers.get('date');

    if (!headerValue) {
      return fallback;
    }

    const serverDate = new Date(headerValue);

    return Number.isNaN(serverDate.getTime()) ? fallback : serverDate.toISOString();
  } catch {
    return fallback;
  }
}
