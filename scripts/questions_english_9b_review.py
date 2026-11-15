# -*- coding: utf-8 -*-
"""英語題庫：九下「會考總複習：文法綜合」（自編原創題，依 108 課綱；把七～九年級的文法混在一起考，比照會考單題與短文題型）"""
from fractions import Fraction as F
import math

SUBJECT = "english"
UNITS = [
    ("EN-9B-3", "9B", 3, "會考總複習：文法綜合"),
]
QUESTIONS = []


def Q(unit, concept, difficulty, stem, options, answer, explanation, hints, wrong, check=None):
    QUESTIONS.append(dict(unit=unit, concept=concept, difficulty=difficulty, stem=stem,
                          options=options, answer=answer, explanation=explanation,
                          hints=hints, wrong=wrong, check=check))


U = "EN-9B-3"

# ---------------- 時態綜合 9 題 ----------------
Q(U, "tense-review", 1, "My father ＿＿＿ the newspaper every morning before he goes to work.",
  ["reads", "is reading", "read", "has read"], "A",
  "every morning 表示習慣，用現在簡單式；主詞 My father 是第三人稱單數，動詞加 s，所以是 reads。",
  ["every morning 是在說一次的事，還是固定的習慣？", "習慣用哪一種時態？主詞是第三人稱單數時動詞要怎麼變？"],
  {"B": "現在進行式是說「此刻正在做」，和 every morning 的習慣不合。", "C": "主詞是第三人稱單數，現在式要加 s；如果當成過去式，又和後面的 goes 時間不一致。", "D": "現在完成式不和 every morning 這種表示習慣的時間一起用。"})
Q(U, "tense-review", 1, "Be quiet! The baby ＿＿＿ in the next room.",
  ["is sleeping", "sleeps", "slept", "has slept"], "A",
  "Be quiet! 表示說話的當下，寶寶「正在」睡覺，用現在進行式 is sleeping。",
  ["Be quiet! 告訴你這件事發生在什麼時候？", "「此刻正在進行」用哪一種時態？"],
  {"B": "現在簡單式是說習慣，不是此刻正在發生的事。", "C": "過去式表示已經結束，就不需要叫人安靜了。", "D": "現在完成式強調到現在為止的經驗或結果，不是「正在睡」。"})
Q(U, "tense-review", 1, "We ＿＿＿ to Kenting with our classmates last summer.",
  ["went", "go", "have gone", "will go"], "A",
  "last summer 是明確的過去時間，用過去簡單式；go 的過去式是 went。",
  ["last summer 是過去、現在還是未來？", "有明確的過去時間時，用過去式還是現在完成式？"],
  {"B": "go 是現在式，和 last summer 不合。", "C": "現在完成式不能和 last summer 這種明確的過去時間一起用。", "D": "will go 是未來式，但 last summer 已經過去了。"})
Q(U, "tense-review", 2, "Mr. Lin ＿＿＿ English at this school since 2015, and he still enjoys it.",
  ["has taught", "taught", "teaches", "is teaching"], "A",
  "since 2015 表示「從 2015 年到現在」一直持續，用現在完成式 has taught。",
  ["since 加上一個過去的時間點，表示動作從那時持續到什麼時候？", "「從過去持續到現在」用哪一種時態？"],
  {"B": "過去式表示已經結束，但後半句說他現在還很喜歡，表示還在教。", "C": "現在簡單式不和 since 一起用。", "D": "現在進行式不和 since 一起用，要用完成式表示持續。"})
Q(U, "tense-review", 2, "When I got home yesterday, my sister ＿＿＿ a cake in the kitchen.",
  ["was making", "makes", "is making", "has made"], "A",
  "「昨天我到家的時候」是過去的一個時間點，當時姊姊「正在」做蛋糕，用過去進行式 was making。",
  ["got home 是什麼時態？整句話發生在什麼時候？", "過去某個時間點「正在進行」的動作，用哪一種時態？"],
  {"B": "makes 是現在式，和 yesterday 不合。", "C": "is making 是現在進行式，但這是昨天的事。", "D": "現在完成式不能和 yesterday 這種明確的過去時間一起用。"})
