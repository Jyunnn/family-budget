# 🚀 IIS 部署前檢查清單

在將應用部署到 IIS 生產環境前，請確保完成以下所有檢查項目。

---

## 📋 預部署準備

### 代碼質量檢查
- [x] 沒有編譯錯誤
- [x] 沒有 JavaScript 警告
- [x] 所有依賴已安裝
- [x] 構建成功完成
- [x] 所有文件都在 dist/ 目錄

### 功能驗證
- [x] 日曆正常顯示
- [x] 支出新增功能工作正常
- [x] 預算設定功能工作正常
- [x] 預算告警系統工作正常
- [x] 數據持久化工作正常
- [x] 響應式設計在各種設備上都能工作
- [x] 沒有控制台錯誤

### 文檔完整性
- [x] README.md 已更新
- [x] IIS_DEPLOYMENT_GUIDE.md 已創建
- [x] REPAIR_REPORT.md 已創建
- [x] COMPLETION_SUMMARY.md 已創建
- [x] 這份檢查清單已創建

---

## 🖥️ 服務器準備

### IIS 安裝和配置
- [ ] IIS 已安裝
- [ ] 靜態內容角色已安裝
- [ ] URL 重寫模組已安裝
- [ ] Application Request Routing (可選)

### Windows 配置
- [ ] .NET Framework 4.5 或更高版本已安裝
- [ ] Windows 防火牆規則已配置（允許 HTTP/HTTPS）
- [ ] 磁盤空間充足（至少 500 MB）

### 用戶和權限
- [ ] IIS 應用程式池用戶已配置
- [ ] 文件夾權限已設置正確
- [ ] 服務帳戶有適當的讀寫權限

---

## 📁 文件部署

### 文件準備
- [ ] 所有 dist/ 文件已準備好
- [ ] web.config 已包含在 dist/ 目錄
- [ ] 沒有遺漏任何資源文件
- [ ] 沒有不必要的開發文件（node_modules 等）

### 上傳流程
- [ ] 創建物理目錄 (例: C:\inetpub\wwwroot\family-budget)
- [ ] 上傳所有 dist 文件到物理目錄
- [ ] 確認所有文件都已上傳
- [ ] 驗證文件權限正確

---

## ⚙️ IIS 配置

### 應用程式配置
- [ ] 在 IIS 中創建新應用程式或網站
- [ ] 設置物理路徑指向正確的目錄
- [ ] 應用程式池已配置
- [ ] 應用程式池用戶已設置為應用程式池服務帳戶

### 應用程式池設置
- [ ] .NET CLR 版本: "無受管程式碼"
- [ ] 託管管線模式: "整合"
- [ ] 64 位相容性: "啟用"
- [ ] 閒置逾時: "20 分鐘"

### 網站/應用程式綁定
- [ ] HTTP 綁定已配置 (端口 80)
- [ ] HTTPS 綁定已配置 (端口 443, 如使用 SSL)
- [ ] SSL 證書已安裝 (如使用 HTTPS)
- [ ] 主機名已配置 (如需要)

---

## 🔒 安全配置

### HTTPS 配置 (推薦)
- [ ] SSL 證書已獲取或簽署
- [ ] 證書已安裝到 IIS
- [ ] HTTPS 綁定已創建
- [ ] HTTP 到 HTTPS 重定向已配置

### 安全頭設置
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin

### CORS 設置 (如需要)
- [ ] CORS 頭已配置
- [ ] 允許的來源已定義
- [ ] 預檢請求已配置

---

## 🔧 MIME 類型驗證

確保以下 MIME 類型已正確配置：

- [ ] .html → text/html
- [ ] .css → text/css
- [ ] .js → text/javascript
- [ ] .json → application/json
- [ ] .mjs → text/javascript
- [ ] .woff → font/woff
- [ ] .woff2 → font/woff2
- [ ] .ttf → font/ttf
- [ ] .svg → image/svg+xml
- [ ] .png → image/png
- [ ] .jpg → image/jpeg
- [ ] .gif → image/gif
- [ ] .ico → image/x-icon

---

## 📊 性能優化

### 壓縮配置
- [ ] Gzip 靜態內容壓縮已啟用
- [ ] Gzip 動態內容壓縮已啟用
- [ ] 壓縮率設置為 7

### 緩存配置
- [ ] 客戶端緩存已配置
- [ ] 靜態資源緩存期限: 1 年
- [ ] 應用程式緩存已配置 (如需要)

### 日誌配置
- [ ] IIS 日誌已啟用
- [ ] 日誌位置: %SystemDrive%\inetpub\logs\LogFiles
- [ ] 日誌格式: W3C
- [ ] 日誌文件回檔: 每天

---

## ✅ 部署驗證

### 功能測試
- [ ] 訪問 http://yourdomain.com 能打開首頁
- [ ] 日曆正常顯示
- [ ] 點擊日期打開對話框
- [ ] 新增支出成功
- [ ] 預算設定成功
- [ ] 頁面刷新後數據保留
- [ ] 頁面路由正常 (無 404 錯誤)

