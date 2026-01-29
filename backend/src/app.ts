import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import drawRoutes from './routes/draw'
import adminRoutes from './routes/admin'
import { apiRateLimiter } from './middleware/rateLimiter'

// 加载环境变量
dotenv.config()

// 创建 Express 应用
const app = express()

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 通用 API 限流
app.use('/api', apiRateLimiter)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 路由
app.use('/api', drawRoutes)
app.use('/api/admin', adminRoutes)

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? '服务器错误' : err.message,
  })
})

export default app
