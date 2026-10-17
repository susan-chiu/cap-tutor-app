# -*- coding: utf-8 -*-
"""英語困難題擴充題庫（自編原創題，依 108 課綱；difficulty 3，比照國中會考英語難題：情境對話、短文閱讀與多重文法整合）"""
from fractions import Fraction as F
import math

SUBJECT = "english"
UNITS = []   # 沿用 questions_english.py 的單元
QUESTIONS = []


def Q(unit, concept, difficulty, stem, options, answer, explanation, hints, wrong, check=None):
    QUESTIONS.append(dict(unit=unit, concept=concept, difficulty=difficulty, stem=stem,
                          options=options, answer=answer, explanation=explanation,
                          hints=hints, wrong=wrong, check=check))


# EN-7A-1 be 動詞與人稱代名詞（困難題）
Q('EN-7A-1', 'be-verb', 3,
  "Hi, I'm Rick. Welcome to my classroom! It is big and clean. Mr. Chen and Ms. Lee (1)＿＿＿ our teachers. Mr. Chen is our math teacher, and Ms. Lee is our English teacher. Mr. Chen is in the classroom now, but Ms. Lee (2)＿＿＿ here. She is in the teachers' office with some students.\n\nWhich is the best choice for (1) and (2)?",
  ["are; isn't", "is; isn't", "are; aren't", 'is; is'], 'A',
  "(1) 主詞 Mr. Chen and Ms. Lee 是兩個人，屬於複數，be 動詞用 are。(2) 前面說陳老師在教室，用 but 轉折，後面又說 She is in the teachers' office（她在教師辦公室），所以李老師「不在這裡」，主詞 Ms. Lee 是單數，否定用 isn't。",
  ['(1) 的主詞有幾個人？', 'but 前後的意思相同還是相反？李老師現在在哪裡？', "單數主詞的 be 動詞否定是 isn't 還是 aren't？"],
  {'B': '只看到靠近空格的 Ms. Lee，忽略 (1) 的主詞是 Mr. Chen and Ms. Lee 兩個人，要用複數 are。', 'C': "(2) 的主詞 Ms. Lee 只有一個人，否定要用單數的 isn't。", 'D': '(1) 主詞是兩個人要用 are；而且 but 表示轉折，後面又說她在辦公室，(2) 應該是「不在這裡」的否定。'},
  None)
Q('EN-7A-1', 'be-verb', 3,
  "Amy: Who are the people in this photo, Jack?\nJack: They're my grandparents. And the girl with the dog is my cousin, Nina.\nAmy: Are your grandparents from Taichung?\nJack: My grandfather (1)＿＿＿, but my grandmother (2)＿＿＿. She is from Hualien.\nAmy: Is Nina from Hualien, too?\nJack: No, she isn't. She's from Taipei.\n\nWhich is the best choice for (1) and (2)?",
  ["isn't; is", "are; aren't", "is; isn't", 'is; is'], 'C',
  "Amy 問爺爺奶奶是不是台中人。Jack 用 but 連接兩句，表示爺爺和奶奶的情況相反；下一句 She is from Hualien. 說明奶奶來自花蓮，所以奶奶「不是」台中人，爺爺「是」台中人。主詞 my grandfather、my grandmother 都是單數，所以 (1) 用 is（= is from Taichung），(2) 用 isn't。",
  ['She is from Hualien. 的 She 指的是誰？', '那麼爺爺和奶奶，誰是台中人？', '每一格的主詞是一個人還是兩個人？'],
  {'A': '把順序弄反了；Jack 說奶奶來自花蓮，所以不是台中人的是奶奶，不是爺爺。', 'B': "(1) 的 my grandfather 和 (2) 的 my grandmother 各自都只有一個人，要用單數 is / isn't。", 'D': 'but 表示前後相反，而且下一句說奶奶來自花蓮，所以 (2) 要用否定。'},
  None)
Q('EN-7A-1', 'pronoun', 3,
  "Ben: Is this your cap, Amy? It's on your desk.\nAmy: No, it isn't (1)＿＿＿. Mine is blue, and it's in my bag. Is it Mike's?\nBen: I don't think so. (2)＿＿＿ cap is red, and this one is green.\nAmy: Oh, then it's Jenny's. Jenny's seat is next to mine, and her cap is green.\n\nWhich is the best choice for (1) and (2)?",
  ['my; His', 'mine; His', 'mine; He', 'me; Him'], 'B',
  '(1) 空格後面沒有名詞，要用所有格代名詞 mine（= my cap），而且下一句 Mine is blue 也用同一個字。(2) 空格後面接名詞 cap，要用所有格形容詞；指的是 Mike（男生），所以是 His cap（他的帽子）。',
  ['(1) 空格後面還有名詞嗎？下一句用了哪個字表示「我的帽子」？', '(2) 空格後面接了什麼名詞？指的是男生還是女生？', '所有格形容詞後面要接名詞，所有格代名詞後面不接名詞。'],
  {'A': 'my 是所有格形容詞，後面一定要接名詞；(1) 後面沒有名詞，要用所有格代名詞 mine。', 'C': 'He 是主格，不能放在名詞 cap 前面表示「他的」。', 'D': 'me、Him 是受格，不能表示「我的」「他的」。'},
  None)
Q('EN-7A-1', 'pronoun', 3,
  "Hi, I'm Paul. These are my neighbors, Mr. and Mrs. Hill. They are from the U.S. Their son, Jack, is ten. He is a student at my sister's school. Jack and my sister are good friends. Their teacher is Ms. Lin. She is young and very funny, and her class is always fun.\n\nWho is Ms. Lin?",
  ["Paul's teacher", "Mr. and Mrs. Hill's daughter", "Jack's mother", "The teacher of Jack and Paul's sister"], 'D',
  '文中有兩個 Their。第一個 Their son 的 Their 指 Mr. and Mrs. Hill；第二個 Their teacher is Ms. Lin. 緊接在 Jack and my sister are good friends. 之後，所以 Their 指 Jack 和 Paul 的姊姊（妹妹）。因此林老師是 Jack 和 Paul 姊妹的老師。',
  ['文中出現了兩次 Their，分別在哪兩句？', 'Their teacher is Ms. Lin. 的前一句提到了哪兩個人？', '代名詞通常指最靠近、而且數量相符的名詞。'],
  {'A': '第二個 Their 指的是前一句的 Jack and my sister，文中沒有說 Paul 也是林老師的學生。', 'B': '把第一個 Their（Hill 夫婦）和第二個 Their 搞混了；Hill 夫婦的孩子是兒子 Jack。', 'C': 'Jack 的媽媽是 Mrs. Hill，不是林老師。'},
  None)
Q('EN-7A-1', 'reading-detail', 3,
  "Our school's sports day is this Friday. The running race is at 9:00 in the morning, and the basketball game is at 1:00 in the afternoon. My brother Ken is in the running race. My sister and I aren't in the race; we are on the basketball team. Mom and Dad are at work in the morning, but in the afternoon, they are at school with us.\n\nWhere are Mom and Dad at 1:00 on Friday?",
  ['At work', 'At the running race', 'At the basketball game', 'At home'], 'C',
  '文中說 Mom and Dad are at work in the morning, but in the afternoon, they are at school with us.（爸媽早上上班，下午和我們在學校）。下午 1 點學校進行的是籃球賽（the basketball game is at 1:00 in the afternoon），作者和姊妹都在籃球隊，所以爸媽下午 1 點在看籃球賽。',
  ['1:00 是上午還是下午？那時學校在比什麼？', '爸媽上午和下午分別在哪裡？', 'with us 的 us 是誰？他們參加哪一項比賽？'],
  {'A': '爸媽只有早上在上班，下午 1 點已經到學校了。', 'B': '賽跑在早上 9 點，那時爸媽還在上班；下午 1 點是籃球賽。', 'D': '文中說下午 they are at school with us，他們在學校，不在家。'},
  None)
Q('EN-7A-1', 'reading-detail', 3,
  "Hi, I'm Tina. Lily, Rose, and I are classmates in Class 703. Lily is twelve. Rose and I aren't twelve; we are thirteen. Rose and Lily are in the dance club, and I am in the music club. Rose is tall, and her hair is long. Lily is short, and her hair is short, too.\n\nWho is thirteen and in the dance club?",
  ['Rose', 'Tina', 'Lily', 'Lily and Rose'], 'A',
  "先找 13 歲的人：Rose and I aren't twelve; we are thirteen.，I 是 Tina，所以 Rose 和 Tina 是 13 歲。再找舞蹈社：Rose and Lily are in the dance club。兩個條件都符合的只有 Rose。",
  ['題目有兩個條件，先找出誰是 13 歲。', 'we are thirteen 的 we 指誰？', '再看誰在舞蹈社，兩個條件都符合的是誰？'],
  {'B': 'Tina 是 13 歲沒錯，但她在音樂社，不是舞蹈社。', 'C': 'Lily 在舞蹈社，但她只有 12 歲。', 'D': '她們兩人都在舞蹈社，但 Lily 是 12 歲，不符合「13 歲」這個條件。'},
  None)

# EN-7B-1 現在進行式與祈使句（困難題）
Q('EN-7B-1', 'present-progressive', 3,
  "Kate: Where's Dad? He usually (1)＿＿＿ the newspaper on the sofa after dinner.\nMom: Not tonight. Look! He (2)＿＿＿ the dishes in the kitchen.\nKate: Really? Why?\nMom: I'm not feeling well tonight, so he is helping me. Let's help him, too.\n\nWhich is the best choice for (1) and (2)?",
  ['is reading; washes', 'reads; is washing', 'reads; washes', 'read; is washing'], 'B',
  '(1) 有 usually（通常），說的是爸爸平常晚餐後的習慣，用現在簡單式；主詞 He 是第三人稱單數，所以是 reads。(2) 媽媽說 Not tonight. Look!，表示今晚和平常不同，而且動作正在發生，用現在進行式 is washing。',
  ['(1) 的句子裡有哪個頻率副詞？它說的是習慣還是現在？', 'Look! 提示 (2) 的動作是什麼時候發生的？', '主詞 He 用現在簡單式時，動詞要不要變化？'],
  {'A': '把兩格顛倒了：usually 說的是平常習慣，要用現在簡單式；Look! 才是正在發生。', 'C': 'Look! 表示動作此刻正在進行，(2) 要用現在進行式。', 'D': '主詞 He 是第三人稱單數，現在簡單式的動詞要加 s。'},
  None)
Q('EN-7B-1', 'present-progressive', 3,
  "It's a hot Sunday afternoon at the swimming pool. Look at the three boys over there. Two of them (1)＿＿＿ in the water, and the other one (2)＿＿＿ on a chair under a big umbrella. He is drinking some juice and reading a comic book. Their mothers are talking near the pool.\n\nWhich is the best choice for (1) and (2)?",
  ['is swimming; are sitting', 'are swiming; is siting', 'swim; sits', 'are swimming; is sitting'], 'D',
  'Look at... 表示正在看的畫面，要用現在進行式 be + V-ing（下一句 He is drinking 也是）。(1) 主詞 Two of them 是複數，用 are；swim 要重複 m 再加 ing。(2) 主詞 the other one 是單數，用 is；sit 要重複 t 再加 ing。',
  ['Look at... 和下一句 He is drinking 提示要用什麼時態？', 'Two of them 和 the other one 各是幾個人？', 'swim、sit 加 ing 時，字尾子音要不要重複？'],
  {'A': 'Two of them 是兩個人，要用 are；the other one 只有一個人，要用 is。', 'B': 'swim、sit 都是「短母音 + 單一子音」結尾，加 ing 前要重複字尾子音：swimming、sitting。', 'C': 'Look at... 表示眼前正在發生的動作，要用現在進行式，而且下一句也用 is drinking。'},
  None)
