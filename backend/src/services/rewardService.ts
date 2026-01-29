import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 获取所有奖励
 */
export async function getAllRewards() {
  return await prisma.reward.findMany({
    orderBy: { weight: 'asc' },
  })
}

/**
 * 获取单个奖励
 */
export async function getRewardById(id: number) {
  return await prisma.reward.findUnique({
    where: { id },
  })
}

/**
 * 创建奖励
 */
export async function createReward(data: {
  title: string
  description?: string
  type: string
  weight: number
  stock: number
  totalStock: number
  image?: string
  enabled?: boolean
}) {
  return await prisma.reward.create({
    data: {
      ...data,
      enabled: data.enabled ?? true,
    },
  })
}

/**
 * 更新奖励
 */
export async function updateReward(
  id: number,
  data: {
    title?: string
    description?: string
    type?: string
    weight?: number
    stock?: number
    totalStock?: number
    image?: string
    enabled?: boolean
  }
) {
  return await prisma.reward.update({
    where: { id },
    data,
  })
}

/**
 * 删除奖励
 */
export async function deleteReward(id: number) {
  return await prisma.reward.delete({
    where: { id },
  })
}

export default {
  getAllRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward,
}
