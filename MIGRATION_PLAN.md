# Family Budget API - Node.js 遷移計劃

## 📋 專案概況

### 當前架構
- **後端**: ASP.NET Core (.NET 10.0) + SQLite
- **前端**: Vue.js 3 + Vite
- **部署**: IIS
- **數據庫**: SQLite (family-budget.db)
- **API 端點**: 5 個 Controller，共 20+ 個端點

### 遷移目標
- 將後端從 ASP.NET Core 遷移到 Node.js
- 保持 API 介面完全相容
- 保持數據庫 schema 不變
- 暫時繼續使用 IIS 部署 (通過反向代理)

## 🎯 技術選型

### 推薦技術棧

| 層級 | 技術選擇 | 說明 |
|------|----------|------|
| **框架** | Express.js | 簡單、成熟、生態豐富 |
| **語言** | TypeScript | 類型安全，與 C# 類似 |
| **數據庫驅動** | better-sqlite3 | 同步 API，效能優異 |
| **驗證** | Zod | 運行時類型驗證 |
| **錯誤處理** | 自定義中間件 | 統一錯誤格式 |
| **進程管理** | PM2 | 生產環境進程管理 |
| **測試** | Jest + Supertest | API 測試 |

### 備選方案
- **NestJS**: 更結構化的框架，適合大型專案
- **Fastify**: 更高效能，但學習曲線較陡

## 📦 專案結構

```
backend-nodejs/
├── src/
│   ├── config/          # 配置檔案
│   │   └── database.ts
│   ├── models/          # 數據模型 (TypeScript 介面)
│   │   ├── expense.ts
│   │   ├── category.ts
│   │   ├── member.ts
│   │   └── index.ts
│   ├── validators/      # 請求驗證
│   │   └── validators.ts
│   ├── routes/          # API 路由
│   │   ├── members.ts
│   │   ├── categories.ts
│   │   ├── expenses.ts
│   │   ├── analytics.ts
│   │   ├── remittance.ts
│   │   └── health.ts
│   ├── controllers/     # 控制器 (如果需要)
│   ├── middleware/      # 中間件
│   │   ├── cors.ts
│   │   └── errorHandler.ts
│   ├── utils/           # 工具函數
│   │   └── dateUtils.ts
│   └── index.ts         # 應用入口
├── App_Data/            # 數據庫文件目錄
│   └── family-budget.db
├── tests/               # 測試檔案
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔌 API 端點對照表

### Members API
| 方法 | 路徑 | 功能 | 優先級 |
|------|------|------|--------|
| GET | /api/members | 獲取所有成員 | P0 |
| POST | /api/members | 創建成員 | P0 |
| PUT | /api/members/:id | 更新成員 | P0 |
| DELETE | /api/members/:id | 刪除成員 | P0 |

### Categories API
| 方法 | 路徑 | 功能 | 優先級 |
|------|------|------|--------|
| GET | /api/categories | 獲取所有分類 | P0 |
| POST | /api/categories | 創建分類 | P0 |
| PUT | /api/categories/:id | 更新分類 | P0 |
| DELETE | /api/categories/:id | 刪除分類 | P0 |

### Expenses API
| 方法 | 路徑 | 功能 | 優先級 |
|------|------|------|--------|
| GET | /api/expenses | 獲取支出列表 | P0 |
| POST | /api/expenses | 創建支出 | P0 |
| PUT | /api/expenses/:id | 更新支出 | P0 |
| DELETE | /api/expenses/:id | 刪除支出 | P0 |

### Analytics API
| 方法 | 路徑 | 功能 | 優先級 |
|------|------|------|--------|
| GET | /api/analytics | 獲取分析數據 | P1 |

### Remittance API
| 方法 | 路徑 | 功能 | 優先級 |
|------|------|------|--------|
| GET | /api/remittance | 獲取匯款資訊 | P1 |

### Health Check
| 方法 | 路徑 | 功能 | 優先級 |
|------|------|------|--------|
| GET | /api/health | 健康檢查 | P2 |

## 📊 數據模型對照

### Members 表
```typescript
interface Member {
  id: string;              // "m_{guid}"
  name: string;
  monthlyContribution: number;
  createdAt?: string;
}
```

### Categories 表
```typescript
interface Category {
  id: string;              // "c_{guid}"
  name: string;
  isActive: boolean;
  createdAt?: string;
}
```

### Expenses 表
```typescript
interface Expense {
  id: string;              // "e_{guid}"
  date: string;            // "yyyy-MM-dd"
  memberId: string;
  categoryId: string;
  amount: number;
  note?: string;
  createdAt?: string;
}
```

## 🚀 實施階段

### 階段 1: 專案設置 (1-2 小時)
- [x] 初始化 Node.js + TypeScript 專案
- [ ] 安裝依賴包 (express, better-sqlite3, zod 等)
- [ ] 配置 TypeScript 和 ESLint
- [ ] 設置目錄結構
- [ ] 創建基礎 Express 應用

### 階段 2: 數據庫層 (2-3 小時)
- [ ] 實現 SQLite 連接工廠
- [ ] 實現數據庫初始化 (schema)
- [ ] 創建數據庫查詢函數
- [ ] 實現事務處理

### 階段 3: 工具和驗證 (1-2 小時)
- [ ] 實現日期驗證工具
- [ ] 實現 Zod 驗證器
- [ ] 創建錯誤處理中間件
- [ ] 配置 CORS

### 階段 4: API 實現 (6-8 小時)
- [ ] Members API (4 個端點)
- [ ] Categories API (4 個端點)
- [ ] Expenses API (4 個端點)
- [ ] Analytics API (1 個端點)
- [ ] Remittance API (1 個端點)
- [ ] Health Check (1 個端點)

### 階段 5: 測試 (1-2 小時)
- [ ] 基本 API 測試 (關鍵端點)
- [ ] 手動測試 (前端整合)
- [ ] 驗證錯誤處理

### 階段 6: 部署設置 (2-3 小時)
- [ ] 配置 PM2
- [ ] 設置環境變量
- [ ] 配置 IIS 反向代理
- [ ] 創建啟動腳本

### 階段 7: 數據遷移 (1 小時)
- [ ] 創建數據遷移腳本 (ASP.NET → Node.js)
- [ ] 執行遷移並驗證數據完整性
- [ ] 備份原始數據庫

### 階段 8: 驗證和優化 (1-2 小時)
- [ ] 效能測試
- [ ] 安全審查
- [ ] 文檔更新
- [ ] 灰度發布

## ⚠️ 注意事項

### 相容性保證
1. **API 介面**: 必須與 ASP.NET 版本完全一致
2. **響應格式**: JSON 格式和欄位名稱必須一致
3. **錯誤處理**: 錯誤格式必須與前端期望一致
4. **數據類型**: 特別注意數字類型 (JavaScript 使用 number)

### 潛在風險
1. **日期處理**: JavaScript Date vs C# DateOnly
2. **數值精度**: JavaScript number vs C# int
3. **異步處理**: better-sqlite3 是同步的
4. **外鍵約束**: SQLite 外鍵檢查

### 數據遷移
如果現有數據庫有數據，可以直接複製數據庫文件到 Node.js 應用使用，因為 schema 保持不變。

## 📦 依賴清單

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "supertest": "^6.3.3",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0"
  }
}
```

