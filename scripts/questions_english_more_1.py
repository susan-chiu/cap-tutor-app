# -*- coding: utf-8 -*-
"""英語 題庫（自編原創題，依 108 課綱）— 補題：七上～八上文法單元"""
from fractions import Fraction as F
import math

SUBJECT = "english"
UNITS = []
QUESTIONS = []


def Q(unit, concept, difficulty, stem, options, answer, explanation, hints, wrong, check=None):
    QUESTIONS.append(dict(unit=unit, concept=concept, difficulty=difficulty, stem=stem,
                          options=options, answer=answer, explanation=explanation,
                          hints=hints, wrong=wrong, check=check))


# ============================ EN-7A-1 be 動詞與人稱代名詞 ============================
Q("EN-7A-1", "be-verb", 1, "I ＿＿＿ a student at Hope Junior High School.",
  ["am", "is", "are", "be"], "A",
  "主詞是 I（我），be 動詞固定搭配 am，所以是 I am a student.（我是學生）。is 配第三人稱單數，are 配 you、we、they 或複數。",
  ["先看主詞是誰。", "I 有自己專屬的 be 動詞。"],
  {"B": "以為 a student 是單數就用 is，但 be 動詞要看主詞 I，不是看後面的名詞。", "C": "把 are 當成萬用的 be 動詞，忘了 I 只能配 am。", "D": "be 是原形，句子裡要依主詞變化成 am、is、are。"},
  None)
Q("EN-7A-1", "be-verb", 1, "The books on the desk ＿＿＿ new.",
  ["is", "are", "am", "be"], "B",
  "主詞是 The books（那些書），books 有 s 是複數；on the desk 只是說明書在哪裡。複數主詞的 be 動詞用 are。",
  ["真正的主詞是 books 還是 desk？", "books 是單數還是複數？"],
  {"A": "看到最靠近空格的 desk 是單數就用 is，誤把 desk 當主詞。", "C": "am 只能和 I 搭配。", "D": "be 是原形，不能直接當句子的動詞。"},
  None)
Q("EN-7A-1", "be-verb", 2, "＿＿＿ Mr. Wang your English teacher? — No, he isn't. He is our math teacher.",
  ["Are", "Do", "Is", "Does"], "C",
  "答句用 he isn't，可知問句是 be 動詞疑問句；主詞 Mr. Wang 是第三人稱單數，所以把 Is 放句首：Is Mr. Wang your English teacher?",
  ["先看答句用的是 be 動詞還是助動詞。", "Mr. Wang 是一個人，配哪個 be 動詞？"],
  {"A": "看到 your 就以為要用 Are，但主詞是 Mr. Wang 一個人。", "B": "句子裡沒有一般動詞，不能用助動詞 Do 來問。", "D": "Does 雖然配第三人稱單數，但答句是 isn't，表示要用 be 動詞而不是助動詞。"},
  None)
Q("EN-7A-1", "be-verb", 2, "Where ＿＿＿ my glasses? — They're on the table.",
  ["is", "am", "does", "are"], "D",
  "glasses（眼鏡）在英文裡一定是複數，答句也用 They're 來代替，所以 be 動詞要用 are：Where are my glasses?",
  ["答句用哪個代名詞代替 my glasses？", "glasses 字尾有 es，是單數還是複數？"],
  {"A": "中文說「一副眼鏡」像是單數，就用 is，忘了 glasses 是複數。", "B": "am 只配 I，主詞是 my glasses。", "C": "句子沒有一般動詞，問「在哪裡」要用 be 動詞，不用 does。"},
  None)
Q("EN-7A-1", "pronoun", 1, "Lisa and I are good friends. ＿＿＿ are in Class 702.",
  ["We", "They", "Us", "She"], "A",
  "Lisa and I（Lisa 和我）包含說話的人自己，代名詞要用「我們」；空格在句首當主詞，用主格 We。",
  ["Lisa and I 裡面有沒有「我」？", "「我們」當主詞時要用主格還是受格？"],
  {"B": "They 是「他們」，不包含說話者自己，但這裡有 I。", "C": "Us 是受格，不能放在句首當主詞。", "D": "She 只代替 Lisa 一個人，而且 be 動詞是 are，主詞應是複數。"},
  None)
Q("EN-7A-1", "pronoun", 2, "These are not my shoes. ＿＿＿ are under the bed.",
  ["My", "Mine", "Me", "I"], "B",
  "空格當主詞，後面直接接 are，沒有名詞，所以要用所有格代名詞 Mine（= my shoes，我的鞋子）。My 後面一定要接名詞。",
  ["空格後面有沒有接名詞？", "「我的（東西）」單獨使用時要用哪個字？"],
  {"A": "My 是所有格形容詞，後面必須接名詞，例如 My shoes are...。", "C": "Me 是受格，不能當主詞，也不能表示「我的」。", "D": "I 是「我」，句意變成「我在床底下」，而且 I 不配 are。"},
  None)
Q("EN-7A-1", "pronoun", 2, "Mr. and Mrs. Chen are my neighbors. ＿＿＿ dog is very friendly.",
  ["They", "Them", "Their", "Theirs"], "C",
  "空格後面接名詞 dog，要用所有格形容詞。Mr. and Mrs. Chen 是兩個人，「他們的狗」是 Their dog。",
  ["空格後面接的是名詞還是動詞？", "「他們的」後面接名詞時用哪個字？"],
  {"A": "They 是主格，They dog 不合文法，主格後面不能直接接名詞。", "B": "Them 是受格，只能放在動詞或介系詞後面。", "D": "Theirs 是所有格代名詞，後面不能再接名詞 dog。"},
  None)
Q("EN-7A-1", "dialogue-response", 1, "A: How are you today?\nB: ＿＿＿",
  ["I'm Ken. I'm from Taipei.", "Nice to meet you, too, Ken.", "Yes, I am. I'm a student.", "I'm fine, thank you. And you?"], "D",
  "How are you? 是問「你好嗎？」，要回答自己的狀況，例如 I'm fine, thank you. And you?（我很好，謝謝。你呢？）。",
  ["How are you? 是在問名字還是問狀況？", "回答後也可以禮貌地反問對方。"],
  {"A": "I'm Ken. I'm from Taipei. 是自我介紹，回答 What's your name? 或 Where are you from?，不是說自己好不好。", "B": "Nice to meet you, too, Ken. 是回應初次見面的 Nice to meet you.", "C": "Yes, I am. 只能回答 Are you...? 的是非問句，How 問句不能用 Yes 回答。"},
  None)
Q("EN-7A-1", "dialogue-response", 2, "A: Is that your brother?\nB: ＿＿＿ He's my cousin, Sam.",
  ["No, he isn't.", "Yes, he is.", "No, he doesn't.", "No, they aren't."], "A",
  "B 接著說「他是我表哥 Sam」，表示那個人不是 B 的哥哥，所以要否定回答。問句用 Is，答句也用 be 動詞：No, he isn't.",
  ["B 後面那句話說那個人是誰？", "問句用 Is，回答要用同一種動詞。"],
  {"B": "沒注意後面說他是 cousin，不是 brother，所以不能肯定回答。", "C": "問句用 be 動詞 Is，答句不能改用助動詞 doesn't。", "D": "問的是一個人，不能用複數 they aren't。"},
  None)
