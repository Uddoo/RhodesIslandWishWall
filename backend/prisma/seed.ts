import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始数据库初始化...')

  // 1. 创建管理员账户
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
    },
  })
  console.log('✅ 管理员账户已创建:', admin.username)

  // 2. 创建示例奖励配置
  const rewards = [
    {
      title: '特等奖',
      description: '稀有奖励',
      type: 'special',
      weight: 1,
      stock: 2,
      totalStock: 2,
      enabled: true,
    },
    {
      title: '一等奖',
      description: '高级奖励',
      type: 'high',
      weight: 5,
      stock: 10,
      totalStock: 10,
      enabled: true,
    },
    {
      title: '二等奖',
      description: '中级奖励',
      type: 'medium',
      weight: 15,
      stock: 30,
      totalStock: 30,
      enabled: true,
    },
    {
      title: '三等奖',
      description: '普通奖励',
      type: 'normal',
      weight: 30,
      stock: 50,
      totalStock: 50,
      enabled: true,
    },
    {
      title: '谢谢参与',
      description: '感谢参与',
      type: 'empty',
      weight: 49,
      stock: 100,
      totalStock: 100,
      enabled: true,
    },
  ]

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { id: rewards.indexOf(reward) + 1 },
      update: {},
      create: reward,
    })
  }
  console.log('✅ 示例奖励已创建:', rewards.length, '个')

  // 3. 创建系统配置
  const configs = [
    {
      key: 'daily_draw_limit',
      value: '2',
      description: '每日抽取次数限制',
    },
    {
      key: 'event_end_time',
      value: '2026-12-31 23:59:59',
      description: '活动结束时间',
    },
  ]

  for (const config of configs) {
    await prisma.config.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }
  console.log('✅ 系统配置已创建:', configs.length, '个')

  console.log('🎉 数据库初始化完成！')
}

main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
