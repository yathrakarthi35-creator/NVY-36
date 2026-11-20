/**
 * Lightweight structured logger that stays silent during test runs and production builds.
 */
const isDev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);

export const logger = {
  info(message: string, context?: unknown): void {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(`[NVY-AI] ${message}`, context ?? '');
    }
  },
  warn(message: string, context?: unknown): void {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(`[NVY-AI] ${message}`, context ?? '');
    }
  },
  error(message: string, error?: unknown): void {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(`[NVY-AI] ${message}`, error ?? '');
    }
  },
};