Q("EN-7A-1", "reading-detail", 2, "Hi, I'm Ryan. I'm from Canada, but my family and I are in Taiwan now. My father is an engineer, and my mother is a nurse. My sister, Kate, and I are students at Rose Junior High School. Kate is in the eighth grade, and I am in the seventh grade. Our favorite teacher is Ms. Huang. She is our music teacher.\n\nWho is a nurse?",
  ["Ryan's father", "Ryan's mother", "Ms. Huang", "Kate"], "B",
  "文中寫 my mother is a nurse，my 指的是 Ryan，所以護理師是 Ryan 的媽媽。爸爸是工程師，Ms. Huang 是音樂老師，Kate 是學生。",
  ["找出 nurse 這個字出現在哪一句。", "那一句的主詞是誰？my 指的是寫信的人。"],
  {"A": "把 engineer 和 nurse 看反了，Ryan 的爸爸是工程師。", "C": "Ms. Huang 是他們的音樂老師，不是護理師。", "D": "Kate 是 Ryan 的姊姊，還在讀八年級，是學生。"},
  None)
Q("EN-7A-1", "reading-detail", 3, "These are three new students in our class.\nAndy is thirteen. He is from Tainan, and he is in the art club.\nBecky and Cindy are twins. They are twelve, and they are from Taichung. Becky is in the art club, but Cindy isn't. She is in the music club.\n\nWhich is TRUE?",
  ["Andy and Cindy are from the same city.", "The twins are thirteen years old.", "Andy and Becky are in the same club.", "Cindy and Andy are in the art club."], "C",
  "Andy 在美術社（art club），Becky 也在美術社，所以 Andy 和 Becky 在同一個社團。Andy 來自臺南、雙胞胎來自臺中；雙胞胎是 12 歲；Cindy 在音樂社。",
  ["把三個人的年齡、城市、社團各自整理出來。", "Becky 和 Cindy 雖然是雙胞胎，社團一樣嗎？"],
  {"A": "Andy 來自臺南，Cindy 來自臺中，不是同一個城市。", "B": "13 歲的是 Andy，雙胞胎是 12 歲，把年齡配錯人。", "D": "以為雙胞胎社團一樣，但文中說 Cindy isn't（不在美術社），她在音樂社。"},
  None)
Q("EN-7A-1", "pronoun", 3, "Jim: Mom, this is Leo. (1)＿＿＿ is my new classmate.\nMom: Hi, Leo. Nice to meet you. Are you from Taipei?\nLeo: No, I'm not. My parents and I are from Tainan, but now (2)＿＿＿ live in Taipei.\n\nWhich is the best choice for (1) and (2)?",
  ["He; us", "His; we", "Him; our", "He; we"], "D",
  "(1) 代替 Leo 當主詞，Leo 是男生，主格用 He。(2) 代替 My parents and I（包含 Leo 自己），後面接動詞 live，要用主格「我們」we。",
  ["兩個空格後面接的都是動詞，所以都要當主詞。", "My parents and I 包含說話的 Leo 自己，要用「我們」。"],
  {"A": "(2) 的 us 是受格，不能放在動詞 live 前面當主詞。", "B": "(1) 的 His 是所有格，後面要接名詞，不能直接接 is 當主詞。", "C": "Him 是受格、our 是所有格，兩個都不能當主詞。"},
  None)

# ============================ EN-7A-2 現在簡單式與頻率副詞 ============================
Q("EN-7A-2", "simple-present", 1, "My mother ＿＿＿ to work at eight every morning.",
  ["go", "goes", "going", "is go"], "B",
  "every morning 表示每天的習慣，用現在簡單式。主詞 My mother 是第三人稱單數，go 要加 es 變成 goes。",
  ["every morning 表示什麼樣的動作？", "第三人稱單數當主詞時，動詞要怎麼變化？"],
  {"A": "忘了主詞是第三人稱單數，動詞要加 es。", "C": "going 是 V-ing，前面沒有 be 動詞不能單獨當動詞。", "D": "be 動詞和一般動詞原形不能同時放在一起當動詞。"},
  None)
Q("EN-7A-2", "simple-present", 1, "We ＿＿＿ English class on Mondays and Fridays.",
  ["has", "having", "have", "are have"], "C",
  "on Mondays and Fridays 表示每週固定的習慣，用現在簡單式。主詞 We 是複數，動詞用原形 have。",
  ["主詞 We 是第幾人稱？", "has 只配哪一類主詞？"],
  {"A": "has 只配第三人稱單數（he、she、it），We 要用 have。", "B": "having 前面沒有 be 動詞，不能當句子的動詞。", "D": "are 和 have 不能同時當動詞，一句只需要一個主要動詞。"},
  None)
Q("EN-7A-2", "frequency", 1, "Lucy ＿＿＿ drinks milk. She drinks a glass of it every morning.",
  ["never", "seldom", "sometimes", "always"], "D",
  "後一句說她每天早上都喝一杯牛奶，表示頻率是「總是」，要用 always。",
  ["後面那句說她多久喝一次牛奶？", "「每天都做」對應哪一個頻率副詞？"],
  {"A": "never 是「從不」，和「每天早上都喝」矛盾。", "B": "seldom 是「很少」，和每天都喝不符。", "C": "sometimes 是「有時候」，但每天都喝的頻率比有時候高很多。"},
  None)
Q("EN-7A-2", "dialogue-response", 1, "A: Where does your uncle work?\nB: ＿＿＿",
  ["He works in a hospital.", "Yes, he does.", "He works very hard.", "He goes to work by bus."], "A",
  "Where 問「在哪裡」，要回答地點。He works in a hospital.（他在醫院工作）說出工作地點，最合適。",
  ["問句的疑問詞是哪一個？", "Where 要用什麼資訊來回答？"],
  {"B": "Where 開頭的問句不能用 Yes 或 No 回答。", "C": "He works very hard. 說的是工作的態度，回答的是 How。", "D": "by bus 是交通方式，回答的是 How does he go to work?"},
  None)
Q("EN-7A-2", "simple-present", 2, "My brother ＿＿＿ TV after dinner. He studies in his room.",
  ["don't watch", "doesn't watch", "doesn't watches", "isn't watch"], "B",
  "後句說他在房間讀書，所以前句是否定。主詞 My brother 是第三人稱單數，否定要用 doesn't，後面的動詞要用原形 watch。",
  ["主詞是第三人稱單數，否定助動詞用哪一個？", "用了 doesn't 以後，動詞還要加 s 嗎？"],
  {"A": "don't 配 I、you、we、they，第三人稱單數要用 doesn't。", "C": "doesn't 後面的動詞要回到原形，不能再加 es。", "D": "watch 是一般動詞，否定要用助動詞，不能用 isn't。"},
  None)
