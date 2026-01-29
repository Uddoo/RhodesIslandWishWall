import { Router } from 'express'
import * as authService from '../services/authService'
import * as rewardService from '../services/rewardService'
import { authMiddleware } from '../middleware/auth'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

/**
 * POST /api/admin/login
 * 管理员登录
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    const result = await authService.login(username, password)

    return res.json(result)
  } catch (error: any) {
    console.error('登录失败:', error)
    return res.status(401).json({
      error: error.message || '登录失败',
    })
  }
})

// 以下所有路由需要认证
router.use(authMiddleware)

/**
 * GET /api/admin/rewards
 * 获取所有奖励
 */
router.get('/rewards', async (req, res) => {
  try {
    const rewards = await rewardService.getAllRewards()
    return res.json(rewards)
  } catch (error: any) {
    console.error('获取奖励列表失败:', error)
    return res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/admin/rewards
 * 创建奖励
 */
router.post('/rewards', async (req, res) => {
  try {
    const { title, description, type, weight, stock, totalStock, image, enabled } = req.body

    if (!title || !type || weight === undefined || stock === undefined || totalStock === undefined) {
      return res.status(400).json({ error: '必填字段不能为空' })
    }

    const reward = await rewardService.createReward({
      title,
      description,
      type,
      weight: parseInt(weight),
      stock: parseInt(stock),
      totalStock: parseInt(totalStock),
      image,
      enabled,
    })

    return res.status(201).json(reward)
  } catch (error: any) {
    console.error('创建奖励失败:', error)
    return res.status(500).json({ error: error.message })
  }
})

/**
 * PUT /api/admin/rewards/:id
 * 更新奖励
 */
router.put('/rewards/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { title, description, type, weight, stock, totalStock, image, enabled } = req.body

    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (type !== undefined) updates.type = type
    if (weight !== undefined) updates.weight = parseInt(weight)
    if (stock !== undefined) updates.stock = parseInt(stock)
    if (totalStock !== undefined) updates.totalStock = parseInt(totalStock)
    if (image !== undefined) updates.image = image
    if (enabled !== undefined) updates.enabled = enabled

    const reward = await rewardService.updateReward(id, updates)

    return res.json(reward)
  } catch (error: any) {
    console.error('更新奖励失败:', error)
    return res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/admin/rewards/:id
 * 删除奖励
 */
router.delete('/rewards/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await rewardService.deleteReward(id)
    return res.json({ success: true })
  } catch (error: any) {
    console.error('删除奖励失败:', error)
    return res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/admin/records
 * 获取抽取记录
 */
router.get('/records', async (req, res) => {
  try {
    const { page = '1', limit = '20', rewardId } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}
    if (rewardId) {
      where.rewardId = parseInt(rewardId as string)
    }

    const [records, total] = await Promise.all([
      prisma.drawRecord.findMany({
        where,
        include: {
          reward: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.drawRecord.count({ where }),
    ])

    return res.json({
      records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error: any) {
    console.error('获取抽取记录失败:', error)
    return res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/admin/dashboard
 * 获取Dashboard统计数据
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [totalDraws, totalRewards, rewardStats] = await Promise.all([
      prisma.drawRecord.count(),
      prisma.reward.count(),
      prisma.reward.findMany({
        select: {
          id: true,
          title: true,
          type: true,
          stock: true,
          totalStock: true,
          weight: true,
          enabled: true,
          _count: {
            select: { drawRecords: true },
          },
        },
      }),
    ])

    const totalStock = rewardStats.reduce((sum, r) => sum + r.stock, 0)

    return res.json({
      totalDraws,
      totalRewards,
      totalStock,
      rewardStats,
    })
  } catch (error: any) {
    console.error('获取Dashboard数据失败:', error)
    return res.status(500).json({ error: error.message })
  }
})

export default router
