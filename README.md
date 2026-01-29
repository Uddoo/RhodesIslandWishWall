# 罗德岛许愿墙系统

一个可自部署、可配置、支持多终端访问的抽取式奖励系统

## 项目简介

本项目包含：
- **前台抽取页面**：用户访问的许愿墙，支持翻牌动效和陀螺仪交互
- **后端 API 服务**：抽奖逻辑、数据存储、权限验证
- **管理后台**：配置奖励、查看记录（待实现）

## 技术栈

### 后端
- **语言**: Node.js + TypeScript
- **框架**: Express
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT

### 前端（前台抽取页面）
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **动画**: CSS Transform + Transition (配置化)

## 快速开始

### 1. 后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 生成 Prisma Client
npm run prisma:generate

# 执行数据库迁移
npm run prisma:migrate

# 初始化数据（创建管理员账户和示例奖励）
npm run db:seed

# 启动开发服务器
npm run dev
```

后端服务将运行在 `http://localhost:3000`

#### 默认管理员账户
- 用户名: `admin`
- 密码: `admin123`

⚠️ **请在生产环境中修改默认密码！**

### 2. 前台抽取页面

```bash
# 进入前台目录
cd frontend-public

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前台页面将运行在 `http://localhost:5173`

### 3. 访问系统

- **前台抽取页面**: http://localhost:5173
- **健康检查**: http://localhost:3000/health
- **API 文档**: 见下方 API 端点说明

## 项目结构

```
RhodesIslandWishWall/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── routes/          # API 路由
│   │   ├── services/        # 业务逻辑
│   │   ├── middleware/      # 中间件
│   │   ├── app.ts           # Express 应用
│   │   └── server.ts        # 入口文件
│   ├── prisma/
│   │   ├── schema.prisma    # 数据库 schema
│   │   └── seed.ts          # 数据初始化
│   └── package.json
│
├── frontend-public/         # 前台抽取页面
│   ├── src/
│   │   ├── components/      # Vue 组件
│   │   ├── composables/     # Vue Composables
│   │   ├── config/          # 配置文件
│   │   ├── api/             # API 调用
│   │   └── types/           # TypeScript 类型
│   └── package.json
│
└── Docs/                    # 项目文档
```

## API 端点

### 公开接口

#### POST /api/draw
执行抽取

**请求体**:
```json
{
  "deviceId": "device_abc123" // 可选，设备 ID
}
```

**响应**:
```json
{
  "success": true,
  "reward": {
    "id": 1,
    "title": "特等奖",
    "description": "稀有奖励",
    "type": "special",
    "image": null
  },
  "remaining": 1
}
```

#### GET /api/eligibility
检查抽取资格

**查询参数**:
- `deviceId` (可选): 设备 ID

**响应**:
```json
{
  "eligible": true,
  "remaining": 2
}
```

#### GET /api/stats
获取统计信息

**响应**:
```json
{
  "totalDraws": 100,
  "rewardsLeft": 50,
  "rewards": [...]
}
```

### 管理接口（需要 JWT 认证）

#### POST /api/admin/login
管理员登录

**请求体**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

#### GET /api/admin/rewards
获取所有奖励配置

**响应**:
```json
[
  {
    "id": 1,
    "title": "特等奖",
    "description": "稀有奖励",
    "type": "special",
    "weight": 1,
    "stock": 2,
    "totalStock": 2,
    "enabled": true,
    ...
  }
]
```

#### POST /api/admin/rewards
创建奖励

**请求体**:
```json
{
  "title": "新奖励",
  "description": "描述...",
  "type": "normal",
  "weight": 10,
  "stock": 50,
  "totalStock": 50,
  "enabled": true
}
```

#### PUT /api/admin/rewards/:id
更新奖励

#### DELETE /api/admin/rewards/:id
删除奖励

#### GET /api/admin/records
获取抽取记录

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `rewardId`: 筛选特定奖励