Q("EN-7A-2", "simple-present", 2, "What time ＿＿＿ your father get up on Sundays? — At nine.",
  ["do", "is", "does", "are"], "C",
  "句子有一般動詞 get up，疑問句要用助動詞。主詞 your father 是第三人稱單數，所以用 does，後面動詞用原形 get。",
  ["句子裡的動詞 get up 是 be 動詞還是一般動詞？", "主詞 your father 是單數還是複數？"],
  {"A": "看到 your 就用 do，但主詞是 your father 一個人，要用 does。", "B": "句子已經有一般動詞 get up，不能再用 be 動詞 is 來問。", "D": "are 是 be 動詞，而且是複數，和 get up 不能搭配。"},
  None)
Q("EN-7A-2", "frequency", 2, "Mary ＿＿＿ tired in the morning because she goes to bed late every night.",
  ["always is", "always", "is never", "is always"], "D",
  "她每晚都很晚睡，所以早上「總是」很累。頻率副詞要放在 be 動詞後面，因此是 is always tired。",
  ["她每天很晚睡，早上會累嗎？", "頻率副詞遇到 be 動詞時，要放在前面還是後面？"],
  {"A": "頻率副詞要放在 be 動詞後面，always is 的位置放反了。", "B": "tired 是形容詞，前面一定要有 be 動詞，只用 always 缺少動詞。", "C": "每天晚睡應該會累，is never tired（從不累）和原因不合。"},
  None)
Q("EN-7A-2", "frequency", 2, "A: How often does Sam play tennis?\nB: ＿＿＿",
  ["Three times a week.", "For two hours.", "In the park.", "With his father."], "A",
  "How often 是問「多常、多久一次」，要回答頻率，例如 Three times a week.（一週三次）。",
  ["How often 問的是時間長度、地點，還是次數？", "回答頻率常用「次數＋a week / a month」。"],
  {"B": "For two hours. 是回答 How long（多久的時間）。", "C": "In the park. 是回答 Where（在哪裡）。", "D": "With his father. 是回答 With whom / Who（和誰）。"},
  None)
Q("EN-7A-2", "dialogue-response", 2, "A: Do you and your sister walk to school?\nB: ＿＿＿ We ride our bikes.",
  ["Yes, we do.", "No, we don't.", "No, they don't.", "No, we aren't."], "B",
  "B 說「我們騎腳踏車」，表示不是走路上學，要否定回答。問句主詞 you and your sister，回答時要用 we，助動詞用 don't。",
  ["B 說他們怎麼去學校？", "you and your sister 在回答時要換成哪個代名詞？"],
  {"A": "沒注意後面說騎腳踏車，所以不能說 Yes。", "C": "回答的人自己也在裡面，要用 we，不能用 they。", "D": "問句用助動詞 Do，回答也要用 don't，不能改用 be 動詞。"},
  None)
Q("EN-7A-2", "reading-detail", 2, "Nancy loves animals. On Saturdays, she helps at an animal hospital near her home. She feeds the dogs there and cleans their rooms. On Sundays, she usually goes hiking in the mountains with her family. She seldom stays home on weekends.\n\nWhere does Nancy go on Saturdays?",
  ["A pet shop", "A mountain", "An animal hospital", "Her friend's house"], "C",
  "文中說 On Saturdays, she helps at an animal hospital near her home.，所以星期六她去動物醫院幫忙。去爬山是星期日的事。",
  ["找出 On Saturdays 那一句。", "注意星期六和星期日做的事不一樣。"],
  {"A": "看到餵狗就猜是寵物店，但文中說的是 animal hospital。", "B": "去山上爬山是星期日（On Sundays）的活動。", "D": "文中沒有提到去朋友家。"},
  None)
Q("EN-7A-2", "reading-detail", 3, "In Kelly's family, everyone goes out early on weekdays. Her father always takes the MRT to work. Her mother usually drives to work, but she takes the bus on rainy days. Kelly and her brother Danny live near their school, so they walk there every day. Danny never takes the bus.\n\nIt is a rainy Wednesday morning. Who takes the bus?",
  ["Kelly's father", "Kelly and Danny", "Nobody in the family", "Kelly's mother"], "D",
  "星期三是平日，又是下雨天。媽媽平常開車，但 on rainy days 會搭公車，所以搭公車的是媽媽。爸爸總是搭捷運，Kelly 和 Danny 每天走路。",
  ["先確認星期三是平日，再注意「下雨」這個條件。", "誰的交通方式會因為下雨而改變？"],
  {"A": "爸爸 always takes the MRT，搭的是捷運不是公車。", "B": "Kelly 和 Danny 每天走路上學，Danny 更是 never takes the bus。", "C": "只看到 usually drives，沒讀到後面 but she takes the bus on rainy days。"},
  None)
Q("EN-7A-2", "simple-present", 3, "My grandparents live in the country. Grandpa (1)＿＿＿ up at five every day and works on the farm. Grandma (2)＿＿＿ like to get up early, so she gets up at seven.\n\nWhich is the best choice for (1) and (2)?",
  ["gets; doesn't", "get; doesn't", "gets; don't", "gets; isn't"], "A",
  "(1) 主詞 Grandpa 是第三人稱單數，每天的習慣用現在簡單式，get 要加 s 變 gets。(2) 奶奶七點才起床，表示她「不喜歡」早起；主詞第三人稱單數、動詞 like 是一般動詞，否定用 doesn't。",
  ["兩個空格的主詞各是誰？是單數還是複數？", "(2) 後面接一般動詞 like，否定要用助動詞還是 be 動詞？"],
  {"B": "(1) 主詞 Grandpa 是第三人稱單數，get 要加 s。", "C": "(2) 主詞 Grandma 是第三人稱單數，否定要用 doesn't，不是 don't。", "D": "(2) like 是一般動詞，否定不能用 be 動詞 isn't。"},
  None)

# ============================ EN-7B-1 現在進行式與祈使句 ============================
Q("EN-7B-1", "present-progressive", 1, "Be quiet! The baby ＿＿＿.",
  ["sleeps", "are sleeping", "is sleeping", "sleeping"], "C",
  "Be quiet!（安靜！）表示寶寶「現在正在」睡覺，用現在進行式 be + V-ing。主詞 The baby 是單數，be 動詞用 is：is sleeping。",
  ["叫大家安靜，是因為寶寶現在正在做什麼？", "現在進行式的形式是什麼？主詞是單數還是複數？"],
  {"A": "sleeps 是現在簡單式，表示習慣，不能表達「此刻正在睡」。", "B": "The baby 是單數，be 動詞要用 is，不是 are。", "D": "只有 V-ing 少了 be 動詞，不能構成現在進行式。"},
  None)
Q("EN-7B-1", "imperative", 1, "＿＿＿ careful! The floor is wet.",
  ["Is", "Are", "Being", "Be"], "D",
  "祈使句用來提醒或命令，以動詞原形開頭。careful 是形容詞，前面要用 be 動詞的原形 Be：Be careful!（小心！）",
  ["這句話是在提醒別人，屬於哪一種句子？", "祈使句開頭的動詞要用什麼形式？"],
  {"A": "Is 放句首會變成疑問句，而且句尾是驚嘆號，不是問句。", "B": "Are 不是原形，祈使句要用原形動詞開頭。", "C": "Being 是 V-ing 形式，祈使句不用 V-ing 開頭。"},
  None)
