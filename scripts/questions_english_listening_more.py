# -*- coding: utf-8 -*-
"""英語聽力題庫擴充（自編原創題，依 108 課綱；題型比照國中會考英語聽力的「基本問答」與「言談理解」，不含看圖題）"""
from fractions import Fraction as F
import math

SUBJECT = "english"
UNITS = []
QUESTIONS = []


def Q(unit, concept, difficulty, stem, options, answer, explanation, hints, wrong, check=None, listen=None):
    QUESTIONS.append(dict(unit=unit, concept=concept, difficulty=difficulty, stem=stem, options=options, answer=answer, explanation=explanation, hints=hints, wrong=wrong, check=check, listen=listen))


BASIC = "請聽一句話，選出最適當的回應。"

# ============================ EN-7L-1 聽力：基本問答與日常對話（七年級） ============================
# ---- 基本問答 10 題 ----
Q("EN-7L-1", "basic-response", 1, BASIC + "（在文具店）",
  ["It's blue and white.", "It's thirty dollars.", "I have two pens.", "It's on the desk."], "B",
  "聽力原文是「How much is this pen?」（這支筆多少錢？），How much 問價錢，所以要回答金額：It's thirty dollars.（三十元）。",
  ["先聽清楚問句開頭是哪兩個字。", "How much 和 What color、How many、Where 問的事情各不相同。"],
  {"A": "這是回答 What color is it?（什麼顏色），不是問價錢。", "C": "這是回答 How many pens do you have?（有幾支筆），把 How much 聽成 How many。", "D": "這是回答 Where is it?（在哪裡），問句沒有問位置。"},
  None, listen="""W: How much is this pen?""")
Q("EN-7L-1", "basic-response", 1, BASIC + "（打電話時）",
  ["Yes, I can speak English.", "Judy is my good friend.", "Hold on, please.", "No, she doesn't."], "C",
  "聽力原文是「Hello, may I speak to Judy?」（喂，請問 Judy 在嗎？），這是電話中要找人的說法，接電話的人請對方稍等、去叫 Judy：Hold on, please.（請稍等）最適當。",
  ["說話的人正在做什麼事？是面對面聊天還是講電話？", "May I speak to...? 在電話裡是什麼意思？接電話的人通常怎麼回應？"],
  {"A": "聽到 speak 就以為是問「會不會說英語」，但 speak to Judy 是「找 Judy 講電話」。", "B": "只介紹 Judy 是好朋友，沒有回應對方要找 Judy 講話的請求。", "D": "May I...? 問句不能用 she doesn't 回答，主詞和助動詞都對不上。"},
  None, listen="""M: Hello, may I speak to Judy?""")
Q("EN-7L-1", "basic-response", 1, BASIC + "（在公園）",
  ["He is very tall.", "He is in the park.", "He is fine, thanks.", "He is my cousin, Tom."], "D",
  "聽力原文是「Who is that tall boy over there?」（那邊那個高高的男孩是誰？），Who 問「誰」，要回答他的身分或名字：He is my cousin, Tom.（他是我表哥 Tom）。",
  ["問句開頭的疑問詞是什麼？", "Who 是問人的身分，回答要說出「他是誰」。"],
  {"A": "聽到 tall 就選有 tall 的句子，但對方已經知道他很高，想知道的是他是誰。", "B": "這是回答 Where is he?（他在哪裡），不是問身分。", "C": "這是回答 How is he?（他好嗎），不是問他是誰。"},
  None, listen="""W: Who is that tall boy over there?""")