Q('EN-7B-1', 'imperative', 3,
  "City Library Rules\n1. Don't eat or drink near the computers.\n2. Talk quietly. People are reading.\n3. Put the books on the front desk after reading.\n\nA girl is drinking juice at a computer. She isn't talking, and her books are already on the front desk. What is the librarian probably saying to her?",
  ['Please take your juice outside.', 'Please talk quietly.', 'Please put the books on the front desk.', 'Please sit at the computer and drink.'], 'A',
  "女孩正在電腦旁喝果汁（is drinking juice at a computer），違反第 1 條 Don't eat or drink near the computers.。她沒有講話、書也已經放好，所以館員最可能用祈使句請她把果汁拿到外面：Please take your juice outside.",
  ['女孩現在正在做哪些事？', '把她的行為和三條規則一一對照，她違反了哪一條？', '館員要她做的事，應該能解決她違反的那條規則。'],
  {'B': '題目說她沒有在講話，沒有違反第 2 條規則。', 'C': '她的書已經放在服務台上了，沒有違反第 3 條規則。', 'D': '第 1 條規則說不可以在電腦旁邊吃喝，這句話剛好和規則相反。'},
  None)
Q('EN-7B-1', 'imperative', 3,
  "It's the first class of the day, and the students are noisy.\nMs. Wang: Good morning, class. Please be quiet and (1)＿＿＿ your books to page 20. Tim, you are talking to Joe again. (2)＿＿＿ talk in class. Listen to me, please.\nTim: Sorry, Ms. Wang. I'm listening now.\n\nWhich is the best choice for (1) and (2)?",
  ["opens; Don't", "open; Doesn't", "open; Don't", 'opening; Not'], 'C',
  "老師在下指令，用祈使句（原形動詞開頭）。(1) and 連接 be quiet 和另一個指令，兩者都是原形，所以是 open your books。(2) 老師要 Tim 不要在課堂上說話，否定祈使句是 Don't + 原形動詞：Don't talk in class.",
  ['老師說這些話是在描述事情，還是在要求學生做事？', 'and 前面的 be quiet 是什麼形式？後面的動詞要和它一樣嗎？', '否定的祈使句要用哪個字開頭？'],
  {'A': '祈使句用原形動詞，and 前面的 be quiet 是原形，後面的動詞也要用原形 open。', 'B': "祈使句沒有主詞，否定時用 Don't，不用第三人稱單數的 Doesn't。", 'D': '祈使句不能用 V-ing；否定祈使句也不能只用 Not 開頭。'},
  None)
Q('EN-7B-1', 'reading-detail', 3,
  "Dear Andy,\nI'm at Grandma's house now. She is sick, and I am taking care of her. Dad is working late tonight, so please make some noodles for dinner. Feed the cat at six, and don't open the door for strangers. Do your homework first, and then you can play video games. See you tomorrow morning!\nLove,\nMom\n\nWhich is NOT something Mom asks Andy to do?",
  ['Cook noodles for dinner', 'Feed the cat at six', 'Do homework before playing games', 'Visit Grandma tonight'], 'D',
  '媽媽用祈使句交代 Andy：煮麵當晚餐、六點餵貓、不要幫陌生人開門、先寫功課再玩遊戲。媽媽自己在奶奶家照顧奶奶，並沒有要 Andy 去探望奶奶，所以「今晚去看奶奶」不是媽媽要他做的事。題目問 NOT，選這一項。',
  ['題目問的是「沒有」要 Andy 做的事。', '把紙條裡以原形動詞開頭的句子都圈出來。', '在奶奶家的人是誰？媽媽有叫 Andy 過去嗎？'],
  {'A': '媽媽寫了 please make some noodles for dinner，這是她交代的事。', 'B': '媽媽寫了 Feed the cat at six，這是她交代的事。', 'C': 'Do your homework first, and then you can play video games. 就是先寫功課再玩遊戲，是媽媽交代的事。'},
  None)
Q('EN-7B-1', 'reading-detail', 3,
  "Dad: Hi, Jenny. Where are you?\nJenny: I'm at the bookstore with Lucy. We're looking for a dictionary for our English class.\nDad: Is your brother with you?\nJenny: No. He's at the park. He and his friends are playing basketball there.\nDad: OK. Please come home before six. We're having dinner at Grandma's house tonight. Don't be late!\n\nWhich is TRUE?",
  ['Jenny is playing basketball with Lucy.', "The family is having dinner at Grandma's house tonight.", "Jenny's brother is at the bookstore.", 'Lucy is buying a dictionary for Dad.'], 'B',
  "爸爸說 We're having dinner at Grandma's house tonight.，現在進行式也可以表示已經安排好的計畫，意思是今晚全家要去奶奶家吃晚餐。其他選項：Jenny 和 Lucy 在書店、哥哥（弟弟）在公園打籃球、字典是英文課要用的。",
  ['Jenny 和 Lucy 在哪裡？在做什麼？', 'Jenny 的兄弟在哪裡？', '爸爸最後提到今晚的什麼安排？'],
  {'A': 'Jenny 和 Lucy 在書店找字典；打籃球的是 Jenny 的哥哥（弟弟）和他的朋友。', 'C': "Jenny 說 No. He's at the park.，哥哥（弟弟）在公園。", 'D': '字典是她們英文課要用的，和爸爸無關。'},
  None)

# EN-7A-2 現在簡單式與頻率副詞（困難題）
Q('EN-7A-2', 'simple-present', 3,
  "My cousin Leo (1)＿＿＿ in Kaohsiung. He and his parents (2)＿＿＿ near a big park, so they often go jogging there in the morning. Leo's sister, Mia, doesn't go with them. She always sleeps late on weekends, and she doesn't like sports.\n\nWhich is the best choice for (1) and (2)?",
  ['live; lives', 'lives; lives', 'lives; live', 'living; live'], 'C',
  '這段話描述長期的事實和習慣，用現在簡單式。(1) 主詞 My cousin Leo 是第三人稱單數，動詞加 s：lives。(2) 主詞 He and his parents 是複數，動詞用原形 live。',
  ['這段文章說的是現在正在發生的事，還是平常的事實？', '(1) 和 (2) 的主詞分別是單數還是複數？', 'He and his parents 一共有幾個人？'],
  {'A': '把兩格顛倒了：(1) 主詞 Leo 是第三人稱單數要加 s，(2) 主詞是複數不加 s。', 'B': '(2) 的主詞是 He and his parents（三個人），是複數，動詞不加 s。', 'D': 'living 前面沒有 be 動詞，不能當句子的動詞。'},
  None)
Q('EN-7A-2', 'simple-present', 3,
  'Sue: (1)＿＿＿ you and your brother go to the same school?\nTom: No. I go to Sunshine Junior High School, but he (2)＿＿＿. He is only nine, so he goes to Hope Elementary School.\nSue: How does he get there?\nTom: My dad drives him there every morning.\n\nWhich is the best choice for (1) and (2)?',
  ["Do; doesn't", "Does; doesn't", "Do; don't", "Do; isn't"], 'A',
  "(1) 句中有一般動詞 go，疑問句要用助動詞；主詞 you and your brother 是複數，用 Do。(2) but he doesn't 是 but he doesn't go to Sunshine Junior High School 的省略，主詞 he 是第三人稱單數，用 doesn't。後面說他去 Hope Elementary School，可以印證是否定。",
  ['(1) 句子的動詞 go 是一般動詞還是 be 動詞？主詞有幾個人？', '(2) 省略了哪些字？他到底有沒有去 Sunshine Junior High？', 'he 用的助動詞否定是哪一個？'],
  {'B': '(1) 的主詞是 you and your brother 兩個人，是複數，要用 Do。', 'C': "(2) 的主詞 he 是第三人稱單數，否定要用 doesn't。", 'D': "(2) 要代替前面的一般動詞 go（他不去那所學校），要用助動詞 doesn't，不能用 be 動詞。"},
  None)
Q('EN-7A-2', 'frequency', 3,
  "Here is Amy's after-school plan:\nMonday: swimming\nTuesday: piano lesson\nWednesday: swimming\nThursday: piano lesson\nFriday: swimming\nSaturday: piano lesson and swimming\nSunday: nothing; she stays home with her family\n\nWhich is TRUE about Amy?",
  ['She never swims on weekends.', 'She has piano lessons four times a week.', 'She always goes swimming on Sundays.', 'She swims four times a week.'], 'D',
  '游泳的日子有星期一、三、五、六，共 4 天，所以一週游泳 4 次（four times a week）。鋼琴課是星期二、四、六，共 3 次；星期六有游泳，所以週末不是從不游泳；星期天在家。',
  ['分別數一數游泳和鋼琴課各有幾天。', '週末指的是哪兩天？', 'never 和 always 的意思分別是什麼？'],
  {'A': '星期六也有游泳，所以不是週末從不游泳。', 'B': '鋼琴課只有星期二、四、六，一週三次。', 'C': '星期天她什麼都不安排，待在家裡陪家人。'},
  None)
Q('EN-7A-2', 'frequency', 3,
  "Joe likes reading very much. He goes to the library on Mondays, Wednesdays, Thursdays, and Fridays. But he doesn't like sports. He goes to the gym only once a month with his father. So Joe (1)＿＿＿ goes to the library, but he (2)＿＿＿ goes to the gym.\n\nWhich is the best choice for (1) and (2)?",
  ['seldom; often', 'often; seldom', 'always; never', 'never; usually'], 'B',
  'Joe 一週有四天去圖書館，是「常常」去，用 often；健身房一個月只去一次，是「很少」去，用 seldom。always 表示每次都，never 表示從不，都和文章不符。',
  ['Joe 一週去幾次圖書館？一個月去幾次健身房？', 'but 前後的意思相同還是相反？', '比較 always、often、seldom、never 的頻率高低。'],
  {'A': '把兩格顛倒了：一週去四天圖書館是常常去，一個月才去一次健身房是很少去。', 'C': 'Joe 不是每天都去圖書館，不能用 always；一個月去一次健身房也不是 never（從不）。', 'D': 'Joe 一週去四次圖書館，不能說從不去；一個月一次健身房也不是「通常」。'},
  None)
Q('EN-7A-2', 'reading-detail', 3,
  "Hi, I'm Kenji. I live in Osaka with my parents and my grandma. My father works at a bank, and my mother teaches art at a high school. Every morning, my grandma gets up at five and takes a walk in the park. I get up at six thirty and have breakfast with my parents. On weekends, my father and I often go fishing, but my mother never goes with us. She doesn't like fish! She usually paints at home.\n\nWhich is TRUE about Kenji's family?",
  ["Kenji's grandma gets up before Kenji.", "Kenji's mother often goes fishing on weekends.", "Kenji's father is an art teacher.", 'Kenji goes fishing with his mother on weekends.'], 'A',
  '奶奶每天早上 5 點起床，Kenji 6 點半起床，所以奶奶比 Kenji 先起床。媽媽從不去釣魚（never goes with us）、教美術的是媽媽、和 Kenji 去釣魚的是爸爸。',
  ['奶奶和 Kenji 各是幾點起床？', '週末誰和 Kenji 去釣魚？媽媽做什麼？', '誰在銀行工作？誰教美術？'],
  {'B': '文中說 my mother never goes with us，媽媽從不去釣魚。', 'C': '爸爸在銀行工作，教美術的是媽媽。', 'D': '週末和 Kenji 去釣魚的是爸爸，媽媽在家畫畫。'},
  None)