Q("EN-7B-1", "present-progressive", 1, "Look! Ben and Leo ＿＿＿ soccer on the playground.",
  ["are playing", "is playing", "play", "playing"], "A",
  "Look! 表示叫人看「現在正在發生」的事，用現在進行式。主詞 Ben and Leo 是兩個人，用 are playing。",
  ["Look! 暗示動作是什麼時候發生的？", "Ben and Leo 是幾個人？"],
  {"B": "主詞是兩個人，be 動詞要用 are 而不是 is。", "C": "play 是現在簡單式，表示習慣，不能表達「看！正在踢」。", "D": "playing 前面少了 be 動詞。"},
  None)
Q("EN-7B-1", "dialogue-response", 1, "A: What are you doing, Mary?\nB: ＿＿＿",
  ["I read comic books at home.", "I'm reading a comic book.", "Yes, I am. I'm very busy.", "I'm Mary, Tom's sister."], "B",
  "What are you doing? 問「你現在正在做什麼？」，要用現在進行式回答：I'm reading a comic book.（我正在看漫畫）。",
  ["問句用的是哪一種時態？", "回答時要和問句用同一種時態。"],
  {"A": "I read comic books at home. 是現在簡單式，說的是習慣，不是現在正在做的事。", "C": "What 開頭的問句不能用 Yes 回答。", "D": "I'm Mary, Tom's sister. 是在介紹自己，但對方問的是正在做什麼。"},
  None)
Q("EN-7B-1", "present-progressive", 2, "Peter is ＿＿＿ in the pool now.",
  ["swiming", "swims", "swimming", "swim"], "C",
  "is ... now 是現在進行式，要用 V-ing。swim 是「短母音＋單一子音」結尾的單音節字，要重複字尾 m 再加 ing：swimming。",
  ["is 後面接什麼形式的動詞，才是現在進行式？", "swim 加 ing 時，字尾子音要不要重複？"],
  {"A": "知道要加 ing，但忘了 swim 要重複字尾 m。", "B": "swims 是現在簡單式，不能接在 is 後面。", "D": "swim 是原形，不能接在 be 動詞 is 後面。"},
  None)
Q("EN-7B-1", "present-progressive", 2, "＿＿＿ the students ＿＿＿ a test now? — Yes. Please be quiet.",
  ["Do; take", "Is; taking", "Are; take", "Are; taking"], "D",
  "now 表示現在正在進行，疑問句要把 be 動詞移到句首，動詞用 V-ing。主詞 the students 是複數，所以用 Are ... taking。",
  ["now 提示你要用哪一種時態？", "the students 是單數還是複數？動詞要用什麼形式？"],
  {"A": "Do ... take 是現在簡單式疑問句，問的是習慣，不是此刻。", "B": "the students 是複數，不能用 Is。", "C": "be 動詞後面的動詞要用 V-ing，Are ... take 不合文法。"},
  None)
Q("EN-7B-1", "imperative", 2, "＿＿＿ late again, Tim. Class starts at eight.",
  ["Don't be", "Don't", "Not be", "Doesn't be"], "A",
  "否定祈使句是 Don't + 原形動詞。late 是形容詞，前面需要 be，所以是 Don't be late.（不要遲到）。",
  ["否定的祈使句要怎麼開頭？", "late 是形容詞還是動詞？前面需要什麼？"],
  {"B": "late 是形容詞，Don't 後面要先接原形動詞 be。", "C": "祈使句的否定要用 Don't，不能只用 Not。", "D": "祈使句沒有主詞，否定一律用 Don't，不用 Doesn't。"},
  None)
Q("EN-7B-1", "imperative", 2, "It's raining. Let's ＿＿＿ out today. Let's watch a movie at home.",
  ["don't go", "not go", "not going", "no go"], "B",
  "Let's 的否定是 Let's not + 原形動詞，所以「我們今天不要出去」是 Let's not go out today.",
  ["Let's 後面接什麼形式的動詞？", "Let's 的否定，not 要放在哪裡？"],
  {"A": "一般祈使句否定用 Don't，但 Let's 的否定是 Let's not，不是 Let's don't。", "C": "Let's 後面要接原形動詞，不能接 V-ing。", "D": "no 不能用來否定動詞，要用 not。"},
  None)
Q("EN-7B-1", "dialogue-response", 2, "A: Please pass me the salt.\nB: ＿＿＿",
  ["You're welcome.", "That's all right.", "Here you are.", "I'm sorry to hear that."], "C",
  "A 請 B 把鹽遞過來，B 把東西交給對方時常說 Here you are.（拿去吧／給你）。",
  ["A 是在道謝、道歉，還是請別人做事？", "把東西交給別人時通常說什麼？"],
  {"A": "You're welcome. 是對方說謝謝時的回答。", "B": "That's all right. 多用來回應對方的道歉。", "D": "I'm sorry to hear that. 是聽到壞消息時的回應。"},
  None)
Q("EN-7B-1", "reading-detail", 2, "It is seven o'clock in the evening at the Lins' house. Mr. Lin is cooking dinner in the kitchen. His son, Jim, is putting bowls and chopsticks on the table. Mrs. Lin is in the living room. She is talking with Grandma on the phone. Their daughter, Amy, is taking a bath.\n\nWhat is Mrs. Lin doing?",
  ["She is cooking dinner.", "She is taking a bath.", "She is putting bowls on the table.", "She is talking with Grandma on the phone."], "D",
  "文中說 Mrs. Lin is in the living room. She is talking with Grandma on the phone.，所以林太太正在和奶奶講電話。煮飯的是林先生。",
  ["找到 Mrs. Lin 出現的句子。", "後面那句的 She 指的是誰？"],
  {"A": "煮晚餐的是 Mr. Lin，不是 Mrs. Lin。", "B": "在洗澡的是女兒 Amy。", "C": "擺碗筷的是兒子 Jim。"},
  None)
Q("EN-7B-1", "imperative", 3, "Museum Notice\n1. Please keep your voice down.\n2. Don't touch the paintings.\n3. Don't take photos in Room A. Photos are OK in Room B.\n\nWhich visitor is NOT following the rules?",
  ["Ken is taking photos of the paintings in Room A.", "Amy is talking quietly with her mom in Room B.", "Leo is taking photos in Room B.", "Sue is looking at the paintings in Room A."], "A",
  "第 3 條規定在 A 室不能拍照，Ken 卻在 A 室拍畫作，違反規定。Amy 小聲說話符合第 1 條；B 室可以拍照；只是看畫沒有碰觸，也沒有違規。",
  ["把每個人的行為和三條規則一一對照。", "拍照的規定在 A 室和 B 室有什麼不同？"],
  {"B": "規定是降低音量，小聲說話（talking quietly）是遵守規則。", "C": "第 3 條說 B 室可以拍照，Leo 沒有違規。", "D": "規定是不能碰畫，只是看畫沒有違規。"},
  None)
