# -*- coding: utf-8 -*-
"""英語聽力題庫（自編原創題，依 108 課綱；題型比照國中會考英語聽力的「基本問答」與「言談理解」，不含看圖題）"""
from fractions import Fraction as F
import math

SUBJECT = "english"
UNITS = [
    ("EN-7L-1", "7B", 91, "聽力：基本問答與日常對話（七年級）"),
    ("EN-8L-1", "8B", 92, "聽力：言談理解（八年級）"),
    ("EN-9L-1", "9A", 93, "聽力：會考聽力綜合（九年級）"),
]
QUESTIONS = []


def Q(unit, concept, difficulty, stem, options, answer, explanation, hints, wrong, check=None, listen=None):
    QUESTIONS.append(dict(unit=unit, concept=concept, difficulty=difficulty, stem=stem, options=options, answer=answer, explanation=explanation, hints=hints, wrong=wrong, check=check, listen=listen))


BASIC = "請聽一句話，選出最適當的回應。"

# ============================ EN-7L-1 聽力：基本問答與日常對話（七年級） ============================
# ---- 基本問答 8 題 ----
Q("EN-7L-1", "basic-response", 1, BASIC + "（朋友聊天）",
  ["He's thirteen years old.", "He's 160 centimeters tall.", "He's fine, thank you.", "He has two old bikes."], "A",
  "聽力原文是「How old is your brother?」（你哥哥／弟弟幾歲？），How old 問年齡，所以要回答歲數 He's thirteen years old.",
  ["先聽清楚問句開頭的疑問詞是什麼。", "How 後面接的是 old、tall 還是 are？不同的字問的事情不一樣。"],
  {"B": "把 How old 聽成 How tall（多高），回答了身高。", "C": "He's fine 是回答 How is he?（他好嗎），不是問年齡。", "D": "聽到 old 這個字就選了有 old 的句子，但意思是「舊的腳踏車」，和年齡無關。"},
  None, listen="""W: How old is your brother?""")
Q("EN-7L-1", "basic-response", 1, BASIC + "（在教室）",
  ["Sure. Here you are.", "Yes, I can.", "No, it isn't.", "It's on Monday."], "A",
  "聽力原文是「Can I borrow your eraser?」（我可以借你的橡皮擦嗎？），這是向對方請求允許，最自然的回應是答應並把東西遞給他：Sure. Here you are.（當然，拿去吧。）",
  ["說話的人想向你做什麼？", "Can I...? 是「我可以……嗎？」，是在請你答應，不是問你會不會。"],
  {"B": "聽到 Can 就回答 Yes, I can，但對方問的是「我可以借嗎」，不是問「你會不會」。", "C": "No, it isn't. 是回答 Is it...? 的問句，和借東西無關。", "D": "It's on Monday. 是回答時間，問句沒有問什麼時候。"},
  None, listen="""M: Can I borrow your eraser?""")
Q("EN-7L-1", "basic-response", 1, BASIC + "（朋友見面）",
  ["You're welcome. I'm glad you like it.", "Happy birthday to you, too.", "It's my birthday today.", "Yes, please."], "A",
  "聽力原文是「Thank you for the birthday card.」（謝謝你送的生日卡片），對方在道謝，所以回答 You're welcome.（不客氣），再補一句很高興你喜歡。",
  ["對方說這句話是在表達什麼心情？", "別人跟你說謝謝時，要怎麼回應？"],
  {"B": "聽到 birthday 就選有 birthday 的句子，但對方是在道謝，不是祝你生日快樂。", "C": "生日的人是收到卡片的對方，不是你，而且這句也沒有回應道謝。", "D": "Yes, please. 是接受別人的提議（例如 Would you like...?）時用的。"},
  None, listen="""W: Thank you for the birthday card.""")
