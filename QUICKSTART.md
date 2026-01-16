# 快速開始

## 本地開發設置

### 1. 啟動後端 (Node.js API)

```bash
cd backend-nodejs
npm install
npm run dev
```

後端將在 `http://localhost:3000` 運行

### 2. 啟動前端

在另一個終端窗口：

```bash
npm install
npm run dev
```

前端將在 `http://localhost:5173` 運行

### 3. 訪問應用

打開瀏覽器訪問: `http://localhost:5173`

## 數據庫遷移 (可選)

如果你有 ASP.NET 版本的數據需要遷移：

```bash
cd backend-nodejs
node scripts/migrate.js
```

## 測試 API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### 創建成員
```bash
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","monthlyContribution":5000}'
```

### 創建分類
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Food"}'
```

### 創建支出
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2026-01-15",
    "memberId":"<成員ID>",
    "categoryId":"<分類ID>",
    "amount":100,
    "note":"Lunch"
  }'
```

## 常見問題

### 端口被占用
如果端口 3000 被占用，修改 `backend-nodejs/.env` 中的 `PORT` 變量。

### 數據庫錯誤
刪除 `backend-nodejs/App_Data/` 目錄中的數據庫文件，讓應用重新創建。

### CORS 錯誤
確保 `FRONTEND_URL` 環境變量正確設置為前端 URL。

## 生產部署

見 [DEPLOYMENT.md](./backend-nodejs/DEPLOYMENT.md) 獲取詳細的 IIS 部署指南。

## 文檔

- [遷移計劃](./MIGRATION_PLAN.md)
- [技術架構](./TECHNICAL_ARCHITECTURE.md)
- [API 文檔](./backend-nodejs/README.md)
- [部署指南](./backend-nodejs/DEPLOYMENT.md)
- [遷移報告](./MIGRATION_REPORT.md)
