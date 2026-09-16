import pino from 'pino';
import pinoHttp from 'pino-http';
import crypto from 'crypto';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  customProps: (req, res) => {
    const props = {
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: res.responseTime,
    };

    const aiMeta = res.locals?.aiMeta || req.aiMeta;
    if (aiMeta) {
      props.aiModel = aiMeta.model;
      props.approxTokens = aiMeta.tokens ?? aiMeta.approxTokens;
    }
    return props;
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res, responseTime) => {
    const aiMeta = res.locals?.aiMeta || req.aiMeta;
    const aiSuffix = aiMeta
      ? ` [model=${aiMeta.model || 'unknown'} tokens=${aiMeta.tokens ?? aiMeta.approxTokens ?? 0}]`
      : '';
    return `${req.method} ${req.originalUrl || req.url} ${res.statusCode} in ${Math.round(responseTime)}ms${aiSuffix}`;
  },
});

export default logger;