Q(U, "tense-review", 2, "If it ＿＿＿ tomorrow, we will stay home and watch a movie.",
  ["rains", "will rain", "rained", "is going to rain"], "A",
  "if 引導的條件子句用現在簡單式代替未來式，主要子句才用 will；主詞 it 是第三人稱單數，所以用 rains。",
  ["if 的那一半句子可以用 will 嗎？", "條件子句要用哪一種時態來代替未來式？"],
  {"B": "if 子句裡不用 will，要用現在式代替未來。", "C": "rained 是過去式，和 tomorrow 不合。", "D": "be going to 也是未來式，if 條件子句裡同樣要用現在式代替。"})
Q(U, "tense-review", 2, "Amy ＿＿＿ her homework yet, so she can't go out to play.",
  ["hasn't finished", "didn't finish", "doesn't finish", "isn't finishing"], "A",
  "yet（還沒）常和現在完成式的否定句一起用，表示到現在為止還沒完成：hasn't finished。",
  ["句尾的 yet 是什麼意思？", "「到現在還沒做完」要用哪一種時態的否定？"],
  {"B": "過去式否定只說過去某個時間沒做，和 yet、後半句的現在式不搭。", "C": "現在簡單式否定是說「習慣上不做」，不是「還沒做完」。", "D": "現在進行式不和 yet 這樣搭配，意思也不對。"})
Q(U, "tense-review", 3, "By the time we arrived at the theater, the movie ＿＿＿ for twenty minutes.",
  ["had been on", "has been on", "was on", "is on"], "A",
  "「我們到電影院」是過去的事，電影在那之前已經演了二十分鐘，比過去更早並持續到那時，用過去完成式 had been on。",
  ["arrived 是過去式；電影開演是在那之前還是之後？", "比「過去某一點」更早開始並持續到那時的事，用哪一種時態？"],
  {"B": "has been 是現在完成式，以「現在」為基準，但這句的基準是過去的 arrived。", "C": "was on 只說當時在演，無法和 for twenty minutes 一起表達「已經演了多久」。", "D": "is on 是現在式，和 arrived 的過去時間不合。"})
Q(U, "tense-review", 3, "I ＿＿＿ this novel three times, and I am still moved by the ending every time.",
  ["have read", "read", "am reading", "was reading"], "A",
  "three times 說的是到現在為止的經驗次數，沒有指出明確的過去時間，用現在完成式 have read。",
  ["three times 是在說某一天的事，還是到目前為止的經驗？", "表達「到現在為止做過幾次」用哪一種時態？"],
  {"B": "過去式要有明確的過去時間；這裡是說累積到現在的經驗，後半句也用現在式。", "C": "現在進行式是說此刻正在讀，不能表達讀過三次。", "D": "過去進行式是說過去某時正在讀，不能表達次數。"})

# ---------------- 被動語態 5 題 ----------------
Q(U, "passive-review", 1, "English ＿＿＿ in many countries around the world.",
  ["is spoken", "speaks", "is speaking", "spoke"], "A",
  "英語是「被說」的，主詞是動作的接受者，用被動語態 be + 過去分詞：is spoken。",
  ["English 自己會說話嗎？它是做動作的人，還是被做的對象？", "被動語態的形式是 be 動詞加上什麼？"],
  {"B": "speaks 是主動，變成「英語在說話」。", "C": "is speaking 是主動的進行式，意思也是英語自己在說。", "D": "spoke 是主動的過去式，沒有被動的意思。"})
Q(U, "passive-review", 2, "The old bridge ＿＿＿ by the typhoon two years ago.",
  ["was destroyed", "destroyed", "is destroyed", "has destroyed"], "A",
  "橋是「被颱風摧毀」，要用被動；two years ago 是過去時間，所以是過去式被動 was destroyed。",
  ["橋是摧毀別人，還是被摧毀？", "two years ago 決定 be 動詞要用哪一個時態？"],
  {"B": "destroyed 是主動，變成橋去摧毀東西，後面的 by the typhoon 也接不上。", "C": "is destroyed 是現在式被動，和 two years ago 不合。", "D": "has destroyed 是主動的完成式，沒有被動的意思。"})
