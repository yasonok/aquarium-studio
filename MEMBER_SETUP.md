# 🔐 會員系統設定指南

## 需要設定 Firebase 才能使用完整功能

### 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點「新增專案」
3. 輸入專案名稱（例如：`aquarium-studio`）
4. 等待專案建立完成

---

### 2. 啟用驗證方式

在 Firebase Console 中：

1. 點「建立」→「驗證」
2. 點「開始使用」
3. 在「登入方式」標籤中啟用：
   - ✅ **Google**
   - ✅ **Facebook**
   - ✅ **LINE**（需要申請 LINE Developers）

---

### 3. 設定各平台驗證

#### Google 驗證
- 點「Google」→「啟用」
- 選擇電子郵件帳戶
- 儲存即可

#### Facebook 驗證
1. 前往 [Facebook Developers](https://developers.facebook.com/)
2. 建立應用程式
3. 取得「應用程式 ID」和「應用程式密鑰」
4. 在 Firebase 中輸入這些資訊
5. 設定 OAuth 重新導向 URI

#### LINE 驗證
1. 前往 [LINE Developers](https://developers.line.biz/)
2. 建立 Provider 和 Channel
3. 取得 Channel ID 和 Channel Secret
4. 設定 Callback URL 到 Firebase

---

### 4. 取得 Firebase 設定

1. 在 Firebase Console 點「一般」→「您的應用程式」
2. 點「</>」新增 Web 應用程式
3. 複製設定資訊

```javascript
{
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

---

### 5. 更新設定檔

將設定資訊填入 `js/member.js`：

```javascript
const firebaseConfig = {
  apiKey: "你的 API Key",
  authDomain: "你的專案.firebaseapp.com",
  projectId: "你的專案ID",
  storageBucket: "你的專案.appspot.com",
  messagingSenderId: "你的 Sender ID",
  appId: "你的 App ID"
};
```

---

### 6. 測試功能

1. 啟動本地伺服器
2. 開啟 `login.html`
3. 嘗試各平台登入
4. 購買商品後查看 `orders.html`

---

### 📱 目前功能狀態

| 功能 | 狀態 | 說明 |
|------|------|------|
| 🔐 登入頁面 | ✅ 完成 | login.html |
| 📦 訂單頁面 | ✅ 完成 | orders.html |
| 🔑 Google 登入 | ⚠️ 需要 Firebase 設定 |
| 📘 Facebook 登入 | ⚠️ 需要 Facebook App 設定 |
| 💚 LINE 登入 | ⚠️ 需要 LINE Developers 設定 |
| 📋 訂單追蹤 | ✅ 完成（DEMO 模式） |

---

### 🎯 預設功能（不需要 Firebase）

即使沒有設定 Firebase，系統仍提供：

- ✅ 購物車功能
- ✅ 訂單成立
- ✅ LINE 通知
- ✅ 商品管理（後台）
- ✅ 網站設定管理

會員登入功能需要 Firebase 設定才能完整使用！