Q("EN-7B-1", "present-progressive", 3, "It is three o'clock on Saturday afternoon. Right now, my dad (1)＿＿＿ the car outside, and my brothers are helping him. My mom is in the kitchen. She (2)＿＿＿ a cake for my grandma's birthday.\n\nWhich is the best choice for (1) and (2)?",
  ["washes; is making", "is washing; is making", "is washing; makes", "are washing; is making"], "B",
  "Right now（就在現在）表示兩個動作都正在進行，都要用現在進行式。(1) 主詞 my dad 是單數，用 is washing；(2) 主詞 She 是單數，用 is making。",
  ["Right now 告訴你這些動作是什麼時候發生的？", "兩個空格的主詞各是單數還是複數？"],
  {"A": "(1) washes 是現在簡單式，表示習慣，但 Right now 是正在進行的動作。", "C": "(2) makes 是現在簡單式，媽媽此刻正在做蛋糕，要用 is making。", "D": "(1) 主詞是 my dad 一個人，雖然後面提到哥哥們，be 動詞仍要用 is。"},
  None)

# ============================ EN-7B-2 過去簡單式 ============================
Q("EN-7B-2", "past-tense", 1, "My grandparents ＿＿＿ in Tainan ten years ago. Now they live in Taipei.",
  ["live", "lives", "living", "lived"], "D",
  "ten years ago（十年前）是過去的時間，要用過去式。live 字尾是 e，直接加 d 變成 lived。",
  ["ten years ago 指的是現在還是過去？", "規則動詞的過去式怎麼變化？"],
  {"A": "live 是現在式，但 ten years ago 是過去的時間。", "B": "lives 是第三人稱單數現在式，而且主詞是複數。", "C": "living 前面沒有 be 動詞，不能當動詞。"},
  None)
Q("EN-7B-2", "irregular-verb", 1, "I ＿＿＿ a great movie with my friends last Saturday.",
  ["saw", "see", "seed", "seen"], "A",
  "last Saturday（上週六）是過去，要用過去式。see 是不規則動詞，過去式是 saw。",
  ["last Saturday 表示什麼時候？", "see 的過去式是規則變化嗎？"],
  {"B": "see 是現在式，沒有配合過去時間 last Saturday。", "C": "把 see 當成規則動詞加 d，但 see 是不規則動詞。", "D": "seen 是過去分詞，不能單獨當過去式動詞。"},
  None)
Q("EN-7B-2", "past-tense", 1, "I ＿＿＿ very tired yesterday, so I went to bed early.",
  ["am", "was", "were", "is"], "B",
  "yesterday 是過去的時間，be 動詞要用過去式。主詞 I 的 be 動詞過去式是 was。",
  ["yesterday 是過去還是現在？", "am 的過去式是什麼？"],
  {"A": "am 是現在式，和 yesterday 不合。", "C": "were 用在 you、we、they 或複數主詞，I 要用 was。", "D": "is 是現在式，而且不配主詞 I。"},
  None)
Q("EN-7B-2", "dialogue-response", 1, "A: Did you have a good weekend?\nB: ＿＿＿",
  ["Yes, I do. I go hiking with my dad.", "No, I wasn't. I was at home all day.", "Yes, I did. I went hiking with my dad.", "Yes, I will. I'll go hiking with my dad."], "C",
  "問句用 Did，問的是過去的週末，回答也要用 did，後面補充的內容也用過去式 went。",
  ["問句用了哪個助動詞？", "回答時要和問句用相同的時態。"],
  {"A": "do 和 go 是現在式，但問的是已經過去的週末。", "B": "問句用助動詞 Did，不能用 be 動詞 wasn't 回答。", "D": "will 是未來式，問的是過去的事。"},
  None)
Q("EN-7B-2", "past-tense", 2, "Lisa ＿＿＿ to the party last night. She stayed home.",
  ["doesn't go", "didn't went", "wasn't go", "didn't go"], "D",
  "她待在家裡，所以昨晚沒有去派對。過去式否定用 didn't，後面接原形動詞 go：didn't go。",
  ["last night 要用什麼時態？", "didn't 後面的動詞要用什麼形式？"],
  {"A": "doesn't 是現在式，和 last night 不合。", "B": "didn't 已經表示過去，後面的動詞要用原形 go，不能用 went。", "C": "go 是一般動詞，否定要用 didn't，不能用 be 動詞 wasn't。"},
  None)
Q("EN-7B-2", "past-tense", 2, "The baby ＿＿＿ a lot last night, so his parents didn't sleep well.",
  ["cried", "cryed", "cries", "crys"], "A",
  "last night 要用過去式。cry 是「子音＋y」結尾，要把 y 改成 i 再加 ed：cried。",
  ["last night 要用什麼時態？", "動詞以「子音＋y」結尾時，加 ed 前要怎麼改？"],
  {"B": "忘了「子音＋y」結尾要先把 y 改成 i 再加 ed。", "C": "cries 是現在式，和 last night 不合。", "D": "crys 拼法錯誤，而且也不是過去式。"},
  None)
Q("EN-7B-2", "irregular-verb", 2, "Ms. Lee ＿＿＿ us a funny story in class yesterday.",
  ["telled", "told", "tells", "tell"], "B",
  "yesterday 要用過去式。tell 是不規則動詞，過去式是 told，不是加 ed。",
  ["yesterday 表示什麼時態？", "tell 的過去式是規則變化嗎？"],
  {"A": "把 tell 當成規則動詞加 ed，但 tell 的過去式是 told。", "C": "tells 是現在式，和 yesterday 不合。", "D": "tell 是原形，沒有配合過去時間。"},
  None)
Q("EN-7B-2", "irregular-verb", 2, "Mike ＿＿＿ a bad cold last week, but he's fine now.",
  ["has", "haved", "had", "have"], "C",
  "last week 是過去，「得了感冒」要用過去式。have 是不規則動詞，過去式是 had。",
  ["感冒是上週還是現在的事？", "have 的過去式是什麼？"],
  {"A": "has 是現在式，但感冒發生在 last week。", "B": "have 是不規則動詞，沒有 haved 這個字。", "D": "have 是原形，而且主詞是第三人稱單數，也不能用 have 當現在式。"},
  None)
Q("EN-7B-2", "dialogue-response", 2, "A: When did you come back from Japan?\nB: ＿＿＿",
  ["For five days.", "By plane.", "With my parents.", "Two days ago."], "D",
  "When 問「什麼時候」，要回答時間點。Two days ago.（兩天前）說出回來的時間，最合適。",
  ["問句的疑問詞是什麼？", "When 要用時間點還是時間長度來回答？"],
  {"A": "For five days. 是時間長度，回答的是 How long。", "B": "By plane. 是交通方式，回答的是 How。", "C": "With my parents. 是同伴，回答的是 Who / With whom。"},
  None)
