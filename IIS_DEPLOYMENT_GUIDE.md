# IIS 部署指南

本文件提供詳細的 IIS 部署說明。

## 前置條件

1. Windows Server 或 Windows 10/11
2. IIS 已安裝並啟用
3. "URL 重寫" 模組已安裝（用於 SPA 路由）

### 安裝 URL 重寫模組

如果未安裝 URL 重寫模組，請執行以下步驟：

1. 打開 **IIS 管理器**
2. 在左側選擇服務器節點
3. 在右側尋找 "URL 重寫"
4. 如果缺失，下載並安裝：https://www.microsoft.com/en-us/download/details.aspx?id=47337

## 部署步驟

### 1. 構建應用

在開發機器上執行：

```bash
cd C:\Development\family-budget
npm run build
```

這將在 `dist/` 文件夾中生成生產版本。

### 2. 上傳文件到伺服器

將 `dist/` 文件夾中的所有內容複製到 IIS 站點目錄，例如：

```
C:\inetpub\wwwroot\family-budget\
```

**重要：** 確保 `web.config` 也已上傳！

### 3. 在 IIS 中創建應用程式

**方法 A：使用 IIS 管理器 UI**

1. 打開 **IIS 管理器**
2. 右鍵點擊 "Default Web Site"
3. 選擇 "Add Application"
4. 設置以下參數：
   - **Alias**: `family-budget` (或你希望的名稱)
   - **Physical path**: `C:\inetpub\wwwroot\family-budget`
   - **Application pool**: 創建新的或使用現有的
5. 點擊 **OK**

**方法 B：使用 PowerShell**

```powershell
Import-Module WebAdministration
New-WebApplication -Name "family-budget" `
  -Site "Default Web Site" `
  -PhysicalPath "C:\inetpub\wwwroot\family-budget" `
  -ApplicationPool "DefaultAppPool"
```

### 4. 配置應用程式池

1. 在 IIS 管理器中選擇應用程式池
2. 確保 **.NET CLR 版本** 設置為 **"無受管程式碼"**
3. **託管管線模式** 應設為 **"整合"** 或 **"經典"**（推薦整合）

### 5. 設置文件和目錄權限

應用程式池用戶必須有適當的權限：

```powershell
# 假設應用池是 DefaultAppPool
$appPoolIdentity = "IIS APPPOOL\DefaultAppPool"
$path = "C:\inetpub\wwwroot\family-budget"

# 授予讀取和列出權限
icacls $path /grant "${appPoolIdentity}:(OI)(CI)R" /T

# 如果需要寫入權限
icacls $path /grant "${appPoolIdentity}:(OI)(CI)M" /T
```

### 6. 驗證部署

1. 打開瀏覽器
2. 訪問 `http://localhost/family-budget` 或 `http://yourdomain.com/family-budget`
3. 應該能看到日曆界面
4. 測試以下功能：
   - 點擊日期
   - 新增支出
   - 設定預算
   - 刷新頁面（應保留路由，不顯示 404）

## 常見問題排查

### 問題 1：404 未找到

**症狀：** 刷新頁面後顯示 404

**解決方案：**
- 確認 `web.config` 已上傳到網站根目錄
- 確認 URL 重寫模組已安裝
- 檢查 IIS 日誌：`C:\inetpub\logs\LogFiles\`

### 問題 2：靜態文件無法加載

**症狀：** 樣式、圖片或 JavaScript 無法加載

**解決方案：**
1. 在 IIS 管理器中選擇應用程式
2. 打開 **MIME 類型**
3. 確保以下 MIME 類型已定義：
   - `.js` → `text/javascript`
   - `.css` → `text/css`
   - `.woff` → `font/woff`
   - `.woff2` → `font/woff2`
   - `.svg` → `image/svg+xml`

### 問題 3：數據無法保存

**症狀：** 新增支出後重新加載頁面數據消失

**解決方案：**
- 檢查瀏覽器控制台（F12）是否有 JavaScript 錯誤
- 檢查瀏覽器是否允許 localStorage
- 清除瀏覽器緩存並刷新

### 問題 4：HTTPS 問題

**症狀：** 混合內容警告或無法加載資源

**解決方案：**
在 `web.config` 中添加 HTTPS 重定向：

```xml
<rule name="HTTP to HTTPS" stopProcessing="true">
  <match url="(.*)" />
  <conditions>
    <add input="{HTTPS}" pattern="off" ignoreCase="true" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
</rule>
```

## 性能優化

### 啟用 Gzip 壓縮

`web.config` 已包含 Gzip 壓縮配置。如果未啟用，可手動檢查：

1. 在 IIS 管理器中選擇服務器
2. 打開 **壓縮**
3. 啟用 **靜態和動態內容壓縮**

### 設置緩存

`web.config` 設置了 1 年的緩存有效期。對於資源文件有效。

## 升級應用

1. 在開發機器上執行 `npm run build`
2. 備份當前的應用文件
3. 上傳新的 `dist` 文件夾內容
4. 刷新 IIS 應用程式池（可選但推薦）

## 備份和恢復

建議定期備份應用和配置：

```powershell
# 備份整個應用
Compress-Archive -Path "C:\inetpub\wwwroot\family-budget" `
  -DestinationPath "C:\Backups\family-budget_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"

# 恢復備份
Expand-Archive -Path "C:\Backups\family-budget_20240101_120000.zip" `
  -DestinationPath "C:\inetpub\wwwroot\" -Force
```

## 檢查清單

- [ ] 已安裝 URL 重寫模組
- [ ] dist/ 文件夾已上傳
- [ ] web.config 已上傳
- [ ] 應用程式池已配置
- [ ] 文件權限已設置
- [ ] 可訪問應用程式 URL
- [ ] 日期點擊功能正常
- [ ] 支出新增功能正常
- [ ] 數據保存正常
- [ ] HTTPS 已配置（如需要）

## 支援

如有任何問題，請：
1. 檢查 IIS 事件日誌
2. 查看瀏覽器開發工具控制台
3. 檢查應用程式日誌

## 相關資源

- IIS 官方文檔：https://docs.microsoft.com/en-us/iis/
- Vue 3 部署指南：https://vuejs.org/guide/scaling-up/deployment.html
- Vite 部署指南：https://vitejs.dev/guide/static-deploy.html
