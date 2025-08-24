// Production-safe logging utility that filters sensitive information
const isDevelopment = import.meta.env.DEV;

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

// Sensitive data patterns to filter out
const SENSITIVE_PATTERNS = [
  /email/i,
  /password/i,
  /token/i,
  /key/i,
  /phone/i,
  /whatsapp/i,
  /@/,  // email addresses
  /\+?\d{10,}/,  // phone numbers
];

// Filter sensitive information from objects
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Sanitize string messages
const sanitizeMessage = (message: string): string => {
  let sanitized = message;
  
  // Remove email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
  
  // Remove phone numbers
  sanitized = sanitized.replace(/\+?\d{10,}/g, '[PHONE_REDACTED]');
  
  return sanitized;
};

class Logger {
  private log(level: string, message: string, ...args: any[]) {
    if (!isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const sanitizedMessage = isDevelopment ? message : sanitizeMessage(message);
    const sanitizedArgs = isDevelopment ? args : args.map(sanitizeData);

    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(`[${level.toUpperCase()}]`, sanitizedMessage, ...sanitizedArgs);
        break;
      case LOG_LEVELS.WARN:
        console.warn(`[${level.toUpperCase()}]`, sanitizedMessage, ...sanitizedArgs);
        break;
      case LOG_LEVELS.INFO:
        console.info(`[${level.toUpperCase()}]`, sanitizedMessage, ...sanitizedArgs);
        break;
      case LOG_LEVELS.DEBUG:
        console.log(`[${level.toUpperCase()}]`, sanitizedMessage, ...sanitizedArgs);
        break;
      default:
        console.log(`[${level.toUpperCase()}]`, sanitizedMessage, ...sanitizedArgs);
    }
  }

  error(message: string, ...args: any[]) {
    this.log(LOG_LEVELS.ERROR, message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log(LOG_LEVELS.WARN, message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log(LOG_LEVELS.INFO, message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.log(LOG_LEVELS.DEBUG, message, ...args);
  }

  // Special method for auth events that automatically sanitizes
  authEvent(event: string, session?: any) {
    if (isDevelopment) {
      this.debug(`Auth event: ${event}`, session?.user?.email || 'no user');
    } else {
      this.info(`Auth event: ${event}`, session ? 'user present' : 'no user');
    }
  }
}

export const logger = new Logger();