Q("EN-7B-2", "reading-detail", 2, "Sunday, October 5\nToday I went to the night market with my cousin. We ate stinky tofu and played some games. I won a big teddy bear! At nine, it rained very hard, so we took a taxi home. It was a fun night.\n\nHow did the writer go home?",
  ["By taxi.", "By bus.", "On foot.", "By MRT."], "A",
  "日記寫 it rained very hard, so we took a taxi home.，因為下大雨，所以作者搭計程車回家。",
  ["找出和「回家」有關的那一句。", "took a taxi 是什麼意思？"],
  {"B": "文中沒有提到搭公車。", "C": "下大雨所以沒有走路回家，文中說的是搭計程車。", "D": "文中沒有提到捷運。"},
  None)
Q("EN-7B-2", "irregular-verb", 3, "Last Sunday, I (1)＿＿＿ a long letter to my pen pal in Japan. I also (2)＿＿＿ some photos of Taiwan in the letter. I hope she likes them.\n\nWhich is the best choice for (1) and (2)?",
  ["writed; put", "wrote; put", "wrote; putted", "write; puts"], "B",
  "Last Sunday 是過去，兩個動詞都要用過去式。write 的過去式是不規則的 wrote；put 的過去式和原形一樣，仍是 put。",
  ["Last Sunday 表示要用哪一種時態？", "write 和 put 都是不規則動詞，有一個的過去式和原形長得一樣。"],
  {"A": "write 是不規則動詞，過去式是 wrote，不是 writed。", "C": "put 的過去式還是 put，不能加 ted。", "D": "write 和 puts 都是現在式，沒有配合 Last Sunday。"},
  None)
Q("EN-7B-2", "reading-detail", 3, "Yesterday, Ken left home at 7:20. He walked to the MRT station in 10 minutes. Then he took the MRT, and the trip took 25 minutes. After he got off the MRT, he walked for 5 more minutes to his school.\n\nWhat time did Ken get to school?",
  ["7:55", "7:45", "8:00", "8:05"], "C",
  "把每段時間加起來：走到捷運站 10 分鐘＋搭捷運 25 分鐘＋再走 5 分鐘＝40 分鐘。7:20 再加 40 分鐘是 8:00。",
  ["Ken 去學校分成哪幾段路？", "把所有段落的分鐘數加起來，再從 7:20 往後算。"],
  {"A": "漏算最後走路的 5 分鐘，只算到 35 分鐘。", "B": "漏算第一段走到捷運站的 10 分鐘。", "D": "多加了 5 分鐘，可能把最後的走路時間算了兩次。"},
  "10 + 25 + 5 == 40 and 20 + 40 == 60")

# ============================ EN-8A-1 未來式與助動詞 ============================
Q("EN-8A-1", "future-tense", 1, "My uncle will ＿＿＿ us next week.",
  ["visit", "visits", "visited", "visiting"], "A",
  "will 是助動詞，後面一定接原形動詞，所以是 will visit。next week 也表示未來。",
  ["will 後面要接什麼形式的動詞？", "主詞是第三人稱單數，用了 will 以後動詞還要加 s 嗎？"],
  {"B": "看到主詞 My uncle 是第三人稱單數就加 s，但 will 後面要用原形。", "C": "visited 是過去式，和 will、next week 不合。", "D": "will 後面不接 V-ing。"},
  None)
Q("EN-8A-1", "modal-verb", 1, "Ann ＿＿＿ speak three languages: Chinese, English, and Japanese.",
  ["cans", "can", "can to", "is can"], "B",
  "can 表示「能夠、會」，是助動詞，沒有人稱變化，後面直接接原形動詞：Ann can speak...。",
  ["can 是一般動詞還是助動詞？", "助動詞後面接什麼？會不會因為主詞加 s？"],
  {"A": "助動詞 can 不會因為第三人稱單數加 s。", "C": "can 後面直接接原形動詞，不需要 to。", "D": "can 已經是助動詞，前面不能再加 be 動詞。"},
  None)
Q("EN-8A-1", "future-tense", 1, "We are going to ＿＿＿ a party for Mom next Sunday.",
  ["has", "having", "have", "had"], "C",
  "be going to 表示「打算、將要」，to 後面要接原形動詞，所以是 are going to have。",
  ["be going to 的 to 後面接什麼形式？", "主詞 We 之後已經有 are，空格只要填原形。"],
  {"A": "has 是第三人稱單數現在式，to 後面要用原形。", "B": "going to 後面不接 V-ing，having 不正確。", "D": "had 是過去式，和 next Sunday 以及 to 都不合。"},
  None)
Q("EN-8A-1", "dialogue-response", 1, "A: What are you going to do this weekend?\nB: ＿＿＿",
  ["I visited my aunt in Tainan last week.", "Yes, I am. I'm very excited about it.", "I visit my aunt in Tainan every day.", "I'm going to visit my aunt in Tainan."], "D",
  "問句用 be going to 問「這個週末打算做什麼」，回答也用 be going to 說出計畫：I'm going to visit my aunt in Tainan.",
  ["問的是過去、習慣，還是未來的計畫？", "回答時用和問句相同的句型。"],
  {"A": "visited 和 last week 是過去式，說的是上週的事，但問的是還沒到的週末。", "B": "What 開頭的問句不能用 Yes 回答。", "C": "every day 是每天的習慣，沒有回答週末的計畫。"},
  None)
Q("EN-8A-1", "future-tense", 2, "Mr. Wu ＿＿＿ in Taipei next year. His family is going to move to Tainan this summer.",
  ["won't work", "doesn't work", "didn't work", "won't works"], "A",
  "他們家今年夏天要搬去臺南，所以吳先生明年「將不會」在臺北工作。next year 是未來，否定用 won't + 原形動詞。",
  ["next year 是什麼時間？要用什麼時態？", "won't 後面的動詞要用什麼形式？"],
  {"B": "doesn't work 是現在式，表示現在的習慣，但說的是明年。", "C": "didn't work 是過去式，和 next year 矛盾。", "D": "won't 是助動詞，後面要接原形 work，不能加 s。"},
  None)
Q("EN-8A-1", "future-tense", 2, "A: Will Jenny come to the meeting tomorrow?\nB: ＿＿＿ She is sick in bed.",
  ["Yes, she will.", "No, she won't.", "No, she isn't.", "No, she doesn't."], "B",
  "B 說 Jenny 生病躺在床上，所以明天不會來，要否定回答。問句用 Will，回答也用 will 的否定 won't。",
  ["Jenny 現在身體狀況如何？明天會來嗎？", "問句用什麼助動詞，回答就用什麼。"],
  {"A": "她生病臥床，說她會來和後面的理由矛盾。", "C": "問句用 Will，回答不能改用 be 動詞 isn't。", "D": "問句用 Will，回答不能改用 doesn't。"},
  None)