Q(U, "passive-review", 2, "A new sports center ＿＿＿ near our school next year.",
  ["will be built", "will build", "is built", "was built"], "A",
  "運動中心是「被蓋」的，next year 是未來，未來式被動是 will be + 過去分詞：will be built。",
  ["運動中心會自己蓋東西嗎？", "未來式的被動語態，will 後面要先加哪一個字？"],
  {"B": "will build 是主動，變成運動中心去蓋別的東西。", "C": "is built 是現在式被動，和 next year 不合。", "D": "was built 是過去式被動，但明年還沒到。"})
Q(U, "passive-review", 3, "The students ＿＿＿ to bring their own cups to the party, so nobody used paper cups.",
  ["were told", "told", "were telling", "have told"], "A",
  "學生是「被告知」要帶杯子，用被動；後半句 used 是過去式，所以用 were told。be told to + 原形動詞 表示「被告知要做某事」。",
  ["是學生告訴別人，還是別人告訴學生？", "後半句的 used 告訴你整件事發生在什麼時候？"],
  {"B": "told 是主動，後面缺少「告訴誰」的受詞，意思變成學生去告訴別人。", "C": "were telling 是主動的過去進行式，一樣缺少受詞。", "D": "have told 是主動的完成式，沒有被動的意思。"})
Q(U, "passive-review", 3, "The classroom must ＿＿＿ before we leave school today.",
  ["be cleaned", "clean", "be cleaning", "cleaned"], "A",
  "教室是「被打掃」；助動詞 must 後面接原形，所以被動是 must be + 過去分詞：must be cleaned。",
  ["助動詞 must 後面的動詞要用什麼形式？", "教室是打掃的人，還是被打掃的對象？"],
  {"B": "must clean 是主動，變成教室去打掃別的東西。", "C": "be cleaning 是進行式，仍然是主動的意思。", "D": "助動詞後面要接原形，不能直接接過去分詞。"})

# ---------------- 關係子句 5 題 ----------------
Q(U, "relative-clause", 1, "The girl ＿＿＿ is singing on the stage is my cousin.",
  ["who", "which", "whose", "what"], "A",
  "先行詞 The girl 是人，關係代名詞在子句裡當主詞，用 who。",
  ["空格前面的名詞是人還是東西？", "空格後面直接接動詞 is，表示這個字在子句裡當什麼？"],
  {"B": "which 用來代替事物或動物，不用在人。", "C": "whose 是所有格，後面要接名詞，這裡後面是動詞。", "D": "what 本身已經包含先行詞，前面不能再有 The girl。"})
Q(U, "relative-clause", 2, "This is the book ＿＿＿ I borrowed from the library last week.",
  ["which", "who", "whose", "where"], "A",
  "先行詞 the book 是事物，在子句裡當 borrowed 的受詞，用 which（也可以用 that）。",
  ["the book 是人還是東西？", "子句裡 borrowed 的受詞是誰？"],
  {"B": "who 用來代替人。", "C": "whose 是所有格，後面要接名詞，這裡接的是 I。", "D": "where 用在地點，而且子句裡不能缺受詞；這裡缺的是 borrowed 的受詞。"})
Q(U, "relative-clause", 2, "I have a friend ＿＿＿ father is a famous doctor.",
  ["whose", "who", "which", "that"], "A",
  "「朋友的爸爸」是所有關係，後面緊接名詞 father，用所有格關係代名詞 whose。",
  ["空格後面緊接的 father 是誰的爸爸？", "表示「……的」的關係代名詞是哪一個？"],
  {"B": "who 是主格或受格，後面不能直接接名詞 father 當主詞。", "C": "which 用在事物，也不能表示所有關係。", "D": "that 不能表示「……的」。"})
Q(U, "relative-clause", 3, "The restaurant ＿＿＿ we had dinner last night was very crowded.",
  ["where", "which", "who", "what"], "A",
  "子句 we had dinner last night 已經有主詞和受詞，是完整的句子；先行詞 the restaurant 是地點，用關係副詞 where（等於 in which）。",
  ["we had dinner last night 這個子句缺主詞或受詞嗎？", "子句完整、先行詞又是地點時，用哪一個字？"],
  {"B": "which 是代名詞，子句裡要缺主詞或受詞；這裡子句完整，要用 in which 或 where。", "C": "who 用來代替人，不用在地點。", "D": "what 前面不能有先行詞 the restaurant。"})
