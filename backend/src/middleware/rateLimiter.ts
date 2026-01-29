import rateLimit from 'express-rate-limit'

/**
 * 抽取接口限流器
 * 防止频繁抽取
 */
export const drawRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'), // 1 小时
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'), // 最多 10 次
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  // 使用 IP 作为限流依据
  keyGenerator: (req) => {
    return (
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      'unknown'
    )
  },
})

/**
 * API 通用限流器
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60000, // 1 分钟
  max: 100, // 最多 100 次请求
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
})