### 瀏覽器兼容性
- [ ] Chrome 最新版本
- [ ] Firefox 最新版本
- [ ] Safari 最新版本
- [ ] Edge 最新版本

### 響應式測試
- [ ] 桌面 (1920x1080)
- [ ] 平板 (768x1024)
- [ ] 手機 (375x667)

### 性能測試
- [ ] 頁面加載時間 < 3 秒
- [ ] 首次內容繪制 < 1 秒
- [ ] 沒有控制台錯誤
- [ ] 沒有 404 錯誤

---

## 📝 文檔驗證

- [ ] README.md 已上傳到服務器或文檔位置
- [ ] IIS_DEPLOYMENT_GUIDE.md 已保存備查
- [ ] 管理員文檔已準備
- [ ] 用戶指南已發佈

---

## 🔍 故障排查和支持

### 常見問題自檢
- [ ] 了解 web.config URL 重寫規則
- [ ] 了解 IIS 日誌位置和查看方式
- [ ] 了解如何檢查應用程式池崩潰日誌
- [ ] 了解如何重啟應用程式池

### 支持聯繫
- [ ] 已識別主要支持人員
- [ ] 已準備支持文檔
- [ ] 已建立監控和告警 (可選)

---

## 📅 部署時間表

| 步驟 | 預計時間 | 完成日期 |
|-----|--------|--------|
| 伺服器準備 | 1-2 小時 | _____ |
| 文件上傳 | 30 分鐘 | _____ |
| IIS 配置 | 30 分鐘 | _____ |
| 安全配置 | 1 小時 | _____ |
| 功能測試 | 1 小時 | _____ |
| 性能測試 | 30 分鐘 | _____ |
| **總計** | **4-5 小時** | _____ |

---

## 🎯 部署前最終檢查

在點擊"部署"按鈕前，請回答以下問題：

**安全性**
- [ ] 所有安全頭都已配置
- [ ] SSL 證書已安裝 (如使用 HTTPS)
- [ ] 防火牆規則已配置
- [ ] 用戶權限已正確設置

**功能性**
- [ ] 所有應用功能都已測試
- [ ] 沒有已知的 bug
- [ ] 所有邊界情況都已考慮
- [ ] 錯誤處理已實現

**性能**
- [ ] 頁面加載速度可接受
- [ ] 資源文件已優化
- [ ] 緩存策略已實現
- [ ] 沒有未優化的資源

**維護**
- [ ] 備份計劃已制定
- [ ] 監控系統已配置
- [ ] 日誌記錄已啟用
- [ ] 支持流程已準備

---

## 🚀 部署執行

### 部署命令參考

```powershell
# 1. 準備文件
cd C:\Development\family-budget
npm run build

# 2. 創建應用程式目錄
New-Item -Path "C:\inetpub\wwwroot\family-budget" -ItemType Directory -Force

# 3. 複製文件
Copy-Item "dist\*" -Destination "C:\inetpub\wwwroot\family-budget" -Recurse -Force

# 4. 設置權限
$appPoolIdentity = "IIS APPPOOL\DefaultAppPool"
icacls "C:\inetpub\wwwroot\family-budget" /grant "${appPoolIdentity}:(OI)(CI)R" /T

# 5. 在 IIS 中創建應用程式
Import-Module WebAdministration
New-WebApplication -Name "family-budget" -Site "Default Web Site" -PhysicalPath "C:\inetpub\wwwroot\family-budget" -ApplicationPool "DefaultAppPool"
```

### 部署驗證

```powershell
# 驗證應用程式
Get-WebApplication -Name "family-budget"

# 驗證物理路徑
Get-Item "C:\inetpub\wwwroot\family-budget"

# 測試訪問
Start-Process "http://localhost/family-budget"
```

---

## ⏮️ 部署後回滾計劃

如果部署失敗，按以下步驟回滾：

1. 停止應用程式池
   ```powershell
   Stop-WebAppPool -Name "DefaultAppPool"
   ```

2. 恢復之前的備份
   ```powershell
   Remove-Item "C:\inetpub\wwwroot\family-budget" -Recurse -Force
   Copy-Item "C:\Backups\family-budget_backup" -Destination "C:\inetpub\wwwroot\family-budget" -Recurse
   ```

3. 重啟應用程式池
   ```powershell
   Start-WebAppPool -Name "DefaultAppPool"
   ```

4. 驗證服務恢復

---

## 📞 部署支援聯繫方式

- **技術支援：** [聯繫信息]
- **IIS 問題：** [聯繫信息]
- **安全問題：** [聯繫信息]

---

## ✨ 部署成功標記

部署成功的標記：

✅ 應用程式可訪問  
✅ 所有功能都能正常工作  
✅ 沒有控制台錯誤  
✅ 性能指標達標  
✅ 用戶可以創建帳戶並記錄支出  
✅ 數據正確保存和檢索  

---

**部署日期：** _____________  
**部署人員：** _____________  
**驗證人員：** _____________  
**備註：** _________________________________________________

---

祝部署順利！🎉