Q("EN-7L-1", "basic-response", 1, BASIC + "（早上出門前）",
  ["It's cloudy and cool.", "I like sunny days.", "It's Wednesday today.", "It's ten thirty."], "A",
  "聽力原文是「What's the weather like today?」（今天天氣如何？），要回答天氣狀況，所以選 It's cloudy and cool.（多雲又涼爽）。",
  ["問句裡最重要的名詞是哪一個？", "weather 是什麼意思？要回答什麼樣的內容？"],
  {"B": "聽到 like 就以為是問「你喜歡什麼」，但 What's...like? 是問「……怎麼樣」。", "C": "這是回答星期幾（What day is it today?）。", "D": "這是回答幾點（What time is it?）。"},
  None, listen="""M: What's the weather like today?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（下課聊天）",
  ["Twice a week.", "For two hours.", "With my classmates.", "At the park."], "A",
  "聽力原文是「How often do you play basketball?」（你多久打一次籃球？），How often 問頻率，要回答次數，所以選 Twice a week.（一星期兩次）。",
  ["注意 How 後面接的是哪一個字。", "How often、How long、Where、Who 各自在問什麼？"],
  {"B": "For two hours 是回答 How long（多久時間），不是多常。", "C": "With my classmates 是回答 Who（和誰）一起打。", "D": "At the park 是回答 Where（在哪裡）打。"},
  None, listen="""W: How often do you play basketball?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（晚餐時）",
  ["No, thanks. I'm full.", "Yes, I'd like to go with you.", "I usually cook soup on Sundays.", "You're welcome."], "A",
  "聽力原文是「Would you like some more soup?」（你要再來一些湯嗎？），這是請你再吃一點，可以接受或婉拒；No, thanks. I'm full.（不用了，謝謝，我吃飽了）是禮貌的婉拒。",
  ["對方是在問你問題，還是在提供東西給你？", "Would you like some more...? 是請你「再來一些」，可以怎麼接受或拒絕？"],
  {"B": "把問句聽成 Would you like to go...?（想不想一起去），但對方問的是要不要再喝湯。", "C": "聽到 soup 就選有 soup 的句子，但對方沒有問你什麼時候煮湯。", "D": "You're welcome. 是回應道謝，對方並沒有說謝謝。"},
  None, listen="""M: Would you like some more soup?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（上課鐘響後）",
  ["That's OK. Please sit down.", "I'm sorry to hear that.", "It's late. Go to bed now.", "Thank you very much."], "A",
  "聽力原文是「I'm sorry I'm late.」（對不起，我遲到了），對方在道歉，適當的回應是表示沒關係：That's OK. Please sit down.（沒關係，請坐。）",
  ["說話的人是在道歉、道謝還是邀請？", "別人跟你說對不起時，可以怎麼表示沒關係？"],
  {"B": "聽到 sorry 就選有 sorry 的句子，但 I'm sorry to hear that. 是聽到壞消息時表示遺憾，不是回應道歉。", "C": "聽到 late 就選有 late 的句子，但「很晚了，去睡覺」和遲到道歉無關。", "D": "對方在道歉，不是在幫你忙，不需要說謝謝。"},
  None, listen="""W: I'm sorry I'm late.""")
Q("EN-7L-1", "basic-response", 3, BASIC + "（放學前）",
  ["Good idea. Let's meet at seven.", "Because I'm hungry.", "I don't like dinner.", "Yes, we did."], "A",
  "聽力原文是「Why don't we go to the night market after dinner?」，Why don't we...? 雖然以 Why 開頭，其實是「我們何不……？」的提議，所以要回應贊成或拒絕：Good idea. Let's meet at seven.（好主意，我們七點見。）",
  ["Why don't we...? 真的是在問原因嗎？", "這句話其實是在提議一起做某件事，你可以表示贊成或拒絕。"],
  {"B": "聽到 Why 就用 Because 回答，但 Why don't we...? 是提議，不是問原因。", "C": "聽到 dinner 就選有 dinner 的句子，而且「我不喜歡晚餐」沒有回應去夜市的提議。", "D": "Yes, we did. 是回答過去式的 Did we...? 問句，時態和意思都不對。"},
  None, listen="""M: Why don't we go to the night market after dinner?""")

# ---- 簡短對話 4 題 ----
Q("EN-7L-1", "dialogue-detail", 2, "What time will they meet?",
  ["At four o'clock.", "At four thirty.", "At three thirty.", "At five o'clock."], "A",
  "電影四點半開始（At four thirty.），但 Peter 說「Let's meet at the station at four.」，所以他們見面的時間是四點。",
  ["對話裡出現了兩個時間，分別是什麼事情的時間？", "注意 Let's meet... 後面接的時間。"],
  {"B": "四點半是電影開始的時間，不是見面的時間。", "C": "對話中沒有提到三點半。", "D": "對話中沒有提到五點。"},
  None, listen="""W: Peter, what time does the movie start?
M: At four thirty. Let's meet at the station at four.
W: OK. See you then.
N: Question: What time will they meet?""")
Q("EN-7L-1", "dialogue-detail", 2, "What does the mother want?",
  ["A newspaper and some milk.", "A book and some milk.", "A newspaper and some bread.", "A magazine and some juice."], "A",
  "媽媽說「Please buy me a newspaper. Oh, and some milk from the store next to it.」，她要一份報紙和一些牛奶。",
  ["媽媽一共要了幾樣東西？", "注意 Oh, and... 後面又補充了什麼。"],
  {"B": "男孩要去 bookstore（書店），但媽媽要的是報紙，不是書。", "C": "媽媽要的是 milk，不是 bread，第二樣東西聽錯了。", "D": "雜誌和果汁都沒有出現在對話中。"},
  None, listen="""M: Mom, I'm going to the bookstore. Do you need anything?
W: Yes, please buy me a newspaper. Oh, and some milk from the store next to it.
M: No problem.
N: Question: What does the mother want?""")
Q("EN-7L-1", "dialogue-detail", 2, "What color is the boy's umbrella?",
  ["Green.", "Red.", "Blue.", "Yellow."], "A",
  "男孩說「It's not mine. Mine is green.」，他的傘是綠色的；紅色的傘是 Lisa 的。",
  ["題目問的是誰的傘？", "男孩說 Mine is... 的時候，後面說的是什麼顏色？"],
  {"B": "紅色是 Lisa 的傘，也是桌子底下那把傘的顏色，不是男孩的。", "C": "對話中沒有提到藍色。", "D": "對話中沒有提到黃色。"},
  None, listen="""W: Whose umbrella is this? It's under my desk.
M: It's not mine. Mine is green. I think it's Lisa's. She has a red one.
W: This one is red, so it must be Lisa's.
N: Question: What color is the boy's umbrella?""")
Q("EN-7L-1", "dialogue-detail", 3, "When will they play tennis?",
  ["On Wednesday.", "On Monday.", "On Tuesday.", "On Thursday."], "A",
  "男孩提議今天放學打網球，Amy 說星期一有鋼琴課，星期二也忙，問「How about Wednesday?」，男孩回答「Wednesday is fine with me.」，所以他們星期三打網球。",
  ["Amy 哪幾天沒有空？", "最後兩個人同意的是哪一天？"],
  {"B": "星期一 Amy 要上鋼琴課（I have a piano lesson on Mondays），所以不能打球。", "C": "Amy 說 I'm busy on Tuesday, too，星期二也不行。", "D": "對話中沒有提到星期四。"},
  None, listen="""M: Amy, let's play tennis after school today.
W: Sorry, I have a piano lesson on Mondays. How about Wednesday? I'm busy on Tuesday, too.
M: OK. Wednesday is fine with me.
N: Question: When will they play tennis?""")

# ============================ EN-8L-1 聽力：言談理解（八年級） ============================
# ---- 基本問答 4 題 ----
Q("EN-8L-1", "basic-response", 1, BASIC + "（週五放學）",
  ["I often go hiking with my family.", "Last weekend was very fun.", "It's on the weekend.", "Yes, I usually do."], "A",
  "聽力原文是「What do you usually do on weekends?」（你週末通常做什麼？），用現在簡單式問習慣，要回答平常的活動：I often go hiking with my family.",
  ["問句裡的 usually 表示在問一次的事，還是平常的習慣？", "What do you do...? 要回答「做什麼事」。"],
  {"B": "只說上週末很好玩，沒有說平常做什麼事，也不是在回答習慣。", "C": "It's on the weekend. 是回答某件事在什麼時候，沒有說做什麼。", "D": "What 開頭的問句不能用 Yes 或 No 回答。"},
  None, listen="""W: What do you usually do on weekends?""")
Q("EN-8L-1", "basic-response", 1, BASIC + "（開學第一天）",
  ["It was great. The views were beautiful.", "I went there by train.", "I'm going there next month.", "It's in eastern Taiwan."], "A",
  "聽力原文是「How was your trip to Hualien?」（你的花蓮之旅如何？），How was...? 問感想，所以回答 It was great. The views were beautiful.（很棒，風景很美）。",
  ["How was...? 是問方法還是問感覺？", "旅行已經結束了，對方想知道你覺得怎麼樣。"],
  {"B": "By train 是回答 How did you go there?（怎麼去的），不是問感想。", "C": "旅行已經發生了（問句用 was），不能回答「下個月要去」。", "D": "這是回答 Where is Hualien?（花蓮在哪裡）。"},
  None, listen="""M: How was your trip to Hualien?""")
Q("EN-8L-1", "basic-response", 2, BASIC + "（在教室裡）",
  ["Not at all. Go ahead.", "Yes, please. It's too hot.", "The window is very big.", "No, it's closed."], "A",
  "聽力原文是「Do you mind if I open the window?」（你介意我開窗嗎？），mind 是「介意」，同意對方開窗要說「不介意」：Not at all. Go ahead.（一點也不，請開吧）。",
  ["mind 是什麼意思？", "如果你同意對方開窗，是「介意」還是「不介意」？"],
  {"B": "Yes 表示「我介意」，後面卻說請開、太熱了，前後矛盾，這是 Do you mind...? 最常見的陷阱。", "C": "聽到 window 就選有 window 的句子，但沒有回應對方的請求。", "D": "No, it's closed. 是回答 Is the window open?，不是回答介不介意。"},
  None, listen="""M: Do you mind if I open the window?""")
Q("EN-8L-1", "basic-response", 2, BASIC + "（出門前）",
  ["Did you look in your schoolbag?", "I found the test very easy.", "My cellphone is newer than yours.", "Sure, you can use it anywhere."], "A",
  "聽力原文是「I can't find my cellphone anywhere.」（我到處都找不到我的手機），最適當的回應是幫忙想可能放在哪裡：Did you look in your schoolbag?（你看過書包裡了嗎？）",
  ["說話的人遇到了什麼問題？", "朋友找不到東西時，你可以怎麼幫他？"],
  {"B": "聽到 find 就選有 found 的句子，但 find...easy 是「覺得……很簡單」，和找手機無關。", "C": "聽到 cellphone 就選，但比較誰的手機比較新，沒有回應對方找不到手機的問題。", "D": "聽到 anywhere 就選，但對方不是在借東西，說「你可以在任何地方用」不合理。"},
  None, listen="""W: I can't find my cellphone anywhere.""")

# ---- 對話細節 3 題 ----
Q("EN-8L-1", "dialogue-detail", 1, "Why is Jenny tired?",
  ["She went to bed late to study.", "She played computer games all night.", "She ran in a race this morning.", "She took a math test last night."], "A",
  "Jenny 說「I stayed up late last night. I was studying for the math test.」，她昨晚熬夜讀書準備數學考試，所以很累。",
  ["男孩說 Jenny 看起來怎麼樣？Jenny 接著說了什麼原因？", "stay up late 是什麼意思？她熬夜在做什麼？"],
  {"B": "對話中沒有提到玩電腦遊戲。", "C": "對話中沒有提到賽跑。", "D": "數學考試在今天下午（This afternoon），昨晚是在準備考試，不是考試。"},
  None, listen="""M: Hi, Jenny. You look tired.
W: I stayed up late last night. I was studying for the math test.
M: When is the test?
W: This afternoon.
N: Question: Why is Jenny tired?""")
Q("EN-8L-1", "dialogue-detail", 2, "How much will the woman pay?",
  ["500 dollars.", "300 dollars.", "600 dollars.", "800 dollars."], "A",
  "店員說一件 300 元，但「if you buy two, they're five hundred」（買兩件 500 元），女士說「I'll take two.」，所以她要付 500 元。",
  ["一件多少錢？買兩件有什麼優惠？", "女士最後決定買幾件？"],
  {"B": "300 元是一件的價錢，但她買了兩件。", "C": "直接用 300 × 2 計算，忽略了買兩件只要 500 元的優惠。", "D": "把 300 和 500 加起來，誤會了兩個價錢的意思。"},
  None, listen="""W: Excuse me. How much is this T-shirt?
M: It's three hundred dollars. But if you buy two, they're five hundred.
W: Great. I'll take two.
N: Question: How much will the woman pay?""")
Q("EN-8L-1", "dialogue-detail", 2, "How will the girl go to school today?",
  ["By bus.", "By car.", "On foot.", "By bike."], "A",
  "女孩想請爸爸開車送她，但爸爸說「My car is broken. Why don't you take the bus?」，女孩回答「OK.」，所以她今天搭公車上學。",
  ["爸爸可以開車送她嗎？為什麼？", "爸爸建議她怎麼去？她同意了嗎？"],
  {"B": "女孩一開始想坐爸爸的車，但爸爸的車壞了（My car is broken）。", "C": "對話中沒有說要走路去，公車站就在大樓前面，她要去搭公車。", "D": "對話中沒有提到腳踏車，而且下大雨也不適合騎車。"},
  None, listen="""W: Dad, can you drive me to school today? It's raining hard.
M: Sorry, honey. My car is broken. Why don't you take the bus? The bus stop is right in front of our building.
W: OK. I'll take my umbrella.
N: Question: How will the girl go to school today?""")

# ---- 廣播 3 題 ----
Q("EN-8L-1", "announcement", 1, "Why will the library close early today?",
  ["There is a teachers' meeting.", "The weather is very bad.", "Today is a holiday.", "The library will be cleaned."], "A",
  "廣播說「The school library will close early today, at three thirty, because of a teachers' meeting.」，because of 後面說出原因：有教師會議。",
  ["廣播一開始說圖書館今天會怎麼樣？", "注意 because of 後面接的內容。"],
  {"B": "廣播中沒有提到天氣。", "C": "廣播中沒有說今天放假，明天八點還會照常開。", "D": "廣播中沒有提到打掃圖書館。"},
  None, listen="""N: Attention, please. The school library will close early today, at three thirty, because of a teachers' meeting. It will open again tomorrow at eight. Thank you.
N: Question: Why will the library close early today?""")
Q("EN-8L-1", "announcement", 2, "Until what time can people buy fruit at half price today?",
  ["Until 6 p.m.", "Until 9 a.m.", "Until 10 p.m.", "Until 12 noon."], "A",
  "廣播說「Today all fruit is half price, but only until six p.m.」，水果半價只到下午六點；晚上十點是商店的打烊時間。",
  ["廣播裡出現了好幾個時間，各是什麼事情的時間？", "注意 but only until... 後面接的時間。"],
  {"B": "早上九點是商店開門的時間，不是特價結束的時間。", "C": "晚上十點是商店打烊的時間，特價只到六點。", "D": "廣播中沒有提到中午。"},
  None, listen="""N: Good morning, shoppers. Welcome to Happy Market. We are open from nine a.m. to ten p.m. every day. Today all fruit is half price, but only until six p.m. Come and get some fresh apples and bananas!
N: Question: Until what time can people buy fruit at half price today?""")
Q("EN-8L-1", "announcement", 3, "What do we know about the train to Kaohsiung?",
  ["It will arrive at Platform 2 at ten fifteen.", "It will arrive at Platform 2 at ten o'clock.", "It will arrive at Platform 1 at ten fifteen.", "It is late because of an accident."], "A",
  "廣播說「The train to Kaohsiung will arrive at Platform 2 at ten fifteen, not ten o'clock. It is fifteen minutes late because of heavy rain.」，火車會在 10:15 到達第 2 月臺，誤點原因是大雨。",
  ["火車原本幾點到？現在改成幾點？", "注意月臺號碼和誤點的原因，選項只要有一個地方不對就不能選。"],
  {"B": "廣播特別說 not ten o'clock，十點是原本的時間，現在誤點了。", "C": "時間對了，但月臺是 Platform 2，不是 1。", "D": "誤點的原因是 heavy rain（大雨），不是意外事故。"},
  None, listen="""N: Attention, please. The train to Kaohsiung will arrive at Platform 2 at ten fifteen, not ten o'clock. It is fifteen minutes late because of heavy rain. We are sorry for the trouble.
N: Question: What do we know about the train to Kaohsiung?""")

# ---- 留言 2 題 ----
Q("EN-8L-1", "message", 2, "Why did Grace leave this message?",
  ["To change the time of their plan.", "To ask Kevin to visit her grandmother.", "To invite Kevin to her house for dinner.", "To tell Kevin she lost her museum ticket."], "A",
  "Grace 說「I can't go to the museum with you tomorrow morning... Can we go on Sunday afternoon instead?」，她明天早上不能去，想改成星期天下午，所以留言是為了更改計畫的時間。",
  ["Grace 原本和 Kevin 約好做什麼？", "她為什麼不能去？她提出了什麼新的時間？"],
  {"B": "是 Grace 的奶奶要來拜訪她（my grandmother is coming to visit），不是請 Kevin 去看奶奶。", "C": "留言中沒有邀請 Kevin 來家裡吃晚餐。", "D": "留言中沒有提到門票遺失。"},
  None, listen="""W: Hi, Kevin. This is Grace. I can't go to the museum with you tomorrow morning because my grandmother is coming to visit. Can we go on Sunday afternoon instead? Please call me back. Thanks.
N: Question: Why did Grace leave this message?""")
Q("EN-8L-1", "message", 3, "What do we know from the message?",
  ["Ms. Lee needs to pay 300 dollars more than she first thought.", "Ms. Lee's bike won't be ready until tomorrow.", "The bike shop isn't open tomorrow.", "Ms. Lee must get her bike before seven tonight."], "A",
  "Sam 說「it's eight hundred dollars, not five hundred」，原本說 500 元，現在要 800 元，所以李小姐要比原本多付 300 元（800 − 500 = 300）。其他選項都和「Your bike is ready」「we're open all day tomorrow」不符。",
  ["原本說的價錢和現在的價錢各是多少？", "再注意：腳踏車修好了沒？店明天有沒有開？"],
  {"B": "留言一開始就說 Your bike is ready（已經修好了）。", "C": "留言說 we're open all day tomorrow，明天整天都有開。", "D": "店今晚七點關門，但明天整天都有開，所以不是一定要今晚拿。"},
  None, listen="""M: Hello, Ms. Lee. This is Sam from Fast Bike Shop. Your bike is ready, but the price is a little higher than we said. We had to change some parts, so it's eight hundred dollars, not five hundred. We close at seven tonight, but we're open all day tomorrow.
N: Question: What do we know from the message?""")

# ============================ EN-9L-1 聽力：會考聽力綜合（九年級） ============================
# ---- 基本問答 4 題 ----
Q("EN-9L-1", "basic-response", 1, BASIC + "（認識新朋友）",
  ["Yes, I went there two years ago.", "No, I've visited it twice.", "Yes, I'll go there next summer.", "It takes about three hours by plane."], "A",
  "聽力原文是「Have you ever been to Japan?」（你曾經去過日本嗎？），問經驗，回答 Yes 後補充去的時間：Yes, I went there two years ago.",
  ["Have you ever been to...? 是在問什麼？", "回答 Yes 或 No 之後，後面的內容要和前面一致。"],
  {"B": "說 No（沒去過）卻又說去過兩次，前後矛盾。", "C": "next summer 是還沒發生的事，說 Yes（去過）卻講未來，意思矛盾。", "D": "這是回答 How long does it take...?（要花多久時間），不是問經驗。"},
  None, listen="""M: Have you ever been to Japan?""")
Q("EN-9L-1", "basic-response", 1, BASIC + "（在街上）",
  ["Sure. It's next to the bank.", "Yes, I could tell you a story.", "I sent a letter yesterday.", "It opens at nine in the morning."], "A",
  "聽力原文是「Could you tell me where the post office is?」（你可以告訴我郵局在哪裡嗎？），這是間接問句，真正問的是地點，所以回答 It's next to the bank.（在銀行旁邊）。",
  ["這句話真正想知道的是什麼？", "注意 tell me 後面的 where..."],
  {"B": "聽到 Could you tell me 就回答「我可以講故事」，沒有聽懂真正問的是地點。", "C": "聽到 post office 想到寄信，但對方沒有問你寄了什麼。", "D": "這是回答郵局幾點開門（When does it open?），不是在哪裡。"},
  None, listen="""W: Could you tell me where the post office is?""")
Q("EN-9L-1", "basic-response", 2, BASIC + "（在家裡）",
  ["Sure, but turn it off before nine.", "I've finished my homework, too.", "Let me finish my homework first.", "The TV show was boring last night."], "A",
  "聽力原文是「I've finished my homework. Can I watch TV now?」（我功課寫完了，現在可以看電視嗎？），孩子在請求允許，媽媽回答 Sure, but turn it off before nine.（可以，但九點前要關掉）最適當。",
  ["說話的人最後問的是什麼？", "Can I...? 是請求允許，回答要表示可不可以。"],
  {"B": "聽到 finished my homework 就跟著說「我也寫完了」，但沒有回答能不能看電視。", "C": "要寫功課的是孩子，而且他已經寫完了，回答的人不需要寫功課。", "D": "聽到 TV 就選有 TV 的句子，但昨晚節目好不好看和現在能不能看無關。"},
  None, listen="""M: I've finished my homework. Can I watch TV now?""")
Q("EN-9L-1", "basic-response", 2, BASIC + "（放學路上）",
  ["I left my wallet on the bus.", "Yes, I'm very happy today.", "You're right. The answer is wrong.", "I'm worried about you, too."], "A",
  "聽力原文是「You look worried. What's wrong?」（你看起來很擔心，怎麼了？），要說出讓自己擔心的事：I left my wallet on the bus.（我把錢包忘在公車上了）。",
  ["對方覺得你看起來怎麼樣？", "What's wrong? 是問「怎麼了」，要說出發生了什麼事。"],
  {"B": "對方說你看起來很擔心，回答「我今天很開心」不合理，而且 What 問句不用 Yes 回答。", "C": "聽到 wrong 就選有 wrong 的句子，但 What's wrong? 是「怎麼了」，不是在問答案對不對。", "D": "聽到 worried 就選有 worried 的句子，但對方是在關心你，你沒有說明發生了什麼事。"},
  None, listen="""W: You look worried. What's wrong?""")

# ---- 對話推論 4 題 ----
Q("EN-9L-1", "dialogue-inference", 1, "Where are the speakers?",
  ["In a restaurant.", "In a bookstore.", "In a supermarket.", "In a classroom."], "A",
  "女士說「Can I have the menu, please?」，男士介紹「Today's special is beef noodles.」，女士點了「the vegetable fried rice」，有菜單、今日特餐和點餐，可推論他們在餐廳。",
  ["對話中出現了哪些和吃東西有關的字？", "menu、today's special 通常在哪裡會聽到？"],
  {"B": "書店不會有菜單和點餐。", "C": "超市可以買食物，但不會拿菜單點今日特餐和炒飯。", "D": "對話中沒有和上課有關的內容。"},
  None, listen="""W: Excuse me, sir. Can I have the menu, please?
M: Here you are. Today's special is beef noodles.
W: Hmm, I don't eat meat. I'll have the vegetable fried rice.
N: Question: Where are the speakers?""")
Q("EN-9L-1", "dialogue-inference", 2, "What will the boy probably do?",
  ["Wear his old soccer shoes.", "Wash his soccer shoes again.", "Stay home and miss the game.", "Buy new shoes at the store."], "A",
  "球鞋昨天洗了還沒乾（Maybe they aren't dry yet），比賽三十分鐘後就開始，男孩說「I'll have to wear my old ones then.」，ones 指 soccer shoes，所以他會穿舊的足球鞋。",
  ["男孩的足球鞋為什麼不能穿？", "最後一句 I'll have to wear my old ones 的 ones 指的是什麼？"],
  {"B": "鞋子昨天已經洗過了，問題是還沒乾，不是要再洗一次。", "C": "男孩說要穿舊鞋去，並沒有說不去比賽。", "D": "比賽三十分鐘後就開始，對話中也沒有提到要買新鞋。"},
  None, listen="""M: Mom, have you seen my soccer shoes? The game starts in thirty minutes!
W: I washed them yesterday. They're still outside in the sun. Maybe they aren't dry yet.
M: Oh no! I'll have to wear my old ones then.
N: Question: What will the boy probably do?""")
Q("EN-9L-1", "dialogue-inference", 2, "How did Jason feel about the concert?",
  ["He liked the singer but was unhappy about other things.", "He didn't like the singer at all.", "He thought everything was perfect.", "He was sorry that he didn't go."], "A",
  "Jason 說「the singer was great, but we sat in the last row, and I couldn't see anything」，還說旁邊的人一直講話。but 前面是優點（歌手很棒），後面是缺點（座位差、旁人吵），所以他喜歡歌手，但對其他事情不滿意。",
  ["Jason 先說了什麼優點？", "注意 but 後面說的內容，是開心還是不開心的事？"],
  {"B": "Jason 說 the singer was great，他很喜歡歌手。", "C": "他抱怨坐最後一排看不到、旁邊的人一直講話，並不是一切都很完美。", "D": "Jason 昨晚有去演唱會，才會知道座位和旁邊的人的狀況。"},
  None, listen="""W: Did you enjoy the concert last night, Jason?
M: Well, the singer was great, but we sat in the last row, and I couldn't see anything. Also, the people next to me talked the whole time.
W: That's too bad.
N: Question: How did Jason feel about the concert?""")
Q("EN-9L-1", "dialogue-inference", 3, "What can we infer about Linda?",
  ["She can get enough money for the trip before Monday.", "She has decided not to go on the trip.", "She has already paid two thousand dollars.", "She will work at her aunt's shop for only one day."], "A",
  "旅行要 2000 元，Linda 說「I've saved only twelve hundred so far.」，還差 800 元。她說這個週末的星期六和星期日兩天都要去阿姨店裡幫忙，「She'll pay me five hundred dollars a day.」，可以賺 500 × 2 = 1000 元，1200 + 1000 = 2200 元，超過 2000 元，而且週末在星期一報名截止之前，所以她能在星期一前湊到旅費。",
  ["旅行要多少錢？Linda 已經存了多少？還差多少？", "週末有幾天？一天可以賺多少？算算看夠不夠，而且來不來得及在報名截止前。"],
  {"B": "Linda 說 I really want to，還打算週末打工賺錢，並沒有決定不去。", "C": "她只存了 1200 元，還沒有付 2000 元。", "D": "她說 both Saturday and Sunday，是兩天，不是只有一天。"},
  None, listen="""M: Linda, are you joining the school trip to Kenting next Friday?
W: I really want to, but it costs two thousand dollars. I've saved only twelve hundred so far.
M: The last day to sign up is next Monday, right?
W: Yes. This weekend I'll help at my aunt's shop on both Saturday and Sunday. She'll pay me five hundred dollars a day.
N: Question: What can we infer about Linda?""")

# ---- 廣播 2 題 ----
Q("EN-9L-1", "announcement", 1, "What should students do after their last class today?",
  ["Go home.", "Go to their clubs.", "Stay in the classroom.", "Go to the playground."], "A",
  "廣播說颱風要來，今天沒有社團活動，並提醒「Please go home right after your last class.」，所以最後一堂課後要直接回家。",
  ["廣播一開始說了什麼天氣狀況？", "注意 Please... 後面要學生做的事。"],
  {"B": "廣播說 there will be no after-school club activities today，今天沒有社團活動。", "C": "廣播沒有要學生留在教室。", "D": "颱風要來，廣播要學生回家，沒有提到操場。"},
  None, listen="""N: Good afternoon, students. Because a typhoon is coming, there will be no after-school club activities today. Please go home right after your last class. Be careful on your way home.
N: Question: What should students do after their last class today?""")
Q("EN-9L-1", "announcement", 2, "Which of the following is allowed at the zoo?",
  ["Having lunch in the picnic area near the main gate.", "Giving food to the animals.", "Talking loudly in the Night Animal House.", "Eating snacks while walking around the zoo."], "A",
  "廣播說「Lunch is only allowed in the picnic area near the main gate.」，在大門附近的野餐區吃午餐是允許的；餵動物、在夜行動物館大聲說話、邊走邊吃都不符合規定。",
  ["廣播一共說了幾條規定？", "注意 only allowed 後面說的地點。"],
  {"B": "廣播說 Please do not feed the animals，不可以餵動物。", "C": "廣播說 please be quiet in the Night Animal House，要保持安靜。", "D": "吃東西只能在野餐區（only allowed in the picnic area），不能邊走邊吃。"},
  None, listen="""N: Welcome to Green Mountain Zoo. Here are some rules for your visit. Please do not feed the animals because they have special food. Please be quiet in the Night Animal House. Lunch is only allowed in the picnic area near the main gate. Enjoy your day!
N: Question: Which of the following is allowed at the zoo?""")

# ---- 留言 2 題 ----
Q("EN-9L-1", "message", 2, "What does Uncle Ben want Sara to do?",
  ["Tell him what kind of food she wants.", "Pick him up at the train station.", "Cook dinner for him on Tuesday.", "Call him before six o'clock."], "A",
  "Ben 叔叔說要請 Sara 和弟弟吃晚餐，最後說「Send me a message and tell me what kind of food you want.」，他要 Sara 告訴他想吃什麼。",
  ["Ben 叔叔打電話來是要做什麼？", "留言最後他請 Sara 做什麼事？"],
  {"B": "留言中沒有提到去車站接他。", "C": "是叔叔要請他們出去吃晚餐（take you out for dinner），不是要 Sara 煮飯。", "D": "six 是叔叔有空的時間（I'll be free after six），他是要 Sara 傳訊息，不是六點前打電話。"},
  None, listen="""M: Hi, Sara. It's Uncle Ben. I'm coming to Taipei for work next Tuesday. I'd love to take you and your brother out for dinner on Tuesday night. I'll be free after six. Send me a message and tell me what kind of food you want. See you soon!
N: Question: What does Uncle Ben want Sara to do?""")
Q("EN-9L-1", "message", 3, "When will the class have the speech contest?",
  ["On Friday.", "On Thursday.", "On Wednesday.", "Next Thursday."], "A",
  "黃老師說演講比賽原本在「this Thursday」，但那天禮堂要開會，所以「we'll have the contest one day later, at the same time」。星期四的後一天是星期五，所以比賽在星期五。",
  ["比賽原本是星期幾？為什麼要改？", "one day later 是往後延幾天？"],
  {"B": "星期四是原本的日期，因為禮堂要開會已經改期了。", "C": "one day later 是往後一天，不是提前一天。", "D": "只延後一天，不是延到下星期四。"},
  None, listen="""W: Hi, Mike. This is Ms. Huang, your English teacher. Our class's speech contest was planned for this Thursday, but the school hall will be used for a meeting that day. So we'll have the contest one day later, at the same time. Please tell the other students in your group. Thanks.
N: Question: When will the class have the speech contest?""")