Q('EN-7A-2', 'reading-detail', 3,
  'Bus 25: City Hall to Sunny Zoo\nWeekdays: every 30 minutes, from 6:00 a.m. to 9:00 p.m.\nWeekends: every 20 minutes, from 7:00 a.m. to 10:00 p.m.\nThe trip takes 40 minutes.\n\nIt is Saturday. Amy gets to City Hall at 7:10 a.m. and takes the next Bus 25. What time does she get to Sunny Zoo?',
  ['7:50 a.m.', '8:10 a.m.', '8:00 a.m.', '7:40 a.m.'], 'C',
  '星期六是週末，公車從 7:00 開始每 20 分鐘一班：7:00、7:20、7:40……。Amy 7:10 到站，下一班是 7:20。車程 40 分鐘，7:20 + 40 分鐘 = 8:00，所以她 8:00 a.m. 到動物園。',
  ['星期六要看平日還是週末的時刻？', '週末的公車幾點開始、多久一班？7:10 之後的下一班是幾點？', '搭上車以後還要再坐多久？'],
  {'A': '以為 7:10 剛好有車，直接加 40 分鐘；但週末的車是 7:00、7:20……，7:10 沒有車。', 'B': '用了平日每 30 分鐘一班的時刻（7:30），但今天是星期六。', 'D': '只算到搭上 7:20 的車再加 20 分鐘，把車程 40 分鐘看錯了。'},
  None)

# EN-7B-2 過去簡單式（困難題）
Q('EN-7B-2', 'past-tense', 3,
  'Every Sunday, my parents and I (1)＿＿＿ breakfast at home. Dad makes eggs, and Mom makes tea. But last Sunday was different. We (2)＿＿＿ to a new restaurant near the station, and we ate sandwiches there. The food was good, but it was a little expensive.\n\nWhich is the best choice for (1) and (2)?',
  ['had; went', 'have; go', 'had; go', 'have; went'], 'D',
  '(1) Every Sunday 表示平常的習慣，用現在簡單式；主詞 my parents and I 是複數，用 have。(2) But last Sunday was different. 說明上星期天和平常不同，是過去的事，go 的過去式是 went；後面的 ate 也是過去式。',
  ['(1) 和 (2) 各有什麼時間詞？', 'Every Sunday 說的是習慣還是過去某一天？', 'go 的過去式是什麼？'],
  {'A': '(1) 有 Every Sunday，說的是每週的習慣，要用現在簡單式，後一句 Dad makes eggs 也是現在式。', 'B': '(2) 有 last Sunday，是過去發生的事，要用過去式 went。', 'C': '兩格的時態都弄反了：習慣用現在式，上星期天的事用過去式。'},
  None)
Q('EN-7B-2', 'past-tense', 3,
  "Lily: (1)＿＿＿ you at Mark's birthday party last night? I didn't see you there.\nJoe: No. I (2)＿＿＿ go. I had a fever, so I stayed in bed all night.\nLily: Oh, I'm sorry to hear that. Are you OK now?\nJoe: Yes, I'm fine today. Thanks.\n\nWhich is the best choice for (1) and (2)?",
  ["Did; didn't", "Were; didn't", "Were; wasn't", "Was; didn't"], 'B',
  "(1) Were you at the party? 問「你昨晚在不在派對上」，句中沒有一般動詞，用 be 動詞；last night 是過去，主詞 you 用 Were。(2) 空格後面是原形動詞 go，一般動詞的過去式否定是 didn't + 原形：I didn't go.",
  ['(1) 句子裡有一般動詞嗎？「在某地」要用哪一種動詞？', 'you 的 be 動詞過去式是什麼？', '(2) 空格後面的 go 是什麼動詞？否定要借什麼？'],
  {'A': '(1) 句中沒有一般動詞（at the party 是「在」派對），要用 be 動詞發問。', 'C': "(2) 後面接的是一般動詞 go，否定要用 didn't，不能用 be 動詞。", 'D': '主詞 you 的 be 動詞過去式是 were，不是 was。'},
  None)
Q('EN-7B-2', 'irregular-verb', 3,
  "Yesterday morning, Jack (1)＿＿＿ his bike to school as usual. On the way, a dog suddenly ran into the street, and Jack (2)＿＿＿ off his bike. He hurt his leg, so his teacher took him to the nurse's office. Luckily, it wasn't serious.\n\nWhich is the best choice for (1) and (2)?",
  ['rided; fell', 'rode; falled', 'rode; fell', 'rides; falls'], 'C',
  "Yesterday morning 是過去時間，兩格都要用過去式。ride（騎）是不規則動詞，過去式是 rode；fall（跌落）也是不規則動詞，過去式是 fell，fall off one's bike 是「從腳踏車上摔下來」。",
  ['文章第一個時間詞是什麼？', 'ride 和 fall 是規則動詞還是不規則動詞？', '它們的過去式分別怎麼寫？'],
  {'A': 'ride 是不規則動詞，過去式是 rode，不是加 d。', 'B': 'fall 是不規則動詞，過去式是 fell，不是加 ed。', 'D': 'Yesterday morning 是過去時間，要用過去式，文中的 ran、hurt、took 也都是過去式。'},
  None)
Q('EN-7B-2', 'irregular-verb', 3,
  "Read Tom's diary.\nMonday, June 3\nThis morning I woke up late. I ran to the bus stop, but I didn't catch the bus. So Mom drived me to school. At lunch, I bought a sandwich and ate it with my friends. In the afternoon, I felt tired, but I was happy because we won the basketball game.\n\nWhich verb in the diary is NOT correct?",
  ['drived', 'woke', 'bought', 'felt'], 'A',
  "drive（開車）是不規則動詞，過去式是 drove，不能加 d 寫成 drived。woke（wake）、bought（buy）、felt（feel）都是正確的不規則動詞過去式。另外 didn't catch 的 catch 在 didn't 後面用原形，也是正確的。",
  ['日記寫的是過去的事，每個動詞都應該是過去式。', '逐一想出每個選項的原形動詞。', 'drive、wake、buy、feel 哪一個的過去式不是這樣寫？'],
  {'B': 'wake 的過去式就是 woke，是正確的。', 'C': 'buy 的過去式就是 bought，是正確的。', 'D': 'feel 的過去式就是 felt，是正確的。'},
  None)
Q('EN-7B-2', 'reading-detail', 3,
  "Last Saturday was a busy day for Mia. After lunch, she went to the bookstore and bought a birthday card for her friend Rose. Before that, she cleaned her room and washed her clothes in the morning. In the evening, she went to Rose's birthday party and gave her the card. Rose loved it.\n\nWhat is the right order of the things Mia did?",
  ['bought a card → cleaned her room → went to a party', 'cleaned her room → bought a card → went to a party', 'went to a party → bought a card → cleaned her room', 'cleaned her room → went to a party → bought a card'], 'B',
  '文中的時間線索：in the morning 打掃房間、洗衣服；After lunch 去書店買卡片；In the evening 去派對。Before that 指「在買卡片之前」，所以順序是：打掃房間 → 買卡片 → 去派對。',
  ['文章的敘述順序就是事情發生的順序嗎？', 'Before that 的 that 指的是哪件事？', '把 in the morning、after lunch、in the evening 對應的事情排好。'],
  {'A': '照文章出現的先後排列，沒注意 Before that（在那之前）表示打掃是更早的事。', 'C': '把整個順序顛倒了；派對是在晚上。', 'D': '卡片是在派對上送給 Rose 的，一定是先買卡片再去派對。'},
  None)
Q('EN-7B-2', 'reading-detail', 3,
  "Ben: How was your trip to Hualien, Amy?\nAmy: Not so good. It rained for the first three days, so we stayed in the hotel most of the time.\nBen: Oh, no! Did you go to Taroko?\nAmy: Yes, but only on the last day. The sun finally came out that day, and we took a lot of pictures there.\nBen: Well, at least you saw Taroko.\n\nWhich is TRUE about Amy's trip?",
  ['She enjoyed every day of the trip.', 'It rained every day during the trip.', "She didn't take any pictures in Hualien.", 'She visited Taroko when the weather was good.'], 'D',
  'Amy 說只有最後一天去了太魯閣，而且 The sun finally came out that day（那天終於出太陽），所以她是在天氣好的時候去太魯閣。前三天下雨，所以不是每天都下雨，她也不是每天都玩得開心。',
  ['Amy 覺得這趟旅行怎麼樣？', '雨下了幾天？最後一天天氣如何？', '她哪一天去太魯閣？那天她做了什麼？'],
  {'A': 'Amy 一開始就說 Not so good，前三天下雨只能待在飯店。', 'B': '只有前三天下雨，最後一天出太陽了。', 'C': '她說在太魯閣 took a lot of pictures（拍了很多照片）。'},
  None)

# EN-8A-1 未來式與助動詞（困難題）
Q('EN-8A-1', 'future-tense', 3,
  "Dad: Look at the sky! It's so dark.\nAmy: Yes, and the wind is getting strong. It (1)＿＿＿ rain soon.\nDad: Then we (2)＿＿＿ take our umbrellas with us. I don't want to get wet.\nAmy: OK. I'll get them. They're next to the door.\n\nWhich is the best choice for (1) and (2)?",
  ['is going to; should', 'is going; should', "is going to; shouldn't", 'goes to; should'], 'A',
  '(1) 天色很暗、風變大，根據眼前跡象判斷「快要下雨」，用 be going to + 原形：It is going to rain soon.。(2) 爸爸不想淋濕，所以建議「應該帶傘」，給建議用 should + 原形。',
  ['(1) 說話者根據什麼判斷天氣？soon 表示什麼時候？', 'be going to 的三個部分是什麼？', '爸爸說不想淋濕，他會建議帶傘還是不帶？'],
  {'B': 'be going to 表示未來時三個部分缺一不可，少了 to。', 'C': '爸爸說不想淋濕，「不應該帶傘」前後矛盾。', 'D': 'goes to 是「去到某地」，不能表示「即將下雨」。'},
  None)
Q('EN-8A-1', 'future-tense', 3,
  "Ken: Are you free tomorrow, Rose? Let's go to the movies.\nRose: Sorry, I can't. I (1)＿＿＿ my grandparents in Tainan tomorrow. I (2)＿＿＿ the train ticket last week.\nKen: That's OK. Have a good time there!\nRose: Thanks. Maybe we can go next weekend.\n\nWhich is the best choice for (1) and (2)?",
  ['visited; bought', 'am going to visit; will buy', 'going to visit; bought', 'am going to visit; bought'], 'D',
  '(1) tomorrow 是未來，而且是已經計畫好的事，用 be going to + 原形：I am going to visit。(2) last week 是過去，車票上週已經買了，用過去式 bought（buy 的過去式）。',
  ['(1) 和 (2) 的時間詞分別是什麼？', '明天要做的事用什麼時態？上週做的事呢？', 'be going to 需要哪三個部分？'],
  {'A': '(1) 有 tomorrow，是未來的事，不能用過去式。', 'B': '(2) 有 last week，車票是上週已經買好的，要用過去式。', 'C': 'be going to 少了 be 動詞 am。'},
  None)