**响应**:
```json
{
  "records": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### GET /api/admin/dashboard
获取 Dashboard 统计数据

## 核心功能

### 1. 加权随机抽奖算法

```typescript
// 支持权重、库存、启用状态的随机抽取
function weightedRandom(rewards) {
  // 过滤可用奖励 (enabled && stock > 0)
  // 根据 weight 计算概率
  // 随机选择
}
```

### 2. 防作弊机制

- IP 限流（每小时最多 10 次请求）
- 设备 ID 绑定（每日抽取次数限制）
- 后端执行所有抽奖逻辑，前端无法篡改

### 3. 三阶段翻牌动效

1. **静止/初始状态**: 轻微摆动 + 悬停反馈
2. **抽取中**: 弹出 → 翻转 → 结果展示
3. **抽取完成**: 淡出 + 标记已完成

### 4. 移动端陀螺仪交互

- 通过设备倾斜控制卡片旋转和光泽
- 自动平滑处理
- 尊重 `prefers-reduced-motion` 设置

## 配置说明

### 后端配置 (backend/.env)

```bash
# 数据库
DATABASE_URL="file:./dev.db"

# 服务器端口
PORT=3000

# JWT 密钥（生产环境必须修改！）
JWT_SECRET=your-secret-key-here

# 限流配置
RATE_LIMIT_WINDOW_MS=3600000   # 1 小时
RATE_LIMIT_MAX_REQUESTS=10      # 最多 10 次
```

### 前端动效配置 (frontend-public/src/config/motionConfig.ts)

```typescript
export const motionConfig = {
  idle: {
    swayDuration: 3000,     // 摆动时长
    hoverScale: 1.03,       // 悬停放大
  },
  pickup: {
    duration: 300,          // 弹出时长
    easing: 'cubic-bezier(.34,1.56,.64,1)',
  },
  flip: {
    duration: 500,          // 翻转时长
  },
  tilt: {
    enabled: true,          // 启用陀螺仪
    maxAngle: 6,            // 最大倾斜角度
  },
}
```

## 开发说明

### 添加新奖励

1. 通过管理接口创建奖励：
```bash
curl -X POST http://localhost:3000/api/admin/rewards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新奖励",
    "type": "normal",
    "weight": 10,
    "stock": 100,
    "totalStock": 100
  }'
```

2. 或直接操作数据库：
```bash
cd backend
npm run prisma:studio
```

### 修改每日抽取次数

修改数据库中的 `configs` 表：
```sql
UPDATE configs SET value = '5' WHERE key = 'daily_draw_limit';
```

或通过 Prisma Studio 修改。

### 自定义动效

编辑 `frontend-public/src/config/motionConfig.ts` 中的参数，无需修改组件代码。

## 生产部署

### 方式 1: 手动部署

1. 构建前端：
```bash
cd frontend-public
npm run build
# 输出到 dist/
```

2. 构建后端：
```bash
cd backend
npm run build
# 输出到 dist/
```

3. 使用 PM2 运行后端：
```bash
pm2 start dist/server.js --name wishwall-backend
```

4. 使用 Nginx 托管：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前台页面
    location / {
        root /path/to/frontend-public/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 方式 2: Docker 部署（待添加）

## 后续扩展

- [ ] 管理后台前端页面
- [ ] 多活动并存支持
- [ ] 保底机制 (N 次必出)
- [ ] WebSocket 实时推送
- [ ] 数据可视化图表
- [ ] 移动端 PWA 支持
- [ ] 微信登录集成

## 许可证

MIT

## 参考文档

- [PROJECT.md](./Docs/PROJECT.md) - 项目设计文档
- [许愿墙翻牌动效.md](./Docs/许愿墙翻牌动效.md) - 动效规范
- [素材清单.md](./Docs/素材清单.md) - 素材管理

## 常见问题

### 1. 为什么抽取失败？

检查：
- 后端服务是否正常运行
- 是否超过每日抽取次数限制
- 奖励库存是否充足
- 是否被限流（过于频繁）

### 2. 如何重置抽取记录？

```bash
cd backend
rm prisma/dev.db
npm run prisma:migrate
npm run db:seed
```

### 3. 如何修改动画效果？

编辑 `frontend-public/src/config/motionConfig.ts`，调整各动画阶段的参数。

### 4. 生产环境安全注意事项

- [ ] 修改 JWT_SECRET
- [ ] 修改默认管理员密码
- [ ] 启用 HTTPS
- [ ] 配置防火墙
- [ ] 定期备份数据库
- [ ] 监控 API 调用频率

---

**开发者**: Rhodes Island Team
**创建时间**: 2026-01-29
