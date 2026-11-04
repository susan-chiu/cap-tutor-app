# -*- coding: utf-8 -*-
"""英語聽力題庫第二批擴充（自編原創題，依 108 課綱；題型比照國中會考英語聽力的「基本問答」與「言談理解」，不含看圖題）"""
from fractions import Fraction as F
import math

SUBJECT = "english"
UNITS = []
QUESTIONS = []


def Q(unit, concept, difficulty, stem, options, answer, explanation, hints, wrong, check=None, listen=None):
    QUESTIONS.append(dict(unit=unit, concept=concept, difficulty=difficulty, stem=stem, options=options, answer=answer, explanation=explanation, hints=hints, wrong=wrong, check=check, listen=listen))


BASIC = "請聽一句話，選出最適當的回應。"

# ============================ EN-7L-1 聽力：基本問答與日常對話（七年級） ============================
# ---- 基本問答 8 題 ----
Q("EN-7L-1", "basic-response", 1, BASIC + "（新同學自我介紹後）",
  ["I'm fine, thank you.", "Nice to meet you, too.", "See you tomorrow.", "You're welcome, Daniel."], "B",
  "聽力原文是「Hi, I'm Daniel. I'm new in this class. Nice to meet you.」（嗨，我是 Daniel，我是這班的新同學，很高興認識你），第一次見面對方說 Nice to meet you，要回答 Nice to meet you, too.（我也很高興認識你）。",
  ["說話的人和你是第一次見面，還是老朋友？", "對方最後一句是打招呼的話，第一次見面時要怎麼回應同一句話？"],
  {"A": "I'm fine, thank you. 是回答 How are you?（你好嗎），對方並沒有問你好不好。", "C": "See you tomorrow. 是道別時說的，對方才剛和你打招呼、互相認識。", "D": "You're welcome. 是回應別人道謝，對方沒有說謝謝，只是聽到他的名字就選了。"},
  None, listen="""M: Hi, I'm Daniel. I'm new in this class. Nice to meet you.""")
Q("EN-7L-1", "basic-response", 1, BASIC + "（寫聯絡簿時）",
  ["It's Friday today.", "It's nine o'clock.", "It's May twentieth.", "It's sunny and warm."], "C",
  "聽力原文是「What's the date today?」（今天幾月幾日？），date 是「日期」，所以要回答月份和日子：It's May twentieth.（五月二十日）。",
  ["問句裡最重要的名詞是哪一個？", "date 和 day 意思不一樣，date 要回答幾月幾日。"],
  {"A": "把 date（日期）和 day（星期幾）搞混了，What day is it today? 才是問星期幾。", "B": "這是回答 What time is it?（幾點），問句問的不是時間。", "D": "這是回答天氣（What's the weather like?），和日期無關。"},
  None, listen="""W: What's the date today?""")