Q('EN-8A-1', 'modal-verb', 3,
  "Swimming Pool Rules\n- You must take a shower before you swim.\n- You must wear a swimming cap.\n- Children under 10 must swim with an adult.\n- You don't have to bring a towel. We have towels for you.\n- You can't eat in the pool area.\n\nTed is 12 years old. He wants to swim here. What must he do?",
  ['Bring his own towel', 'Take a shower before swimming', 'Swim with his father', 'Eat his lunch in the pool area'], 'B',
  "規則第一條 You must take a shower before you swim.，所有人游泳前都必須淋浴。毛巾是 don't have to（不必）帶；和大人一起游只限 10 歲以下；泳池區 can't（不可以）吃東西。",
  ['題目問的是 Ted「必須」做的事，要找 must 的規則。', 'Ted 12 歲，哪一條 must 的規則不適用於他？', "don't have to 和 can't 分別是什麼意思？"],
  {'A': "規則說 You don't have to bring a towel，是「不必」帶，游泳池有提供。", 'C': '只有 10 歲以下的小孩必須和大人一起游，Ted 已經 12 歲。', 'D': "規則說 You can't eat in the pool area，是禁止的事。"},
  None)
Q('EN-8A-1', 'modal-verb', 3,
  "Visitor: Excuse me. Is the museum still open?\nClerk: Yes, it is. You can look at the paintings, but you (1)＿＿＿ touch them. They are very old.\nVisitor: I see. How much is a ticket for my son? He's five.\nClerk: Oh, you (2)＿＿＿ buy a ticket for him. Children under six get in free.\n\nWhich is the best choice for (1) and (2)?",
  ["don't have to; mustn't", 'must; have to', "mustn't; don't have to", "mustn't; must"], 'C',
  "(1) 畫作很古老，可以看但「不可以」摸，表示禁止用 mustn't。(2) Children under six get in free.（六歲以下免費），兒子五歲，所以「不必」買票，用 don't have to。注意 mustn't 是禁止，don't have to 是不必。",
  ['(1) 畫很古老，參觀者可以摸嗎？', '(2) 兒子幾歲？幾歲以下可以免費入場？', '「禁止」和「不必」在英文裡分別怎麼說？'],
  {'A': "把兩格弄反了：古畫「禁止」觸摸用 mustn't；小孩免費是「不必」買票，用 don't have to。", 'B': '畫很古老，「必須摸」不合理；小孩免費也不需要買票。', 'D': '店員說六歲以下免費入場，「必須買票」前後矛盾。'},
  None)
Q('EN-8A-1', 'reading-detail', 3,
  "Hi Jason,\nNext Saturday is Grandpa's 70th birthday. We're going to have a party at his house. Mom will make a big cake, and Dad will cook Grandpa's favorite fish. Can you come at 5:00 and help me put up the balloons? The party will start at 6:30. Don't tell Grandpa about it! It's a surprise.\nKelly\n\nWhich is TRUE?",
  ['Grandpa knows about the party.', "Kelly's dad will make the birthday cake.", "The party will be at Kelly's house.", 'Kelly wants Jason to come before the party starts.'], 'D',
  'Kelly 請 Jason 5:00 來幫忙掛氣球，而派對 6:30 才開始，所以她希望 Jason 在派對開始前就到。爺爺不知道派對（這是驚喜）、蛋糕由媽媽做、派對在爺爺家。',
  ['Kelly 請 Jason 幾點來？派對幾點開始？', 'at his house 的 his 指誰？', '誰做蛋糕？誰煮魚？'],
  {'A': "Kelly 說 Don't tell Grandpa... It's a surprise.，這是給爺爺的驚喜，爺爺不知道。", 'B': '做蛋糕的是媽媽，爸爸負責煮魚。', 'C': '派對在爺爺家（at his house）舉行。'},
  None)
Q('EN-8A-1', 'reading-detail', 3,
  "Weather report for this weekend:\nSaturday: sunny and hot, 32°C\nSunday: heavy rain all day, 21°C\n\nTina: Let's go to the beach this weekend!\nRay: Good idea. But we should go on the sunny day.\nTina: Right. It will be very hot, so we must bring something for our heads.\n\nWhen will they probably go to the beach, and what will they bring?",
  ['On Saturday, with hats', 'On Sunday, with umbrellas', 'On Saturday, with jackets', 'On Sunday, with hats'], 'A',
  'Ray 說 we should go on the sunny day，氣象報告中晴天是星期六；Tina 說天氣會很熱，must bring something for our heads（必須帶戴在頭上的東西），最合理的是帽子。所以他們會在星期六帶帽子去海邊。',
  ['哪一天是晴天？', 'Tina 說要帶「給頭用的東西」，是哪一種物品？', '天氣 32°C 時需要外套嗎？'],
  {'B': '星期天整天大雨，Ray 說要在晴天去。', 'C': '星期六 32°C 很熱，不需要外套，而且 Tina 說要帶的是戴在頭上的東西。', 'D': '星期天下大雨，不是晴天。'},
  None)

# EN-8B-1 不定詞與動名詞（困難題）
Q('EN-8B-1', 'gerund', 3,
  'Amy had a lot of homework last night. She started her science report at seven. She finished (1)＿＿＿ it at ten, and she felt very tired. Then she decided (2)＿＿＿ a short walk in the park near her home before going to bed.\n\nWhich is the best choice for (1) and (2)?',
  ['to write; taking', 'writing; taking', 'writing; to take', 'to write; to take'], 'C',
  '(1) finish（完成）後面接動名詞：finished writing it。(2) decide（決定）後面接不定詞：decided to take a short walk。句末的 before going to bed 也是介系詞 before 後面接 V-ing。',
  ['finish 後面的動詞要用什麼形式？', 'decide 和 want、hope 是同一類動詞嗎？', '這兩個動詞一個接 V-ing，一個接 to V。'],
  {'A': '把兩個動詞的用法弄反了：finish 接 V-ing，decide 接 to V。', 'B': 'decide 後面要接不定詞 to V，不接 V-ing。', 'D': 'finish 後面要接動名詞 V-ing，不接不定詞。'},
  None)
Q('EN-8B-1', 'gerund', 3,
  "Do you want to learn new English words? Here's a fun way. (1)＿＿＿ English songs is a good way to learn new words. My brother is good at (2)＿＿＿ them, and he learns five or six new words from every song. He also enjoys watching English cartoons.\n\nWhich is the best choice for (1) and (2)?",
  ['Sing; sing', 'Singing; singing', 'Singing; to sing', 'Sings; singing'], 'B',
  '(1) 空格在句首，是句子的主詞（動詞是 is），動詞當主詞要改成動名詞 Singing。(2) be good at（擅長）的 at 是介系詞，介系詞後面接動名詞：good at singing them。',
  ['(1) 這句話的主要動詞是什麼？空格是在當主詞嗎？', '(2) 空格前面的 at 是什麼詞性？', '動詞要當主詞或放在介系詞後面時，要怎麼改？'],
  {'A': '原形動詞不能當主詞；介系詞 at 後面也不能接原形動詞。', 'C': 'be good at 的 at 是介系詞，後面要接 V-ing，不接 to V。', 'D': 'Sings 是動詞，不能當句子的主詞。'},
  None)
Q('EN-8B-1', 'infinitive', 3,
  "Mia: Can you help me with this math problem? It's too hard for me.\nDan: Sure. Let me see... Oh, it's not difficult (1)＿＿＿ this problem. I can teach you (2)＿＿＿ do it.\nMia: Thank you! You're so good at math. I hope to be like you someday.\n\nWhich is the best choice for (1) and (2)?",
  ['to solve; how to', 'solving; how', 'to solve; what to', 'solve; how to'], 'A',
  "(1) It's + 形容詞 + to + 原形動詞 表示「做某事是……的」，It 是虛主詞，真正的主詞是 to solve this problem。(2) teach someone how to + 原形 表示「教某人如何做」，how to do it 就是「怎麼做這題」。",
  ["(1) 句子 it's not difficult ＿ this problem 中，It 代替的是什麼？", '(2)「教你怎麼做」要用哪個疑問詞 + 不定詞？', 'what to do 和 how to do 後面可以再接 it 嗎？'],
  {'B': 'teach you how 後面直接接原形 do 不合文法，要用 how to + 原形。', 'C': 'what to do 已經有 do 的受詞 what，後面再加 it 就重複了。', 'D': "It's + 形容詞 + to V 的句型，不能省略 to。"},
  None)
Q('EN-8B-1', 'infinitive', 3,
  'Kevin was late for school three times last week. This morning, he was late again. His teacher, Ms. Lin, was not happy. She told him (1)＿＿＿ late again, and she wants everyone in the class (2)＿＿＿ at school before 7:30 every day.\n\nWhich is the best choice for (1) and (2)?',
  ['to not being; arriving', "don't be; arrive", 'not being; to arrive', 'not to be; to arrive'], 'D',
  '(1) tell + 人 + to V 表示「叫某人做某事」，否定是 tell + 人 + not to V，所以是 told him not to be late again。(2) want + 人 + to V 表示「要某人做某事」，所以是 wants everyone to arrive。',
  ['tell someone 和 want someone 後面的動詞要用什麼形式？', '不定詞的否定，not 要放在 to 的前面還是後面？', '(1) 老師是叫 Kevin 做什麼還是不要做什麼？'],
  {'A': 'tell someone 後面接不定詞 to + 原形，不能接 being；want someone 後面也要接 to V。', 'B': "tell someone 後面不能直接接祈使句 don't be；want someone 後面要加 to。", 'C': 'tell someone 後面要接不定詞，否定是 not to + 原形，不是 not being。'},
  None)
Q('EN-8B-1', 'reading-main-idea', 3,
  "Many students spend hours playing computer games every day. Some parents think playing games is a waste of time, but games are not always bad. Some games teach players to work with others, and some help them practice thinking fast. The real problem is not playing games, but playing too long. Students should learn to stop after an hour and save time for homework, sports, and sleep.\n\nWhat is the writer's main point?",
  ['Students should never play computer games.', "Playing games is OK if students don't play too long.", 'Parents should play games with their children.', 'Students should stop doing homework to play games.'], 'B',
  '作者先說遊戲不一定是壞事，並舉例：可以學習合作、練習快速思考；接著點出重點 The real problem is not playing games, but playing too long.（真正的問題不是玩遊戲，而是玩太久），最後建議玩一小時就要停下來。所以主旨是：只要不玩太久，玩遊戲是可以的。',
  ['作者對玩電腦遊戲的態度是完全反對嗎？', '找出 The real problem is not..., but... 這一句。', '最後一句的建議和哪個選項的意思最接近？'],
  {'A': '作者說 games are not always bad，還舉出遊戲的好處，並不反對玩遊戲。', 'C': '文中沒有提到父母要陪孩子玩遊戲。', 'D': '作者剛好相反，要學生留時間給功課、運動和睡眠。'},
  None)
