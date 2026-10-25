# 函數教學影片 — 課程資料格式（lessons/*.json）

每個函數一個 JSON 檔，檔名 = 函數 id（大寫英文，如 `XLOOKUP.json`）。UTF-8，無 BOM。
build.py 會把它轉成 1080×1920 的自動播放教學影片 HTML。

## 頂層欄位

```json
{
  "id": "XLOOKUP",
  "cat": "lookup",               // lookup | dynamic | shape | text | math | logic | date
  "emoji": "🔎",
  "zh": "新一代萬用查找",          // 8–12 字中文副標
  "en": "Modern lookup in any direction",   // 英文一句話（首頁英文模式用）
  "desc": "依查找值在範圍中找到對應項目，並傳回另一範圍的值，可左右查找、自訂找不到訊息。",  // 首頁卡片說明 30–50 字
  "descEn": "Finds a value in one range and returns the matching item from another range.",
  "syntax": "=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])",
  "keywords": ["查找", "查詢", "對照", "取代VLOOKUP"],   // 3–6 個檢索關鍵字
  "level": 2,                    // 難度 1 入門 / 2 進階 / 3 高手
  "version": "Microsoft 365 / Excel 2021",   // 可使用的版本
  "slides": [ ... ]              // 7–9 張
}
```

## 旁白 `say`（每張投影片都要有）

- `say` 是字串陣列，每一個元素 = 一句字幕 + 一段配音，**依語氣在標點處切開**。
- **每句最多 26 個字**（全形字算 1，英數字每 2 個算 1）。建議 12–24 字。
- 每張投影片 3–7 句。整支影片約 1.5–3 分鐘（全部 say 合計約 450–800 字）。
- 口語、親切、台灣用語：欄＝column、列＝row、儲存格、工作表、公式、引數。
- 唸儲存格範圍寫成「A2 到 A6」，不要寫「A2:A6」（TTS 會唸成冒號）。函數名稱用大寫英文。
- 不要用 emoji、括號註解、引號以外的特殊符號。句尾可用。！？
- 視覺元素會依「句子索引」出現（見各類型的 `at`），請讓旁白與畫面同步。

## 投影片類型

所有類型都有 `type`、`title`（≤14 字，title 類型可省略）、`say`。

### 1. `title` 封面（第 1 張固定）
使用頂層 id / emoji / zh / syntax，不需其他欄位。

### 2. `concept` 概念（用比喻說明用途）
```json
{"type":"concept","title":"它能做什麼？",
 "points":[{"icon":"🎯","text":"指定要找的值"},{"icon":"📚","text":"在一欄資料中搜尋"},{"icon":"🎁","text":"傳回同一列的其他資料"}],
 "say":["...","...","...","..."]}
```
points 2–4 個，每個 text ≤ 16 字。第 i 個 point 會在第 floor(i*句數/點數) 句出現；也可用 `"at":[0,1,3]` 指定。

### 3. `syntax` 語法
```json
{"type":"syntax","title":"語法結構",
 "formula":"=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])",
 "args":[{"name":"lookup_value","zh":"要找的值","req":true},
         {"name":"if_not_found","zh":"找不到時顯示的內容","req":false}],
 "say":[...]}
```
args 依序列出所有引數（最多 6 個；超過可合併如 "value1, value2, …"），zh ≤ 18 字。`at` 可選。

### 4. `sheet` 試算表示範（最重要，每支影片 2–3 張）
```json
{"type":"sheet","title":"範例：用學號查姓名",
 "data":[["學號","姓名","班級","分數","","查詢學號","姓名"],
         ["S001","王小明","301","88","","S003",""],
         ["S002","李美華","302","92","","",""]],
 "cell":"G2",
 "formula":"=XLOOKUP(F2,A2:A6,B2:B6)",
 "result":[["陳志強"]],
 "steps":[{"at":1,"range":"F2","color":0,"tag":"查找值"},
          {"at":2,"range":"A2:A6","color":1,"tag":"查找範圍"},
          {"at":3,"range":"B2:B6","color":2,"tag":"傳回範圍"},
          {"at":4,"range":"A4","color":3}],
 "resultAt":5,
 "say":[...]}
```
- `data`：從 A1 開始的整個可見網格（所有列長度相同，空白格用 ""），**最多 9 欄 × 11 列**。第 1 列通常是標題。數字也寫成字串。
- `cell`：公式所在儲存格（必須在網格內，且 data 中該格為 ""）。
- `result`：公式結果（2D 陣列，從 `cell` 開始溢出 spill；單一值寫 `[["值"]]`）。溢出範圍也必須在網格內且原本為 ""。**結果必須是 Excel 真正會算出的值**，請逐格驗算。
- `steps`：依序在第 `at` 句時框選範圍 `range`（如 "A2:A6"、"F2"），`color` 0–5，`tag`（≤6 字，可省略）會貼在框旁。
- `resultAt`：第幾句時把結果填入（通常是最後一兩句）。
- 選填 `"note":"一行補充說明 ≤ 24 字"`，顯示在表格下方。

### 5. `flow` 流程／運作原理
```json
{"type":"flow","title":"運作原理","steps":[{"icon":"1️⃣","text":"先找到 S003 在第 3 個位置"},{"icon":"2️⃣","text":"再到傳回範圍取第 3 個"}],"say":[...]}
```
steps 2–5 個，text ≤ 18 字。

### 6. `compare` 比較表
```json
{"type":"compare","title":"XLOOKUP vs VLOOKUP","head":["比較項目","VLOOKUP","XLOOKUP"],
 "rows":[["向左查找","❌ 不行","✅ 可以"],["預設比對","近似","完全"]],"say":[...]}
```
2–3 欄、2–5 列，每格 ≤ 12 字。第 i 列依句數平均出現。

### 7. `tips` 小技巧／常見錯誤
```json
{"type":"tips","title":"注意事項","items":[{"icon":"⚠️","title":"#N/A 錯誤","text":"找不到值時會出現，可用第4引數處理"}],"say":[...]}
```
items 2–4 個，title ≤ 10 字，text ≤ 26 字。

### 8. `quiz` 小測驗（倒數第 2 張）
```json
{"type":"quiz","title":"隨堂小測驗","q":"=XLOOKUP(\"S009\",A2:A6,B2:B6) 會得到？",
 "options":["#N/A","0","空白","S009"],"answer":0,
 "explain":"找不到且未設定第4引數時傳回 #N/A","say":[...]}
```
q ≤ 40 字，options 4 個每個 ≤ 14 字，explain ≤ 30 字。最後一句旁白公布答案（答案在最後一句時才顯示）。

### 9. `recap` 重點回顧（最後一張）
```json
{"type":"recap","title":"重點回顧","items":["...","...","..."],"say":[...]}
```
items 3–4 個，每個 ≤ 18 字。最後一句說再見／鼓勵練習。

## 建議結構（7–9 張）
title → concept → syntax → sheet → sheet →（flow / compare / sheet / tips 擇 1–2）→ quiz → recap