Q(U, "relative-clause", 3, "The boy and the dog ＿＿＿ are playing in the park look very happy.",
  ["that", "who", "which", "whose"], "A",
  "先行詞同時有人（the boy）和動物（the dog），關係代名詞只能用 that。",
  ["先行詞有幾個？是人、動物，還是兩種都有？", "同時指人和事物（或動物）時，哪一個關係代名詞才能用？"],
  {"B": "who 只能指人，不能包含 the dog。", "C": "which 只能指事物或動物，不能包含 the boy。", "D": "whose 是所有格，後面要接名詞，這裡接的是動詞 are。"})

# ---------------- 分詞形容詞與感官動詞 5 題 ----------------
Q(U, "participle-adjective", 1, "The movie was so ＿＿＿ that I fell asleep in the theater.",
  ["boring", "bored", "bore", "boringly"], "A",
  "形容事物「令人感到無聊」用現在分詞 boring；bored 是形容人「感到無聊」。主詞是 The movie，所以用 boring。",
  ["主詞是人還是事物？", "-ing 和 -ed 的形容詞，哪一個形容事物、哪一個形容人的感受？"],
  {"B": "bored 是「感到無聊的」，用來形容人，電影不會覺得無聊。", "C": "bore 是動詞原形，was so 後面要接形容詞。", "D": "boringly 是副詞，be 動詞後面要用形容詞。"})
Q(U, "participle-adjective", 2, "We were all ＿＿＿ at the news that our team won the game.",
  ["surprised", "surprising", "surprise", "surprises"], "A",
  "主詞 We 是人，表示人「感到驚訝」用過去分詞 surprised；be surprised at 是固定用法。",
  ["主詞是人還是事物？", "形容人的感受要用 -ed 還是 -ing？"],
  {"B": "surprising 是「令人驚訝的」，用來形容事物，例如 the news is surprising。", "C": "surprise 是原形動詞或名詞，不能放在 were all 後面當形容詞。", "D": "surprises 是動詞第三人稱單數，文法不對。"})
Q(U, "participle-adjective", 2, "The man ＿＿＿ a black jacket over there is our new coach.",
  ["wearing", "wears", "wore", "is wearing"], "A",
  "句子的動詞是後面的 is；空格是用來修飾 The man 的分詞片語，由 who is wearing 省略而來，所以用 wearing。",
  ["這句話真正的動詞是哪一個？", "一個句子已經有動詞時，另一個動作要改成什麼形式來修飾名詞？"],
  {"B": "wears 是動詞，句子會出現兩個動詞而沒有連接詞。", "C": "wore 也是動詞，同樣造成兩個動詞。", "D": "is wearing 是完整的動詞，除非前面加 who，否則文法不對。"})
Q(U, "participle-adjective", 3, "The picture ＿＿＿ by my little brother won first prize in the art contest.",
  ["painted", "painting", "paints", "was painted"], "A",
  "句子的動詞是 won；圖畫是「被弟弟畫的」，用過去分詞片語 painted by... 修飾 The picture（等於 which was painted by...）。",
  ["圖畫是自己畫畫，還是被畫出來的？", "句子的動詞已經是 won，空格要用分詞還是動詞？"],
  {"B": "painting 表示主動，變成圖畫自己在畫畫。", "C": "paints 是動詞，會和 won 變成兩個動詞。", "D": "was painted 是完整的動詞，和 won 之間沒有連接詞或關係代名詞。"})
Q(U, "participle-adjective", 3, "I heard someone ＿＿＿ the piano when I walked past the music room.",
  ["playing", "to play", "played", "plays"], "A",
  "感官動詞 hear + 受詞 + 現在分詞（或原形動詞）。走過時聽到「正在彈」，用 playing。",
  ["heard 是哪一類動詞？", "感官動詞後面的受詞，接的動詞可以用哪兩種形式？"],
  {"B": "感官動詞的主動用法後面不接 to 不定詞。", "C": "played 是過去分詞，表示被動，但 someone 是彈琴的人。", "D": "plays 是加了 s 的動詞，受詞後面不能再接這種形式。"})