Q('EN-8B-1', 'reading-main-idea', 3,
  "Dear neighbors,\nDo you have books that you don't read anymore? Please don't throw them away! Bring them to the community center before May 20. We are planning to send them to children in the mountains. We also need some people to help pack the books on May 21. If you'd like to help, please call Ms. Lee at 2345-6789.\n\nWhat is the purpose of this letter?",
  ['To sell old books at the community center', 'To invite children to a party in the mountains', 'To ask people to give old books and help pack them', 'To tell people where to buy new books'], 'C',
  '信一開頭問大家有沒有不再讀的書，請大家不要丟掉，在 5 月 20 日前送到社區中心，要送給山區的孩子；還徵求 5 月 21 日幫忙打包的人。所以寫信的目的是請鄰居捐出舊書並幫忙打包。',
  ['這封信是寫給誰的？請他們做哪些事？', '書最後要送去哪裡？', 'Ms. Lee 的電話是給什麼人打的？'],
  {'A': '信中是請大家「捐」書給山區的孩子，不是要賣書。', 'B': '書是要送給山區的孩子，信中沒有提到派對。', 'D': '信中談的是不再讀的舊書，不是買新書。'},
  None)

# EN-8A-2 比較級與最高級（困難題）
Q('EN-8A-2', 'comparative', 3,
  "Ted wants to buy a new phone. Here are three phones in the store:\nPhone A: NT$8,000, 150 grams\nPhone B: NT$12,000, 180 grams\nPhone C: NT$10,000, 130 grams\nTed doesn't have much money, but he also wants a light phone.\n\nWhich is TRUE about the three phones?",
  ['Phone B is cheaper than Phone C.', 'Phone A is heavier than Phone C.', 'Phone C is the most expensive.', 'Phone A is lighter than Phone C.'], 'B',
  '比較重量：Phone A 150 公克，Phone C 130 公克，150 > 130，所以 Phone A 比 Phone C 重（heavier）。價格由高到低是 B（12,000）> C（10,000）> A（8,000），所以 B 不比 C 便宜，C 也不是最貴的。',
  ['先把三支手機的價格和重量分別排順序。', '公克數越大表示越重還是越輕？', 'cheaper、heavier、lighter、the most expensive 分別是什麼意思？'],
  {'A': 'Phone B 要 NT$12,000，比 Phone C 的 NT$10,000 貴。', 'C': '最貴的是 Phone B（NT$12,000），Phone C 排第二。', 'D': 'Phone A 150 公克，Phone C 130 公克，A 比較重，把輕重弄反了。'},
  None)
Q('EN-8A-2', 'comparative', 3,
  "Kevin and I walk to school together every day. Kevin's bag is heavy, but my bag is even (1)＿＿＿. There are five books in my bag, and there are only three in his. So my bag is (2)＿＿＿ of the two. I think I should take some books out.\n\nWhich is the best choice for (1) and (2)?",
  ['heavier; the heavier', 'more heavy; the heaviest', 'heavier; heavier', 'heaviest; the heavier'], 'A',
  '(1) even 用來加強比較級，表示「甚至更……」，heavy 字尾是「子音 + y」，比較級是 heavier。(2) of the two 是在兩者之中比較，要用 the + 比較級：the heavier of the two（兩個之中較重的）。',
  ['even 後面要接原級、比較級還是最高級？', 'heavy 字尾是 y，變比較級時怎麼改？', 'of the two 是幾個東西在比較？前面要不要加 the？'],
  {'B': 'heavy 的比較級是 heavier，不是 more heavy；而且只有兩個書包。', 'C': '「兩者之中較……的那一個」要用 the + 比較級，不能少了 the。', 'D': 'even（更加）要修飾比較級，不能接最高級。'},
  None)
Q('EN-8A-2', 'superlative', 3,
  "Four students are in a class photo. Cathy is the tallest of the four, and she is 170 cm. Amy is the shortest; she is 150 cm. Dan is 162 cm. Ben is taller than Dan, but he isn't as tall as Cathy.\n\nHow tall could Ben be?",
  ['160 cm', '172 cm', '168 cm', '148 cm'], 'C',
  "Ben is taller than Dan，所以 Ben 超過 162 公分；he isn't as tall as Cathy，而且 Cathy 是 the tallest of the four，所以 Ben 不到 170 公分。只有 168 公分在 162 和 170 之間。",
  ['Ben 和 Dan 比，誰比較高？', "isn't as tall as Cathy 是什麼意思？", 'Ben 的身高要在哪兩個數字之間？'],
  {'A': '160 公分比 Dan 的 162 公分矮，但文中說 Ben 比 Dan 高。', 'B': '172 公分比 Cathy 還高，但 Cathy 是四個人中最高的。', 'D': '148 公分比 Amy 還矮，但 Amy 是四個人中最矮的。'},
  None)
Q('EN-8A-2', 'superlative', 3,
  "Ann: What's your favorite season, Joe?\nJoe: Of all the seasons, I like summer (1)＿＿＿ because I love swimming in the sea.\nAnn: My sister is different. She likes winter (2)＿＿＿ than summer because she hates hot weather.\nJoe: Really? I think winter is too cold!\n\nWhich is the best choice for (1) and (2)?",
  ['better; best', 'good; better', 'best; best', 'best; better'], 'D',
  'like 的程度用副詞 well 表示，比較級是 better，最高級是 best。(1) Of all the seasons（在所有季節中）是三者以上的比較，用最高級：like summer best。(2) 後面有 than summer，是兩者比較，用比較級：likes winter better than summer。',
  ['(1) Of all the seasons 是在幾個季節裡比較？', '(2) 空格後面出現了哪個字？', '「最喜歡」和「比較喜歡」英文分別怎麼說？'],
  {'A': '把兩格弄反了：Of all the seasons 是在所有季節中比較，用最高級；有 than 才用比較級。', 'B': 'Of all the seasons 要用最高級；而且 good 是形容詞，不能修飾動詞 like。', 'C': '(2) 後面有 than，要用比較級 better。'},
  None)
Q('EN-8A-2', 'as-as', 3,
  'Last week, Mr. Lin gave his class a math test. Tom got 85 points. Mia got the same score as Tom. Joe got 5 points more than Mia, and he was very happy about it. Mr. Lin said all three of them did a good job.\n\nWhich is TRUE?',
  ["Mia's score was as high as Tom's.", "Tom's score was not as high as Mia's.", "Joe's score was as high as Mia's.", "Mia's score was higher than Joe's."], 'A',
  "Tom 85 分，Mia got the same score as Tom，也是 85 分；Joe 比 Mia 多 5 分，是 90 分。兩人分數相同用 as + 原級 + as，所以 Mia's score was as high as Tom's. 正確。",
  ['先算出三個人各考幾分。', 'the same score as 是什麼意思？', 'as high as 和 not as high as 分別表示什麼關係？'],
  {'B': 'Mia 和 Tom 分數相同，不能說 Tom 沒有 Mia 高。', 'C': 'Joe 比 Mia 多 5 分，兩人分數不一樣。', 'D': 'Joe 比 Mia 多 5 分，是 Joe 的分數比較高。'},
  None)
Q('EN-8A-2', 'as-as', 3,
  "Last month, my family moved to a new house. The new house is not as big as our old one, and it doesn't have a garden. But I like it more because it is closer to my school. Now I can walk to school in five minutes. Before, I took the bus for thirty minutes every day.\n\nWhich is TRUE about the new house?",
  ['It is bigger than the old house.', 'It is smaller than the old house.', 'It is as far from school as the old house.', 'It has a bigger garden than the old house.'], 'B',
  'The new house is not as big as our old one. 表示新房子沒有舊房子大，也就是新房子比較小（smaller）。新家比較靠近學校，而且沒有花園。',
  ['not as big as 是「一樣大」還是「沒那麼大」？', '新家離學校近還是遠？', '新房子有花園嗎？'],
  {'A': 'not as big as 是「沒有那麼大」，新房子比較小。', 'C': '新家比較靠近學校，走路五分鐘；以前要搭三十分鐘公車。', 'D': "文中說新房子 doesn't have a garden（沒有花園）。"},
  None)

# EN-8B-2 連接詞與附加問句（困難題）
Q('EN-8B-2', 'conjunction', 3,
  "Sam saw a pair of cool shoes in a store last month. He wanted to buy them, (1)＿＿＿ he didn't have enough money. (2)＿＿＿ he saved his pocket money for two months, he finally bought them last Sunday. Now he wears them every day.\n\nWhich is the best choice for (1) and (2)?",
  ['so; After', 'but; Although', 'or; Before', 'but; After'], 'D',
  '(1) 想買鞋子，但是錢不夠，前後語意相反，用 but。(2) 存了兩個月的零用錢「之後」，終於買到鞋子，表示事情的先後順序，用 After；finally（終於）也提示存錢在先、買鞋在後。',
  ['(1) 「想買」和「錢不夠」是什麼關係？', '(2) 存錢和買到鞋子，哪件事先發生？', 'finally 這個字給了你什麼線索？'],
  {'A': 'so 表示結果，「想買所以錢不夠」不合理；想買和錢不夠是轉折關係。', 'B': '存了兩個月的錢，終於買到鞋子，是順理成章的事，不是相反關係。', 'C': 'or 表示「或者」不合句意；而且「存錢之前就終於買到」不合理。'},
  None)
Q('EN-8B-2', 'conjunction', 3,
  "Mom: What are we going to do this weekend?\nDad: Let's go hiking on Sunday morning. But the weather report says it may rain.\nMom: Then here's our plan. If it (1)＿＿＿ on Sunday, we (2)＿＿＿ at home and watch movies.\nKids: Great! We love movies.\n\nWhich is the best choice for (1) and (2)?",
  ['will rain; will stay', 'rained; will stay', 'rains; will stay', 'rains; stayed'], 'C',
  '這是對星期天的假設計畫。if 引導的條件子句用現在簡單式表示未來：If it rains on Sunday；主要子句用未來式：we will stay at home。主詞 it 是第三人稱單數，所以 rain 要加 s。',
  ['這個計畫是過去還是未來的事？', 'if 子句裡可以用 will 嗎？', '主要子句要用什麼時態表示未來？'],
  {'A': 'if 引導的條件子句要用現在式表示未來，不能用 will rain。', 'B': '星期天是未來的事，條件子句不能用過去式 rained。', 'D': '主要子句說的是未來的計畫，要用 will stay，不能用過去式。'},
  None)
Q('EN-8B-2', 'tag-question', 3,
  'Ella: Your brother can speak Japanese, (1)＿＿＿?\nKen: (2)＿＿＿ He only speaks Chinese and English. But he wants to learn Japanese next year.\nElla: Oh, I see. My aunt teaches Japanese. Maybe she can help him.\n\nWhich is the best choice for (1) and (2)?',
  ["can he; No, he can't.", "can't he; No, he can't.", "can't he; Yes, he can.", "doesn't he; No, he doesn't."], 'B',
  "(1) 前句是肯定句，用助動詞 can，附加問句用否定的 can't，主詞 Your brother 換成 he：can't he。(2) Ken 說 He only speaks Chinese and English.（只會說中文和英文），所以哥哥不會日文，要回答 No, he can't.。",
  ['(1) 前句用的是哪個助動詞？是肯定還是否定？', 'Ken 的哥哥會說哪些語言？', '回答附加問句時，只看事實決定用 Yes 還是 No。'],
  {'A': "附加問句要「前肯後否」，前句是肯定的 can speak，附加問句要用否定 can't he。", 'C': 'Ken 說哥哥只會說中文和英文，所以他不會日文，不能回答 Yes。', 'D': '前句用助動詞 can，附加問句和回答都要用 can，不能改用 does。'},
  None)
