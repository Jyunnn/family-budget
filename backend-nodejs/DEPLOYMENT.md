# IIS 部署指南

本文檔說明如何將 Family Budget API 部署到 IIS。

## 前置條件

- Windows Server 或 Windows 10+
- IIS 7.0 或更高版本
- URL Rewrite Module 2.0
- Node.js (LTS 版本)
- PM2 (全局安裝)

## 安裝前置條件

### 1. 安裝 URL Rewrite Module

從 [Microsoft 下載頁面](https://www.iis.net/downloads/microsoft/url-rewrite) 下載並安裝 URL Rewrite Module。

### 2. 安裝 Node.js

從 [Node.js 官網](https://nodejs.org/) 下載並安裝 LTS 版本。

### 3. 安裝 PM2

```bash
npm install -g pm2
```

## 部署步驟

### 1. 構建應用

```bash
cd backend-nodejs
npm install
npm run build
```

### 2. 測試應用

```bash
npm start
```

訪問 `http://localhost:3000/api/health` 確認應用運行正常。

### 3. 使用 PM2 啟動應用

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. 配置 IIS

#### 創建新網站

1. 打開 IIS 管理器
2. 右鍵點擊「網站」->「新增網站」
3. 輸入網站名稱 (例如: `family-budget-api`)
4. 設置物理路徑為 `backend-nodejs` 目錄
5. 設置端口 (例如: `8080`)

#### 配置反向代理

`web.config` 文件已經包含反向代理配置，會將請求轉發到 `http://localhost:3000`。

#### 應用程序池設置 (可選)

如果需要修改應用程序池設置：

1. 打開 IIS 管理器
2. 展開「應用程序池」
3. 選擇對應的應用程序池
4. 右鍵 ->「基本設置」
5. 將 .NET CLR 版本設置為「無託管代碼」

## 配置 SSL/HTTPS (推薦)

### 1. 綁定 HTTPS

1. 選擇網站
2. 右鍵 ->「編輯綁定」
3. 點擊「新增」
4. 選擇「https」
5. 選擇 SSL 證書

### 2. 更新 web.config (可選)

如果需要強制 HTTPS，在 web.config 中添加重定向規則：

```xml
<rule name="HTTP to HTTPS redirect" stopProcessing="true">
  <match url="(.*)" />
  <conditions>
    <add input="{HTTPS}" pattern="off" ignoreCase="true" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
</rule>
```

## 防火牆設置

確保以下端口已開放：

- 端口 `3000` (Node.js 應用) - 僅本地訪問
- 端口 `80` 或 `443` (IIS) - 外部訪問

## 監控和日誌

### 查看 PM2 日誌

```bash
pm2 logs family-budget-api
```

### 查看應用狀態

```bash
pm2 status
```

### 重啟應用

```bash
pm2 restart family-budget-api
```

### 停止應用

```bash
pm2 stop family-budget-api
```

## 故障排除

### 應用無法啟動

檢查 PM2 日誌：

```bash
pm2 logs family-budget-api --lines 100
```

### IIS 返回 502 錯誤

確認 Node.js 應用正在運行：

```bash
pm2 status
```

檢查端口 3000 是否正確監聽：

```bash
netstat -an | findstr :3000
```

### 無法訪問 API

檢查：
1. PM2 應用是否運行
2. 端口 3000 是否開放
3. IIS 網站是否啟動
4. web.config 配置是否正確

## 更新部署

當需要更新應用時：

```bash
git pull
npm install
npm run build
pm2 restart family-budget-api
```

## 備份

定期備份數據庫文件：

```bash
# 備份數據庫
copy App_Data\family-budget.db App_Data\family-budget.db.backup
```

## 生產環境建議

1. 使用 SSL/HTTPS
2. 設置定期備份
3. 監控應用健康狀態
4. 配置日誌輪轉
5. 限制 API 訪問頻率
6. 更新 `FRONTEND_URL` 環境變量為實際的前端 URL
7. 考慮使用容器化部署 (Docker)