# ---------------- so...that / too...to / enough 5 題 ----------------
Q(U, "result-clause", 1, "The box is ＿＿＿ heavy for the little girl to carry.",
  ["too", "so", "such", "enough"], "A",
  "too + 形容詞 + (for 人) + to 動詞，表示「太……以致於不能」：箱子太重，小女孩搬不動。",
  ["句子後面有 to carry，哪一個字可以和 to 搭配表示「太……而不能」？", "小女孩搬得動這個箱子嗎？"],
  {"B": "so 要和 that 子句搭配（so heavy that...），不和 to 動詞搭配。", "C": "such 後面要接名詞（such a heavy box），而且要和 that 子句搭配。", "D": "enough 要放在形容詞後面（heavy enough），而且意思相反。"})
Q(U, "result-clause", 2, "Jack ran ＿＿＿ fast that nobody could catch up with him.",
  ["so", "too", "very", "such"], "A",
  "so + 形容詞／副詞 + that 子句，表示「如此……以致於」。fast 是副詞，用 so。",
  ["空格後面有 that 子句，哪一個字和 that 搭配？", "fast 後面沒有名詞，要用 so 還是 such？"],
  {"B": "too 和 to 動詞搭配，不和 that 子句搭配。", "C": "very 不能和 that 子句組成「如此……以致於」的句型。", "D": "such 後面要有名詞（such a fast runner that...），這裡只有副詞 fast。"})
Q(U, "result-clause", 2, "My brother is not old ＿＿＿ to ride a scooter.",
  ["enough", "too", "so", "very"], "A",
  "形容詞 + enough + to 動詞，表示「夠……可以」；否定就是「年紀還不夠大，不能騎機車」。",
  ["空格在形容詞 old 的前面還是後面？", "哪一個字要放在形容詞後面，再接 to 動詞？"],
  {"B": "too 要放在形容詞前面（too young to ride）。", "C": "so 要放在形容詞前面，並且和 that 搭配。", "D": "very 要放在形容詞前面，也不能接 to 動詞組成這個句型。"})
Q(U, "result-clause", 3, "It was ＿＿＿ a beautiful day that we decided to have a picnic by the river.",
  ["such", "so", "too", "very"], "A",
  "such + a/an + 形容詞 + 名詞 + that 子句。空格後面是 a beautiful day（有名詞），用 such。",
  ["空格後面的重點是形容詞，還是「a + 形容詞 + 名詞」？", "so 和 such 哪一個後面接名詞？"],
  {"B": "so 後面直接接形容詞（so beautiful a day 是另一種語序），不能接 a beautiful day。", "C": "too 和 to 動詞搭配，不和 that 子句搭配。", "D": "very 不能和 that 子句組成這個句型。"})
Q(U, "result-clause", 3, "The soup was too hot for me to eat. 下列哪一句意思和這句相同？",
  ["The soup was so hot that I couldn't eat it.", "The soup was hot enough for me to eat.",
   "The soup was so hot that I could eat it.", "The soup was not hot enough for me to eat."], "A",
  "too...to... 是「太……而不能」，可以改寫成 so...that + 否定：湯太燙，我沒辦法喝。",
  ["too hot to eat 的意思是能喝還是不能喝？", "改寫成 so...that 時，that 後面要用肯定還是否定？"],
  {"B": "hot enough to eat 是「夠燙可以喝」，意思不同。", "C": "that 後面用了肯定的 could，意思變成能喝。", "D": "意思變成「不夠燙所以不能喝」，原因相反。"})

# ---------------- 連接詞與子句 5 題 ----------------
Q(U, "conjunction-review", 1, "＿＿＿ it was raining heavily, we still went to school on time.",
  ["Although", "Because", "If", "So"], "A",
  "「雨下得很大」和「還是準時到校」是相反的關係，用 Although（雖然）。still 也提示了轉折。",
  ["前後兩件事是因果關係，還是相反的關係？", "主要子句裡的 still 暗示什麼語氣？"],
  {"B": "Because 表示原因，但下大雨不是準時到校的原因。", "C": "If 表示條件，但雨已經在下了，不是假設。", "D": "So 表示結果，不能放在句首引導前半句。"})
Q(U, "conjunction-review", 2, "I didn't go to bed ＿＿＿ I finished all my homework last night.",
  ["until", "since", "while", "unless"], "A",
  "not...until... 表示「直到……才……」：我昨晚直到寫完功課才去睡。",
  ["前面有 didn't，哪一個字可以和 not 搭配表示「直到……才」？", "是先寫完功課，還是先去睡？"],
  {"B": "since 表示「自從」或「因為」，要和完成式或原因搭配，這裡不合。", "C": "while 表示「當……的時候」，兩件事同時進行，意思不對。", "D": "unless 是「除非」，用在條件，不用在已經發生的過去事件。"})