Q('EN-8B-2', 'tag-question', 3,
  "Amy: Mr. and Mrs. Chen live next to you, (1)＿＿＿?\nBen: (2)＿＿＿ They moved to Taichung last month. A new family lives there now.\nAmy: Oh, I didn't know that. I wanted to give this book back to Mrs. Chen.\n\nWhich is the best choice for (1) and (2)?",
  ["don't they; No, they don't.", "aren't they; No, they aren't.", "don't they; Yes, they do.", "doesn't he; No, he doesn't."], 'A',
  "(1) 前句是肯定的現在簡單式，動詞 live 是一般動詞，主詞 Mr. and Mrs. Chen 是複數，附加問句用 don't they。(2) 他們上個月搬到台中，現在住在隔壁的是新的一家人，所以事實是「沒有住在隔壁」，回答 No, they don't.。",
  ['(1) 前句的動詞是 be 動詞還是一般動詞？主詞有幾個人？', '陳先生夫婦現在還住在 Ben 隔壁嗎？', '事實是否定時，回答要用 Yes 還是 No？'],
  {'B': "前句的動詞 live 是一般動詞，附加問句要用助動詞 don't，不能用 be 動詞。", 'C': '陳先生夫婦上個月已經搬到台中，現在不住在 Ben 隔壁，不能回答 Yes。', 'D': "主詞 Mr. and Mrs. Chen 是兩個人，要用 they 和 don't。"},
  None)
Q('EN-8B-2', 'reading-detail', 3,
  'Ryan and his twin brother, Sean, look the same, but they have very different habits. Ryan gets up early, while Sean always stays up late and gets up at the last minute. Ryan walks to school because he likes exercise. Sean takes the bus, so he can sleep a little longer. However, they both enjoy cooking, and they often make dinner together when their parents work late.\n\nWhich is TRUE?',
  ['Sean walks to school to get exercise.', 'Ryan gets up later than Sean.', 'The twins both like cooking.', "Sean takes the bus because he doesn't like walking."], 'C',
  '前面用 but、while 說明兄弟倆習慣不同，接著用 However 轉折：they both enjoy cooking（他們都喜歡做菜），還常常一起煮晚餐。所以「雙胞胎都喜歡做菜」正確。',
  ['文中哪一個連接詞把「不同」轉到「相同」？', 'Ryan 和 Sean 誰早起？誰走路上學？', 'Sean 搭公車的原因，文中用哪個連接詞說明？'],
  {'A': '走路上學、喜歡運動的是 Ryan，Sean 搭公車。', 'B': 'Ryan 早起，Sean 總是最後一刻才起床，是 Sean 起得比較晚。', 'D': 'Sean 搭公車是為了可以多睡一點（so he can sleep a little longer），文中沒說他不喜歡走路。'},
  None)
Q('EN-8B-2', 'reading-detail', 3,
  "Sports Day Notice\n- Sports Day is on Friday, October 20. If it rains that day, it will be moved to the next Monday.\n- Students must wear sports clothes, or they can't join the games.\n- Lunch is free for students, but parents need to pay NT$100 for lunch.\n- Please arrive before 7:40 because the opening starts at 8:00.\n\nKevin's mom wants to have lunch with Kevin on Sports Day. On Friday, October 20, it rains hard all day. What should she do?",
  ['Come on Friday and pay nothing for lunch', 'Come on Monday and pay nothing for lunch', 'Come on Friday and pay NT$100 for lunch', 'Come on Monday and pay NT$100 for lunch'], 'D',
  '通知第一條：If it rains that day, it will be moved to the next Monday.，星期五下大雨，運動會改到下星期一。第三條：Lunch is free for students, but parents need to pay NT$100.，媽媽是家長，要付 100 元。所以她應該星期一來，並付 100 元午餐費。',
  ['星期五下雨的話，運動會會怎麼樣？', '午餐對學生和家長的規定有什麼不同？', '這題要同時用到通知中的兩條規定。'],
  {'A': '星期五下雨，運動會會延到下星期一；而且只有學生免費，家長要付錢。', 'B': '日子對了，但通知說 parents need to pay NT$100，家長的午餐要付 100 元。', 'C': '星期五下大雨，運動會改到下星期一，星期五不會舉行。'},
  None)

# EN-9A-1 現在完成式（困難題）
Q('EN-9A-1', 'present-perfect', 3,
  "Judy: Your photos are beautiful! (1)＿＿＿ to Japan?\nLeo: Yes. I (2)＿＿＿ there with my family two years ago. We visited Tokyo and Kyoto.\nJudy: Lucky you! I've never been there. I hope to go someday.\n\nWhich is the best choice for (1) and (2)?",
  ['Have you ever been; went', 'Have you ever been; have been', 'Did you ever been; went', 'Have you ever went; went'], 'A',
  '(1) 問對方「曾經去過」日本嗎，用現在完成式 Have you ever been to...?。(2) two years ago 是明確的過去時間，要用過去簡單式 went；現在完成式不能和 ago、last year 這類明確的過去時間連用。',
  ['(1) Judy 想問的是「曾經」去過嗎？要用什麼時態？', '(2) 的句子裡有什麼時間詞？', '現在完成式可以和 two years ago 一起用嗎？'],
  {'B': '(2) 有 two years ago，是明確的過去時間，不能用現在完成式。', 'C': 'Did 後面要接原形動詞，不能接過去分詞 been。', 'D': 'have 後面要接過去分詞 been 或 gone，went 是過去式。'},
  None)
Q('EN-9A-1', 'present-perfect', 3,
  "Mom: Is your sister home, Tom?\nTom: No, she (1)＿＿＿ to the supermarket. She'll be back in ten minutes.\nMom: OK. Have you finished your homework (2)＿＿＿?\nTom: Not yet. I'm still working on my English report.\nMom: Please finish it before dinner.\n\nWhich is the best choice for (1) and (2)?",
  ['has been; yet', 'has gone; yet', 'has gone; ago', 'has been; since'], 'B',
  '(1) 姊姊（妹妹）不在家，十分鐘後才回來，表示她「已經去了超市、人還在那裡」，用 has gone to。(2) 現在完成式的疑問句問「已經……了嗎」，句尾用 yet；Tom 回答 Not yet 也可以印證。',
  ['(1) 姊姊（妹妹）現在在家嗎？', 'have gone to 和 have been to 的差別是什麼？', 'Tom 回答 Not yet，問句句尾應該用哪個字？'],
  {'A': 'has been to 表示「曾經去過、已經回來」，但姊姊（妹妹）現在不在家。', 'C': 'ago 要接在一段時間後面，而且不能用在現在完成式的問句裡。', 'D': 'since 後面要接時間起點；而且 has been to 不合「人還沒回來」的情境。'},
  None)
Q('EN-9A-1', 'since-for', 3,
  "My parents bought their car in 2018, and they still drive it today. The car is old, but it still runs well. Dad washes it every weekend, and Mom says it's like a member of our family. It's 2026 now, so my parents (1)＿＿＿ the car (2)＿＿＿.\n\nWhich is the best choice for (1) and (2)?",
  ['have bought; for eight years', 'have had; since eight years', 'had; since 2018', 'have had; for eight years'], 'D',
  '車子 2018 年買的，到 2026 年仍在使用，表示「從過去持續到現在」，用現在完成式。買（buy）是瞬間動作不能持續，要用表示擁有的 have，過去分詞是 had：have had。2018 到 2026 年是一段時間八年，用 for eight years（也可以說 since 2018，但要搭配 have had）。',
  ['從 2018 年到 2026 年，一共是幾年？', '「買」這個動作可以持續八年嗎？哪個動詞表示「擁有」？', 'for 和 since 後面分別接什麼？'],
  {'A': 'buy 是一瞬間就完成的動作，不能持續八年；要表示「擁有」八年，用 have had。', 'B': 'since 後面要接時間起點（例如 since 2018），eight years 是一段時間，要用 for。', 'C': 'since 表示「從那時到現在」，要搭配現在完成式，不能用過去式 had。'},
  None)
Q('EN-9A-1', 'since-for', 3,
  'Mr. Wu came to Tainan in 2010. At first, he worked in a bookstore for four years. Then he became a teacher, and he has taught at Sunny Junior High School since then. He loves his job, and his students love him, too.\n\nIt is 2026 now. How long has Mr. Wu taught at Sunny Junior High School?',
  ['For sixteen years', 'For four years', 'For twelve years', 'Since 2010'], 'C',
  '吳老師 2010 年到台南，先在書店工作四年，所以 2014 年才開始在 Sunny 國中教書（since then 指書店工作結束之後）。2014 年到 2026 年是 12 年，所以他已經教了十二年（for twelve years）。',
  ['吳老師來台南後先做什麼工作？做了幾年？', 'since then 的 then 指的是哪一年？', '從那一年到 2026 年是幾年？'],
  {'A': '從 2010 年算起，但他前四年在書店工作，不是在學校教書。', 'B': '四年是他在書店工作的時間。', 'D': '2010 年是他來台南的年份，那時他還在書店工作，不是開始教書的時間。'},
  None)
Q('EN-9A-1', 'reading-detail', 3,
  "Dear Grandma,\nWe have lived in our new apartment for a month now. I like it here. I have already made two new friends, Lisa and Joy. They live on the fifth floor. I have also joined the school band, but I haven't found a piano teacher yet. Mom has looked for one on the Internet. For now, I practice on the old piano in the living room.\nLove,\nAmy\n\nWhat has Amy NOT done yet?",
  ['Made new friends', 'Found a piano teacher', 'Joined the school band', 'Moved to a new apartment'], 'B',
  "信中說 I haven't found a piano teacher yet.（我還沒找到鋼琴老師），haven't... yet 表示「還沒」。交新朋友、加入樂隊、搬新家都是已經完成的事（have already made、have joined、have lived）。",
  ['題目問的是 Amy「還沒」做的事。', "信中哪一句用了 haven't... yet？", 'already 和 yet 分別用在什麼樣的句子？'],
  {'A': 'Amy 說 I have already made two new friends，她已經交到新朋友了。', 'C': 'Amy 說 I have also joined the school band，她已經加入樂隊了。', 'D': '信的第一句就說他們已經在新公寓住了一個月。'},
  None)
Q('EN-9A-1', 'reading-detail', 3,
  "Ken: Mom, have you seen my glasses? I've looked everywhere in my room.\nMom: Have you checked your schoolbag?\nKen: Yes, I've already checked it twice. They're not there.\nMom: What about the bathroom? You took a shower an hour ago.\nKen: Oh! I haven't looked there yet. I'll go and check.\n\nWhere will Ken probably look for his glasses next?",
  ['In the bathroom', 'In his schoolbag', 'In his room', 'In the kitchen'], 'A',
  "Ken 已經找遍房間、書包也找了兩次。媽媽提醒他一小時前洗過澡，Ken 說 I haven't looked there yet.（我還沒找那裡），there 指浴室，而且他說要去看看，所以他接下來最可能去浴室找。",
  ['Ken 已經找過哪些地方？', "I haven't looked there yet. 的 there 指哪裡？", '還沒找過的地方，就是他接下來要去的地方。'],
  {'B': 'Ken 說書包已經找過兩次了（already checked it twice）。', 'C': 'Ken 一開始就說已經找遍了房間（looked everywhere in my room）。', 'D': '對話中完全沒有提到廚房。'},
  None)

