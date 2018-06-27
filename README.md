# huge-bot

## 開發指南

### 複製 `.env` 設定檔

```
cp .env.sample .env
```

之後在 `.env` 中填入 `AIRTABLE_BASE_ID` 和 `AIRTABLE_API_KEY`，若希望連接 LINE bot，還需要填寫 `ChannelSecret` 和 `ChannelAccessToken`。

### 執行

使用 console bot

```
npm run dev
```

正式連接 LINE

```
npm start
```
