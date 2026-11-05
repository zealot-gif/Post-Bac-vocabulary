# 學士後中西醫及私醫英文歷屆單字趨勢分析 (PostMed English Trends)

類似 Google Trends 的英文單字頻率分析網頁，專為學士後中醫、學士後西醫、私醫聯招考生設計。

## 專案內容
- `index.html`：前端動態網頁 (含 Chart.js 趨勢圖與上下文調閱器)
- `app.js`：前端 JavaScript 互動邏輯
- `vocab_database.json`：預設單字歷年聲量與考題資料庫
- `extract_vocab.py`：Python PDF/TXT 試題解析與單字萃取腳本
- `schema.sql`：Supabase 雲端資料庫建表 SQL

## GitHub Pages 部署步驟
1. 建立 GitHub 儲存庫 `postmed-english-trends`。
2. 上傳所有檔案至儲存庫。
3. 進入 Repository Settings -> Pages -> 選擇 Source 為 `main` 分支。
4. 即可取得部署後的免費網頁 URL！