## 🔒 安全考量

1. **SQL 注入**: 使用參數化查詢
2. **輸入驗證**: 所有請求必須經過 Zod 驗證
3. **CORS**: 配置允許的來源
4. **環境變量**: 敏感配置使用 .env 文件
5. **錯誤訊息**: 不暴露內部實現細節

## 📈 效能優化

1. **連接池**: better-sqlite3 已經是單連接，不需要池
2. **索引**: 保持現有的 SQLite 索引
3. **查詢優化**: 避免不必要的查詢
4. **快取**: 考慮實現簡單的快取機制

## 🚢 部署策略

### 開發環境
```bash
npm run dev  # 使用 nodemon 監聽文件變化
```

### 生產環境
```bash
pm2 start dist/index.js --name "family-budget-api"
pm2 startup
pm2 save
```

### IIS 反向代理配置
```xml
<system.webServer>
  <rewrite>
    <rules>
      <rule name="ReverseProxyInboundRule1" stopProcessing="true">
        <match url="(.*)" />
        <action type="Rewrite" url="http://localhost:3000/{R:1}" />
      </rule>
    </rules>
  </rewrite>
</system.webServer>
```

## ✅ 驗收標準

- [ ] 所有 API 端點功能正常
- [ ] 前端應用可以正常使用
- [ ] 數據讀寫正確
- [ ] 錯誤處理正確
- [ ] 效能與原版相當
- [ ] 安全審查通過
- [ ] 部署文檔完整

## 📝 後續優化

1. **API 文檔**: 使用 Swagger/OpenAPI
2. **日誌系統**: Winston 或 Pino
3. **監控**: Prometheus + Grafana
4. **容器化**: Docker 化部署
5. **測試覆蓋率**: 提升到 80% 以上

---

**預估總工時**: 14-18 小時 (2-3 工作日)
**已確認選擇**:
- ✅ 使用 Express.js 框架
- ✅ 基本測試範圍 (關鍵 API 端點)
- ✅ 需要數據遷移腳本
**建議實施**: 分階段實施，每完成一個階段進行測試驗證