Q(U, "conjunction-review", 2, "Can you tell me ＿＿＿ the nearest post office is?",
  ["where", "what", "who", "which"], "A",
  "問「郵局在哪裡」，用 where 引導間接問句；間接問句用「疑問詞 + 主詞 + 動詞」的語序。",
  ["the nearest post office 是地點，要問它的什麼？", "間接問句裡，主詞和動詞的順序和一般問句一樣嗎？"],
  {"B": "what 問「什麼」，但這裡要問的是位置。", "C": "who 問人，郵局不是人。", "D": "which 問「哪一個」，後面通常要接名詞，這裡語意和文法都不合。"})
Q(U, "conjunction-review", 3, "Both my father and my mother ＿＿＿ interested in hiking.",
  ["are", "is", "am", "be"], "A",
  "both A and B 當主詞時表示兩者，動詞永遠用複數，所以是 are。",
  ["both...and... 連接了幾個人？", "主詞是兩個人時，be 動詞用哪一個？"],
  {"B": "is 是單數，只看最靠近的 my mother 就會選錯；both...and... 一律用複數。", "C": "am 只和 I 搭配。", "D": "be 是原形，句子需要依主詞變化的動詞。"})
Q(U, "conjunction-review", 3, "Neither the teacher nor the students ＿＿＿ about the surprise party yet.",
  ["know", "knows", "is knowing", "has known"], "A",
  "neither A nor B 當主詞時，動詞跟最靠近的主詞一致。最靠近的是 the students（複數），用 know。",
  ["neither...nor... 的動詞要跟哪一個主詞一致？", "最靠近空格的主詞是單數還是複數？"],
  {"B": "knows 是單數，是跟著較遠的 the teacher 走，但要看最靠近的 the students。", "C": "know 是狀態動詞，不用進行式，而且 is 也是單數。", "D": "has 是單數，和最靠近的複數主詞不一致。"})

# ---------------- 比較、不定詞與動名詞 6 題 ----------------
Q(U, "comparison-review", 1, "Taipei 101 is ＿＿＿ than any other building in our city.",
  ["taller", "tall", "tallest", "the tallest"], "A",
  "句中有 than，用比較級；tall 是單音節，比較級是 taller。「比其他任何一棟都高」其實就是最高的意思。",
  ["看到 than 要用原級、比較級還是最高級？", "tall 的比較級怎麼變？"],
  {"B": "tall 是原級，不能和 than 一起用。", "C": "tallest 是最高級，不接 than。", "D": "the tallest 後面要接範圍（in our city），不接 than。"})
Q(U, "comparison-review", 2, "This math problem is not as ＿＿＿ as the one we did yesterday.",
  ["difficult", "more difficult", "most difficult", "difficulty"], "A",
  "as + 形容詞原級 + as 表示「和……一樣」；否定是「不像……那麼」。中間要用原級 difficult。",
  ["as...as 中間要放原級還是比較級？", "be 動詞後面要用形容詞還是名詞？"],
  {"B": "as...as 中間不能放比較級。", "C": "as...as 中間不能放最高級。", "D": "difficulty 是名詞，這裡需要形容詞。"})
Q(U, "comparison-review", 3, "The more you practice speaking English, ＿＿＿ you will become.",
  ["the more confident", "more confident", "the most confident", "confident"], "A",
  "「the + 比較級……, the + 比較級……」表示「越……就越……」，後半句也要用 the + 比較級：the more confident。",
  ["前半句用了 The more，後半句要用什麼形式來對應？", "「越……越……」的句型裡，兩邊的 the 可以省略嗎？"],
  {"B": "少了 the，不符合「the + 比較級, the + 比較級」的句型。", "C": "the most 是最高級，這個句型兩邊都用比較級。", "D": "原級不能表達「越來越」的意思。"})
Q(U, "verb-pattern", 1, "My brother enjoys ＿＿＿ basketball with his friends after school.",
  ["playing", "to play", "play", "plays"], "A",
  "enjoy 後面接動名詞（V-ing），所以是 enjoys playing。",
  ["enjoy 後面的動詞要用 to V 還是 V-ing？", "還有哪些動詞和 enjoy 一樣（例如 finish、practice）？"],
  {"B": "enjoy 後面不接 to 不定詞。", "C": "一個句子不能直接放兩個原形動詞。", "D": "enjoys 已經是動詞，後面不能再接加 s 的動詞。"})
