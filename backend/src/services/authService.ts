import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

/**
 * 用户登录
 */
export async function login(username: string, password: string) {
  // 查找用户
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    throw new Error('用户名或密码错误')
  }

  // 验证密码
  const validPassword = await bcrypt.compare(password, user.passwordHash)

  if (!validPassword) {
    throw new Error('用户名或密码错误')
  }

  // 生成 JWT
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  }
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('无效的 token')
  }
}

/**
 * 创建用户
 */
export async function createUser(username: string, password: string, role: string = 'admin') {
  const passwordHash = await bcrypt.hash(password, 10)

  return await prisma.user.create({
    data: {
      username,
      passwordHash,
      role,
    },
  })
}

export default {
  login,
  verifyToken,
  createUser,
}
