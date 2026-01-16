# Family Budget API - Node.js 版本

Family Budget 應用的 Node.js 後端實現，從 ASP.NET Core 遷移而來。

## 技術棧

- **框架**: Express.js
- **語言**: TypeScript
- **數據庫**: SQLite (better-sqlite3)
- **驗證**: Zod
- **進程管理**: PM2

## 安裝

```bash
npm install
```

## 配置

複製 `.env.example` 到 `.env` 並配置環境變量：

```bash
cp .env.example .env
```

## 數據庫遷移

從 ASP.NET 數據庫遷移數據：

```bash
node scripts/migrate.js
```

## 開發

```bash
npm run dev
```

## 構建

```bash
npm run build
```

## 生產環境

```bash
npm run build
npm start
```

或使用 PM2：

```bash
pm2 start ecosystem.config.js
```

## API 端點

### Members
- `GET /api/members` - 獲取所有成員
- `POST /api/members` - 創建成員
- `PUT /api/members/:id` - 更新成員
- `DELETE /api/members/:id` - 刪除成員

### Categories
- `GET /api/categories` - 獲取所有分類
- `POST /api/categories` - 創建分類
- `PUT /api/categories/:id` - 更新分類
- `DELETE /api/categories/:id` - 刪除分類

### Expenses
- `GET /api/expenses?from=2024-01-01&to=2024-12-31` - 獲取支出列表
- `POST /api/expenses` - 創建支出
- `PUT /api/expenses/:id` - 更新支出
- `DELETE /api/expenses/:id` - 刪除支出

### Analytics
- `GET /api/analytics?from=2024-01-01&to=2024-12-31` - 獲取分析數據

### Remittance
- `GET /api/remittance?month=2024-01` - 獲取匯款資訊

### Health Check
- `GET /api/health` - 健康檢查

## 測試

```bash
npm test
```

## IIS 部署

見 [IIS 部署指南](./DEPLOYMENT.md)

## 項目結構

```
src/
├── config/          # 配置
├── middleware/     # 中間件
├── models/         # 數據模型
├── routes/         # API 路由
├── utils/          # 工具函數
├── validators/     # 請求驗證
└── index.ts        # 應用入口
```