# EN-9A-2 被動語態（困難題）
Q('EN-9A-2', 'passive-voice', 3,
  "Look at this beautiful cake! It (1)＿＿＿ by my sister. She (2)＿＿＿ it for Mom's birthday yesterday. It has strawberries on top, and it tastes great. Mom was so happy that she took a picture of it before we ate it.\n\nWhich is the best choice for (1) and (2)?",
  ['made; was made', 'was made; was made', 'was made; made', 'is made; was made'], 'C',
  '(1) 主詞 It（蛋糕）是被做出來的，後面又有 by my sister，要用被動語態；昨天做的，用過去式被動 was made。(2) 主詞 She 是動作的執行者，後面接受詞 it，用主動語態的過去式 made。',
  ['(1) 蛋糕是做的人還是被做的東西？', '(2) 的主詞 She 是做動作的人嗎？後面有沒有受詞？', 'yesterday 提示兩格要用什麼時態？'],
  {'A': '把兩格弄反了：蛋糕是「被做」的要用被動；姊姊（妹妹）是做蛋糕的人要用主動。', 'B': '(2) 的主詞 She 是做蛋糕的人，要用主動語態，而且後面有受詞 it。', 'D': '蛋糕昨天做好的，(1) 要用過去式；(2) 的 She 是做動作的人，不能用被動。'},
  None)
Q('EN-9A-2', 'passive-voice', 3,
  'The new park near my home opened last year. Many trees (1)＿＿＿ there before it opened, and now the park is green and beautiful. People (2)＿＿＿ there every evening, and children play on the grass. It has become my favorite place in town.\n\nWhich is the best choice for (1) and (2)?',
  ['planted; are walked', 'were planted; are walked', 'are planted; walked', 'were planted; walk'], 'D',
  '(1) 樹不會自己種，是「被種植」，要用被動；開幕前種的，用過去式被動 were planted（trees 是複數）。(2) People 是自己去散步的人，用主動；every evening 表示現在的習慣，用現在簡單式 walk。',
  ['(1) 樹是種的人，還是被種的東西？', '(2) People 是做動作的人嗎？', '兩格的時間線索分別是什麼？'],
  {'A': '樹是被種的，(1) 要用被動；人是自己去散步的，(2) 要用主動。', 'B': '(2) 的主詞 People 是散步的人，是動作的執行者，要用主動。', 'C': '樹是公園開幕前種的，要用過去式；(2) 有 every evening，表示現在的習慣，不能用過去式。'},
  None)
Q('EN-9A-2', 'passive-tense', 3,
  "Music in the Park!\nA free concert (1)＿＿＿ in Central Park next Sunday at 7 p.m. You don't need a ticket. Please come early to get a good seat. Drinks can (2)＿＿＿ at the front gate, and food will be sold near the lake. See you there!\n\nWhich is the best choice for (1) and (2)?",
  ['will be held; be bought', 'will hold; be bought', 'will be held; buy', 'is held; bought'], 'A',
  '(1) 音樂會是被舉辦的，next Sunday 是未來，未來式被動是 will be + 過去分詞：will be held（hold 的過去分詞是 held）。(2) 飲料是被買的，助動詞 can 後面的被動是 can + be + 過去分詞：can be bought。',
  ['(1) 音樂會是舉辦的人，還是被舉辦的活動？next Sunday 是什麼時態？', '(2) 飲料是被買的嗎？can 後面要接什麼形式？', '未來式和助動詞的被動都是「助動詞 + be + 過去分詞」。'],
  {'B': '音樂會是「被舉辦」的，不會自己舉辦東西，要用被動 will be held。', 'C': '飲料是「被買」的，can 後面的被動要用 be + 過去分詞。', 'D': 'next Sunday 是未來，不能用現在式；can 後面不能直接接過去分詞。'},
  None)
Q('EN-9A-2', 'passive-tense', 3,
  'The Ocean Museum was opened in 1995. Every year, it is visited by about one million people. Many of the fish in the museum were brought from other countries. Last year, the shark area was damaged by an earthquake, so it was closed. Workers are repairing it now, and it will be opened again next spring.\n\nWhich is TRUE?',
  ['The museum was opened last year.', 'The shark area will be opened again next spring.', 'All the fish in the museum were brought from other countries.', 'The museum was damaged by an earthquake in 1995.'], 'B',
  '文中最後說 Workers are repairing it now, and it will be opened again next spring.，it 指關閉的鯊魚區，未來式被動 will be opened 表示明年春天會重新開放。博物館 1995 年開幕、很多（不是全部）魚來自國外、地震發生在去年。',
  ['文中出現了哪些年份或時間？各發生了什麼事？', '最後一句的 it 指什麼？', 'Many 和 All 的意思一樣嗎？'],
  {'A': '博物館 1995 年開幕；去年發生的是鯊魚區被地震損壞。', 'C': '文中說 Many of the fish（很多魚），不是全部。', 'D': '1995 年是開幕的年份，地震是去年發生的，損壞的是鯊魚區。'},
  None)
Q('EN-9A-2', 'reading-detail', 3,
  "Our school garden was started by the science club three years ago. Now vegetables are grown there by students in every grade. Last month, some of the vegetables were sold at the school fair, and the money was given to a children's hospital. This year, the garden will be made bigger, so more students can join.\n\nWhat happened to the money from the vegetables?",
  ['It was used to make the garden bigger.', 'It was kept by the science club.', 'It was used to buy new seeds.', "It was given to a children's hospital."], 'D',
  "文中說 some of the vegetables were sold at the school fair, and the money was given to a children's hospital.，賣菜的錢被捐給了兒童醫院。",
  ['找到 money 出現的句子。', 'the money was given to... 是誰「被給」了錢？', '其他選項的內容，文中有說到嗎？'],
  {'A': '花園今年會擴大，但文中沒有說是用賣菜的錢。', 'B': '自然社是三年前開闢花園的社團，錢並沒有留給他們。', 'C': '文中沒有提到買種子。'},
  None)
Q('EN-9A-2', 'reading-detail', 3,
  'Every October, the Moon Lake Kite Festival is held in our town. Kites of all shapes are flown by people from many countries. This year, the biggest kite was made by a group of high school students in our town; it was 20 meters long. Sadly, on the second day, the festival was stopped because of strong winds. The prizes will be given out next week.\n\nWhich is TRUE?',
  ['The festival is held every spring.', 'The biggest kite was made by people from other countries.', 'The winners will get their prizes later.', 'The festival was stopped because of rain.'], 'C',
  '文中最後說 The prizes will be given out next week.（獎品下週才會頒發），所以得獎者之後才會拿到獎品。風箏節在十月、最大的風箏是本地高中生做的、停辦原因是強風。',
  ['風箏節在哪個月舉行？', '最大的風箏是誰做的？', '最後一句 will be given out next week 說明獎品什麼時候頒發？'],
  {'A': '風箏節在每年十月舉行，是秋天，不是春天。', 'B': '最大的風箏是本鎮的一群高中生做的。', 'D': '風箏節第二天停辦是因為強風（strong winds），不是下雨。'},
  None)

# EN-9B-1 關係代名詞（困難題）
Q('EN-9B-1', 'relative-person', 3,
  'Look at the boy (1)＿＿＿ is talking to Ms. Lin. He is my cousin, Sam. He just moved here from Taichung. His sister, (2)＿＿＿ name is Amy, is in my class. Amy and I sit next to each other, and we often eat lunch together.\n\nWhich is the best choice for (1) and (2)?',
  ['which; whose', 'who; whose', 'who; who', 'whose; which'], 'B',
  '(1) 先行詞 the boy 是人，關係代名詞在子句中當主詞（後面接 is talking），用 who。(2) 先行詞 His sister 是人，空格後面接名詞 name，表示「她的名字叫 Amy」，用所有格關係代名詞 whose。',
  ['(1) 先行詞是人還是物？空格後面接的是動詞還是名詞？', '(2) 空格後面接了什麼名詞？', '表示「……的」的關係代名詞是哪一個？'],
  {'A': '先行詞 the boy 是人，(1) 不能用 which。', 'C': '(2) 空格後面接名詞 name，表示「她的名字」，要用所有格 whose。', 'D': '(1) 空格後面直接接動詞 is talking，要用主格 who；(2) 的先行詞是人，也不能用 which。'},
  None)
Q('EN-9B-1', 'relative-person', 3,
  'In this photo, there are four people. The woman who is holding a baby is my aunt. The man who is standing next to her is my uncle; he is a pilot. The baby, whose name is Ella, is their first child. The old man who is sitting in the chair is my grandpa.\n\nWho is Ella?',
  ["The writer's cousin", "The writer's aunt", "The writer's sister", "The writer's grandpa's wife"], 'A',
  'The baby, whose name is Ella, is their first child.，their 指前面的 my aunt 和 my uncle，所以 Ella 是作者阿姨（姑姑）和叔叔（姑丈）的第一個孩子，也就是作者的表（堂）妹，英文是 cousin。',
  ['whose name is Ella 描述的是照片中的哪一個人？', 'their first child 的 their 指誰？', '阿姨（姑姑）的孩子，要怎麼稱呼？'],
  {'B': '作者的阿姨（姑姑）是抱著嬰兒的那位女士，不是 Ella。', 'C': 'Ella 是阿姨（姑姑）和叔叔（姑丈）的孩子，不是作者父母的孩子。', 'D': '坐在椅子上的是爺爺，Ella 是嬰兒，不是爺爺的太太。'},
  None)
Q('EN-9B-1', 'relative-thing', 3,
  "I'm very sad today. The bike (1)＿＿＿ my dad gave me last year (2)＿＿＿ stolen yesterday afternoon. I parked it in front of the library, and when I came out, it was gone. I'm going to tell the police about it.\n\nWhich is the best choice for (1) and (2)?",
  ['who; was', 'which; were', 'whose; is', 'which; was'], 'D',
  '(1) 先行詞 The bike 是物品，在子句中當 gave 的受詞，用 which。(2) 整句的主詞是 The bike（關係子句 which my dad gave me last year 只是修飾它），腳踏車是「被偷」，yesterday 是過去，單數主詞用 was stolen。',
  ['(1) 先行詞是人還是物？', '去掉關係子句後，整句的主詞是什麼？是單數還是複數？', 'yesterday afternoon 提示 (2) 要用什麼時態？'],
  {'A': '先行詞 The bike 是物品，不能用 who。', 'B': '句子的主詞是 The bike（單數），不是 my dad 或 me，be 動詞要用 was。', 'C': '空格後面不是接名詞，不能用 whose；而且 yesterday 是過去，要用 was。'},
  None)
