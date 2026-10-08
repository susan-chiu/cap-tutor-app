# 出題規範（所有科目共用）

## 檔案格式

每個題庫檔是一個 Python 模組，放在 `scripts/`，UTF-8 編碼，開頭固定：

```python
# -*- coding: utf-8 -*-
"""<科目> 題庫（自編原創題，依 108 課綱）"""
from fractions import Fraction as F
import math

SUBJECT = "english"   # math / chinese / english / science / social
UNITS = [             # 數學擴充檔不用寫 UNITS（沿用 questions_math.py 的單元）
    ("EN-7A-1", "7A", 1, "be 動詞與人稱代名詞"),
]
QUESTIONS = []


def Q(unit, concept, difficulty, stem, options, answer, explanation, hints, wrong, check=None):
    QUESTIONS.append(dict(unit=unit, concept=concept, difficulty=difficulty, stem=stem,
                          options=options, answer=answer, explanation=explanation,
                          hints=hints, wrong=wrong, check=check))
```

每一題呼叫一次 `Q(...)`：

| 參數 | 說明 |
| --- | --- |
| unit | 單元代碼，必須在指定的單元清單裡 |
| concept | 英文小寫、連字號的觀念標籤（例如 `past-tense`、`photosynthesis`）。**每個觀念至少 2 題**（App 的「相似題驗收」會從同單元同觀念出題），建議每單元 3～5 個觀念 |
| difficulty | 1 基礎、2 標準、3 進階（會考難題）。比例約 3 : 5 : 2 |
| stem | 題幹。空格用「＿＿＿」。英文題的題幹可以是英文 |
| options | 剛好 4 個字串，彼此不重複。**不可以**用「以上皆是」「以上皆非」「A 和 B」這類依賴位置的選項（系統會打亂選項順序） |
| answer | 正確選項的字母 "A"～"D"（對應 options 的位置，打亂前） |
| explanation | 標準解析（至少 20 字），這是 AI 小老師講解的依據，要正確、完整、用國中生聽得懂的話 |
| hints | 2～3 層提示，由淺到深，**提示不能直接說出答案** |
| wrong | dict，**剛好**包含 3 個錯誤選項的字母，值是「學生選這個通常是因為…」的常見錯誤原因 |
| check | 數學與自然的計算題**必須**提供：一段 Python 運算式，執行結果必須是 `True`，用來驗算答案（可用 `F`（Fraction）、`math`、`abs`、`round`、`min`、`max`、`sum`、`sorted`、`range`、`all`、`len`、`int`）。非計算題填 `None` |

## 內容規範

1. **全部原創**：不可抄錄課本、參考書、補習班講義或網路題庫。會考歷屆試題也不要照抄（可以參考題型與難度）。
2. **國文閱讀素材**：只能用古典作品（作者已過世超過 50 年，例如《論語》、唐詩宋詞、古文）或你自己寫的白話短文。**不可**引用現代作家有著作權的文章。
3. **純文字**：App 不能顯示圖片，題目不能依賴圖形。幾何、地圖、實驗裝置、圖表都要用文字完整描述（必要時用簡單表格文字，例如「甲地 25°C、乙地 18°C」）。
4. **正體中文、臺灣用語**：例如「程式」不是「程序」、「品質」不是「質量」、「公尺」、「溫度計」、「光合作用」。數學符號用 −（U+2212）、×、÷、²、³、√。
5. **符合 108 課綱與該學期範圍**：不要考超出該學期的內容。
6. **答案唯一且無爭議**：每題只能有一個正確答案，錯誤選項要「看起來合理但明確是錯的」。有爭議、學界說法不一、或教科書版本間說法不同的內容不要出。
7. **社會科**：陳述事實、依課綱用語，避免帶立場的評論；涉及政治議題時只考制度與事實。
8. **難度要像會考**：difficulty 3 的題目要有情境、需要兩步以上推理。
9. 每寫完一個單元，自己再逐題檢查一次答案。

## 完成後自我檢查

在 `/home/claude/cap-app/scripts` 執行：

```bash
python3 check_bank.py <你的檔名，不含 .py>
```

會檢查格式、答案、錯誤原因、驗算式、每個觀念至少 2 題、每單元題數。**必須通過才算完成**。
