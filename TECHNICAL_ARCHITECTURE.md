# 技術架構設計

## 數據流架構

```
┌─────────────┐
│   Browser   │
│  (Vue.js)   │
└──────┬──────┘
       │ HTTP/JSON
       ▼
┌─────────────┐
│  IIS (ARR)  │
└──────┬──────┘
       │ Reverse Proxy
       ▼
┌─────────────────────────┐
│     Express.js API      │
│  (TypeScript + Node)    │
└──────────┬──────────────┘
           │ SQL
           ▼
┌─────────────────────────┐
│   SQLite Database       │
│  (family-budget.db)     │
└─────────────────────────┘
```

## 模組依賴圖

```
index.ts (Entry Point)
  ├── config/
  │   └── database.ts
  ├── middleware/
  │   ├── cors.ts
  │   └── errorHandler.ts
  ├── utils/
  │   └── dateUtils.ts
  ├── validators/
  │   └── validators.ts
  └── routes/
      ├── members.ts
      ├── categories.ts
      ├── expenses.ts
      ├── analytics.ts
      ├── remittance.ts
      └── health.ts
```

## API 響應格式

### 成功響應
```json
{
  "id": "m_abc123",
  "name": "John Doe",
  "monthlyContribution": 5000
}
```

### 錯誤響應
```json
{
  "message": "Invalid member payload."
}
```

## 日期處理規範

所有日期必須使用 `yyyy-MM-dd` 格式 (ISO 8601)

```typescript
// 輸入驗證
const isValidDate = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
};

// 月度格式
const isValidMonth = (month: string): boolean => {
  return /^\d{4}-\d{2}$/.test(month);
};
```

## ID 生成規範

與 ASP.NET 保持一致：

- Members: `m_{guid}` (e.g., `m_5f83a2d7e3c94d7c94d7c94d`)
- Categories: `c_{guid}` (e.g., `c_5f83a2d7e3c94d7c94d7c94d`)
- Expenses: `e_{guid}` (e.g., `e_5f83a2d7e3c94d7c94d7c94d`)

```typescript
import { randomUUID } from 'crypto';

export const generateId = (prefix: string): string => {
  const uuid = randomUUID().replace(/-/g, '');
  return `${prefix}_${uuid}`;
};

// 使用範例
const memberId = generateId('m');  // m_5f83a2d7e3c94d7c94d7c94d
const categoryId = generateId('c'); // c_5f83a2d7e3c94d7c94d7c94d
const expenseId = generateId('e');  // e_5f83a2d7e3c94d7c94d7c94d
```

## 數據庫操作模式

### 查詢模式
```typescript
import Database from 'better-sqlite3';

const db = new Database('family-budget.db');
db.pragma('foreign_keys = ON');

// 查詢
const members = db.prepare('SELECT * FROM Members').all();

// 參數化查詢
const member = db.prepare('SELECT * FROM Members WHERE Id = ?').get(id);

// 事務處理
const insertMember = db.transaction((memberData) => {
  const stmt = db.prepare('INSERT INTO Members (Id, Name, MonthlyContribution) VALUES (?, ?, ?)');
  stmt.run(memberData.id, memberData.name, memberData.monthlyContribution);
});
```

## 錯誤處理策略

### HTTP 狀態碼對照表

| 錯誤類型 | 狀態碼 | 說明 |
|----------|--------|------|
| 驗證錯誤 | 400 | 請求參數無效 |
| 未找到 | 404 | 資源不存在 |
| 衝突 | 409 | 資源被使用 (如刪除成員時) |
| 伺服器錯誤 | 500 | 內部錯誤 |

### 錯誤處理中間件
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ message: err.message });
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({ message: err.message });
  }

  res.status(500).json({ message: 'Internal server error.' });
};
```

## CORS 配置

```typescript
import cors from 'cors';

// 開發環境
app.use(cors());

// 生產環境
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
```

## 環境變量配置

```env
# .env.example
PORT=3000
NODE_ENV=development
DATABASE_PATH=./App_Data/family-budget.db
FRONTEND_URL=http://localhost:5173
```

## 測試策略

### 單元測試
- 測試工具函數 (日期驗證、ID 生成)
- 測試驗證器

### 整合測試
- 測試 API 端點
- 測試數據庫操作
- 測試錯誤處理

### 測試範例
```typescript
import request from 'supertest';
import app from '../src/index';

describe('Members API', () => {
  it('should create a member', async () => {
    const response = await request(app)
      .post('/api/members')
      .send({ name: 'John Doe', monthlyContribution: 5000 })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('John Doe');
  });
});
```

## 日誌記錄

```typescript
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  }
};
```

## 效能優化

1. **查詢優化**
   - 使用索引 (已存在)
   - 避免 SELECT *
   - 批量查詢

2. **連接管理**
   - better-sqlite3 是單連接，不需要池
   - 在應用啟動時初始化連接

3. **快取策略**
   - 考慮實現簡單的記憶體快取
   - 快取 Members 和 Categories (不經常變更)

## 監控和健康檢查

```typescript
app.get('/api/health', (req, res) => {
  const dbStatus = db ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});
```

## 部署配置

### PM2 配置 (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'family-budget-api',
    script: './dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### IIS web.config
```xml
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule1" stopProcessing="true">
          <match url="api/(.*)" />
          <action type="Rewrite" url="http://localhost:3000/api/{R:1}" />
        </rule>
        <rule name="ReverseProxyInboundRule2" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```
