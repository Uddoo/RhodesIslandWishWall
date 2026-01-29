import { Router } from 'express'
import * as drawService from '../services/drawService'
import { drawRateLimiter } from '../middleware/rateLimiter'

const router = Router()

/**
 * POST /api/draw
 * 执行抽取
 */
router.post('/draw', drawRateLimiter, async (req, res) => {
  try {
    const { deviceId, userId } = req.body
    const ipAddress = (req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress) as string
    const userAgent = req.headers['user-agent']

    // 1. 校验抽取资格
    const eligibility = await drawService.validateDrawEligibility(ipAddress, deviceId)

    if (!eligibility.eligible) {
      return res.status(403).json({
        success: false,
        error: eligibility.reason,
        remaining: 0,
      })
    }

    // 2. 执行抽取
    const result = await drawService.executeDraw({
      ipAddress,
      userAgent,
      deviceId,
      userId,
    })

    // 3. 返回结果
    return res.json({
      success: true,
      reward: {
        id: result.reward.id,
        title: result.reward.title,
        description: result.reward.description,
        type: result.reward.type,
        image: result.reward.image,
      },
      remaining: (eligibility.remaining ?? 1) - 1,
    })
  } catch (error: any) {
    console.error('抽取失败:', error)
    return res.status(500).json({
      success: false,
      error: error.message || '抽取失败',
    })
  }
})

/**
 * GET /api/stats
 * 获取统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await drawService.getStats()
    return res.json(stats)
  } catch (error: any) {
    console.error('获取统计信息失败:', error)
    return res.status(500).json({
      error: error.message || '获取统计信息失败',
    })
  }
})

/**
 * GET /api/eligibility
 * 检查抽取资格
 */
router.get('/eligibility', async (req, res) => {
  try {
    const { deviceId } = req.query
    const ipAddress = (req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress) as string

    const eligibility = await drawService.validateDrawEligibility(
      ipAddress,
      deviceId as string
    )

    return res.json(eligibility)
  } catch (error: any) {
    console.error('检查抽取资格失败:', error)
    return res.status(500).json({
      error: error.message || '检查抽取资格失败',
    })
  }
})

export default router
