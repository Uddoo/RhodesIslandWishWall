import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/authService'

export interface AuthRequest extends Request {
  user?: any
}

/**
 * JWT 认证中间件
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 获取 token
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: '未提供认证 token' })
    }

    const token = authHeader.replace('Bearer ', '')

    // 验证 token
    const decoded = verifyToken(token)
    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({ error: '无效的 token' })
  }
}