Q("EN-7L-1", "basic-response", 1, BASIC + "（和新同學聊天）",
  ["At seven thirty.", "With my sister.", "It's near the park.", "I usually walk."], "D",
  "聽力原文是「How do you go to school every day?」（你每天怎麼去上學？），How 在這裡問「方法、交通方式」，所以回答 I usually walk.（我通常走路去）。",
  ["問句開頭的疑問詞是什麼？", "How do you go to...? 想知道的是時間、同伴，還是去的方式？"],
  {"A": "這是回答 What time do you go to school?（幾點去），不是怎麼去。", "B": "這是回答 Who do you go with?（和誰一起去），沒有說出交通方式。", "C": "這是說學校的位置（Where is it?），問句沒有問學校在哪裡。"},
  None, listen="""M: How do you go to school every day?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（聊到家人時）",
  ["He's a bus driver.", "He's cooking dinner.", "He's tall and thin.", "He likes fishing."], "A",
  "聽力原文是「What does your father do?」（你爸爸是做什麼的？），What does he do? 是問職業，所以回答 He's a bus driver.（他是公車司機）。",
  ["問句用的是 does...do，還是 is...doing？", "What does your father do? 是問「此刻在做什麼」，還是問「他的工作」？"],
  {"B": "把 What does he do?（職業）聽成 What is he doing?（正在做什麼），所以回答正在煮晚餐。", "C": "這是回答 What does he look like?（他長什麼樣子），是外表不是職業。", "D": "這是回答 What does he like to do?（他喜歡做什麼），是興趣不是職業。"},
  None, listen="""W: What does your father do?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（下課時在走廊）",
  ["Yes, I can read them.", "Sure. I'll take some.", "Thanks for your help.", "No, they aren't mine."], "B",
  "聽力原文是「These books are so heavy. Can you help me?」（這些書好重，你可以幫我嗎？），對方請你幫忙搬書，最適當的回應是答應並幫他分擔：Sure. I'll take some.（當然，我來拿一些）。",
  ["說話的人遇到了什麼麻煩？", "Can you help me? 是請你幫忙，你可以怎麼答應他？"],
  {"A": "聽到 books 就想到讀書，但對方是說書很重、請你幫忙拿，不是問你會不會讀。", "C": "角色搞反了，是對方請你幫忙，該說謝謝的是對方，不是你。", "D": "對方沒有問書是不是你的，這樣回答也沒有回應他的請求。"},
  None, listen="""W: These books are so heavy. Can you help me?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（在寵物店）",
  ["Yes, I like them a lot.", "I have two cats at home.", "Dogs. They're friendly.", "They're in that big box."], "C",
  "聽力原文是「Which do you like better, cats or dogs?」（貓和狗你比較喜歡哪一個？），Which...better 要從兩個中選一個，所以回答 Dogs. They're friendly.（狗，牠們很友善），選出一個並說明原因。",
  ["問句開頭是 Which，表示要你做什麼？", "對方給了兩個選擇，回答要說出其中一個。"],
  {"A": "Which 開頭的問句不能用 Yes 回答，而且沒有說出比較喜歡哪一個。", "B": "只說家裡有兩隻貓，沒有說出比較喜歡哪一種；有養貓不代表就比較喜歡貓。", "D": "這是回答 Where are they?（牠們在哪裡），問句沒有問位置。"},
  None, listen="""M: Which do you like better, cats or dogs?""")
Q("EN-7L-1", "basic-response", 2, BASIC + "（媽媽在門口提醒）",
  ["Yes, I forgot it.", "No, I didn't.", "Sorry, I don't.", "OK, I won't."], "D",
  "聽力原文是「Don't forget to bring your raincoat.」（別忘了帶雨衣），這是提醒，回答 OK, I won't.（好，我不會忘的）表示自己會記得帶。won't 是跟著 Don't forget 的意思回答「不會忘記」。",
  ["媽媽是在問問題，還是在提醒你？", "Don't forget... 是「別忘了」，如果你會記得，要說「我會」還是「我不會」忘記？"],
  {"A": "forgot 表示已經忘了，但媽媽是在出門前提醒，雨衣還沒有忘記帶。", "B": "No, I didn't. 是回答過去式 Did you...? 的問句，媽媽沒有問過去的事。", "C": "Sorry, I don't. 是回答 Do you...? 的問句，沒有回應媽媽的提醒。"},
  None, listen="""W: Don't forget to bring your raincoat.""")
Q("EN-7L-1", "basic-response", 3, BASIC + "（在公車站等車）",
  ["Sure. It's ten past three.", "Sorry, I'm busy today.", "Yes, I have lots of time.", "I have a watch, too."], "A",
  "聽力原文是「Excuse me, do you have the time?」，多了 the 的 Do you have the time? 意思是「你知道現在幾點嗎？」，和 Do you have time?（你有空嗎）不同，所以回答時間：Sure. It's ten past three.（三點十分）。",
  ["注意 time 前面有沒有 the。", "在公車站，陌生人會問你有沒有空，還是問你現在幾點？", "Do you have the time? 和 What time is it? 意思很接近。"],
  {"B": "把 the time 聽成 time，以為對方問你有沒有空，所以說自己很忙。", "C": "同樣以為是問「有沒有空」，回答自己時間很多，沒有告訴對方幾點。", "D": "只說自己也有手錶，沒有告訴對方現在幾點，而且對方沒有說他有手錶。"},
  None, listen="""M: Excuse me, do you have the time?""")

# ---- 簡短對話 7 題 ----
Q("EN-7L-1", "dialogue-detail", 1, "Which one is Mike's sister?",
  ["The girl with long, straight hair.", "The girl with short hair and glasses.", "The girl with long hair and glasses.", "The girl with short hair and a big hat."], "B",
  "女孩問是不是長頭髮的那位，Mike 說「No, that's my cousin. My sister has short hair, and she wears glasses.」，長頭髮的是表姊妹，他的妹妹是短頭髮又戴眼鏡。",
  ["女孩猜的長頭髮女生是誰？", "Mike 說他妹妹有哪兩個特徵？兩個都要對才行。"],
  {"A": "長頭髮的女孩是 Mike 的 cousin（表姊妹），不是他妹妹。", "C": "眼鏡對了，但 Mike 的妹妹是短頭髮，長頭髮的是表姊妹。", "D": "短頭髮對了，但 Mike 說妹妹戴的是眼鏡（glasses），沒有提到帽子。"},
  None, listen="""W: Is this your family photo, Mike?
M: Yes. That's my sister.
W: The girl with long hair?
M: No, that's my cousin. My sister has short hair, and she wears glasses.
N: Question: Which one is Mike's sister?""")
Q("EN-7L-1", "dialogue-detail", 1, "What is the weather like now?",
  ["It's sunny and hot.", "It's cold and snowy.", "It's raining now.", "It's windy but dry."], "C",
  "男孩說「The ground is all wet, and people are using umbrellas.」，地上都濕了、大家都在撐傘，女孩也改成在家玩牌，可以推論外面正在下雨。",
  ["男孩叫女孩往窗外看，他看到了什麼？", "地上濕濕的、大家撐著傘，通常是什麼天氣？"],
  {"A": "大太陽不會讓地上全濕，他們也不會因此不出去打球。", "B": "對話沒有提到冷，臺灣一般也不會下雪，地上濕是因為下雨。", "D": "地上都是濕的（all wet），不可能是乾的。"},
  None, listen="""W: Let's go out and play basketball.
M: Look out the window. The ground is all wet, and people are using umbrellas.
W: Oh no. Then let's play cards at home.
N: Question: What is the weather like now?""")
Q("EN-7L-1", "dialogue-detail", 2, "What time does the boy's piano lesson start?",
  ["At four o'clock.", "At three thirty.", "At five o'clock.", "At four thirty."], "D",
  "Eric 說鋼琴課「starts thirty minutes after school」（放學後三十分鐘開始），女士確認學校四點放學，所以 4:00 再加 30 分鐘，鋼琴課是 4:30 開始。",
  ["學校幾點放學？", "鋼琴課是放學「之前」還是「之後」？差多少時間？"],
  {"A": "四點是放學的時間，鋼琴課要再晚三十分鐘。", "B": "把 after（之後）當成 before（之前），往前推了三十分鐘。", "C": "多加了一個小時，對話說的是 thirty minutes（三十分鐘）。"},
  "4 * 60 + 30 == 4.5 * 60", listen="""W: Do you have a piano lesson today, Eric?
M: Yes. It starts thirty minutes after school.
W: School is over at four, right?
M: Yes, so I need to hurry.
N: Question: What time does the boy's piano lesson start?""")
Q("EN-7L-1", "dialogue-detail", 2, "What will the girl do tonight?",
  ["Study for her test.", "Play video games.", "Take a math test.", "Watch a ball game."], "A",
  "Sandy 拒絕晚上打電動，因為「I have a math test tomorrow morning, and I'm not ready yet.」，明天早上要考數學、她還沒準備好，所以今晚她會唸書準備考試。",
  ["男孩邀 Sandy 做什麼？她答應了嗎？", "數學考試是今晚還是明天？她說自己準備好了沒？"],
  {"B": "打電動是男孩的邀請，但 Sandy 說 Sorry, I can't，沒有答應。", "C": "數學考試在明天早上（tomorrow morning），今晚還不是考試的時間。", "D": "對話中沒有提到看球賽。"},
  None, listen="""M: Do you want to play video games with me tonight, Sandy?
W: Sorry, I can't. I have a math test tomorrow morning, and I'm not ready yet.
M: OK. Good luck!
N: Question: What will the girl do tonight?""")
Q("EN-7L-1", "dialogue-detail", 2, "Why won't they eat at the noodle shop?",
  ["It's too far away from them.", "It isn't open today.", "The boy doesn't like noodles.", "The noodles there cost too much."], "B",
  "女孩說「But today is Monday. It never opens on Mondays.」，那家麵店星期一都不營業，而今天正好是星期一，所以他們不能去，改去新的三明治店。",
  ["女孩用 But 提出了什麼問題？", "今天星期幾？那家店星期幾不開？"],
  {"A": "麵店就在公園附近（near the park），對話沒有說太遠。", "C": "提議去吃麵的就是男孩，表示他喜歡吃麵。", "D": "對話中沒有提到麵店的價錢。"},
  None, listen="""M: I'm hungry. Let's have lunch at the noodle shop near the park.
W: But today is Monday. It never opens on Mondays.
M: Oh, right. Then let's try the new sandwich shop.
N: Question: Why won't they eat at the noodle shop?""")
Q("EN-7L-1", "dialogue-detail", 3, "When is Amy's birthday?",
  ["Next Tuesday.", "Next Thursday.", "Next Wednesday.", "Next Sunday."], "C",
  "Amy 說校外教學是下星期五，「my birthday is two days before that」，星期五往前兩天是星期三；男孩又說是英文考試（星期二）的隔天，星期二的後一天也是星期三，兩個線索都指向下星期三。",
  ["校外教學是星期幾？Amy 的生日比它早幾天還是晚幾天？", "再用英文考試的日期確認一次：the day after 是往前還是往後一天？"],
  {"A": "星期二是英文考試的日子，生日是考試的隔天。", "B": "星期五只往前推了一天，但 Amy 說的是 two days before（早兩天）。", "D": "把 before（之前）當成 after（之後），從星期五往後推了兩天。"},
  None, listen="""M: Amy, is your birthday next week?
W: Yes. Our school trip is next Friday, and my birthday is two days before that.
M: So it's the day after our English test?
W: That's right. The test is on Tuesday.
N: Question: When is Amy's birthday?""")
Q("EN-7L-1", "dialogue-detail", 3, "Which bus will the woman probably take?",
  ["Bus 13.", "Bus 30.", "Bus 3.", "Bus 40."], "A",
  "男士說 13 號和 30 號都到動物園，但 30 號剛開走、下一班要等四十分鐘；女士說等不了那麼久，男士建議「take the other one. It comes every ten minutes.」，另一班就是 13 號，所以她會搭 13 號公車。",
  ["哪兩班公車會到動物園？要分清楚 thirteen 和 thirty 的發音。", "哪一班剛開走、要等很久？the other one 指的是哪一班？"],
  {"B": "30 號剛開走，下一班要等四十分鐘，女士說 I can't wait that long。", "C": "只聽到 thir- 的部分，漏掉了 thirteen 後面的 -teen，對話中沒有 3 號公車。", "D": "把 forty minutes（四十分鐘）的 forty 當成公車號碼，其實那是等車的時間。"},
  None, listen="""W: Excuse me. Which bus goes to the zoo?
M: Bus 13 and Bus 30. But Bus 30 just left, and the next one comes in forty minutes.
W: Oh, I can't wait that long.
M: Then take the other one. It comes every ten minutes.
N: Question: Which bus will the woman probably take?""")

# ============================ EN-8L-1 聽力：言談理解（八年級） ============================
# ---- 基本問答 4 題 ----
Q("EN-8L-1", "basic-response", 1, BASIC + "（看到同學手上包著繃帶）",
  ["My arms are long and very strong.", "I'm going to wash it later.", "Yes, it happened last week.", "I fell off my bike yesterday."], "D",
  "聽力原文是「What happened to your arm?」（你的手臂怎麼了？），What happened 是問「發生了什麼事」，要說出受傷的經過：I fell off my bike yesterday.（我昨天騎腳踏車摔倒了）。",
  ["問句開頭是 What happened，想知道的是什麼？", "同學手上包著繃帶，你可以怎麼說明受傷的原因？"],
  {"A": "只描述手臂的樣子，沒有說發生了什麼事。", "B": "說等一下要洗，沒有回答手臂發生了什麼事。", "C": "What 開頭的問句不能用 Yes 回答，而且沒有說出發生了什麼。"},
  None, listen="""W: What happened to your arm?""")
Q("EN-8L-1", "basic-response", 1, BASIC + "（在餐桌上）",
  ["Of course. Here it is.", "Yes, I could pass it.", "It's too salty for me.", "No, I didn't pass it."], "A",
  "聽力原文是「Could you pass me the salt, please?」（可以請你把鹽遞給我嗎？），Could you...? 是客氣的請求，最適當的回應是答應並把鹽遞過去：Of course. Here it is.（當然，給你）。",
  ["Could you..., please? 是在問能力，還是在請你幫忙？", "別人請你遞東西時，遞過去的時候會說什麼？"],
  {"B": "聽到 Could you 就用 Yes, I could 回答，但這是請求不是問能力，而且沒有真的把鹽遞過去。", "C": "聽到 salt 就想到 salty（鹹），但對方是請你遞鹽，不是問你覺得鹹不鹹。", "D": "把 pass 想成「通過考試」，又用過去式回答，和遞鹽的請求無關。"},
  None, listen="""M: Could you pass me the salt, please?""")
Q("EN-8L-1", "basic-response", 2, BASIC + "（放假前一天）",
  ["Welcome back home!", "Have a good trip!", "It was a fun trip.", "Sorry to hear that."], "B",
  "聽力原文是「I'm leaving for Japan tomorrow morning.」（我明天早上要出發去日本），旅行還沒開始，適合祝對方旅途愉快：Have a good trip!",
  ["對方是要出發，還是已經回來了？", "leave for... 是「出發前往……」，對要去旅行的人可以說什麼祝福？"],
  {"A": "Welcome back 是對旅行回來的人說的，對方明天才要出發。", "C": "用過去式說旅行很好玩，但對方的旅行還沒開始。", "D": "這是聽到壞消息時表示遺憾，要出國旅行不是壞消息。"},
  None, listen="""W: I'm leaving for Japan tomorrow morning.""")
Q("EN-8L-1", "basic-response", 2, BASIC + "（早上在校門口）",
  ["I'm watching TV now.", "I'll call you tonight.", "I was taking a shower.", "Yes, I answered it."], "C",
  "聽力原文是「I called you at eight last night, but no one answered. What were you doing?」，What were you doing? 是過去進行式，問「昨晚八點那時你正在做什麼」，所以回答 I was taking a shower.（我那時正在洗澡），也說明了為什麼沒接電話。",
  ["問句的時間是現在、過去還是未來？", "What were you doing? 要用哪一種時態回答？"],
  {"A": "用現在進行式說「現在正在看電視」，但對方問的是昨晚八點的事。", "B": "說今晚會打給他，沒有回答昨晚那時在做什麼。", "D": "What 問句不能用 Yes 回答，而且對方說沒人接，說自己有接也互相矛盾。"},
  None, listen="""M: I called you at eight last night, but no one answered. What were you doing?""")

# ---- 對話細節 4 題 ----
Q("EN-8L-1", "dialogue-detail", 1, "What is the boy's problem?",
  ["He hurt his leg in a game.", "He lost his new sports shoes.", "His shoes are too big now.", "His shoes are too small now."], "D",
  "男孩說穿這雙鞋走路腳趾會痛，媽媽說「You grew so fast this year. Your feet are bigger now.」，他的腳變大了，所以鞋子變得太小、穿不下了。",
  ["男孩說哪裡會痛？什麼時候會痛？", "媽媽說他的腳怎麼了？腳變大了，鞋子會變得怎樣？"],
  {"A": "男孩說的是腳趾痛（my toes hurt），而且是因為鞋子，不是比賽受傷。", "B": "他正穿著這雙鞋（in these shoes），鞋子沒有不見。", "C": "腳變大了（feet are bigger），所以鞋子是變小，不是變大。"},
  None, listen="""M: Mom, my toes hurt when I walk in these shoes.
W: Let me see. You grew so fast this year. Your feet are bigger now.
M: Can we go shopping this weekend?
W: Sure.
N: Question: What is the boy's problem?""")
Q("EN-8L-1", "dialogue-detail", 2, "Who is the tallest of the three children?",
  ["Joe's brother.", "Joe himself.", "Joe's sister.", "Joe and his brother."], "A",
  "Joe 說去年他比弟弟（或哥哥）高，「but he grew a lot. Now he's taller than me.」，現在兄弟比 Joe 高；妹妹（或姊姊）是全家最矮的。所以三個孩子裡最高的是 Joe 的兄弟。",
  ["Joe 去年和現在，誰比較高？", "Joe 的姊妹在家裡是什麼樣的身高？把三個人排一排。"],
  {"B": "Joe 是「去年」比較高，現在兄弟已經比他高了（Now he's taller than me）。", "C": "Joe 說姊妹是 the shortest（最矮的），不是最高。", "D": "Joe 說兄弟現在比他高，兩人不是一樣高。"},
  None, listen="""W: Joe, are you taller than your brother?
M: I was last year, but he grew a lot. Now he's taller than me.
W: What about your sister?
M: She's the shortest in our family.
N: Question: Who is the tallest of the three children?""")
Q("EN-8L-1", "dialogue-detail", 2, "What does the girl want the boy to do?",
  ["Turn off the room lights.", "Make the music quieter.", "Help her with history.", "Play the music louder."], "B",
  "女孩說「can you turn down the music? I'm trying to study」，turn down 是「把音量調小」，男孩調整後她說 Much better，表示她要男孩把音樂調小聲一點。",
  ["女孩正在做什麼？什麼東西讓她不舒服？", "turn down 是把音量調大還是調小？"],
  {"A": "對話中沒有提到燈，女孩在意的是音樂。", "C": "history 是她要準備的考試科目，她沒有請男孩教她。", "D": "把 turn down（調小）想成 turn up（調大），意思剛好相反。"},
  None, listen="""W: Tom, can you turn down the music? I'm trying to study for my history test.
M: Oh, sorry. Is this OK?
W: Much better. Thanks.
N: Question: What does the girl want the boy to do?""")
Q("EN-8L-1", "dialogue-detail", 3, "When will they have dinner?",
  ["Right after the movie.", "At about eight o'clock.", "Before seven o'clock.", "At around nine o'clock."], "C",
  "電影七點開始、大約兩小時，所以九點才結束；但餐廳「closes at nine」，看完電影餐廳就關了，女孩說「we'd better eat first」，所以他們要在七點電影開始前吃晚餐。",
  ["電影幾點開始？演多久？幾點結束？", "餐廳幾點關門？看完電影還來得及嗎？", "女孩最後說 eat first，first 是指在什麼之前？"],
  {"A": "這是女孩一開始的提議，但電影九點才結束，餐廳九點就關門了。", "B": "八點左右他們正在看電影，不會去吃飯。", "D": "九點餐廳已經關門了，電影也才剛結束。"},
  "7 + 2 == 9", listen="""M: The movie starts at seven, and it's about two hours long.
W: Then let's have dinner at the Italian restaurant after the movie.
M: But that restaurant closes at nine.
W: Oh. Then we'd better eat first.
N: Question: When will they have dinner?""")

# ---- 廣播 4 題 ----
Q("EN-8L-1", "announcement", 1, "What does the announcement ask people to do?",
  ["Finish shopping and pay soon.", "Come back in ten minutes.", "Leave their bags at the door.", "Get a free gift at the counter."], "A",
  "廣播說商店再十分鐘就要關門，「Please take the things you want to buy to the checkout counters now.」，請顧客現在把要買的東西拿去結帳櫃檯，也就是盡快買完、付錢。",
  ["商店還有多久關門？", "Please... 後面請顧客把東西拿到哪裡？去那裡要做什麼？"],
  {"B": "ten minutes 是商店再十分鐘就關門，不是請大家十分鐘後再來。", "C": "廣播中沒有提到把包包放在門口。", "D": "聽到 counters 就以為是去櫃檯拿禮物，但結帳櫃檯是付錢的地方。"},
  None, listen="""N: Dear customers, our store will close in ten minutes. Please take the things you want to buy to the checkout counters now. We will open again at nine tomorrow morning. Thank you for shopping with us.
N: Question: What does the announcement ask people to do?""")
Q("EN-8L-1", "announcement", 2, "What will the weather be like in southern Taiwan tomorrow?",
  ["Cloudy in the morning, rainy later.", "Rainy and cool for the whole day.", "Sunny in the morning, rainy later.", "Clear skies and hot all day long."], "D",
  "氣象報告說「In the south, there will be no clouds all day, but it will be very hot.」，南部明天整天沒有雲（晴朗）、天氣很熱，氣溫可能到 34 度；早上多雲、下午下雨的是北部。",
  ["氣象報告分別說了哪兩個地區的天氣？", "注意 In the south 後面的內容，no clouds all day 是什麼樣的天空？"],
  {"A": "早上多雲、下午下雨是北部（Northern Taiwan）的天氣。", "B": "南部是很熱（very hot），不是涼爽，也沒有下雨。", "C": "南部整天都沒有雲，沒有說下午會下雨，把北部下午的雨套到南部了。"},
  None, listen="""N: Here is the weather report for tomorrow. Northern Taiwan will be cloudy in the morning, and it will start to rain in the afternoon. In the south, there will be no clouds all day, but it will be very hot. The temperature may go up to thirty-four degrees.
N: Question: What will the weather be like in southern Taiwan tomorrow?""")
Q("EN-8L-1", "announcement", 2, "What should students do if they want to join the singing contest?",
  ["Sign up at the school hall on May 10.", "Sign up at an office before Friday.", "Find three classmates to sing with.", "Practice in the school hall on Fridays."], "B",
  "廣播說「Students who want to join should sign up at the English teachers' office before this Friday.」，想參加的人要在這星期五前到英文老師辦公室報名；五月十日在禮堂是比賽的日期和地點。",
  ["廣播裡出現了哪兩個地點、哪兩個日期？各是什麼事情的？", "注意 should sign up... 後面報名的地點和期限。"],
  {"A": "五月十日、學校禮堂是比賽舉行的時間和地點，不是報名的地方。", "C": "每班只能派兩位同學（only two students），廣播是請大家先和同學討論，不是找三個人一起唱。", "D": "廣播中沒有說每週五要在禮堂練習，Friday 是報名截止的日子。"},
  None, listen="""N: Attention, students. The English singing contest will be held in the school hall on May tenth. Students who want to join should sign up at the English teachers' office before this Friday. Each class can send only two students, so talk with your classmates first.
N: Question: What should students do if they want to join the singing contest?""")
Q("EN-8L-1", "announcement", 3, "If it rains tomorrow, what will the students do?",
  ["Go to the mountain with their own lunch.", "Stay at school and have their classes.", "Visit a museum and eat lunch there.", "Visit a museum with their own lunch."], "C",
  "廣播說「If it rains, we will visit the science museum instead.」，下雨就改去科學博物館；還說「you don't need to bring lunch, because we will eat at the museum restaurant」，不用帶午餐，在博物館的餐廳吃。所以下雨時是去博物館並在那裡吃午餐。",
  ["原本的計畫是去哪裡？要帶什麼？", "If it rains 後面改成去哪裡？那時午餐要怎麼解決？", "選項要地點和午餐兩個部分都對。"],
  {"A": "去山上、自己帶午餐是「沒下雨」時的原本計畫。", "B": "廣播說下雨會改去博物館（instead），不是留在學校上課。", "D": "地點對了，但下雨時不用帶午餐（don't need to bring lunch），要在博物館餐廳吃。"},
  None, listen="""N: Good afternoon, Class 805. Tomorrow we are going to Yangmingshan. The bus will leave at seven thirty, so please come to school fifteen minutes before that. There are no stores on the mountain, so please bring your own lunch. If it rains, we will visit the science museum instead. In that case, you don't need to bring lunch, because we will eat at the museum restaurant.
N: Question: If it rains tomorrow, what will the students do?""")

# ---- 留言 3 題 ----
Q("EN-8L-1", "message", 1, "What does Ted's mom want him to do?",
  ["Go to the supermarket for her.", "Check the fridge and text her.", "Clean the fridge before dinner.", "Bring the list to the store."], "B",
  "媽媽說她在超市但忘了帶購物清單，「Can you look in the fridge and send me a message about what we need?」，請 Ted 看看冰箱裡缺什麼，再傳訊息告訴她。",
  ["媽媽現在在哪裡？她忘了什麼？", "注意 Can you... 後面請 Ted 做的兩件事。"],
  {"A": "媽媽自己已經在超市了，不需要 Ted 去。", "C": "媽媽是請 Ted 看冰箱裡缺什麼，不是打掃冰箱。", "D": "媽媽雖然忘了帶清單，但她是請 Ted 傳訊息，沒有要他把清單送過去。"},
  None, listen="""W: Hi, Ted. It's Mom. I'm at the supermarket now, but I forgot my shopping list at home. Can you look in the fridge and send me a message about what we need? Thanks, dear.
N: Question: What does Ted's mom want him to do?""")
Q("EN-8L-1", "message", 2, "What should the listener do before next Wednesday?",
  ["Return the book Ocean Animals.", "Pay for a new library card.", "Pick up the book she wanted.", "Call the library about the book."], "C",
  "圖書館說林小姐要的書「has come back. We will keep it for you until next Wednesday.」，書已經有人還回來了，館方幫她保留到下星期三，所以她要在那之前帶借書證去把書借走。",
  ["林小姐之前向圖書館要了什麼？", "has come back 是誰把書還回來？圖書館幫她保留到什麼時候？"],
  {"A": "has come back 是別人把書還回圖書館了，不是要林小姐還書。", "B": "留言是請她帶借書證來（bring your library card），不是辦新的。", "D": "留言中沒有要她回電，只要她來拿書。"},
  None, listen="""W: Hello, this is the City Library calling for Ms. Lin. The book you asked for, Ocean Animals, has come back. We will keep it for you until next Wednesday. Please bring your library card when you come. Thank you.
N: Question: What should the listener do before next Wednesday?""")
Q("EN-8L-1", "message", 3, "When and where will the two girls meet?",
  ["At 1:30 at the MRT station.", "At 4:00 at the MRT station.", "At 4:30 at the bookstore.", "At 4:00 at the bookstore."], "D",
  "Rita 說兩點那場賣完了，所以買了四點半的票，「Let's meet thirty minutes before the movie starts.」，4:30 提早 30 分鐘是 4:00；地點改成「the bookstore next to the theater, not at the MRT station」。所以四點在書店見面。",
  ["Rita 最後買的是幾點的電影？", "見面時間要比電影早多少？地點從哪裡改到哪裡？", "時間和地點兩個都要對。"],
  {"A": "用原本兩點的場次往前推三十分鐘，地點也還是原本的捷運站，兩個都沒有更新。", "B": "時間對了，但 Rita 說 not at the MRT station，地點改成書店了。", "C": "地點對了，但 4:30 是電影開始的時間，要提早三十分鐘見面。"},
  "4 * 60 + 30 - 30 == 4 * 60", listen="""W: Hi, Kate. It's Rita. About the movie tomorrow: the two o'clock show is sold out, so I bought tickets for the four thirty show. Let's meet thirty minutes before the movie starts. And let's meet at the bookstore next to the theater, not at the MRT station.
N: Question: When and where will the two girls meet?""")

# ============================ EN-9L-1 聽力：會考聽力綜合（九年級） ============================
# ---- 基本問答 3 題 ----
Q("EN-9L-1", "basic-response", 1, BASIC + "（頒獎典禮後）",
  ["Don't worry. You'll win next time.", "You're welcome. It's my pleasure.", "Thank you. I practiced a lot.", "I'm sorry. I didn't do well."], "C",
  "聽力原文是「Congratulations on winning first place in the speech contest!」（恭喜你演講比賽得第一名！），別人恭喜你時要道謝，所以回答 Thank you. I practiced a lot.（謝謝，我練習了很多次）。",
  ["Congratulations 是在安慰、道歉，還是恭喜？", "別人恭喜你得獎時，要怎麼回應？"],
  {"A": "這是安慰沒得獎的人說的話，但對方是在恭喜你得了第一名。", "B": "You're welcome. 是回應別人的道謝，對方是在恭喜你，不是謝謝你。", "D": "你得了第一名，說自己表現不好和事實不符。"},
  None, listen="""W: Congratulations on winning first place in the speech contest!""")
Q("EN-9L-1", "basic-response", 1, BASIC + "（逛街時遇到同學）",
  ["It was five hundred dollars.", "At a shop near my school.", "I bought it last Sunday.", "It's my favorite color."], "B",
  "聽力原文是「Your dress looks great. Where did you get it?」（你的洋裝很好看，在哪裡買的？），Where 問地點，所以回答 At a shop near my school.（在我學校附近的一家店）。",
  ["對方最後一句的疑問詞是什麼？", "Where did you get it? 要回答價錢、時間，還是地點？"],
  {"A": "這是回答 How much was it?（多少錢），不是在哪裡買。", "C": "這是回答 When did you buy it?（什麼時候買的），沒有說地點。", "D": "只說是自己最喜歡的顏色，沒有回答在哪裡買的。"},
  None, listen="""M: Your dress looks great. Where did you get it?""")
Q("EN-9L-1", "basic-response", 2, BASIC + "（拿到新制服時）",
  ["It looks nice, but it's too warm.", "I wear it on Mondays and Fridays.", "I'd like a bigger one, please.", "I got it from the school office."], "A",
  "聽力原文是「How do you like our new school uniform?」，How do you like...? 是問「你覺得……怎麼樣」，要說出感想，所以回答 It looks nice, but it's too warm.（很好看，但是太熱了）。",
  ["How do you like...? 是問喜不喜歡、覺得怎麼樣，還是問想要什麼？", "回答要說出你對新制服的看法。"],
  {"B": "這是回答 When do you wear it?（什麼時候穿），沒有說出感想。", "C": "把 How do you like 聽成 What would you like（想要什麼），回答要大一號的，是在店裡買東西的說法。", "D": "這是回答 Where did you get it?（從哪裡拿到的），沒有說覺得怎麼樣。"},
  None, listen="""W: How do you like our new school uniform?""")

# ---- 對話推論 4 題 ----
Q("EN-9L-1", "dialogue-inference", 1, "Where does this conversation most likely take place?",
  ["At a bookstore.", "At a train station.", "At a bank.", "At a post office."], "D",
  "女士說要把箱子寄給臺南的奶奶，男士幫忙秤重（Let me weigh it）、算郵資一百八十元，還請她寫上地址，說兩天會送到。寄包裹、秤重、寫地址，可以推論是在郵局。",
  ["女士想把箱子怎麼樣？", "秤重、算錢、寫收件人地址，這些事通常在哪裡做？"],
  {"A": "書店是買書的地方，不會幫人秤箱子、寫地址寄送。", "B": "火車站是買票搭車的地方，對話中沒有車票或班次。", "C": "銀行處理的是錢和帳戶，不會秤重寄箱子。"},
  None, listen="""W: Hi. I'd like to send this box to my grandmother in Tainan.
M: Sure. Let me weigh it first. It's two kilograms, so that's one hundred eighty dollars.
W: How soon will it get there?
M: In two days. Please write her address here.
N: Question: Where does this conversation most likely take place?""")
Q("EN-9L-1", "dialogue-inference", 2, "What is the relationship between the two speakers?",
  ["A doctor and a patient.", "A teacher and a student.", "A father and a daughter.", "A clerk and a customer."], "B",
  "Annie 稱對方 Mr. Lee，為沒交自然報告道歉；Mr. Lee 說其他同學（classmates）昨天都交了，還提醒下週要期末考。交報告、同學、期末考這些線索，表示兩人是老師和學生。",
  ["女孩為了什麼事情道歉？", "男士提到了 classmates 和 final exam，誰會說這些話？"],
  {"A": "對話中沒有看病、身體不舒服的內容。", "C": "女孩稱對方 Mr. Lee，女兒不會這樣稱呼爸爸，而且提到班上同學交報告。", "D": "對話中沒有買東西或付錢的內容。"},
  None, listen="""W: Mr. Lee, I'm sorry. I left my science report at home again.
M: That's the second time this month, Annie. All your classmates handed theirs in yesterday.
W: I'll bring it to your office tomorrow morning.
M: OK. And don't forget that the final exam is next week.
N: Question: What is the relationship between the two speakers?""")
Q("EN-9L-1", "dialogue-inference", 2, "How does the girl probably feel?",
  ["She is proud of her dance.", "She is excited about the result.", "She is upset about how she did.", "She is bored with dancing now."], "C",
  "Wendy 練了三個月，比賽時卻忘了舞步、站在那裡不動；男孩安慰她「Don't be so hard on yourself」，她說「I can't stop thinking about it」，一直想著這件事，可以推論她對自己的表現很難過、很在意。",
  ["Wendy 比賽時發生了什麼事？", "男孩為什麼要安慰她？她最後說一直在想這件事，表示心情如何？"],
  {"A": "她在比賽中忘了舞步，男孩還要安慰她，不會是覺得驕傲。", "B": "她一直想著自己的失誤，對結果並不興奮。", "D": "她練了三個月，是在意這次表現，不是對跳舞感到無聊。"},
  None, listen="""M: How was the dance contest yesterday, Wendy?
W: I practiced every day for three months, but in the middle of the dance, I forgot the steps. I just stood there.
M: Don't be so hard on yourself. Everyone makes mistakes.
W: I know, but I can't stop thinking about it.
N: Question: How does the girl probably feel?""")
Q("EN-9L-1", "dialogue-inference", 3, "Which phone case will the woman probably buy?",
  ["The white one.", "The red one.", "The black one.", "The blue one."], "A",
  "紅色最便宜但太大，不合手機；黑色剛好但要六百元，她只帶了五百元，買不起；白色合手機、四百五十元，錢也夠。男孩提醒她不喜歡白色，她說可以貼貼紙，表示這個缺點她能解決，所以她最可能買白色的。",
  ["三種手機殼各有什麼優點和缺點？", "她帶了多少錢？哪一個買得起又合手機？", "男孩提出的問題，她最後怎麼回應？"],
  {"B": "紅色雖然最便宜，但 it's too big for your phone，太大不合用。", "C": "黑色合手機，但要六百元，她只帶了五百元。", "D": "對話中沒有提到藍色的手機殼。"},
  "450 <= 500 < 600", listen="""W: Which phone case should I buy?
M: The red one is the cheapest, but it's too big for your phone. The black one fits well, but it's six hundred dollars.
W: I only brought five hundred. What about the white one? It fits, and it's four hundred fifty.
M: But you said you didn't like white things.
W: Well, I can put some stickers on it.
N: Question: Which phone case will the woman probably buy?""")

# ---- 廣播 3 題 ----
Q("EN-9L-1", "announcement", 1, "Who is this announcement for?",
  ["People waiting at an airport.", "People riding the MRT.", "People watching a movie.", "People shopping in a mall."], "B",
  "廣播說「The next station is City Hall. The doors on the left will open.」，還請要去動物園的人在這站換搭棕線（change to the Brown Line），並請大家握好扶手、讓座。下一站、左側開門、換線，可以推論是給搭捷運的乘客聽的。",
  ["廣播一開始說「下一個」什麼？", "換到另一條「線」、握好扶手、讓座，這是在什麼交通工具上？"],
  {"A": "機場的廣播會說班機和登機門，不會說下一站和換線。", "C": "看電影時不會有下一站、開門和讓座的廣播。", "D": "購物中心的廣播會說特價或樓層，不會說換搭某條線。"},
  None, listen="""N: The next station is City Hall. The doors on the left will open. Passengers going to the zoo, please change to the Brown Line at this station. Please hold the handrail and give your seat to people who need it.
N: Question: Who is this announcement for?""")
Q("EN-9L-1", "announcement", 2, "What will listeners hear at nine tonight?",
  ["The program Story Time.", "Tomorrow's weather report.", "Story Time and then a report.", "A report about a ball game."], "D",
  "廣播說今晚九點的節目 Story Time 不播（will not be on at nine），「Instead, we will bring you a special report on the high school basketball final.」，改播高中籃球決賽的特別報導，所以九點會聽到球賽的報導。",
  ["Story Time 平常幾點播？今晚會照常播嗎？", "Instead 後面說改播什麼？"],
  {"A": "廣播說 Story Time will not be on at nine，今晚九點不播。", "B": "廣播中沒有提到天氣預報。", "C": "Story Time 今晚不會播，要明天晚上才回來，不是先播故事再播報導。"},
  None, listen="""N: Thank you for listening to Happy Radio. Tonight, our program Story Time will not be on at nine as usual. Instead, we will bring you a special report on the high school basketball final. Story Time will be back tomorrow night at the same time.
N: Question: What will listeners hear at nine tonight?""")
Q("EN-9L-1", "announcement", 2, "What will happen if a visitor returns a bike at 6:30 p.m.?",
  ["The visitor will pay 100 dollars more.", "The visitor will pay 200 dollars more.", "The visitor can't rent bikes again.", "The visitor will get a free helmet."], "A",
  "廣播說腳踏車要在下午五點半前歸還，晚還「you will need to pay one hundred dollars for each extra hour」，每多一小時付一百元。六點半還車比五點半晚了一小時，所以要多付 100 × 1 = 100 元。",
  ["腳踏車要在幾點以前還？", "六點半比規定的時間晚了幾小時？每晚一小時要付多少錢？"],
  {"B": "把晚還的時間算成兩小時，五點半到六點半只差一小時。", "C": "廣播只說晚還要付錢，沒有說以後不能再租。", "D": "安全帽是全程都要戴的規定（wear a helmet at all times），不是送給遊客的禮物。"},
  "(18 * 60 + 30 - (17 * 60 + 30)) // 60 * 100 == 100", listen="""N: Welcome to the Lakeside Bike Path. You can rent bikes at the visitor center. Please wear a helmet at all times. All bikes must be returned by five thirty p.m. If you return your bike late, you will need to pay one hundred dollars for each extra hour.
N: Question: What will happen if a visitor returns a bike at 6:30 p.m.?""")

# ---- 留言 2 題 ----
Q("EN-9L-1", "message", 2, "What will Mr. Brown get because of the problem?",
  ["One more night at no cost.", "Free use of the pool on Monday.", "Two breakfasts at no cost.", "A cheaper room for Friday."], "C",
  "飯店說游泳池這個週末要維修、不能用，「To say sorry, we will give you breakfast for free on both mornings.」，為了表示歉意，他住的兩個早上都提供免費早餐，也就是兩頓不用錢的早餐。",
  ["飯店發生了什麼問題？", "To say sorry 後面，飯店說要給 Brown 先生什麼？", "both mornings 是幾個早上？"],
  {"A": "飯店沒有說要免費多住一晚，他訂的還是兩晚。", "B": "游泳池是維修中的設施，飯店沒有說星期一可以免費使用。", "D": "留言中沒有提到給他比較便宜的房間。"},
  None, listen="""W: Hello, Mr. Brown. This is Sunshine Hotel. You have a room with us for two nights, starting this Friday. I'm sorry to tell you that our swimming pool will be closed this weekend for repairs. To say sorry, we will give you breakfast for free on both mornings. If you have any questions, please call us at 2233-4455.
N: Question: What will Mr. Brown get because of the problem?""")
Q("EN-9L-1", "message", 3, "Which of the following is true according to Sam's message?",
  ["Ivy still has to finish the poster.", "The group will meet in the afternoon.", "Sam's laptop will be used for the work.", "They will meet at nine on Sunday morning."], "B",
  "Sam 說因為 Lisa 星期六不能來，改成星期天；圖書館九點開，但早上的讀書室都被訂走了，「so let's meet at one」，一點是下午，所以小組會在下午見面。另外 Sam 的筆電壞了、要 Ivy 帶，海報 Sam 已經做好了。",
  ["見面的日子為什麼從星期六改成星期天？", "九點是什麼的時間？他們最後約幾點？那是上午還是下午？", "再確認：誰的筆電壞了？海報做完了沒？"],
  {"A": "Sam 說 I've already finished it，海報他已經做好了，Ivy 不用再做。", "C": "Sam 說 mine is broken，他的筆電壞了，所以請 Ivy 帶她的。", "D": "九點是圖書館開門的時間，但早上的讀書室都被訂走了，他們約的是一點。"},
  None, listen="""M: Hi, Ivy. It's Sam. I'm calling about our group project. Lisa can't come on Saturday, so we'll meet on Sunday instead. The library opens at nine on Sundays, but all the study rooms are booked in the morning, so let's meet at one. Please bring your laptop, because mine is broken. And don't worry about the poster. I've already finished it.
N: Question: Which of the following is true according to Sam's message?""")

# ---- 短文 3 題 ----
Q("EN-9L-1", "short-talk", 1, "Why does Grace cook dinner on Sundays?",
  ["Her parents can't cook very well.", "She wants to be a cook someday.", "Her little brother asks her to.", "She wants to do something nice for her parents."], "D",
  "Grace 說爸媽星期一到星期六都工作得很辛苦，所以她每個星期天煮晚餐，「I want them to relax and enjoy a nice meal on their day off.」，她想讓爸媽在休假日好好休息、吃頓好飯，也就是為爸媽做一件貼心的事。",
  ["Grace 的爸媽平常怎麼樣？", "注意 I want them to... 這一句，她希望爸媽星期天怎麼樣？"],
  {"A": "短文說的是爸媽工作很辛苦，沒有說他們不會煮飯。", "B": "短文中沒有提到她以後想當廚師。", "C": "弟弟只是吃了還想再來一碗，並不是弟弟要她煮的。"},
  None, listen="""N: Hi, I'm Grace. I love cooking. My parents work very hard from Monday to Saturday, so every Sunday I cook dinner for my family. I want them to relax and enjoy a nice meal on their day off. Last Sunday, I made fried rice and tomato soup. My little brother asked for a second bowl!
N: Question: Why does Grace cook dinner on Sundays?""")
Q("EN-9L-1", "short-talk", 2, "What do Plant Club members do during summer vacation?",
  ["They go back to school to give the plants water.", "They meet twice a week after school.", "They sell vegetables at the fair.", "They plant tomatoes and carrots."], "A",
  "短文說暑假沒有上課，但植物還是需要水，「So members take turns coming to school to water them.」，社員輪流回學校幫植物澆水。每週二、四放學後照顧花園是上課期間的事，春天種菜、秋天賣菜也都不是暑假。",
  ["短文依照季節說了社團在不同時候做的事，暑假是哪一段？", "暑假沒有上課，植物需要什麼？社員怎麼安排？"],
  {"B": "每週二、四放學後是上課期間的活動，暑假沒有上課。", "C": "賣菜是秋天（In the fall）在學校園遊會的事。", "D": "種番茄和紅蘿蔔是春天（In spring）的事。"},
  None, listen="""N: Our school has a Plant Club. Every Tuesday and Thursday after school, club members take care of the school garden. In spring, we grow vegetables like tomatoes and carrots. In summer vacation, there are no classes, but the plants still need water. So members take turns coming to school to water them. In the fall, we sell our vegetables at the school fair and use the money to buy new tools.
N: Question: What do Plant Club members do during summer vacation?""")
Q("EN-9L-1", "short-talk", 3, "What does the speaker suggest students do?",
  ["Study late at night before a big test.", "Sleep less so they have time to review.", "Rest well and review early for tests.", "Review everything the night before a test."], "C",
  "短文先說很多學生以為熬夜讀書最好，再用 However 轉折：睡眠對學習很重要，睡覺時大腦會整理白天學的東西；睡不到七小時的學生上課容易累、容易忘。最後建議「review your lessons a few days early, and go to bed on time the night before」，也就是早點複習、考前好好睡覺。",
  ["短文一開始提到很多學生相信什麼？However 後面的說法一樣嗎？", "最後一句 So next time... 是作者的建議，他要學生做哪兩件事？"],
  {"A": "熬夜讀書是很多學生「以為」的方法，作者用 However 表示不同意。", "B": "作者說睡不到七小時的學生容易累、容易忘，不會建議少睡。", "D": "作者建議提早幾天複習（a few days early），考前一晚要準時睡覺，不是考前一晚才全部複習。"},
  None, listen="""N: Many students believe that studying late at night is the best way to get good grades. However, scientists have found that sleep plays an important part in learning. While we are sleeping, our brains organize what we learned during the day and help us remember it. Students who sleep less than seven hours often feel tired in class and forget things easily. So next time you have a big test, review your lessons a few days early, and go to bed on time the night before.
N: Question: What does the speaker suggest students do?""")