Q("EN-8A-1", "modal-verb", 2, "You ＿＿＿ talk loudly in the library. Other people are reading.",
  ["don't have to", "must", "mustn't", "can"], "C",
  "圖書館裡有人在看書，所以「不可以」大聲說話，表示禁止要用 mustn't（must not）。",
  ["後一句說明了什麼原因？", "表示「禁止、不可以」要用哪個助動詞？"],
  {"A": "don't have to 是「不必」，表示可做可不做，不是禁止。", "B": "must 是「必須」，變成「你必須大聲說話」，意思相反。", "D": "can 是「可以」，和別人在看書的情境矛盾。"},
  None)
Q("EN-8A-1", "modal-verb", 2, "My little brother is only two years old. He ＿＿＿ read or write.",
  ["mustn't", "doesn't have to", "shouldn't", "can't"], "D",
  "兩歲的小孩還沒有讀寫的能力，表示「不會、不能」要用 can't。",
  ["兩歲小孩做不到這件事，是因為被禁止還是沒有能力？", "表示「能力上做不到」要用哪個助動詞？"],
  {"A": "mustn't 是「禁止」，但讀書寫字不是被禁止的事。", "B": "doesn't have to 是「不必」，沒有表達出能力不足的意思。", "C": "shouldn't 是「不應該」，讀寫並不是不應該做的事。"},
  None)
Q("EN-8A-1", "dialogue-response", 2, "A: I have a bad toothache.\nB: ＿＿＿",
  ["You should see a dentist.", "You must eat more candy.", "You don't have to brush your teeth.", "I'll be there on time."], "A",
  "A 說牙齒很痛，合理的建議是 You should see a dentist.（你應該去看牙醫），should 用來給建議。",
  ["A 遇到了什麼問題？", "給別人建議時常用哪個助動詞？"],
  {"B": "牙痛還要多吃糖果，建議不合理。", "C": "牙痛時更需要刷牙，說不必刷牙不合常理。", "D": "I'll be there on time. 是答應準時到，和牙痛無關。"},
  None)
Q("EN-8A-1", "reading-detail", 2, "Class 801 Field Trip\nWe will go to the Science Museum this Friday. Please meet at the school gate at 8:00 a.m. You should wear your school uniform. You don't have to bring lunch. The school will give everyone a lunch box.\n\nWhich is TRUE?",
  ["The students will meet at the museum.", "The school will give the students lunch.", "The students must bring their lunch.", "The students don't have to wear school uniforms."], "B",
  "通知最後說 The school will give everyone a lunch box.，所以學校會提供午餐。集合地點是校門口；不必帶午餐；應該穿制服。",
  ["逐一核對集合地點、服裝和午餐三件事。", "You don't have to bring lunch. 的原因寫在下一句。"],
  {"A": "集合地點是 the school gate（校門口），不是博物館。", "C": "通知說 You don't have to bring lunch.（不必帶午餐）。", "D": "通知說 You should wear your school uniform.，應該穿制服。"},
  None)
Q("EN-8A-1", "modal-verb", 3, "Mia: Mom, can I go to Amy's house tonight?\nMom: Yes, but you (1)＿＿＿ finish your homework before you go. That's our rule.\nMia: OK. Do I have to take the bus there?\nMom: No, you (2)＿＿＿. Dad will drive you.\n\nWhich is the best choice for (1) and (2)?",
  ["must; mustn't", "don't have to; must", "must; don't have to", "can't; don't have to"], "C",
  "(1) 媽媽說 That's our rule.（這是我們的規定），表示「必須」先寫完作業，用 must。(2) 回答 Do I have to...? 的否定是 No, you don't have to.（不必），因為爸爸會載她。",
  ["(1) 後面的 That's our rule. 表示這件事是必須還是可有可無？", "回答 Do I have to...? 的否定時，要說「不必」還是「禁止」？"],
  {"A": "(2) mustn't 是「禁止」，但搭公車並沒有被禁止，只是爸爸會載她所以不必。", "B": "(1) 有家規要求先寫完作業，不能說 don't have to（不必）。", "D": "(1) can't finish 是「不能寫完」，和「寫完才能去」的意思不合。"},
  None)
Q("EN-8A-1", "reading-detail", 3, "Ben: Are you free after school next week, Jason? Let's play basketball.\nJason: Let me see. I'm going to see the dentist on Tuesday, and I'll help my mom at her shop on Thursday. On Friday, my family is going to have dinner at Grandpa's house.\nBen: How about Monday or Wednesday?\nJason: Monday is OK. On Wednesday I have a piano lesson.\n\nWhen will they probably play basketball?",
  ["Tuesday", "Wednesday", "Thursday", "Monday"], "D",
  "Jason 星期二看牙醫、星期三上鋼琴課、星期四幫媽媽顧店、星期五去爺爺家吃飯，只有星期一有空，他也說 Monday is OK.，所以他們應該星期一打球。",
  ["把 Jason 每天的計畫列出來。", "哪一天 Jason 說可以？"],
  {"A": "星期二 Jason 要去看牙醫。", "B": "Ben 提議過星期三，但 Jason 那天有鋼琴課。", "C": "星期四 Jason 要去媽媽的店幫忙。"},
  None)

# ============================ EN-8A-2 比較級與最高級 ============================
Q("EN-8A-2", "comparative", 1, "In Taiwan, summer is ＿＿＿ than spring.",
  ["hoter", "hotter", "more hot", "hottest"], "B",
  "有 than 表示兩者比較，用比較級。hot 是「短母音＋單一子音」結尾，要重複 t 再加 er：hotter。",
  ["句子裡有 than，要用原級、比較級還是最高級？", "hot 加 er 時字尾要不要重複？"],
  {"A": "知道加 er，但忘了 hot 要重複字尾 t。", "C": "hot 是單音節形容詞，比較級直接加 er，不用 more。", "D": "hottest 是最高級，有 than 要用比較級。"},
  None)
Q("EN-8A-2", "superlative", 1, "Mount Jade is the ＿＿＿ mountain in Taiwan.",
  ["higher", "high", "highest", "most high"], "C",
  "玉山在臺灣所有山裡最高，「在某範圍內最…」要用最高級：the highest。前面已經有 the。",
  ["in Taiwan 表示在一個範圍裡比較，用哪一級？", "high 的最高級怎麼變化？"],
  {"A": "higher 是比較級，用在兩者比較，而且通常搭配 than。", "B": "high 是原級，沒有表達「最」的意思。", "D": "high 是單音節字，最高級直接加 est，不用 most。"},
  None)
Q("EN-8A-2", "comparative", 1, "This story is ＿＿＿ than that one. I can't stop reading it.",
  ["interestinger", "most interesting", "interesting", "more interesting"], "D",
  "有 than 要用比較級。interesting 是多音節形容詞，比較級要在前面加 more：more interesting。",
  ["看到 than 要用哪一級？", "長的形容詞（三個音節以上）比較級要怎麼變？"],
  {"A": "interesting 是長形容詞，不能直接加 er。", "B": "most interesting 是最高級，有 than 要用比較級。", "C": "interesting 是原級，不能和 than 搭配。"},
  None)