Q('EN-9B-1', 'relative-thing', 3,
  'Mr. Lin: Whose books are these? They are on my desk, and I need the desk for my computer.\nAnn: The books which (1)＿＿＿ on your desk (2)＿＿＿ to Joe. He left them there this morning.\nMr. Lin: OK. Please tell him to take them back after class.\n\nWhich is the best choice for (1) and (2)?',
  ['is; belongs', 'are; belongs', 'are; belong', 'is; belong'], 'C',
  '(1) which 代替先行詞 The books（複數），關係子句的 be 動詞用 are。(2) 整句的主詞是 The books，which are on your desk 只是修飾語，所以主要動詞用複數 belong（belong to 表示「屬於」）。',
  ['which 代替的是哪個名詞？', '整句話真正的主詞是什麼？不要被 your desk 騙了。', '主詞是複數時，動詞要不要加 s？'],
  {'A': 'which 代替的是 The books（複數），整句的主詞也是 The books，兩格都要用複數。', 'B': '(2) 的主詞是 The books，不是最靠近的 your desk，動詞不加 s。', 'D': '(1) which 代替複數的 The books，be 動詞要用 are。'},
  None)
Q('EN-9B-1', 'reading-detail', 3,
  'Help Wanted\nWe need a person who can speak English and Japanese, who is free on weekends, and who likes working with children. Please call Ms. Ho at 2233-4455.\n\nWho is the best person for this job?',
  ['Cindy, who speaks English and Japanese and is free on weekends, has taught children for two years.', 'Amy, who speaks English and Japanese, works at a bank on weekends.', 'Ben, who loves kids and is free on weekends, speaks only English.', "David, who speaks Japanese and English, doesn't like noisy children."], 'A',
  '徵人條件有三個（三個 who 子句）：會說英文和日文、週末有空、喜歡和小孩一起工作。Cindy 會說英日文、週末有空，而且教過小孩兩年，三個條件都符合。Amy 週末要上班、Ben 不會日文、David 不喜歡小孩。',
  ['徵人廣告用了幾個 who 子句？各是什麼條件？', '把每個人的資料和三個條件一一對照。', '只有一個人三個條件全部符合。'],
  {'B': 'Amy 週末要在銀行上班，不符合「週末有空」的條件。', 'C': 'Ben 只會說英文，不符合「會說英文和日文」的條件。', 'D': 'David 不喜歡吵鬧的小孩，不符合「喜歡和孩子相處」的條件。'},
  None)
Q('EN-9B-1', 'reading-detail', 3,
  "Guess what animal I am thinking of. It is an animal that lives in the sea, but it isn't a fish. Its babies drink milk from their mothers. It can't stay under the water all the time; it must come up to get air. One kind of this animal is the biggest animal that has ever lived on Earth.\n\nWhat animal is it?",
  ['A shark', 'A whale', 'An elephant', 'A turtle'], 'B',
  '線索：住在海裡但不是魚、寶寶喝母奶、要浮上水面換氣，而且其中一種（藍鯨）是地球上有史以來最大的動物。符合所有條件的是鯨魚（whale）。',
  ['題目給了幾個線索？把每個 that 子句的內容整理出來。', '住在海裡卻不是魚，寶寶還喝母奶，是哪一類動物？', '地球上最大的動物是什麼？'],
  {'A': "鯊魚是魚，但文中說 it isn't a fish。", 'C': '大象住在陸地上，但文中說這種動物 lives in the sea。', 'D': '海龜的寶寶不喝母奶，而且海龜也不是地球上最大的動物。'},
  None)

# EN-9B-2 間接問句與閱讀理解（困難題）
Q('EN-9B-2', 'indirect-question', 3,
  'Tourist: Excuse me. Could you tell me (1)＿＿＿?\nClerk: The next one leaves at 3:15.\nTourist: Thank you. And do you know (2)＿＿＿?\nClerk: Sure. You can buy one at the machine over there. It only takes coins.\n\nWhich is the best choice for (1) and (2)?',
  ['when does the next bus leave; where I can buy a ticket', 'when the next bus leaves; where can I buy a ticket', 'when the next bus leave; where I buy can a ticket', 'when the next bus leaves; where I can buy a ticket'], 'D',
  '間接問句要用直述句語序：疑問詞 + 主詞 + 動詞。(1) When does the next bus leave? 去掉 does，主詞 the next bus 是單數，動詞加 s：when the next bus leaves。(2) Where can I buy a ticket? 改成 where I can buy a ticket。',
  ['疑問句放進 Could you tell me / do you know 後面時，語序要怎麼改？', '去掉助動詞 does 之後，動詞要不要變化？', '間接問句中，主詞要放在助動詞 can 的前面還是後面？'],
  {'A': '(1) 保留了直接問句的 does 倒裝，間接問句要改成直述句語序。', 'B': '(2) 保留了直接問句 can I 的倒裝，間接問句要主詞在前：I can。', 'C': '去掉 does 後，第三人稱單數的 leave 要加 s；can 也要放在動詞 buy 前面。'},
  None)
Q('EN-9B-2', 'indirect-question', 3,
  "Ms. Wang: Amy, do you know (1)＿＿＿ yesterday? I didn't see him in class.\nAmy: No, he didn't. He had a bad cold, so he stayed home.\nMs. Wang: I see. Can you tell me (2)＿＿＿? I want to call his parents.\nAmy: Sorry, I don't know his phone number.\n\nWhich is the best choice for (1) and (2)?",
  ['did Ken come to school; what his phone number is', 'if Ken came to school; what is his phone number', 'if Ken came to school; what his phone number is', 'where Ken came to school; what his phone number is'], 'C',
  "(1) Amy 回答 No, he didn't.，可知原本的問題是 Yes/No 問句 Did Ken come to school yesterday?，變成間接問句要用 if 連接，去掉 did、動詞改成過去式：if Ken came to school。(2) What is his phone number? 改成直述句語序：what his phone number is。",
  ["Amy 用 No, he didn't. 回答，原本是哪一種問句？", 'Yes/No 問句變成間接問句時要加哪個字？', '(2) 的主詞是什麼？它要放在 is 的前面還是後面？'],
  {'A': '(1) 間接問句不能保留 did 倒裝，Yes/No 問句要用 if 連接。', 'B': '(2) 間接問句要用直述句語序，主詞 his phone number 要放在 is 前面。', 'D': "Amy 回答 No, he didn't.，表示原本是 Yes/No 問句，要用 if（是否），不是 where。"},
  None)
Q('EN-9B-2', 'reading-inference', 3,
  "A: Good afternoon. What's the problem today?\nB: I've had a terrible toothache since last night. I couldn't sleep at all.\nA: Let me take a look. Open your mouth, please... Hmm, there's a big hole in this tooth. I'll fix it for you today. After that, don't eat too many sweets, and brush your teeth after every meal.\nB: OK. Thank you.\n\nWhere does this conversation probably take place?",
  ['At a candy store', "At a dentist's office", 'At a restaurant', 'At a hotel'], 'B',
  'B 說牙痛（toothache）睡不著，A 請 B 張開嘴巴檢查，發現牙齒有個洞，說今天幫他補好，並提醒少吃甜食、飯後刷牙。能檢查並治療牙齒的是牙醫，所以對話最可能發生在牙醫診所。',
  ['B 哪裡不舒服？', 'A 為 B 做了什麼？會說這些話的是什麼職業的人？', '不要只看到單一個字（sweets、meal）就選答案。'],
  {'A': '看到 sweets 就選糖果店，但 A 是叫 B 不要吃太多甜食，還要幫 B 補牙。', 'C': '看到 meal 就選餐廳，但對話內容是檢查和治療牙齒。', 'D': "看到 couldn't sleep 就聯想到旅館，但 B 睡不著是因為牙痛。"},
  None)
Q('EN-9B-2', 'reading-inference', 3,
  'Jenny practiced the piano for three hours every day for a month before the music contest. On the day of the contest, her hands were shaking before she went on stage. But when she started to play, she forgot about everything around her. When she finished, everyone stood up and clapped for a long time. Jenny smiled with tears in her eyes.\n\nHow did Jenny probably feel at the end?',
  ['Happy and proud', 'Nervous and afraid', 'Angry and upset', 'Bored and tired'], 'A',
  'Jenny 苦練一個月，表演結束時全場起立、鼓掌很久，她 smiled with tears in her eyes（含著淚微笑），這是喜極而泣，表示她很開心、也為自己感到驕傲。上台前手發抖的緊張已經過去了。',
  ['題目問的是哪個時間點的心情？', '表演結束時，觀眾有什麼反應？', '一邊微笑一邊流淚，通常是什麼樣的心情？'],
  {'B': '緊張發抖是她上台「之前」的心情，題目問的是表演結束時。', 'C': '全場起立鼓掌很久，她還面帶微笑，沒有生氣的線索。', 'D': '她努力練習一個月，表演後得到熱烈掌聲，不會覺得無聊。'},
  None)
Q('EN-9B-2', 'reading-main-idea', 3,
  "Some students are afraid to ask questions in class. They worry about what others will think, or they don't know how they should ask. But asking questions is one of the best ways to learn. When you ask, you find out what you don't understand. Most teachers are happy when students ask questions. If you are shy, you can write down your questions and ask your teacher after class.\n\nWhat is the main idea of the passage?",
  ["Teachers don't like students who ask questions.", 'Shy students should not talk in class.', 'Students should write down everything the teacher says.', "Students shouldn't be afraid to ask questions."], 'D',
  '作者先說有些學生不敢發問，接著用 But 轉折，說發問是最好的學習方法之一，老師也樂於學生發問，最後給害羞的人建議。全文都在鼓勵學生不要害怕發問。',
  ['第一句提出了什麼問題？', 'But 之後，作者的看法是什麼？', '最後一句的建議是在幫助什麼樣的學生？目的是什麼？'],
  {'A': '文中說 Most teachers are happy when students ask questions.，和這句相反。', 'B': '作者是建議害羞的學生可以下課再問，不是叫他們不要說話。', 'C': '作者只建議害羞的人把「問題」寫下來，不是寫下老師說的每句話。'},
  None)
Q('EN-9B-2', 'reading-main-idea', 3,
  "Three years ago, people in Green Town threw away thousands of plastic bags every day. Then the town decided to make a change. Now, stores don't give out free plastic bags, so people bring their own bags when they go shopping. Many restaurants also let people pay less if they bring their own cups. Today, there is much less plastic in the town's trash.\n\nWhat is the best title for this passage?",
  ['The Best Stores in Green Town', 'Why Plastic Bags Are Cheap', 'How Green Town Uses Fewer Plastic Bags', 'A Famous Restaurant in Green Town'], 'C',
  '文章先說三年前鎮上每天丟掉大量塑膠袋，接著說明鎮上的改變：商店不再免費提供塑膠袋、餐廳鼓勵自備杯子，結果垃圾中的塑膠少了很多。全文在說綠鎮如何減少使用塑膠袋，所以最好的標題是 How Green Town Uses Fewer Plastic Bags。',
  ['文章前後比較了綠鎮哪方面的變化？', '商店和餐廳的例子都是為了說明什麼？', '好的標題要能涵蓋整篇文章，而不只是其中一個細節。'],
  {'A': '文中沒有比較哪些商店最好，商店只是不再免費給塑膠袋。', 'B': '文中沒有討論塑膠袋的價格。', 'D': '餐廳只是其中一個例子，而且文中沒有提到某家有名的餐廳。'},
  None)