Q(U, "verb-pattern", 2, "Don't forget ＿＿＿ off the lights when you leave the classroom.",
  ["to turn", "turning", "turn", "turned"], "A",
  "forget to V 表示「忘記要去做（還沒做）」；forget V-ing 是「忘記做過」。這裡是提醒離開時要關燈，用 to turn。",
  ["關燈這件事做了沒？是提醒還沒做的事，還是回想做過的事？", "forget 後面接 to V 和 V-ing 的意思有什麼不同？"],
  {"B": "forget turning 是「忘記已經關過燈」，和提醒的語意不合。", "C": "forget 後面不能直接接原形動詞。", "D": "turned 是過去式或過去分詞，文法不對。"})
Q(U, "verb-pattern", 3, "My parents made me ＿＿＿ my room before I could play video games.",
  ["clean", "to clean", "cleaning", "cleaned"], "A",
  "使役動詞 make + 受詞 + 原形動詞，表示「叫某人做某事」：made me clean。",
  ["made 在這裡是哪一類動詞？", "使役動詞 make、let、have 後面的受詞接什麼形式的動詞？"],
  {"B": "使役動詞 make 的主動用法後面不加 to。", "C": "make + 受詞後面不接 V-ing。", "D": "cleaned 是過去分詞，表示被動，但我是打掃的人。"})

# ---------------- 代名詞、數量詞與介系詞 5 題 ----------------
Q(U, "pronoun-quantifier", 1, "There isn't ＿＿＿ milk in the fridge. Let's go buy some.",
  ["any", "some", "many", "a few"], "A",
  "否定句裡用 any；milk 是不可數名詞。「冰箱裡沒有牛奶了」。",
  ["這句是肯定句還是否定句？", "milk 可數還是不可數？哪些字只能接可數名詞？"],
  {"B": "some 通常用在肯定句，否定句要改用 any。", "C": "many 接可數名詞複數，milk 不可數。", "D": "a few 接可數名詞複數，milk 不可數。"})
Q(U, "pronoun-quantifier", 2, "I have two brothers. One is a doctor, and ＿＿＿ is a teacher.",
  ["the other", "another", "other", "others"], "A",
  "只有兩個時，一個用 one，剩下的那一個用 the other。",
  ["總共有幾個兄弟？", "只剩下「特定的最後一個」時，前面要不要加 the？"],
  {"B": "another 是「另一個（不特定）」，用在三個以上還有剩的情況。", "C": "other 後面要接名詞（other brothers），不能單獨當主詞。", "D": "others 是複數，但剩下的只有一個人，動詞也是 is。"})
Q(U, "pronoun-quantifier", 2, "Each of the students ＿＿＿ a dictionary on the desk.",
  ["has", "have", "are having", "having"], "A",
  "each of + 複數名詞當主詞時，強調「每一個」，動詞用單數：has。",
  ["主詞的重點是 Each 還是 students？", "each 當主詞時，動詞用單數還是複數？"],
  {"B": "have 是複數，是被 students 影響，但主詞是 Each。", "C": "have 表示「擁有」時不用進行式，而且 are 是複數。", "D": "having 不是完整的動詞，句子會沒有動詞。"})
Q(U, "preposition-review", 1, "My birthday is ＿＿＿ May 5th, and we will have a party that night.",
  ["on", "in", "at", "for"], "A",
  "特定的日期（幾月幾日）或星期幾，前面用 on。",
  ["May 5th 是月份、日期還是時刻？", "月份用 in、時刻用 at，那特定的某一天用什麼？"],
  {"B": "in 用在月份、年份、季節（in May），不用在確切的日期。", "C": "at 用在時刻（at seven o'clock）。", "D": "for 表示一段時間的長度（for two days），不表示在某一天。"})