Q("EN-8A-2", "as-as", 1, "My bag is as ＿＿＿ as yours. They both cost NT$500.",
  ["cheap", "cheaper", "cheapest", "more cheap"], "A",
  "兩個包包價錢一樣，用「as + 原級 + as」表示「和……一樣」，中間要放原級形容詞 cheap。",
  ["兩個包包的價錢一樣還是不一樣？", "as ... as 中間要放哪一級的形容詞？"],
  {"B": "as ... as 中間要放原級，不能放比較級 cheaper。", "C": "cheapest 是最高級，不能放在 as ... as 中間。", "D": "cheap 的比較級是 cheaper，沒有 more cheap，而且 as ... as 中間要用原級。"},
  None)
Q("EN-8A-2", "comparative", 2, "Tom's English is good, but his sister's English is even ＿＿＿.",
  ["gooder", "better", "best", "more good"], "B",
  "even（更加）用來加強比較級。good 的比較級是不規則的 better，所以是 even better（更好）。",
  ["even 後面通常接哪一級的形容詞？", "good 的比較級是規則變化嗎？"],
  {"A": "good 是不規則變化，沒有 gooder 這個字。", "C": "best 是最高級，even 用來修飾比較級。", "D": "good 的比較級是 better，不用 more good。"},
  None)
Q("EN-8A-2", "superlative", 2, "Of all the students in my class, Leo runs ＿＿＿.",
  ["faster", "fast", "the fastest", "the most fast"], "C",
  "Of all the students in my class（在全班同學中）表示三者以上比較，要用最高級 the fastest。",
  ["Of all the students 表示比較的對象有幾個？", "fast 的最高級怎麼變化？"],
  {"A": "faster 是比較級，用在兩者比較，這裡是全班比較。", "B": "fast 是原級，沒有表達「最快」。", "D": "fast 是單音節字，最高級是 fastest，不用 most。"},
  None)
Q("EN-8A-2", "superlative", 2, "In Taiwan, winter is ＿＿＿ season of the year.",
  ["colder", "the colder", "coldest", "the coldest"], "D",
  "season of the year 表示在一年四季中比較，四季中最冷用最高級，而且最高級前面要加 the：the coldest。",
  ["一年有幾個季節？是兩者比較還是多者比較？", "最高級前面通常要加什麼？"],
  {"A": "colder 是比較級，四季比較要用最高級。", "B": "the colder 用在兩者之中，這裡是四個季節。", "C": "最高級前面少了 the，is coldest season 不合文法。"},
  None)
Q("EN-8A-2", "as-as", 2, "Ken is 165 cm tall, and Paul is 165 cm tall, too. Ken is ＿＿＿ Paul.",
  ["as tall as", "taller than", "as taller as", "shorter than"], "A",
  "兩人都是 165 公分，一樣高，用「as + 原級 + as」：Ken is as tall as Paul.",
  ["兩人的身高一樣嗎？", "表示「一樣……」的句型是什麼？中間放哪一級？"],
  {"B": "兩人一樣高，不能說 Ken 比較高。", "C": "as ... as 中間要放原級 tall，不能放比較級。", "D": "兩人一樣高，不能說 Ken 比較矮。"},
  None)
Q("EN-8A-2", "comparative", 2, "A: Which is ＿＿＿, a bike or a car?\nB: A car, of course.",
  ["fastest", "faster", "the fast", "more fast"], "B",
  "問句在腳踏車和汽車「兩者」之間比較，用比較級。fast 是單音節字，比較級是 faster。",
  ["問句裡比較的東西有幾個？", "兩者比較要用比較級還是最高級？"],
  {"A": "fastest 是最高級，用在三者以上，這裡只有兩樣東西。", "C": "fast 是原級，加 the 也不能表示比較。", "D": "fast 是單音節字，比較級直接加 er，不用 more。"},
  None)
Q("EN-8A-2", "reading-detail", 2, "Tim is looking at three backpacks in a store. The red one is NT$800. The blue one is NT$600, and it is the lightest of the three. The green one is NT$1,000, and it is the biggest.\n\nTim wants the cheapest backpack. Which one will he buy?",
  ["The red one", "The green one", "The blue one", "The biggest one"], "C",
  "三個背包的價錢：紅色 800 元、藍色 600 元、綠色 1,000 元，最便宜的是藍色，所以 Tim 會買藍色的。",
  ["把三個背包的價錢列出來比較。", "cheapest 是「最便宜」，找價錢最低的。"],
  {"A": "紅色 800 元，比藍色的 600 元貴。", "B": "綠色 1,000 元是最貴的。", "D": "最大的是綠色背包，也是最貴的，不符合 Tim 要最便宜的條件。"},
  "min(800, 600, 1000) == 600")
Q("EN-8A-2", "comparative", 3, "Mia: Excuse me. Which jacket is (1)＿＿＿, the black one or the white one?\nClerk: The black one. It's NT$1,500, and the white one is only NT$1,200.\nMia: Then I'll take the white one. It's (2)＿＿＿, and it looks nice, too.\n\nWhich is the best choice for (1) and (2)?",
  ["cheaper; more expensive", "expensiver; cheaper", "more expensive; more cheap", "more expensive; cheaper"], "D",
  "店員回答「黑色的，1,500 元，白色的只要 1,200 元」，表示 Mia 問的是哪件比較貴，(1) 用 more expensive。Mia 選白色的，因為它比較便宜，(2) 用 cheaper。",
  ["店員回答黑色的，並說白色的「只要」1,200 元，Mia 問的是比較貴還是比較便宜？", "expensive 和 cheap 的比較級各怎麼變化？"],
  {"A": "把兩個空格的意思弄反了：店員回答黑色，而黑色比較貴。", "B": "expensive 是長形容詞，比較級是 more expensive，沒有 expensiver。", "C": "cheap 是單音節字，比較級是 cheaper，不是 more cheap。"},
  "1500 > 1200")
Q("EN-8A-2", "superlative", 3, "How to get from Green Town to Blue Lake:\nBy train: 2 hours, NT$450\nBy bus: 4 hours, NT$300\nBy plane: 40 minutes, NT$1,800\n\nWhich is TRUE?",
  ["The bus is the cheapest, but it is also the slowest.", "The train is faster than the plane, and it costs less.", "The plane is the fastest, and it is cheaper than the train.", "The bus is as fast as the train, but it costs less."], "A",
  "比較價錢：公車 300 元最便宜；比較時間：公車 4 小時最久，所以公車最便宜也最慢。飛機 40 分鐘最快；飛機 1,800 元比火車貴；公車 4 小時比火車 2 小時慢。",
  ["分別比較三種交通方式的「時間」和「價錢」。", "花的時間越長，表示越快還是越慢？"],
  {"B": "火車比飛機便宜沒錯，但火車要 2 小時，飛機只要 40 分鐘，飛機比較快。", "C": "飛機最快沒錯，但飛機 1,800 元，火車 450 元，飛機比較貴。", "D": "公車比火車便宜沒錯，但公車要 4 小時，火車 2 小時，兩者速度不一樣。"},
  "min(450, 300, 1800) == 300 and max(120, 240, 40) == 240")