Q("EN-7L-1", "basic-response", 1, BASIC + "（週末早上）",
  ["I'm making breakfast.", "I do my homework every day.", "I'm a student.", "Yes, I am."], "A",
  "聽力原文是「What are you doing?」（你正在做什麼？），用現在進行式問「此刻正在做的事」，所以回答 I'm making breakfast.（我正在做早餐）。",
  ["問句用的是 are you doing，表示在問什麼時候的事？", "What 問句要回答「做什麼」，而且時態要跟著問句。"],
  {"B": "這是說每天的習慣（現在簡單式），問句問的是「現在正在做」的事。", "C": "這是回答 What do you do?（你是做什麼的）或身分，不是正在做的事。", "D": "What 開頭的問句不能用 Yes 或 No 回答。"},
  None, listen="""M: What are you doing?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（在路上相遇）",
  ["I went to the zoo with my sister.", "To the bookstore. I need a dictionary.", "I'm going by bus with my brother.", "Yes, I'm going there right now."], "B",
  "聽力原文是「Where are you going?」（你要去哪裡？），Where 問地點，要說出要去的地方：To the bookstore. I need a dictionary.（去書店，我需要一本字典）。",
  ["問句開頭的疑問詞是什麼？", "are you going 是問已經去過的地方，還是現在要去的地方？"],
  {"A": "went 是過去式，說的是已經去過的地方，但對方問的是現在要去哪裡。", "C": "by bus 是回答 How are you going?（怎麼去），不是去哪裡。", "D": "Where 問句不能用 Yes 回答，也沒有說出地點。"},
  None, listen="""W: Where are you going?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（早自習時）",
  ["That's great! Have a nice day.", "It's cold outside. Wear your coat.", "I'm sorry to hear that. Take care.", "Me, too. I like it very much."], "C",
  "聽力原文是「I have a bad cold today.」（我今天重感冒），對方說自己生病了，要表示關心：I'm sorry to hear that. Take care.（聽到這消息真難過，保重喔）。",
  ["對方說的是好消息還是壞消息？", "a bad cold 的 cold 在這裡是「冷」還是「感冒」？"],
  {"A": "對方生病是壞消息，回答「太好了」很不禮貌。", "B": "把 cold（感冒）聽成天氣「冷」，所以回答外面很冷。", "D": "生病不是令人喜歡的事，說「我也是，我喜歡」不合理。"},
  None, listen="""M: I have a bad cold today.""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（在餐廳點餐）",
  ["Yes, you can take it. I don't need it.", "I'm sorry. It's not mine. It's Ben's.", "Here you are. It's on the table.", "I'd like a hamburger and a cola, please."], "D",
  "聽力原文是「Can I take your order?」（我可以幫您點餐了嗎？），這是店員請客人點餐的說法，所以回答想吃什麼：I'd like a hamburger and a cola, please.（我要一個漢堡和一杯可樂）。",
  ["說話的人可能是什麼身分？", "在餐廳裡，take your order 是要拿走東西，還是要幫你點餐？"],
  {"A": "把 take 想成「拿走」，以為對方要拿走某樣東西。", "B": "聽到 your 以為是在問東西是不是你的，但 order 是「點餐」。", "C": "Here you are. 是把東西遞給別人時說的，店員是要聽你點什麼。"},
  None, listen="""W: Can I take your order?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（打掃教室時）",
  ["It's Mark's. He left it here.", "It's twenty dollars. It's cheap.", "It's a red cap with a star.", "Yes, it is. It's a nice cap."], "A",
  "聽力原文是「Whose cap is this?」（這是誰的帽子？），Whose 問「誰的」，要說出擁有者：It's Mark's. He left it here.（是 Mark 的，他忘在這裡了）。",
  ["問句開頭的疑問詞是 Who 還是 Whose？", "Whose 是問「誰的」，回答要說出東西屬於哪一個人。"],
  {"B": "這是回答 How much is it?（多少錢），不是問誰的。", "C": "只描述帽子的顏色，沒有說是誰的。", "D": "Whose 開頭的問句不能用 Yes 回答。"},
  None, listen="""M: Whose cap is this?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（星期六上午）",
  ["I swim very well.", "Sounds great. What time?", "Yes, I can swim.", "The swimming pool is big."], "B",
  "聽力原文是「Let's go swimming this afternoon.」（我們今天下午去游泳吧），Let's... 是提議一起做某事，適當的回應是表示贊成或拒絕：Sounds great. What time?（聽起來很棒，幾點？）",
  ["Let's... 是在問問題，還是在提議？", "朋友提議一起去做某件事，你可以怎麼表示同意？"],
  {"A": "只說自己很會游泳，沒有回應要不要一起去。", "C": "Yes, I can swim. 是回答 Can you swim?（你會游泳嗎），對方沒有問你會不會。", "D": "聽到 swimming 就選有 swimming 的句子，但沒有回應對方的提議。"},
  None, listen="""W: Let's go swimming this afternoon.""")
Q("EN-7L-1", "basic-response", 3, BASIC + "（在圖書館）",
  ["Yes, please take it.", "Sure, I'll take it home.", "No, it isn't. Please sit down.", "Yes, it's my seat. Go ahead."], "C",
  "聽力原文是「Excuse me, is this seat taken?」（請問這個座位有人坐嗎？），seat taken 是「座位已經有人了」。回答 No, it isn't.（沒有人坐）再請對方坐下，前後一致，最適當。",
  ["is this seat taken 的 taken 在這裡是什麼意思？", "如果座位沒有人，要回答 Yes 還是 No？後面的話要和前面一致。"],
  {"A": "Yes 表示「有人坐了」，後面卻請對方坐，前後矛盾。", "B": "把 take 想成「拿走」，座位不能帶回家。", "D": "Yes, it's my seat. 表示這是我的位子，後面卻說請便，前後矛盾。"},
  None, listen="""M: Excuse me, is this seat taken?""")

# ---- 簡短對話 8 題 ----
Q("EN-7L-1", "dialogue-detail", 1, "Where is the boy's cat?",
  ["Under the sofa.", "On the bed.", "In the kitchen.", "Behind the door."], "A",
  "媽媽說「She's sleeping under the sofa.」，男孩再問「Not on my bed?」，媽媽說「No, not today.」，所以貓在沙發底下。",
  ["媽媽第一次回答時說貓在哪裡？", "男孩問的 on my bed，媽媽怎麼回答？"],
  {"B": "床是男孩猜的地方，媽媽說 No, not today，今天不在床上。", "C": "對話中沒有提到廚房。", "D": "對話中沒有提到門後面。"},
  None, listen="""M: Mom, where is my cat?
W: She's sleeping under the sofa.
M: Not on my bed?
W: No, not today.
N: Question: Where is the boy's cat?""")
Q("EN-7L-1", "dialogue-detail", 1, "What is Kelly's favorite subject?",
  ["Math.", "P.E.", "Music.", "English."], "D",
  "男孩問 Kelly 喜不喜歡數學，Kelly 說「It's OK, but I like English best.」，like...best 是「最喜歡」，所以她最喜歡英文；喜歡體育的是男孩。",
  ["Kelly 對數學的感覺是什麼？", "注意 but 後面的 like... best。"],
  {"A": "Kelly 說數學 It's OK（還可以），不是最喜歡。", "B": "P.E.（體育）是男孩喜歡的科目，不是 Kelly。", "C": "對話中沒有提到音樂。"},
  None, listen="""M: Do you like math, Kelly?
W: It's OK, but I like English best.
M: Really? I like P.E.
N: Question: What is Kelly's favorite subject?""")
Q("EN-7L-1", "dialogue-detail", 2, "How many people are there in Tony's family?",
  ["Four.", "Five.", "Six.", "Three."], "B",
  "Tony 說「Five. My parents, my two sisters, and me.」，爸媽 2 人、兩個姊妹 2 人，再加上他自己 1 人，共 5 人；狗是寵物，不算家庭成員的人數。",
  ["Tony 一開始直接說了一個數字，是多少？", "把他列出來的人數算一算，別忘了他自己，也注意寵物算不算人。"],
  {"A": "算人數時忘了加上 Tony 自己（and me）。", "C": "把小狗也算進去了，但題目問的是 people（人）。", "D": "只算了兩個姊妹和 Tony，漏掉了父母。"},
  None, listen="""W: Tony, how many people are there in your family?
M: Five. My parents, my two sisters, and me.
W: Do you have any pets?
M: Yes, a dog.
N: Question: How many people are there in Tony's family?""")
Q("EN-7L-1", "dialogue-detail", 2, "What will the boy buy for his sister?",
  ["A storybook.", "A doll.", "A dress.", "A notebook."], "A",
  "女士先建議買娃娃，男孩說妹妹已經有很多娃娃，而且她喜歡閱讀；女士再建議「Then buy her a storybook.」，男孩說「Good idea.」，所以他要買故事書。",
  ["女士第一次建議買什麼？男孩同意嗎？", "男孩說妹妹喜歡做什麼？最後他接受了哪個建議？"],
  {"B": "娃娃是第一個建議，但男孩說 She has many dolls，沒有接受。", "C": "對話中沒有提到洋裝。", "D": "妹妹喜歡閱讀，最後買的是 storybook（故事書），不是筆記本。"},
  None, listen="""M: I want to buy a present for my sister.
W: How about a doll?
M: She has many dolls. She likes reading.
W: Then buy her a storybook.
M: Good idea.
N: Question: What will the boy buy for his sister?""")
Q("EN-7L-1", "dialogue-detail", 2, "What day is it today?",
  ["Friday.", "Wednesday.", "Thursday.", "Saturday."], "C",
  "男孩說英文考試「No, it's tomorrow, on Friday.」，考試在明天，明天是星期五，所以今天是星期四。",
  ["英文考試是今天還是明天？", "明天是星期幾？那今天呢？"],
  {"A": "星期五是明天（考試那天），不是今天。", "B": "把「前一天」多算了一天，星期五的前一天是星期四。", "D": "往後推而不是往前推，星期六是考試的後一天。"},
  None, listen="""W: Is the English test today?
M: No, it's tomorrow, on Friday.
W: Great. I have one more day to study.
N: Question: What day is it today?""")
Q("EN-7L-1", "dialogue-detail", 2, "Where does the woman want to go?",
  ["To the bank.", "To the hospital.", "To the park.", "To the bus stop."], "B",
  "女士問「Is there a hospital near here?」，她想找醫院；男士報路時提到的銀行是轉彎的地標，公園是醫院旁邊的地標。",
  ["女士一開始問附近有沒有什麼地方？", "男士說的 bank 和 park 是目的地，還是用來報路的地標？"],
  {"A": "銀行是轉彎的地方（turn left at the bank），只是報路的地標。", "C": "公園在醫院旁邊（next to the park），也是地標，不是目的地。", "D": "對話中沒有提到公車站。"},
  None, listen="""W: Excuse me. Is there a hospital near here?
M: Yes. Go straight and turn left at the bank. It's next to the park.
W: Thank you.
N: Question: Where does the woman want to go?""")
Q("EN-7L-1", "dialogue-detail", 3, "How much does the boy need to pay?",
  ["30 dollars.", "40 dollars.", "60 dollars.", "50 dollars."], "D",
  "蘋果一顆 20 元、香蕉一根 10 元，男孩說「I'll take two apples and one banana.」，所以要付 20 × 2 + 10 × 1 = 50 元。",
  ["蘋果和香蕉各一個多少錢？", "男孩最後各買了幾個？把錢加起來。"],
  {"A": "只算了一顆蘋果加一根香蕉（20 + 10），漏了第二顆蘋果。", "B": "只算了兩顆蘋果（20 × 2），忘了加香蕉。", "C": "以為兩種水果都買兩個（20 × 2 + 10 × 2）。"},
  "20 * 2 + 10 * 1 == 50", listen="""M: How much are the apples?
W: They're twenty dollars each.
M: And the bananas?
W: Ten dollars each.
M: I'll take two apples and one banana.
N: Question: How much does the boy need to pay?""")
Q("EN-7L-1", "dialogue-detail", 3, "What time does Nina get up on Sundays?",
  ["At nine.", "At six.", "At seven.", "At eight."], "A",
  "Nina 說平日（weekdays）六點起床，「on Saturdays I get up at seven, and on Sundays I sleep until nine」，星期天睡到九點，所以星期天九點起床。",
  ["對話中出現了三個時間，各是哪幾天起床的時間？", "注意 on Sundays 後面的 sleep until...。"],
  {"B": "六點是平日（星期一到星期五）起床的時間。", "C": "七點是星期六起床的時間。", "D": "對話中沒有提到八點。"},
  None, listen="""M: Do you get up at six every day, Nina?
W: On weekdays, yes. But on Saturdays I get up at seven, and on Sundays I sleep until nine.
M: Lucky you!
N: Question: What time does Nina get up on Sundays?""")

# ============================ EN-8L-1 聽力：言談理解（八年級） ============================
# ---- 基本問答 4 題 ----
Q("EN-8L-1", "basic-response", 1, BASIC + "（放學後）",
  ["Yes, I go every week.", "No, I had to help my mom at home.", "Yes, I'll watch it tonight.", "The game is at the gym."], "B",
  "聽力原文是「Did you go to the basketball game last night?」（你昨晚有去看籃球賽嗎？），用過去式問昨晚的事，No, I had to help my mom at home.（沒有，我得在家幫媽媽）時態和意思都正確。",
  ["問句的時間是 last night，用的是哪一種時態？", "回答要用過去式，而且 Yes／No 後面的內容要一致。"],
  {"A": "go every week 是現在的習慣，沒有回答昨晚的事。", "C": "說 Yes（有去）卻講今晚要看，時間和意思都對不上。", "D": "這是回答比賽在哪裡，沒有回答昨晚有沒有去。"},
  None, listen="""W: Did you go to the basketball game last night?""")
Q("EN-8L-1", "basic-response", 1, BASIC + "（在百貨公司）",
  ["Yes, I can help you.", "No, I don't help people.", "Yes, I'm looking for a jacket.", "Sure. Here you are."], "C",
  "聽力原文是「May I help you?」（需要幫忙嗎？／有什麼需要嗎？），這是店員招呼客人的話，客人可以說明想買什麼：Yes, I'm looking for a jacket.（是的，我在找外套）。",
  ["在百貨公司裡，誰會說這句話？", "店員問你需不需要幫忙，你可以說自己想找什麼。"],
  {"A": "搞反了角色，是店員要幫你，不是你要幫店員。", "B": "把句子聽成問你幫不幫別人，回答也很沒禮貌。", "D": "Here you are. 是遞東西給別人時說的，店員沒有向你要東西。"},
  None, listen="""M: May I help you?""")
Q("EN-8L-1", "basic-response", 2, BASIC + "（考試結束後）",
  ["I studied in the library.", "It's next Monday.", "I took the bus to school.", "Not bad. I got eighty-five."], "D",
  "聽力原文是「How did you do on the science test?」（你自然考得怎麼樣？），How did you do on...? 是問表現或成績，所以回答 Not bad. I got eighty-five.（還不錯，我考 85 分）。",
  ["How did you do on the test? 是問方法，還是問結果？", "考完試，朋友最想知道的是什麼？"],
  {"A": "這是回答在哪裡讀書，不是考得怎麼樣。", "B": "這是回答考試是什麼時候，而且考試已經考完了（問句用 did）。", "C": "把 How did you...? 當成問交通方式，但對方問的是考試結果。"},
  None, listen="""W: How did you do on the science test?""")
Q("EN-8L-1", "basic-response", 2, BASIC + "（在朋友家）",
  ["Thanks. They look delicious.", "Sure, I can help you.", "You're welcome.", "Yes, I made them myself."], "A",
  "聽力原文是「Help yourself to some cookies.」（請自己拿餅乾吃），Help yourself to... 是請客人自便、自己取用，適當的回應是道謝：Thanks. They look delicious.（謝謝，看起來好好吃）。",
  ["Help yourself to... 真的是在請你幫忙嗎？", "主人請你吃東西時，客人應該怎麼回應？"],
  {"B": "聽到 help 就以為對方需要幫忙，但 Help yourself 是「請自己取用」。", "C": "You're welcome. 是回應別人的道謝，對方沒有說謝謝。", "D": "餅乾是主人準備的，客人說自己做的不合理。"},
  None, listen="""M: Help yourself to some cookies.""")

# ---- 對話細節 5 題 ----
Q("EN-8L-1", "dialogue-detail", 1, "What did Andy do last Sunday?",
  ["He stayed home and watched TV.", "He went to the beach.", "He went to the mountains.", "He visited his grandparents."], "B",
  "Andy 說「I went to the beach with my cousins.」，他上星期天和表兄弟去海邊，還游泳、打排球；待在家看電視的是女孩。",
  ["題目問的是誰做了什麼？", "Andy 說 I went to... 後面接的是哪裡？"],
  {"A": "待在家看電視的是女孩（I just stayed home），不是 Andy。", "C": "對話中沒有提到山。", "D": "Andy 是和 cousins（表兄弟姊妹）出去，不是去看祖父母。"},
  None, listen="""W: What did you do last Sunday, Andy?
M: I went to the beach with my cousins. We swam and played volleyball.
W: Sounds fun. I just stayed home and watched TV.
N: Question: What did Andy do last Sunday?""")
Q("EN-8L-1", "dialogue-detail", 2, "Why can't Jane see the movie tonight?",
  ["She has too much homework to do tonight.", "She is sick and has to stay in bed.", "She needs to take care of her grandmother.", "She doesn't like to watch movies at all."], "C",
  "Jane 說「I'd love to, but I can't. My grandma is sick, and I have to take care of her.」，生病的是奶奶，她要照顧奶奶，所以不能去看電影。",
  ["Jane 想不想去看電影？", "注意 but I can't 後面的原因，生病的是誰？"],
  {"A": "對話中沒有提到功課。", "B": "生病的是 Jane 的奶奶（My grandma is sick），不是 Jane；Jane 是要照顧奶奶，不是自己躺在床上休息。", "D": "Jane 說 I'd love to（我很想去），她是喜歡看電影的。"},
  None, listen="""M: Do you want to see a movie with us tonight, Jane?
W: I'd love to, but I can't. My grandma is sick, and I have to take care of her.
M: I see. Maybe next time.
N: Question: Why can't Jane see the movie tonight?""")
Q("EN-8L-1", "dialogue-detail", 2, "What will the weather be like tomorrow, according to the weather report?",
  ["Hot and sunny.", "Cloudy and warm.", "Windy and cold.", "Rainy and cool."], "D",
  "男士說「the weather report says it'll be rainy and cool tomorrow」，氣象報告說明天會下雨又涼爽，所以女士說要帶傘；今天才是很熱。",
  ["對話裡說了哪兩天的天氣？", "注意 the weather report says 後面說的是明天的天氣。"],
  {"A": "hot 是今天的天氣（It's so hot today），不是明天。", "B": "對話中沒有提到多雲。", "C": "對話中沒有提到颳風和寒冷，cool 是涼爽不是冷。"},
  None, listen="""W: It's so hot today.
M: Yes, but the weather report says it'll be rainy and cool tomorrow.
W: Good. I'll bring my umbrella.
N: Question: What will the weather be like tomorrow, according to the weather report?""")
Q("EN-8L-1", "dialogue-detail", 2, "Where are the man's keys?",
  ["In his jacket pocket.", "At the bottom of his bag.", "On the kitchen table.", "Under the bed in his room."], "A",
  "男士說他找過包包和桌上都沒有，女士問「Did you check your jacket pocket?」，男士說「Oh, here they are!」，表示鑰匙在外套口袋裡。",
  ["男士已經找過哪些地方？", "女士建議找哪裡？男士接著說了什麼？"],
  {"B": "男士說 I looked in my bag，包包已經找過，沒有。", "C": "桌上也找過了（and on the table），沒有。", "D": "對話中沒有提到床底下。"},
  None, listen="""M: I can't find my keys. I looked in my bag and on the table.
W: Did you check your jacket pocket?
M: Oh, here they are! Thanks.
N: Question: Where are the man's keys?""")
Q("EN-8L-1", "dialogue-detail", 3, "How many students will go to the science museum now?",
  ["25.", "27.", "30.", "32."], "B",
  "原本有 30 人報名（Thirty signed up），其中 5 人生病不能去，又有 Tina 和 Ken 兩人想加入，所以現在是 30 − 5 + 2 = 27 人。",
  ["原本有幾個人報名？後來有幾個人不能去？", "又有誰說也想去？把人數加減算一算。"],
  {"A": "只減掉生病的 5 人（30 − 5），忘了加上 Tina 和 Ken。", "C": "30 是原本報名的人數，沒有考慮後來的變化。", "D": "只加上 Tina 和 Ken（30 + 2），忘了減掉生病的 5 人。"},
  "30 - 5 + 2 == 27", listen="""W: How many students are going to the science museum on Friday?
M: Thirty signed up, but five of them are sick now.
W: Oh, and Tina and Ken just told me they want to go, too.
M: OK, so I'll change the number.
N: Question: How many students will go to the science museum now?""")

# ---- 廣播 5 題 ----
Q("EN-8L-1", "announcement", 1, "Where will the school meeting be this morning?",
  ["On the playground.", "In their classrooms.", "In the gym.", "In the library."], "C",
  "廣播說「This morning's school meeting will be in the gym, not on the playground, because it's raining.」，因為下雨，朝會改在體育館，不在操場。",
  ["廣播說今天天氣怎麼樣？", "注意 in the gym, not on the playground 這一句。"],
  {"A": "廣播特別說 not on the playground，因為下雨不在操場。", "B": "廣播沒有說在教室開會。", "D": "廣播中沒有提到圖書館。"},
  None, listen="""N: Good morning, students. This morning's school meeting will be in the gym, not on the playground, because it's raining. Please go to the gym at ten o'clock. Thank you.
N: Question: Where will the school meeting be this morning?""")
Q("EN-8L-1", "announcement", 1, "Where should Leo's parents go?",
  ["To the toy store.", "To the third floor.", "To the restaurant on the first floor.", "To the service center on the first floor."], "D",
  "廣播說在三樓玩具店附近找到小男孩 Leo，並請「If you are Leo's parents, please come to the service center on the first floor.」，所以父母要去一樓的服務中心。",
  ["廣播在哪裡找到 Leo？", "注意 please come to... 後面請父母去的地方。"],
  {"A": "玩具店是找到 Leo 的地方，不是要父母去的地方。", "B": "三樓是找到 Leo 的樓層，服務中心在一樓。", "C": "樓層對了，但廣播說的是 service center（服務中心），沒有提到餐廳。"},
  None, listen="""N: Attention, please. We have found a little boy near the toy store on the third floor. His name is Leo, and he is wearing a yellow T-shirt. If you are Leo's parents, please come to the service center on the first floor. Thank you.
N: Question: Where should Leo's parents go?""")
Q("EN-8L-1", "announcement", 2, "Where are the people who hear this announcement?",
  ["On a plane.", "On a train.", "On a bus.", "On a boat."], "A",
  "廣播由 captain（機長）發出，說「We will arrive in Tokyo in about forty minutes」，並請乘客「stay in your seats and fasten your seatbelts」（留在座位上、繫好安全帶）。由機長廣播又要繫安全帶，可以推論是在飛機上。",
  ["廣播的人說自己是誰？", "廣播請乘客做什麼？哪種交通工具會要乘客繫安全帶？"],
  {"B": "火車的廣播不會由 captain 發出，也不會要乘客繫好安全帶。", "C": "公車是司機（driver）在開，不會有 captain 廣播。", "D": "船上雖然也有 captain，但不會要乘客留在座位上繫好安全帶。"},
  None, listen="""N: Good afternoon, passengers. This is your captain speaking. We will arrive in Tokyo in about forty minutes. The weather there is sunny, and the temperature is twenty degrees. Please stay in your seats and fasten your seatbelts.
N: Question: Where are the people who hear this announcement?""")
Q("EN-8L-1", "announcement", 2, "What do we know about the City Art Museum?",
  ["It is open every day, from Monday to Sunday.", "Students pay less if they show their student cards.", "It closes at nine p.m. from Tuesday to Sunday.", "Students can get in for free with their student cards."], "B",
  "廣播說「Students can get in for half price. Please show your student card at the ticket office.」，學生出示學生證可以半價，所以學生付比較少的錢。",
  ["博物館的開放時間是幾點到幾點？哪一天休息？", "學生有什麼優惠？要做什麼才能享有？"],
  {"A": "廣播說 We are closed on Mondays，星期一休館，不是每天開。", "C": "博物館是早上九點開、下午五點關，不是晚上九點關。", "D": "學生是半價（half price），不是免費。"},
  None, listen="""N: Welcome to the City Art Museum. The museum is open from nine a.m. to five p.m. from Tuesday to Sunday. We are closed on Mondays. Students can get in for half price. Please show your student card at the ticket office.
N: Question: What do we know about the City Art Museum?""")
Q("EN-8L-1", "announcement", 3, "What will students do this Friday?",
  ["Have Sports Day.", "Stay home and rest.", "Have the classes planned for next Wednesday.", "Bring their P.E. clothes to school."], "C",
  "廣播說運動會不在這星期五舉行，改到下星期三；「Classes on that Wednesday will move to this Friday.」，下星期三原本的課移到這星期五上，所以這星期五要上下星期三的課。",
  ["運動會原本是哪一天？改到哪一天？", "原本下星期三的課怎麼辦？移到了哪一天？"],
  {"A": "運動會已經改到下星期三，這星期五不舉行（will not be held this Friday）。", "B": "這星期五還是要上課，只是上的是下星期三的課，不是放假。", "D": "廣播要學生下星期三（運動會那天）帶運動服，不是這星期五。"},
  None, listen="""N: Attention, students. Because the playground is not ready yet, Sports Day will not be held this Friday. It will be held next Wednesday instead. Classes on that Wednesday will move to this Friday. Please bring your P.E. clothes next Wednesday.
N: Question: What will students do this Friday?""")

# ---- 留言 4 題 ----
Q("EN-8L-1", "message", 1, "Why did Mrs. Chen call Tom?",
  ["To ask Tom to walk her dog.", "To invite Tom to her garden party.", "To tell Tom his dog is sick.", "To tell Tom she has his dog."], "D",
  "陳太太說「I found your dog in my garden this morning. He's fine and he's with me now.」，她在花園找到 Tom 的狗，狗現在和她在一起，請 Tom 回家後來帶狗，所以留言是要告訴 Tom 狗在她那裡。",
  ["陳太太在哪裡發現了什麼？", "狗現在好不好？在誰那裡？"],
  {"A": "狗是 Tom 的（your dog），不是陳太太的，她也沒有請 Tom 遛狗。", "B": "聽到 garden 就以為是花園派對，但留言沒有邀請。", "C": "留言說 He's fine，狗很好，沒有生病。"},
  None, listen="""W: Hello, Tom. This is Mrs. Chen, your neighbor. I found your dog in my garden this morning. He's fine, and he's with me now. Please come and get him when you get home. Thank you.
N: Question: Why did Mrs. Chen call Tom?""")
Q("EN-8L-1", "message", 2, "What does Amy's dad ask her to do?",
  ["Do her homework and eat dinner without him.", "Cook dinner for her mom at six.", "Wait for him until nine for dinner.", "Go to a meeting with him."], "A",
  "爸爸說「Please start your homework first and don't wait for me for dinner.」，要 Amy 先寫功課，晚餐不用等他，所以是寫功課、不等他吃晚餐。",
  ["爸爸為什麼會晚回家？", "注意 Please... 和 don't... 這兩個要求。"],
  {"B": "六點是媽媽回家的時間，爸爸沒有要 Amy 煮晚餐。", "C": "爸爸說 don't wait for me for dinner，不要等他吃晚餐。", "D": "開會的是爸爸自己，沒有要 Amy 一起去。"},
  None, listen="""M: Hi, Amy. It's Dad. I'm going to be late tonight because I have a meeting. Mom will be home at six. Please start your homework first, and don't wait for me for dinner. I'll be home around nine.
N: Question: What does Amy's dad ask her to do?""")
Q("EN-8L-1", "message", 2, "What time should Mr. Wang arrive at the dentist's office?",
  ["At two thirty.", "At two forty.", "At two twenty.", "At two o'clock."], "C",
  "留言說看牙時間是「tomorrow at two thirty」，並請他「come ten minutes early」（提早十分鐘到）填表格，2:30 提早 10 分鐘是 2:20。",
  ["預約的時間是幾點？", "ten minutes early 是要提早還是延後？差幾分鐘？"],
  {"A": "兩點半是看診的時間，但留言要他提早十分鐘到。", "B": "把 early（提早）聽成延後，算成 2:40。", "D": "提早了三十分鐘，但留言只說提早十分鐘。"},
  None, listen="""W: Hello, this is Happy Dentist Office calling for Mr. Wang. Your appointment is tomorrow at two thirty. Please come ten minutes early to fill out a form. If you can't come, please call us at 2345-6789.
N: Question: What time should Mr. Wang arrive at the dentist's office?""")
Q("EN-8L-1", "message", 3, "What should Lucy bring to the class party?",
  ["Some fruit.", "The drinks.", "The cake.", "Some fruit and the drinks."], "B",
  "Jack 一開始請 Lucy 帶水果，但後來 Peter 不能來，所以改請 Lucy「bring the drinks instead」，而且說「I'll ask someone else about the fruit.」，水果會找別人帶，所以 Lucy 只要帶飲料。",
  ["Jack 一開始請 Lucy 帶什麼？後來發生了什麼事？", "注意 instead（改成）和最後一句水果要找誰帶。"],
  {"A": "水果是一開始的安排，後來改了，Jack 會請別人帶水果。", "C": "蛋糕是 Jack 自己要帶的（I'll bring the cake）。", "D": "Jack 說水果會問別人（ask someone else about the fruit），Lucy 不用兩樣都帶。"},
  None, listen="""M: Hi, Lucy. It's Jack. About the class party on Saturday: Peter will bring the drinks, and I'll bring the cake. Can you bring some fruit? Oh, wait. Peter just texted me. He can't come, so could you bring the drinks instead? I'll ask someone else about the fruit.
N: Question: What should Lucy bring to the class party?""")

# ============================ EN-9L-1 聽力：會考聽力綜合（九年級） ============================
# ---- 基本問答 4 題 ----
Q("EN-9L-1", "basic-response", 1, BASIC + "（在超商）",
  ["Yes, I'd like to go.", "No, it's not my bag.", "Yes, I bought it yesterday.", "No, thanks. I brought my own."], "D",
  "聽力原文是「Would you like a bag for your things?」（你的東西需要袋子嗎？），店員在提供袋子，No, thanks. I brought my own.（不用了，謝謝，我有自己帶）是有禮貌的拒絕，並說明原因。",
  ["店員是在問問題，還是在提供東西？", "Would you like...? 可以怎麼接受或婉拒？"],
  {"A": "把問句聽成 Would you like to go...?（想不想去），但店員問的是要不要袋子。", "B": "聽到 bag 以為在問袋子是不是你的。", "C": "用過去式說昨天買的，沒有回答現在要不要袋子。"},
  None, listen="""M: Would you like a bag for your things?""")
Q("EN-9L-1", "basic-response", 1, BASIC + "（午休時間）",
  ["Not yet. I've read only half of it.", "Yes, I'll finish it tomorrow.", "I lent it to you last week.", "No, I've already finished it."], "A",
  "聽力原文是「Have you finished reading the book I lent you?」（我借你的書看完了嗎？），用現在完成式問是否完成，Not yet. I've read only half of it.（還沒，我只看了一半）前後一致。",
  ["Have you finished...? 是在問什麼？", "Yes／No／Not yet 後面的話要和前面的意思一致。"],
  {"B": "說 Yes（看完了）卻說明天才會看完，前後矛盾。", "C": "書是對方借給你的，搞反了借出和借入的人。", "D": "說 No（沒看完）卻說已經看完了，前後矛盾。"},
  None, listen="""W: Have you finished reading the book I lent you?""")
Q("EN-9L-1", "basic-response", 2, BASIC + "（社團活動時）",
  ["Don't be afraid. It's not dangerous.", "That's all right. Hope everything is OK.", "Great. See you tomorrow, then.", "I'm afraid of dogs, too."], "B",
  "聽力原文是「I'm afraid I can't come to practice tomorrow.」，I'm afraid... 在這裡是「恐怕……」的委婉說法，對方是說明天不能來練習，適當的回應是表示沒關係並關心：That's all right. Hope everything is OK.",
  ["I'm afraid... 在這句話裡真的是「害怕」嗎？", "對方說明天不能來，你可以怎麼回應？"],
  {"A": "把 I'm afraid 當成「害怕」，但這裡是委婉的「恐怕」。", "C": "對方說明天不能來，回答「明天見」不合理。", "D": "把 afraid 當成「害怕」，又扯到怕狗，和不能來練習無關。"},
  None, listen="""M: I'm afraid I can't come to practice tomorrow.""")
Q("EN-9L-1", "basic-response", 2, BASIC + "（在旅館櫃檯）",
  ["It leaves every ten minutes.", "It's about thirty kilometers.", "About forty minutes by MRT.", "I'll go to the airport tomorrow."], "C",
  "聽力原文是「How long does it take to get to the airport from here?」（從這裡到機場要多久？），How long does it take 問花費的時間，所以回答 About forty minutes by MRT.（搭捷運大約四十分鐘）。",
  ["How long does it take... 問的是時間、距離還是頻率？", "回答要說出「需要多少時間」。"],
  {"A": "every ten minutes 是回答 How often（多久一班），不是要花多久。", "B": "thirty kilometers 是距離，回答的是 How far，不是 How long。", "D": "只說自己明天要去機場，沒有回答需要多少時間。"},
  None, listen="""W: How long does it take to get to the airport from here?""")

# ---- 對話推論 5 題 ----
Q("EN-9L-1", "dialogue-inference", 1, "Who is the woman most likely to be?",
  ["A teacher.", "A doctor.", "A cook.", "A police officer."], "B",
  "女士問「What seems to be the problem?」，男士說頭痛、發燒，女士幫他檢查（Open your mouth），說他感冒了，還告訴他藥一天吃三次，所以她最可能是醫生。",
  ["男士說自己哪裡不舒服？", "女士做了哪些事？誰會檢查身體、告訴你怎麼吃藥？"],
  {"A": "對話中沒有和上課有關的內容。", "C": "雖然有說到喝水、吃藥，但廚師不會幫人檢查身體。", "D": "警察不會幫人看病、開藥。"},
  None, listen="""W: Good morning. What seems to be the problem?
M: I've had a headache and a fever since last night.
W: Let me check. Open your mouth, please. Well, you have a cold. Take this medicine three times a day and drink lots of water.
N: Question: Who is the woman most likely to be?""")
Q("EN-9L-1", "dialogue-inference", 2, "What can we learn about the girl?",
  ["She doesn't like hiking.", "She will go hiking this Saturday.", "She has basketball practice on Saturday.", "She can't walk well right now."], "D",
  "女孩說「I'd love to, but I hurt my foot during basketball practice yesterday.」，她想去，但昨天練球時腳受傷了，可以推論她現在沒辦法好好走路，所以不能去爬山。",
  ["女孩想不想去爬山？", "她說自己哪裡受傷了？腳受傷會影響什麼？"],
  {"A": "女孩說 I'd love to，還說下次可以一起去，她是喜歡爬山的。", "B": "她腳受傷了，說 Maybe I can join you next time，這次不會去。", "C": "籃球練習是昨天（yesterday），對話沒有說星期六要練球。"},
  None, listen="""M: Do you want to go hiking with us this Saturday?
W: I'd love to, but I hurt my foot during basketball practice yesterday.
M: Oh, I'm sorry.
W: Maybe I can join you next time.
N: Question: What can we learn about the girl?""")
Q("EN-9L-1", "dialogue-inference", 2, "What does the woman think?",
  ["The man's ways of learning English work well.", "The man should watch more movies.", "The man's cousin speaks better English than him.", "English movies are too hard to understand."], "A",
  "女士先稱讚「your English has really improved」，男士說明他每週看英文電影、和加拿大的表哥練習說英文，女士回答「No wonder.」（難怪），表示她認為這些方法讓他進步，也就是他的學習方法很有效。",
  ["女士一開始怎麼評價男士的英文？", "No wonder. 是「難怪」的意思，女士覺得是什麼讓他進步？"],
  {"B": "女士沒有建議他多看電影，她是認同他已經在做的方法。", "C": "對話中沒有比較男士和表哥誰的英文比較好。", "D": "男士每週看英文電影而且進步了，女士沒有說電影太難。"},
  None, listen="""W: Wow, your English has really improved!
M: Thanks. I've watched an English movie every week, and I've practiced speaking with my cousin from Canada.
W: No wonder.
N: Question: What does the woman think?""")
Q("EN-9L-1", "dialogue-inference", 2, "What will the man probably do next?",
  ["Take this bus to the city hall.", "Walk to the train station.", "Cross the street to wait for Bus 25.", "Ask the bus driver for help."], "C",
  "男士想去火車站，女士說這班公車是去市政府的，「You need Bus 25. It stops across the street.」，男士道謝，所以他接下來最可能過馬路去等 25 號公車。",
  ["男士想去哪裡？這班公車會到嗎？", "女士建議他搭哪一班車？在哪裡搭？"],
  {"A": "這班公車去市政府，不到火車站，男士不會搭。", "B": "女士建議搭 25 號公車，沒有說要走路去。", "D": "女士已經告訴他要怎麼搭車了，不需要再問司機。"},
  None, listen="""M: Excuse me. Does this bus go to the train station?
W: No, this one goes to the city hall. You need Bus 25. It stops across the street.
M: Thank you very much.
N: Question: What will the man probably do next?""")
Q("EN-9L-1", "dialogue-inference", 3, "If they leave now, what time will they arrive at the concert?",
  ["At 7:05.", "At 7:30.", "At 7:35.", "At 7:20."], "D",
  "現在是 6:45，男士原本想搭計程車（20 分鐘），但女士說星期五晚上會塞車，改搭捷運，「It takes thirty-five minutes.」，男士同意現在出發，所以 6:45 + 35 分鐘 = 7:20 到達。",
  ["現在幾點？他們最後決定搭什麼交通工具？", "那種交通工具要花多久？從現在開始算。"],
  {"A": "用計程車的 20 分鐘來算（6:45 + 20），但他們最後決定搭捷運。", "B": "7:30 是演唱會開始的時間，不是到達的時間。", "C": "從 7:00 開始加 35 分鐘，但現在是 6:45。"},
  "6 * 60 + 45 + 35 == 7 * 60 + 20", listen="""W: Hurry up, Ken! The concert starts at seven thirty.
M: Don't worry. It's only six forty-five. It takes twenty minutes to get there by taxi.
W: But it's Friday night. The traffic will be terrible. Let's take the MRT. It's slower, but it's never late. It takes thirty-five minutes.
M: OK. Let's go now.
N: Question: If they leave now, what time will they arrive at the concert?""")

# ---- 廣播 3 題 ----
Q("EN-9L-1", "announcement", 1, "Where can people hear this announcement?",
  ["At a swimming pool.", "At a bookstore.", "At a train station.", "At a hospital."], "A",
  "廣播說「We will close in fifteen minutes. Please get out of the water and go to the changing rooms now.」，要大家離開水中（get out of the water）、去更衣室（changing rooms），還提醒別忘了毛巾，由這些線索可以推論是在游泳池聽到的。",
  ["廣播要大家離開哪裡、去哪裡？", "get out of the water、changing rooms 會在哪裡出現？"],
  {"B": "書店不會要人離開水中、去更衣室。", "C": "火車站的廣播會說班次和月臺，不會叫人離開水中。", "D": "醫院不會說要關門、請大家離開水中。"},
  None, listen="""N: Attention, please. We will close in fifteen minutes. Please get out of the water and go to the changing rooms now. Don't forget your towels. We will open again tomorrow at six a.m. Thank you.
N: Question: Where can people hear this announcement?""")
Q("EN-9L-1", "announcement", 2, "Which of the following is NOT allowed during the show?",
  ["Bringing a bottle of water.", "Sitting in your seat quietly.", "Taking photos of the singers.", "Arriving before eight fifteen."], "C",
  "廣播說「During the show, please turn off your cellphones and do not take pictures.」，表演中不能拍照，所以拍歌手的照片是不被允許的；廣播也說 Drinks are allowed，可以帶水。",
  ["廣播一共說了哪些規定？哪些可以、哪些不行？", "注意 do not... 後面接的事情。"],
  {"A": "廣播說 Drinks are allowed，可以帶飲料（水），不能帶的是食物。", "B": "安靜坐在位子上是看表演的正常行為，廣播沒有禁止。", "D": "表演延到 8:15 開始，提早到並沒有被禁止。"},
  None, listen="""N: Good evening, everyone. Tonight's show will start a little late, at eight fifteen instead of eight. During the show, please turn off your cellphones and do not take pictures. Drinks are allowed, but food is not. Thank you for your understanding.
N: Question: Which of the following is NOT allowed during the show?""")
Q("EN-9L-1", "announcement", 2, "What can passengers to Hong Kong do while they wait?",
  ["Take a different flight at 3:20.", "Get a free meal at Gate 21.", "Get on the plane at Gate 12 now.", "Get a free drink near Gate 12."], "D",
  "廣播說飛往香港的 3:20 班機因天氣不好延誤到 5:10，「Passengers on this flight can get a free drink at the coffee shop near Gate 12.」，所以乘客等待時可以到 12 號登機門附近拿免費飲料。",
  ["班機原本幾點？延到幾點？為什麼？", "廣播說乘客可以在哪裡得到什麼？"],
  {"A": "3:20 是原本的起飛時間，班機已經延誤了，沒有說可以換班機。", "B": "廣播說的是免費飲料（drink），不是餐點，而且是 Gate 12 不是 21。", "C": "12 號登機門附近是咖啡店，班機延誤到 5:10，現在還不能登機。"},
  None, listen="""N: Attention, all passengers. The three-twenty flight to Hong Kong has been delayed because of bad weather. The new time is five-ten. Passengers on this flight can get a free drink at the coffee shop near Gate 12. We're sorry for the trouble.
N: Question: What can passengers to Hong Kong do while they wait?""")

# ---- 留言 3 題 ----
Q("EN-9L-1", "message", 1, "What does Eric's mother want him to do?",
  ["Make lunch for her.", "Bring her wallet to her office.", "Pick her up at the bus stop.", "Look for her wallet in the office."], "B",
  "媽媽說「I left my wallet on the kitchen table. Could you bring it to my office before lunch?」，她把錢包忘在廚房桌上，請 Eric 在午餐前送到她的辦公室。",
  ["媽媽把什麼東西忘在哪裡？", "注意 Could you... 後面請 Eric 做的事。"],
  {"A": "before lunch 是送錢包的時間，媽媽沒有要他做午餐。", "C": "媽媽是要 Eric 搭公車去，不是去公車站接她。", "D": "錢包在家裡的廚房桌上，不用去辦公室找。"},
  None, listen="""W: Hi, Eric. It's Mom. I left my wallet on the kitchen table. Could you bring it to my office before lunch? Take the bus, and call me when you get to the building. Thanks, honey.
N: Question: What does Eric's mother want him to do?""")
Q("EN-9L-1", "message", 2, "Why did Max call?",
  ["To say the pizza will be late because of traffic.", "To tell the customer the price is higher.", "To ask the customer to choose a different pizza.", "To tell the customer the order is ready."], "C",
  "Max 說「we don't have any more mushroom pizzas today」，蘑菇披薩賣完了，可以改成起司或雞肉披薩，「Please call us back and tell us which one you want.」，所以他打電話是請客人改選別的披薩。",
  ["客人原本點了什麼披薩？店裡還有嗎？", "Max 請客人回電告訴他什麼？"],
  {"A": "留言中沒有提到塞車或送餐延誤。", "B": "Max 說 at the same price，價錢一樣，沒有變貴。", "D": "披薩要等客人回電後三十分鐘才會好，現在還沒做好。"},
  None, listen="""M: Hello, this is Max from Sunny Pizza. I'm sorry, but we don't have any more mushroom pizzas today. We can give you a cheese pizza or a chicken pizza at the same price. Please call us back and tell us which one you want. Your order will be ready thirty minutes after you call.
N: Question: Why did Max call?""")
Q("EN-9L-1", "message", 3, "What do we know about Mia's plan?",
  ["Mia will visit her grandfather on Sunday afternoon.", "Mia's dance contest is on Sunday afternoon.", "Mia will take the bus to visit her grandfather.", "Mia can't visit her grandfather this weekend."], "A",
  "Mia 說星期六有兩天的舞蹈比賽，不能去看爺爺；比賽「ends at noon on Sunday, so I can come that afternoon instead」，所以她改在星期天下午去看爺爺，而且是媽媽開車載她。",
  ["Mia 為什麼星期六不能去？比賽什麼時候結束？", "she can come that afternoon 的 that 指哪一天？她怎麼去？"],
  {"B": "比賽在星期天中午就結束了（ends at noon），星期天下午是去看爺爺的時間。", "C": "Mia 說 Mom will drive me there，是媽媽開車載她，不是搭公車。", "D": "她只是星期六不能去，星期天下午還是會去，週末仍會見到爺爺。"},
  None, listen="""W: Hi, Grandpa. It's Mia. I'm sorry, but I can't visit you this Saturday because I have a two-day dance contest. It ends at noon on Sunday, so I can come that afternoon instead. Mom will drive me there, and we'll stay for dinner. Please call me back if that time doesn't work for you.
N: Question: What do we know about Mia's plan?""")

# ---- 短文 3 題 ----
Q("EN-9L-1", "short-talk", 1, "What does Kevin do every morning?",
  ["He runs in the park.", "He runs by the river with his father.", "He joins a running race.", "He walks his dog in the park."], "A",
  "Kevin 說「Every morning, I get up at six and run in the park near my home for thirty minutes.」，他每天早上在家附近的公園跑步；和爸爸在河邊跑步是週末的事。",
  ["短文裡說了 Kevin 哪些不同時間做的事？", "注意 Every morning 後面接的活動和地點。"],
  {"B": "和爸爸在河邊跑步是週末（On weekends）的事，不是每天早上。", "C": "跑步比賽是下個月（Next month）才要參加的。", "D": "短文中沒有提到遛狗。"},
  None, listen="""N: My name is Kevin. I'm fifteen, and I live in Taichung. Every morning, I get up at six and run in the park near my home for thirty minutes. Running makes me feel healthy and happy. On weekends, I often run with my father by the river. Next month, we are going to join a running race together.
N: Question: What does Kevin do every morning?""")
Q("EN-9L-1", "short-talk", 2, "Why did Amy feel nervous at first?",
  ["She had never traveled by plane.", "She couldn't speak French.", "Sophie's family wasn't friendly.", "She got lost in France."], "B",
  "短文說「At first, Amy felt nervous because she couldn't speak French.」，because 後面說出原因：她不會說法語。後來 Sophie 的家人很親切，還教她法語單字。",
  ["Amy 去哪裡拜訪筆友？", "注意 felt nervous because... 後面的原因。"],
  {"A": "短文中沒有提到她沒搭過飛機。", "C": "短文說 Sophie's family was very kind，他們很親切。", "D": "短文中沒有提到她迷路。"},
  None, listen="""N: Last summer, Amy visited her pen pal, Sophie, in France. At first, Amy felt nervous because she couldn't speak French. But Sophie's family was very kind. They spoke English slowly to her and taught her some French words every day. Before she left, Amy could say "thank you" and "good night" in French. Now she wants to learn more French in high school.
N: Question: Why did Amy feel nervous at first?""")
Q("EN-9L-1", "short-talk", 3, "What is the main idea of this talk?",
  ["Lily's class sold new clothes at the school fair.", "Old clothes should all be given to children's homes.", "Shopping bags are better than plastic bags.", "Lily's class found useful ways to reuse old clothes."], "D",
  "短文說 Lily 的班級收集舊衣服：還很好的拿到園遊會賣，錢捐給兒童之家；太舊不能穿的剪開做成購物袋，最後幾乎沒有丟掉任何東西。整篇都在說他們把舊衣服重新利用的好方法，所以主旨是 Lily 的班級找到再利用舊衣的方法。",
  ["短文一開始提到很多人怎麼處理舊衣服？Lily 的班級有什麼不同？", "主旨要能包含整篇的內容，不能只是其中一個細節，也不能說錯細節。"],
  {"A": "園遊會賣的是收集來的舊衣服，不是新衣服。", "B": "衣服沒有全部捐出，捐的是賣衣服得到的錢，太舊的衣服做成了購物袋。", "C": "購物袋只是其中一個細節，短文也沒有和塑膠袋比較。"},
  None, listen="""N: Many people throw away old clothes when they don't want them anymore. But Lily's class found a better idea. They collected old clothes from students and parents. Clothes in good condition were sold at the school fair, and the money was given to a children's home. Clothes that were too old to wear were cut into pieces and made into shopping bags. In the end, almost nothing was thrown away.
N: Question: What is the main idea of this talk?""")
