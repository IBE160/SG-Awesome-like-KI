// src/lib/logger.ts
// A simple structured logger for the application.
// In a production environment, this might be replaced by a more robust solution
// like Winston, Pino, or a cloud-specific logging client.

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: any; // Allow arbitrary additional metadata
}

function formatLogMessage(level: LogLevel, message: string, metadata?: Record<string, any>): string {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  };
  return JSON.stringify(logEntry);
}

export const logger = {
  info: (message: string, metadata?: Record<string, any>) => {
    console.log(formatLogMessage('info', message, metadata));
  },
  warn: (message: string, metadata?: Record<string, any>) => {
    console.warn(formatLogMessage('warn', message, metadata));
  },
  error: (message: string, metadata?: Record<string, any>) => {
    console.error(formatLogMessage('error', message, metadata));
  },
  debug: (message: string, metadata?: Record<string, any>) => {
    // Only log debug messages in development or if explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      console.log(formatLogMessage('debug', message, metadata));
    }
  },
};
