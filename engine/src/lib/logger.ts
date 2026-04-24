import pino from 'pino';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { paths } from './paths.ts';

mkdirSync(paths.logs, { recursive: true });

const level = process.env.SCQR_LOG_LEVEL ?? 'info';
const isTTY = process.stdout.isTTY;

export const logger = pino({
  level,
  transport: isTTY
    ? {
        target: 'pino-pretty',
        options: { colorize: true, singleLine: false, translateTime: 'HH:MM:ss' },
      }
    : undefined,
});

export function fileLogger(command: string): pino.Logger {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = resolve(paths.logs, `${command}-${ts}.log`);
  return pino({ level }, pino.destination({ dest: file, sync: false }));
}
