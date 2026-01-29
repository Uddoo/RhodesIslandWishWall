import { PrismaClient, Reward } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 加权随机抽取算法
 * @param rewards 可用奖励列表
 * @returns 抽中的奖励
 */
export function weightedRandom(rewards: Reward[]): Reward | null {
  if (rewards.length === 0) {
    return null
  }

  // 1. 过滤可用奖励 (enabled && stock > 0)
  const available = rewards.filter((r) => r.enabled && r.stock > 0)

  if (available.length === 0) {
    return null
  }

  // 2. 计算总权重
  const totalWeight = available.reduce((sum, r) => sum + r.weight, 0)

  // 3. 随机选择
  let random = Math.random() * totalWeight
  for (const reward of available) {
    random -= reward.weight
    if (random <= 0) {
      return reward
    }
  }

  // Fallback (理论上不会到达)
  return available[0]
}

/**
 * 执行抽奖
 * @param options 抽奖选项
 * @returns 抽奖结果
 */
export async function executeDraw(options: {
  ipAddress?: string
  userAgent?: string
  deviceId?: string
  userId?: string
}) {
  try {
    // 1. 获取所有奖励
    const rewards = await prisma.reward.findMany()

    // 2. 执行加权随机
    const selectedReward = weightedRandom(rewards)

    if (!selectedReward) {
      throw new Error('没有可用的奖励')
    }

    // 3. 扣减库存 (使用事务保证原子性)
    const [updatedReward, drawRecord] = await prisma.$transaction([
      prisma.reward.update({
        where: { id: selectedReward.id },
        data: { stock: { decrement: 1 } },
      }),
      prisma.drawRecord.create({
        data: {
          rewardId: selectedReward.id,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          deviceId: options.deviceId,
          userId: options.userId,
        },
      }),
    ])

    return {
      success: true,
      reward: updatedReward,
      recordId: drawRecord.id,
    }
  } catch (error) {
    console.error('抽奖失败:', error)
    throw error
  }
}

/**
 * 校验抽取资格
 * @param ipAddress IP 地址
 * @param deviceId 设备 ID
 * @returns 是否可以抽取
 */
export async function validateDrawEligibility(
  ipAddress?: string,
  deviceId?: string
): Promise<{ eligible: boolean; reason?: string; remaining?: number }> {
  try {
    // 获取每日限制配置
    const limitConfig = await prisma.config.findUnique({
      where: { key: 'daily_draw_limit' },
    })
    const dailyLimit = limitConfig ? parseInt(limitConfig.value) : 2

    // 计算今日开始时间
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // 查询今日抽取记录
    const whereClause: any = {
      createdAt: { gte: todayStart },
    }

    if (deviceId) {
      whereClause.deviceId = deviceId
    } else if (ipAddress) {
      whereClause.ipAddress = ipAddress
    }

    const todayDrawCount = await prisma.drawRecord.count({
      where: whereClause,
    })

    const remaining = dailyLimit - todayDrawCount

    if (todayDrawCount >= dailyLimit) {
      return {
        eligible: false,
        reason: '今日抽取次数已用完',
        remaining: 0,
      }
    }

    return {
      eligible: true,
      remaining,
    }
  } catch (error) {
    console.error('校验抽取资格失败:', error)
    return {
      eligible: false,
      reason: '系统错误',
    }
  }
}

/**
 * 获取统计信息
 */
export async function getStats() {
  const [totalDraws, rewards] = await Promise.all([
    prisma.drawRecord.count(),
    prisma.reward.findMany({
      select: {
        id: true,
        title: true,
        stock: true,
        totalStock: true,
      },
    }),
  ])

  const rewardsLeft = rewards.reduce((sum, r) => sum + r.stock, 0)

  return {
    totalDraws,
    rewardsLeft,
    rewards,
  }
}

export default {
  weightedRandom,
  executeDraw,
  validateDrawEligibility,
  getStats,
}