Q(U, "preposition-review", 2, "Thank you ＿＿＿ helping me carry these heavy boxes.",
  ["for", "to", "with", "of"], "A",
  "thank + 人 + for + 名詞／V-ing，表示「因為某事而感謝」。",
  ["感謝的原因是哪一件事？", "介系詞後面的動詞用了 V-ing，表示空格是哪一種詞？"],
  {"B": "to 當介系詞時表示方向或對象，不用來表示感謝的原因。", "C": "with 表示「和……一起」或「用……」，不用在這個句型。", "D": "of 不和 thank you 這樣搭配。"})

# ---------------- 短文閱讀 5 題 ----------------
P1 = ("【閱讀短文】Lisa started learning to swim when she was ten. At first, she was afraid of water and often cried during class. "
      "Her coach did not push her. Instead, he let her play in the shallow end until she felt safe. "
      "Two years later, Lisa joined the school swim team, and now she teaches younger kids on weekends.\n\n")
Q(U, "reading-review", 1, P1 + "How did Lisa feel when she first started learning to swim?",
  ["She was scared.", "She was excited.", "She was bored.", "She was proud."], "A",
  "文中說 At first, she was afraid of water and often cried，afraid 和 scared 都是「害怕」。",
  ["找到 At first 那一句，她對水的感覺是什麼？", "哪一個選項和 afraid 的意思相同？"],
  {"B": "文中說她害怕、常常哭，沒有提到興奮。", "C": "文中沒有說她覺得無聊。", "D": "感到驕傲可能是後來的事，不是一開始的感受。"})
Q(U, "reading-review", 2, P1 + "What did the coach do to help Lisa?",
  ["He let her get used to the water slowly.", "He made her swim in the deep end at once.",
   "He told her to join the swim team right away.", "He asked younger kids to teach her."], "A",
  "教練沒有逼她（did not push her），而是讓她在淺水區玩到覺得安全，也就是讓她慢慢適應水。",
  ["Instead 後面那一句說教練做了什麼？", "shallow end 是水深的地方還是水淺的地方？"],
  {"B": "文中說的是 shallow end（淺水區），而且教練沒有逼她。", "C": "她是兩年後才加入校隊，不是教練一開始要求的。", "D": "文中是 Lisa 現在教年紀小的孩子，不是孩子教她。"})
Q(U, "reading-review", 3, P1 + "What can we learn from the reading?",
  ["Lisa has become a good swimmer who helps others.", "Lisa stopped swimming after two years.",
   "Lisa's coach was strict and often got angry.", "Lisa learned to swim before she was ten."], "A",
  "她後來加入校隊，現在週末還教小朋友，可以推論她游得很好，也在幫助別人。",
  ["最後一句說 Lisa 現在在做什麼？", "把每個選項和文章對照，哪一個和文章的內容不衝突？"],
  {"B": "兩年後她是加入校隊，不是停止游泳。", "C": "文中說教練沒有逼她，很有耐心。", "D": "文中說她十歲才開始學。"})
P2 = ("【閱讀短文】Notice: The school library will be closed from June 3rd to June 7th because the old shelves are being replaced. "
      "Students who need to return books during this week can put them in the box outside the library door. "
      "No late fee will be charged for books due on these days.\n\n")
Q(U, "reading-review", 2, P2 + "Why will the library be closed?",
  ["New shelves are being put in.", "The librarians are on vacation.", "Too many books are missing.", "The exams are coming."], "A",
  "公告說 because the old shelves are being replaced，舊書架正在更換，也就是在裝新書架。",
  ["because 後面寫的原因是什麼？", "replaced 是什麼意思？舊的被換掉以後會放上什麼？"],
  {"B": "公告沒有提到館員放假。", "C": "公告沒有提到書不見。", "D": "公告沒有提到考試。"})
Q(U, "reading-review", 3, P2 + "Tom's book is due on June 5th. What should he do?",
  ["Put the book in the box outside the library.", "Pay a late fee when the library opens again.",
   "Keep the book until the end of June.", "Bring the book to his homeroom teacher."], "A",
  "6 月 5 日在閉館期間。公告說這週要還書的同學可以把書放進圖書館門外的箱子，而且這幾天到期的書不收逾期費。",
  ["June 5th 在不在閉館的那幾天裡？", "公告對這一週要還書的學生說了哪兩件事？"],
  {"B": "公告說這幾天到期的書不收逾期費。", "C": "公告沒有說可以留到六月底，而是提供還書箱。", "D": "公告沒有提到交給導師。"})
