import app from './app'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const PORT = process.env.PORT || 3000

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`)
  console.log(`📊 健康检查: http://localhost:${PORT}/health`)
  console.log(`🎯 公开接口: http://localhost:${PORT}/api`)
  console.log(`🔐 管理接口: http://localhost:${PORT}/api/admin`)
})
