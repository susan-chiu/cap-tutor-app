# -*- coding: utf-8 -*-
"""英語題庫（自編原創題，依 108 課綱；題型比照國中會考英語閱讀測驗，不含聽力）"""
from fractions import Fraction as F
import math

SUBJECT = "english"
UNITS = [
    ("EN-7A-1", "7A", 1, "be 動詞與人稱代名詞"),
    ("EN-7A-2", "7A", 2, "現在簡單式與頻率副詞"),
    ("EN-7B-1", "7B", 1, "現在進行式與祈使句"),
    ("EN-7B-2", "7B", 2, "過去簡單式"),
    ("EN-8A-1", "8A", 1, "未來式與助動詞"),
    ("EN-8A-2", "8A", 2, "比較級與最高級"),
    ("EN-8B-1", "8B", 1, "不定詞與動名詞"),
    ("EN-8B-2", "8B", 2, "連接詞與附加問句"),
    ("EN-9A-1", "9A", 1, "現在完成式"),
    ("EN-9A-2", "9A", 2, "被動語態"),
    ("EN-9B-1", "9B", 1, "關係代名詞"),
    ("EN-9B-2", "9B", 2, "間接問句與閱讀理解"),
]
QUESTIONS = []


def Q(unit, concept, difficulty, stem, options, answer, explanation, hints, wrong, check=None):
    QUESTIONS.append(dict(unit=unit, concept=concept, difficulty=difficulty, stem=stem,
                          options=options, answer=answer, explanation=explanation,
                          hints=hints, wrong=wrong, check=check))


# ============================ 七上 ============================
# EN-7A-1 be 動詞與人稱代名詞
Q("EN-7A-1", "be-verb", 1, "My sister and I ＿＿＿ in the same class.",
  ["am", "is", "are", "be"], "C",
  "主詞 My sister and I 是「我姊姊和我」兩個人，屬於複數，be 動詞要用 are。am 只配 I，is 配第三人稱單數。",
  ["主詞是幾個人？", "兩個人以上當主詞時，be 動詞用哪一個？"],
  {"A": "只看到最靠近空格的 I 就用 am，忽略主詞是兩個人。", "B": "把 My sister 當成主詞，忘了後面還有 and I。", "D": "be 是原形，句子裡需要依主詞變化的 be 動詞。"},
  None)
Q("EN-7A-1", "be-verb", 1, "Look at the cat. It ＿＿＿ very cute.",
  ["are", "is", "am", "be"], "B",
  "主詞 It 指那隻貓，是第三人稱單數，be 動詞用 is。",
  ["It 是單數還是複數？", "第三人稱單數（he、she、it）配哪個 be 動詞？"],
  {"A": "are 用在 you、we、they 或複數名詞。", "C": "am 只和 I 搭配。", "D": "be 是原形，不能直接放在主詞 It 後面當動詞。"},
  None)
Q("EN-7A-1", "be-verb", 2, "＿＿＿ your parents at home now? — No, they aren't.",
  ["Is", "Are", "Do", "Does"], "B",
  "主詞 your parents（你的父母）是複數，be 動詞疑問句要把 Are 放句首；回答 No, they aren't. 也是用 be 動詞，可以互相印證。",
  ["答句用的是哪一種動詞？", "your parents 是單數還是複數？"],
  {"A": "parents 有 s，是複數，不能用 Is。", "C": "答句是 they aren't，問句應該用 be 動詞，不是助動詞 Do。", "D": "Does 是助動詞，而且只配第三人稱單數。"},
  None)
Q("EN-7A-1", "be-verb", 2, "Kevin and his brother ＿＿＿ from Japan. They are from Korea.",
  ["isn't", "aren't", "don't", "doesn't"], "B",
  "後句說他們來自韓國，所以前句要用否定。主詞 Kevin and his brother 是複數，be 動詞否定用 aren't；「來自」是 be from，不用 don't。",
  ["後面那句話告訴你他們從哪裡來？", "be from 表示「來自」，否定時要否定哪一個字？"],
  {"A": "主詞是兩個人，不能用單數的 isn't。", "C": "be from 的 be 已經是動詞，否定時直接用 aren't，不用 don't。", "D": "doesn't 是助動詞，而且主詞不是第三人稱單數。"},
  None)
Q("EN-7A-1", "pronoun", 1, "This is my friend Amy. ＿＿＿ is twelve years old.",
  ["He", "She", "Her", "It"], "B",
  "Amy 是女生，當主詞時用主格代名詞 She。Her 是受格或所有格，不能當主詞。",
  ["Amy 是男生還是女生？", "空格在句首當主詞，要用主格還是受格？"],
  {"A": "He 用來代替男生。", "C": "Her 是受格或所有格，不能放在句首當主詞。", "D": "It 用來代替物品或動物，不用來稱呼人。"},
  None)
Q("EN-7A-1", "pronoun", 2, "Mr. Lin is our teacher. We all like ＿＿＿ very much.",
  ["he", "his", "him", "they"], "C",
  "空格在動詞 like 後面，是受詞，要用受格。Mr. Lin 是男生，受格是 him。",
  ["空格是在動詞前面還是後面？", "放在動詞後面的代名詞要用什麼格？"],
  {"A": "he 是主格，只能當主詞，不能放在動詞後當受詞。", "B": "his 是所有格，後面要接名詞，例如 his class。", "D": "Mr. Lin 只有一個人，不能用複數 they，而且 they 也是主格。"},
  None)
Q("EN-7A-1", "pronoun", 2, "Is this Jenny's bag? — Yes, it is ＿＿＿.",
  ["her", "hers", "she", "they"], "B",
  "空格後面沒有名詞，要用所有格代名詞 hers（= her bag，她的包包）。her 是所有格形容詞，後面必須接名詞。",
  ["空格後面還有名詞嗎？", "「她的東西」不接名詞時要怎麼說？和 mine、yours 同一類。"],
  {"A": "her 當所有格時後面要接名詞，例如 her bag。", "C": "she 是主格，意思變成「它是她」，不合理。", "D": "Jenny 只有一個人，而且 they 是主格，不能表示「她的」。"},
  None)
Q("EN-7A-1", "dialogue-response", 1, "A: Hi, I'm Ben. Nice to meet you.\nB: ＿＿＿",
  ["Nice to meet you, too.", "I'm fine, thank you.", "You're welcome.", "Yes, I am."], "A",
  "初次見面對方說 Nice to meet you.（很高興認識你），禮貌的回答是 Nice to meet you, too.（我也很高興認識你）。",
  ["Ben 說的是哪一種打招呼？", "對方說很高興認識你，你可以怎麼回應同樣的心情？"],
  {"B": "I'm fine, thank you. 是回答 How are you?（你好嗎）。", "C": "You're welcome. 是別人說謝謝時的回答。", "D": "Yes, I am. 是回答 Are you...? 的是非問句。"},
  None)
Q("EN-7A-1", "dialogue-response", 2, "A: Are you and Linda classmates?\nB: ＿＿＿ We are both in Class 701.",
  ["Yes, we are.", "No, we aren't.", "Yes, you are.", "Yes, I am."], "A",
  "問句主詞是 you and Linda（你和 Linda），回答時要改成 we。後面說我們都在 701 班，所以是肯定的 Yes, we are.",
  ["後面那句說她們在不在同一班？", "問 you and Linda 時，回答要用哪個代名詞？"],
  {"B": "後面說 both in Class 701（都在 701 班），是同學，不能否定。", "C": "回答自己和 Linda 時要用 we，不是 you。", "D": "問的是兩個人，回答不能只用 I。"},
  None)
Q("EN-7A-1", "reading-detail", 2,
  "Hello! My name is Mia. I am thirteen years old, and I am a student at Sunshine Junior High School. "
  "My best friend is Grace. She is in my class, too. We are both on the school basketball team. "
  "Our coach is Mr. Wang. He is tall and kind. We are happy on the team.\n\nWho is Mr. Wang?",
  ["Mia's classmate", "Mia's basketball coach", "Mia's father", "Grace's brother"], "B",
  "文中說 We are both on the school basketball team. Our coach is Mr. Wang.，Our 指 Mia 和 Grace，所以王先生是她們籃球隊的教練。",
  ["找到 Mr. Wang 出現的那一句。", "Our coach 的 Our 指的是誰？"],
  {"A": "Mia 的同班同學是 Grace，不是王先生。", "C": "文中沒有提到 Mia 的爸爸。", "D": "文中沒有提到 Grace 的哥哥，王先生是教練。"},
  None)
Q("EN-7A-1", "reading-detail", 3,
  "This is a photo of my family. The man with glasses is my father. He is a doctor. The woman next to him "
  "is my mother. She is an English teacher. The boy in the blue T-shirt is not my brother. He is my cousin, Nick. "
  "His mother is my father's sister. The little girl on my mother's lap is my sister, Lily. She is only three."
  "\n\nWhich is TRUE about the writer's family?",
  ["The writer's mother is a doctor.", "Nick is the writer's brother.", "Nick's mother is the writer's aunt.", "Lily is thirteen years old."], "C",
  "文中說 Nick 的媽媽是 my father's sister（爸爸的姊妹），爸爸的姊妹就是作者的姑姑（aunt），所以 C 正確。醫生是爸爸、Nick 是表親（cousin）、Lily 才三歲。",
  ["逐一對照每個選項和文章。", "His mother is my father's sister. 中的 His 指誰？爸爸的姊妹要怎麼稱呼？"],
  {"A": "文中說 He is a doctor.，He 指戴眼鏡的爸爸；媽媽是英文老師。", "B": "文中明說 The boy... is not my brother. He is my cousin.", "D": "文中說 She is only three.，Lily 才三歲。"},
  None)
Q("EN-7A-1", "reading-detail", 3,
  "Hi Dad,\nI am at Kevin's house now. His parents are not at home, but his grandmother is here. "
  "She is very nice. Kevin and I are in his room. We are busy with our science homework. "
  "It is hard, but we are OK.\nJoe\n\nWho is at Kevin's house now?",
  ["Kevin, Joe, and Kevin's grandmother", "Kevin, Joe, and Kevin's parents", "Joe and Joe's dad", "Only Kevin and Joe"], "A",
  "Joe 說 I am at Kevin's house now，又說 Kevin and I are in his room，另外 his grandmother is here，而 Kevin 的父母不在家。所以在家的是 Kevin、Joe 和 Kevin 的奶奶。",
  ["把文中提到「在」和「不在」Kevin 家的人分別圈出來。", "His parents are not at home, but his grandmother is here. 這句說了哪兩件事？"],
  {"B": "文中說 His parents are not at home.，Kevin 的父母不在家。", "C": "這是 Joe 寫給爸爸的訊息，爸爸不在 Kevin 家。", "D": "漏看了 his grandmother is here，奶奶也在家。"},
  None)

# EN-7A-2 現在簡單式與頻率副詞
Q("EN-7A-2", "simple-present", 1, "My brother ＿＿＿ basketball after school every day.",
  ["play", "plays", "playing", "is play"], "B",
  "every day 表示習慣，用現在簡單式。主詞 My brother 是第三人稱單數，動詞要加 s，所以用 plays。",
  ["every day 表示什麼樣的動作？", "主詞 My brother 是第幾人稱、單數還是複數？"],
  {"A": "主詞是第三人稱單數，現在簡單式動詞要加 s。", "C": "playing 不能單獨當句子的動詞，前面缺 be 動詞。", "D": "be 動詞和一般動詞原形不能直接放在一起。"},
  None)
Q("EN-7A-2", "simple-present", 1, "＿＿＿ your sister like cats? — Yes, she does.",
  ["Do", "Does", "Is", "Are"], "B",
  "like 是一般動詞，疑問句要借助動詞。主詞 your sister 是第三人稱單數，用 Does；答句 Yes, she does. 也可以印證。",
  ["句子裡的動詞 like 是 be 動詞還是一般動詞？", "看答句用的是哪個助動詞。"],
  {"A": "your sister 是第三人稱單數，要用 Does，不是 Do。", "C": "句中已有一般動詞 like，不能用 be 動詞 Is 發問。", "D": "Are 是 be 動詞，而且配複數主詞。"},
  None)
Q("EN-7A-2", "simple-present", 2, "Amy and her friends ＿＿＿ to school by bus. They walk to school.",
  ["don't go", "doesn't go", "aren't go", "not go"], "A",
  "後句說她們走路上學，所以前句要否定。主詞 Amy and her friends 是複數，一般動詞否定用 don't + 原形動詞。",
  ["後句告訴你她們怎麼上學？", "複數主詞的一般動詞否定要用哪個助動詞？"],
  {"B": "doesn't 只配第三人稱單數，Amy and her friends 是複數。", "C": "be 動詞否定 aren't 不能直接接一般動詞 go。", "D": "英文否定句不能只加 not，要有助動詞 don't。"},
  None)
Q("EN-7A-2", "simple-present", 1, "Mr. Chen ＿＿＿ English at our school. He is a good teacher.",
  ["teach", "teaches", "teachs", "is teach"], "B",
  "主詞 Mr. Chen 是第三人稱單數，現在簡單式動詞要變化。字尾是 ch 的動詞要加 es，所以 teach → teaches。",
  ["主詞是第三人稱單數嗎？", "字尾是 s、x、sh、ch、o 的動詞，第三人稱單數要加什麼？"],
  {"A": "主詞是第三人稱單數，動詞要加 es。", "C": "字尾 ch 要加 es，不是只加 s。", "D": "be 動詞 is 和動詞原形 teach 不能連用。"},
  None)
Q("EN-7A-2", "frequency", 2, "Kevin ＿＿＿ late for school. He gets up at six every morning.",
  ["is never", "never is", "never", "is always"], "A",
  "後句說他每天六點起床，所以他從不遲到。be late 要有 be 動詞，而頻率副詞要放在 be 動詞後面，所以是 is never。",
  ["Kevin 每天很早起床，他會常常遲到嗎？", "頻率副詞放在 be 動詞的前面還是後面？"],
  {"B": "頻率副詞要放在 be 動詞之後，不是之前。", "C": "late 是形容詞，前面要有 be 動詞才能成為完整句子。", "D": "每天六點就起床，說他「總是遲到」前後矛盾。"},
  None)
Q("EN-7A-2", "frequency", 2, "A: ＿＿＿ do you go swimming?\nB: Twice a week.",
  ["How often", "How long", "How many", "What time"], "A",
  "答句 Twice a week（一週兩次）是次數頻率，問「多久一次」要用 How often。",
  ["Twice a week 是在回答時間長短、數量，還是頻率？", "哪個疑問詞是問「多常」？"],
  {"B": "How long 問時間多長，答案應是 For two hours 之類。", "C": "How many 問可數名詞的數量，後面要接名詞。", "D": "What time 問幾點，答案應是 At seven 之類。"},
  None)
Q("EN-7A-2", "frequency", 2, "Tina ＿＿＿ breakfast, so she is often hungry in her first class.",
  ["never eats", "eats never", "always eats", "never eat"], "A",
  "她第一節課常常餓，表示她從不吃早餐。頻率副詞放在一般動詞前面，主詞 Tina 是第三人稱單數，動詞要加 s，所以是 never eats。",
  ["因為怎麼樣，所以第一節課常肚子餓？", "頻率副詞放在一般動詞的前面或後面？動詞要不要加 s？"],
  {"B": "頻率副詞應放在一般動詞前面。", "C": "如果總是吃早餐，就不會因此而肚子餓，和 so 後面的結果不合。", "D": "主詞 Tina 是第三人稱單數，eat 要加 s。"},
  None)
Q("EN-7A-2", "dialogue-response", 1, "A: What do you usually do on Sundays?\nB: ＿＿＿",
  ["I usually go hiking with my family.", "Yes, I do.", "It's Sunday.", "I'm in the park now."], "A",
  "What do you usually do 問的是平常習慣做什麼，要用現在簡單式回答做了什麼活動：I usually go hiking...",
  ["What 開頭的問句能用 Yes 或 No 回答嗎？", "問的是「通常」做什麼，回答要說一個活動。"],
  {"B": "What 開頭的疑問句不能用 Yes/No 回答。", "C": "問的是做什麼，不是問今天星期幾。", "D": "問的是星期天的習慣，不是現在人在哪裡。"},
  None)
Q("EN-7A-2", "dialogue-response", 2, "A: Does your father cook dinner?\nB: ＿＿＿ My mother does.",
  ["No, he doesn't.", "Yes, he does.", "No, she doesn't.", "Yes, he is."], "A",
  "後面說 My mother does（是我媽媽煮），表示爸爸不煮，要否定回答。問 your father 要用 he，助動詞用 doesn't。",
  ["後面那句說是誰煮晚餐？", "回答 your father 要用哪個代名詞？問句用什麼助動詞，回答就用什麼。"],
  {"B": "後面說是媽媽煮，所以爸爸不煮，不能肯定。", "C": "問的是爸爸，要用 he，不是 she。", "D": "問句用 Does，回答要用 does，不能用 be 動詞 is。"},
  None)
Q("EN-7A-2", "reading-detail", 2,
  "Ted is a busy boy. He gets up at 6:00 every morning and takes a walk with his dog. After school, he has "
  "piano lessons on Mondays and Wednesdays. On Tuesdays and Thursdays, he plays soccer with his classmates. "
  "He is free only on Fridays, so he usually watches movies at home that night.\n\nWhat does Ted do on Thursdays after school?",
  ["He takes piano lessons.", "He plays soccer.", "He watches movies at home.", "He walks his dog."], "B",
  "文中說 On Tuesdays and Thursdays, he plays soccer with his classmates.，所以星期四放學後他踢足球。",
  ["找出文中 Thursdays 出現的句子。", "注意題目問的是「放學後」。"],
  {"A": "鋼琴課是星期一和星期三。", "C": "看電影是星期五晚上。", "D": "遛狗是每天早上，不是放學後。"},
  None)
Q("EN-7A-2", "reading-detail", 3,
  "Amy's family has a rule for the TV. Amy and her brother can watch TV for one hour on school days. "
  "On weekends, they can watch it for two hours a day. Their parents seldom watch TV. Her father usually reads "
  "the newspaper after dinner, and her mother often goes jogging in the park.\n\nHow long can Amy watch TV in a week?",
  ["3 hours", "7 hours", "9 hours", "10 hours"], "C",
  "上學日是星期一到星期五共 5 天，每天 1 小時，共 5 小時；週末兩天每天 2 小時，共 4 小時。5 + 4 = 9 小時。",
  ["一週有幾天上學日？幾天週末？", "分別算出上學日和週末的時數，再相加。"],
  {"A": "只把 1 小時和 2 小時相加，沒有乘上天數。", "B": "把一週 7 天都當成每天 1 小時。", "D": "週末只有 2 天，可能把週末算成 2.5 天或多算一天。"},
  None)
Q("EN-7A-2", "reading-detail", 3,
  "City Library\nOpening Hours:\nMonday: Closed\nTuesday to Friday: 9:00 a.m. to 8:00 p.m.\n"
  "Saturday and Sunday: 10:00 a.m. to 5:00 p.m.\nChildren under 12 can borrow five books at a time. "
  "Other people can borrow ten books at a time.\n\n"
  "Ben is 14 years old. He wants to borrow some books at 6:00 p.m. When can he go, and how many books can he borrow?",
  ["On Monday; ten books", "On Wednesday; ten books", "On Saturday; five books", "On Sunday; ten books"], "B",
  "晚上 6 點還開著的只有星期二到星期五（開到晚上 8 點）；Ben 14 歲，不是 12 歲以下，可以借 10 本。所以是星期三、10 本。",
  ["先找晚上 6 點還有開的日子。", "Ben 幾歲？他屬於 Children under 12 嗎？"],
  {"A": "星期一休館（Closed）。", "C": "週末只開到下午 5 點，而且 Ben 超過 12 歲可以借 10 本。", "D": "星期天下午 5 點就關門，晚上 6 點進不去。"},
  None)

# ============================ 七下 ============================
# EN-7B-1 現在進行式與祈使句
Q("EN-7B-1", "present-progressive", 1, "Listen! The birds ＿＿＿ in the tree.",
  ["sing", "are singing", "is singing", "sings"], "B",
  "Listen!（你聽！）表示動作正在發生，用現在進行式 be + V-ing。主詞 The birds 是複數，be 動詞用 are。",
  ["Listen! 提示這個動作是什麼時候發生的？", "現在進行式的公式是什麼？birds 是單數還是複數？"],
  {"A": "sing 是現在簡單式，表示習慣，不是「正在」。", "C": "birds 是複數，be 動詞要用 are。", "D": "sings 是第三人稱單數現在式，主詞是複數，也不表示正在進行。"},
  None)
Q("EN-7B-1", "present-progressive", 1, "What ＿＿＿ you doing now? — I'm doing my homework.",
  ["are", "do", "is", "does"], "A",
  "doing 和 now 表示現在進行式，疑問句是 What + be 動詞 + 主詞 + V-ing。主詞 you 配 are。",
  ["空格後面的 doing 是什麼形式？", "現在進行式要搭配哪一種動詞？you 配哪一個？"],
  {"B": "V-ing 前面要用 be 動詞，不是助動詞 do。", "C": "主詞是 you，要用 are，不是 is。", "D": "does 是助動詞，不能和 V-ing 形成進行式。"},
  None)
Q("EN-7B-1", "present-progressive", 2, "Jack is ＿＿＿ a letter to his grandma.",
  ["writting", "writing", "writeing", "write"], "B",
  "is 後面要接 V-ing 形成現在進行式。write 字尾是不發音的 e，要去 e 再加 ing，變成 writing，不需要重複 t。",
  ["is 後面接動詞要用什麼形式？", "字尾是 e 的動詞，加 ing 時要怎麼處理？"],
  {"A": "write 不是「短母音 + 子音」結尾，不用重複字尾子音。", "C": "字尾不發音的 e 要先去掉再加 ing。", "D": "be 動詞後面不能直接接動詞原形。"},
  None)
Q("EN-7B-1", "present-progressive", 2, "My father usually drives to work, but today he ＿＿＿ the MRT.",
  ["takes", "is taking", "take", "taking"], "B",
  "usually 描述平常的習慣（現在簡單式），but today 表示今天和平常不同、正在進行的情況，用現在進行式 is taking。",
  ["but 前後在比較什麼？", "today 描述的是平常習慣，還是今天這個時候的狀況？"],
  {"A": "takes 是現在簡單式，表示習慣，但句子強調今天和平常不同。", "C": "主詞 he 是第三人稱單數，而且這裡要用進行式。", "D": "taking 前面缺少 be 動詞 is。"},
  None)
Q("EN-7B-1", "imperative", 1, "＿＿＿ run in the classroom. It's dangerous.",
  ["Don't", "Doesn't", "Not", "No"], "A",
  "祈使句（命令、勸告）以原形動詞開頭，否定祈使句是 Don't + 原形動詞，所以是 Don't run（不要跑）。",
  ["這句話是在叫別人做或不做某件事嗎？", "否定的祈使句要用哪個字開頭？"],
  {"B": "祈使句沒有主詞，不用第三人稱單數的 Doesn't。", "C": "英文否定祈使句不能只用 Not 開頭。", "D": "No 後面要接 V-ing 或名詞（如 No running），不能接原形 run。"},
  None)
Q("EN-7B-1", "imperative", 2, "It's cold outside. ＿＿＿ your jacket.",
  ["Put on", "Puts on", "Putting on", "To put on"], "A",
  "天氣冷，叫對方穿上外套，是祈使句，要用原形動詞開頭：Put on your jacket.",
  ["這句是在勸對方做什麼？", "祈使句的第一個字要用動詞的什麼形式？"],
  {"B": "祈使句用原形動詞，不加 s。", "C": "Putting on 不是完整句子，祈使句要用原形。", "D": "To put on 是不定詞，不能單獨成為祈使句。"},
  None)
Q("EN-7B-1", "imperative", 2, "Let's ＿＿＿ to the movies tonight.",
  ["go", "goes", "going", "to go"], "A",
  "Let's（= Let us）是提議「我們一起…吧」，後面接原形動詞，所以是 Let's go。",
  ["Let's 是什麼的縮寫？", "let 後面接的動詞要用什麼形式？"],
  {"B": "Let's 後面接原形動詞，不加 s。", "C": "Let's 後面不接 V-ing。", "D": "Let's 後面直接接原形動詞，不加 to。"},
  None)
Q("EN-7B-1", "dialogue-response", 2, "A: Let's play basketball after school.\nB: ＿＿＿ I love basketball.",
  ["Good idea.", "No, let's not.", "You're welcome.", "I'm sorry to hear that."], "A",
  "A 提議一起打籃球，B 後面說 I love basketball.（我很愛籃球），表示贊成，所以回答 Good idea.（好主意）。",
  ["B 喜不喜歡籃球？", "贊成別人的提議時可以怎麼說？"],
  {"B": "B 說很愛籃球，拒絕提議前後矛盾。", "C": "You're welcome. 是回應別人道謝。", "D": "I'm sorry to hear that. 是聽到壞消息時的回應。"},
  None)
Q("EN-7B-1", "dialogue-response", 1, "A: Where is Mom?\nB: ＿＿＿",
  ["She's watering the flowers in the garden.", "Yes, she is.", "She waters the flowers every day.", "She is a nurse."], "A",
  "Where 問「在哪裡」，要回答地點。A 選項說她正在花園裡澆花，說出了地點 in the garden。",
  ["Where 問的是什麼？", "哪個選項有提到地點？"],
  {"B": "Where 開頭的問句不能用 Yes/No 回答。", "C": "說的是每天的習慣，沒有回答現在在哪裡。", "D": "說的是職業，沒有回答在哪裡。"},
  None)
Q("EN-7B-1", "reading-detail", 2,
  "Hi Sam,\nI'm at the night market with Lisa. It's very crowded now. Lisa is buying some fruit, and I'm waiting "
  "in line for beef noodles. Don't eat dinner at home! We're bringing some fried chicken back for you. See you at nine.\n"
  "Mom\n\nWhat is Lisa doing now?",
  ["She is buying fruit.", "She is waiting in line.", "She is eating dinner at home.", "She is buying fried chicken."], "A",
  "文中說 Lisa is buying some fruit，所以 Lisa 正在買水果；排隊買牛肉麵的是寫訊息的媽媽（I）。",
  ["找到 Lisa 出現的句子。", "I'm waiting in line 的 I 是誰？"],
  {"B": "排隊的是寫訊息的人 I，不是 Lisa。", "C": "她們在夜市，不在家；Don't eat dinner at home 是對 Sam 說的。", "D": "炸雞是要帶回去給 Sam 的，文中沒說 Lisa 正在買。"},
  None)
Q("EN-7B-1", "reading-detail", 3,
  "Welcome to Green Hill Zoo!\nPlease follow these rules:\n1. Don't feed the animals.\n"
  "2. Keep your voice down near the bird house.\n3. Put your trash in the trash cans.\n"
  "4. Children under 8, please stay with your parents.\n\nWhich person is following the rules?",
  ["Tom is giving his bread to a monkey.", "Amy is shouting near the bird house.",
   "Leo, a six-year-old boy, is walking with his mother.", "Joy is leaving her bottle on the grass."], "C",
  "規則 4 說 8 歲以下的小孩要和父母在一起，Leo 6 歲、正和媽媽一起走，遵守規則。其他人分別違反了不要餵食、要小聲、垃圾要丟垃圾桶的規則。",
  ["把每個人的行為和四條規則一一對照。", "Leo 幾歲？規則 4 要求 8 歲以下的小孩怎麼做？"],
  {"A": "把麵包給猴子就是餵動物，違反規則 1。", "B": "在鳥屋附近大叫，違反規則 2 要小聲。", "D": "把瓶子留在草地上，違反規則 3 要把垃圾丟進垃圾桶。"},
  None)
Q("EN-7B-1", "reading-detail", 3,
  "It is Sunday morning. Everyone in the Wu family is busy. Mr. Wu is washing the car in front of the house. "
  "Mrs. Wu is not cooking in the kitchen today; she is cleaning the bathroom upstairs. Their son, Andy, is helping "
  "his father, and their daughter, Nina, is walking the dog in the park.\n\n"
  "How many people in the Wu family are in front of the house now?",
  ["One", "Two", "Three", "Four"], "B",
  "吳先生在房子前面洗車；Andy 正在幫爸爸，所以也在房子前面。吳太太在樓上浴室，Nina 在公園。所以在房子前面的是 2 個人。",
  ["誰在 in front of the house？", "Andy is helping his father，爸爸在做什麼、在哪裡？"],
  {"A": "只算了吳先生，漏掉在幫爸爸洗車的 Andy。", "C": "吳太太在樓上打掃浴室，不在房子前面。", "D": "Nina 在公園遛狗，吳太太在樓上，不能全算進去。"},
  None)

# EN-7B-2 過去簡單式
Q("EN-7B-2", "past-tense", 1, "We ＿＿＿ a baseball game on TV last night.",
  ["watch", "watched", "watching", "are watching"], "B",
  "last night（昨晚）是過去時間，動詞要用過去式。watch 是規則動詞，加 ed 變成 watched。",
  ["句子裡有哪個時間詞？", "過去發生的事，動詞要用什麼時態？"],
  {"A": "watch 是現在式，和 last night 不合。", "C": "watching 前面沒有 be 動詞，不能當句子的動詞。", "D": "are watching 是現在進行式，和 last night 不合。"},
  None)
Q("EN-7B-2", "past-tense", 1, "Where ＿＿＿ you yesterday afternoon? — I was at the library.",
  ["are", "were", "was", "did"], "B",
  "yesterday afternoon 是過去時間，be 動詞用過去式。主詞 you 的 be 動詞過去式是 were。",
  ["yesterday 表示什麼時態？", "you 的 be 動詞過去式是 was 還是 were？"],
  {"A": "are 是現在式，和 yesterday 不合。", "C": "was 配 I、he、she、it，主詞 you 要用 were。", "D": "句中沒有一般動詞，要用 be 動詞，不能用 did。"},
  None)
Q("EN-7B-2", "past-tense", 2, "＿＿＿ your brother go to the beach last weekend? — No, he didn't.",
  ["Do", "Does", "Did", "Was"], "C",
  "last weekend 是過去時間，一般動詞 go 的過去式疑問句用 Did + 主詞 + 原形動詞。答句 he didn't 也可以印證。",
  ["句中有 last weekend，是什麼時態？", "空格後的 go 是原形，疑問句要借哪個助動詞？"],
  {"A": "Do 是現在式，和 last weekend 不合。", "B": "Does 是現在式，和 last weekend 不合。", "D": "Was 是 be 動詞，後面不能接原形動詞 go。"},
  None)
Q("EN-7B-2", "past-tense", 2, "Amy didn't ＿＿＿ her homework last night because she was sick.",
  ["finish", "finished", "finishes", "finishing"], "A",
  "didn't 已經表示過去，後面的動詞要用原形，所以是 didn't finish。",
  ["didn't 本身已經是過去式了嗎？", "助動詞後面的動詞要用什麼形式？"],
  {"B": "didn't 已經表示過去，後面不能再用過去式。", "C": "助動詞後面接原形，不加 es。", "D": "didn't 後面不能接 V-ing。"},
  None)
Q("EN-7B-2", "irregular-verb", 1, "I ＿＿＿ a new bike from my uncle two days ago.",
  ["get", "got", "getted", "gets"], "B",
  "two days ago（兩天前）是過去時間。get 是不規則動詞，過去式是 got。",
  ["ago 表示什麼時態？", "get 的過去式是規則變化嗎？"],
  {"A": "get 是現在式，和 two days ago 不合。", "C": "get 是不規則動詞，過去式不是加 ed。", "D": "gets 是現在式，而且主詞 I 不加 s。"},
  None)
Q("EN-7B-2", "irregular-verb", 2, "Kevin ＿＿＿ his wallet at home this morning, so he had no money for lunch.",
  ["left", "leaved", "leaves", "leave"], "A",
  "後句用過去式 had，表示事情已經發生。leave（遺留）是不規則動詞，過去式是 left。",
  ["後半句的 had 是什麼時態？", "leave 的過去式怎麼寫？"],
  {"B": "leave 是不規則動詞，過去式不是加 d。", "C": "leaves 是現在式，和 had 的時態不一致。", "D": "主詞 Kevin 是第三人稱單數，而且時態應該用過去式。"},
  None)
Q("EN-7B-2", "irregular-verb", 2, "Last summer my family ＿＿＿ to Japan and ＿＿＿ a lot of pictures.",
  ["went; took", "goes; takes", "went; taked", "go; took"], "A",
  "Last summer 是過去時間，兩個動詞都要用過去式。go 的過去式是 went，take 的過去式是 took。",
  ["Last summer 表示什麼時態？", "go 和 take 都是不規則動詞，它們的過去式是什麼？"],
  {"B": "goes、takes 是現在式，和 Last summer 不合。", "C": "take 的過去式是 took，不是 taked。", "D": "go 是現在式，兩個動詞的時態都要是過去式。"},
  None)
Q("EN-7B-2", "dialogue-response", 1, "A: How was your trip to Kenting?\nB: ＿＿＿",
  ["It was great. We swam in the sea.", "I go there by train.", "Yes, it was.", "I'm going there next week."], "A",
  "How was your trip? 問旅行「怎麼樣」，要說感想，而且旅行已經結束，用過去式：It was great.",
  ["How was...? 是在問什麼？", "問句用 was，表示旅行已經結束了嗎？"],
  {"B": "問的是旅行好不好，不是交通方式，而且時態不對。", "C": "How 開頭的疑問句不能用 Yes/No 回答。", "D": "問句用過去式 was，表示旅行已經去過了，不是下週才要去。"},
  None)
Q("EN-7B-2", "dialogue-response", 2, "A: What did you do last Sunday?\nB: ＿＿＿",
  ["I visited my grandparents.", "I visit my grandparents every Sunday.", "Yes, I did.", "I will visit my grandparents."], "A",
  "問句用 did 和 last Sunday，問上星期天做了什麼，回答要用過去式：I visited my grandparents.",
  ["問句的時態是什麼？", "回答要用和問句相同的時態。"],
  {"B": "every Sunday 是現在簡單式說習慣，沒有用過去式回答上星期天的事。", "C": "What 開頭的疑問句不能用 Yes/No 回答。", "D": "will 是未來式，但問的是已經過去的星期天。"},
  None)
Q("EN-7B-2", "reading-detail", 2,
  "Saturday, May 10\nToday was my mom's birthday. In the morning, Dad and I went to the bakery and bought a big cake. "
  "In the afternoon, my sister made a card for Mom. At night, we had dinner at Mom's favorite restaurant. "
  "Mom was very happy. She said it was her best birthday ever.\n\nWhat did the writer's sister do for Mom?",
  ["She bought a cake.", "She made a card.", "She cooked dinner.", "She sang a song."], "B",
  "日記寫 In the afternoon, my sister made a card for Mom.，姊姊（妹妹）做了一張卡片給媽媽。",
  ["找到 my sister 出現的句子。", "made 是哪個動詞的過去式？"],
  {"A": "買蛋糕的是爸爸和作者。", "C": "晚餐是在餐廳吃的，不是姊妹煮的。", "D": "文中沒有提到唱歌。"},
  None)
Q("EN-7B-2", "reading-detail", 3,
  "Last Friday, Tim got up late. He missed the bus, so he ran to school. When he got there, the gate was already "
  "closed. He waited at the gate for ten minutes, and then a teacher let him in. In the classroom, he found out "
  "that his math book was still at home. It was a bad day for Tim.\n\nWhich is NOT true about Tim last Friday?",
  ["He got up late.", "He took the bus to school.", "He waited at the school gate.", "He forgot his math book."], "B",
  "文中說 He missed the bus, so he ran to school.，他錯過公車、跑步去學校，所以「搭公車上學」不是事實。題目問 NOT true，選 B。",
  ["題目問的是「不正確」的敘述。", "missed the bus 是什麼意思？他最後怎麼到學校的？"],
  {"A": "文中第一句就說 Tim got up late，是正確敘述。", "C": "文中說他在校門口等了十分鐘，是正確敘述。", "D": "文中說他的數學課本還在家裡，也就是忘了帶，是正確敘述。"},
  None)
Q("EN-7B-2", "reading-detail", 3,
  "Lucy: Hi, Mark. Did you enjoy the concert last night?\nMark: No, I didn't go. My little brother was sick, "
  "so I stayed home with him.\nLucy: Oh, I'm sorry. Is he OK now?\nMark: Yes, he's better. He went back to school "
  "this morning.\nLucy: Good. The concert was great. I bought a CD for you.\n\nWhat do we know from the dialogue?",
  ["Mark went to the concert with Lucy.", "Mark's brother is still sick at home.",
   "Mark took care of his brother last night.", "Lucy didn't enjoy the concert."], "C",
  "Mark 說弟弟生病，所以他留在家陪弟弟（stayed home with him），也就是昨晚照顧弟弟。弟弟今天已經回學校，Lucy 說音樂會很棒。",
  ["Mark 昨晚為什麼沒去音樂會？", "弟弟現在怎麼樣了？Lucy 覺得音樂會如何？"],
  {"A": "Mark 說 No, I didn't go.，他沒去音樂會。", "B": "Mark 說弟弟好多了，今天早上已經回學校。", "D": "Lucy 說 The concert was great.，她很喜歡。"},
  None)

# ============================ 八上 ============================
# EN-8A-1 未來式與助動詞
Q("EN-8A-1", "future-tense", 1, "Look at the dark clouds. It ＿＿＿ rain soon.",
  ["is going to", "is going", "going to", "will going to"], "A",
  "看到烏雲、判斷快要下雨，用未來式 be going to + 原形動詞：It is going to rain soon.",
  ["soon 表示什麼時候？", "be going to 表示未來時，三個部分缺一不可。"],
  {"B": "少了 to，is going rain 不合文法。", "C": "少了 be 動詞 is。", "D": "will 和 be going to 不能同時使用，而且 will 後面要接原形。"},
  None)
Q("EN-8A-1", "future-tense", 1, "We ＿＿＿ visit the science museum next Friday.",
  ["will", "are", "did", "were"], "A",
  "next Friday（下星期五）是未來時間，用 will + 原形動詞 visit。",
  ["next Friday 是過去還是未來？", "表示未來、後面可以直接接原形動詞的是哪個字？"],
  {"B": "are 是 be 動詞，不能直接接原形動詞 visit。", "C": "did 表示過去，和 next Friday 不合。", "D": "were 是過去式 be 動詞，時態不合，也不能接原形動詞。"},
  None)
Q("EN-8A-1", "future-tense", 2, "＿＿＿ you going to join the dance contest tomorrow? — Yes, I am.",
  ["Are", "Will", "Do", "Did"], "A",
  "be going to 的疑問句把 be 動詞移到句首：Are you going to...? 答句 Yes, I am. 也是用 be 動詞。",
  ["空格後面是 going to，表示要搭配哪一種動詞？", "看答句 Yes, I am. 用的是什麼動詞。"],
  {"B": "Will 後面要接原形動詞，不能接 going to。", "C": "Do 是助動詞，不能和 going to 構成未來式。", "D": "Did 表示過去，和 tomorrow 不合。"},
  None)
Q("EN-8A-1", "modal-verb", 1, "You ＿＿＿ stop when the traffic light is red.",
  ["must", "can't", "don't have to", "may not"], "A",
  "紅燈時一定要停下來，這是規定，用 must（必須）。",
  ["紅燈時停車是可以選擇的，還是規定？", "哪個助動詞表示「必須」？"],
  {"B": "can't stop 是「不能停」，和交通規則相反。", "C": "don't have to 是「不必」，紅燈時停車不是可有可無。", "D": "may not 是「不可以」，紅燈時反而一定要停。"},
  None)
Q("EN-8A-1", "modal-verb", 2, "It's Sunday tomorrow. You ＿＿＿ get up early. You can sleep late.",
  ["don't have to", "must", "have to", "mustn't"], "A",
  "明天是星期天，可以睡晚一點，表示「不必」早起，用 don't have to。mustn't 是「禁止」，意思不同。",
  ["You can sleep late. 是什麼意思？", "「不必」和「禁止」在英文中分別怎麼說？"],
  {"B": "must 是「必須」，和後面「可以睡晚一點」矛盾。", "C": "have to 是「必須」，和後面「可以睡晚一點」矛盾。", "D": "mustn't 是「禁止」，星期天不會禁止人早起，把「不必」和「不可以」弄混了。"},
  None)
Q("EN-8A-1", "modal-verb", 2, "A: ＿＿＿ I use your eraser?\nB: Sure. Here you are.",
  ["May", "Must", "Should", "Will"], "A",
  "B 回答 Sure. Here you are.（當然，拿去吧），表示 A 在請求許可。禮貌地請求許可用 May I...?",
  ["B 的回答表示同意什麼？", "哪個助動詞可以用來「請求許可」？"],
  {"B": "Must I...? 是問「我必須…嗎」，不是請求借用。", "C": "Should I...? 是問「我應該…嗎」，是在徵求建議，不是借東西。", "D": "Will I...? 是問未來會不會發生，不能用來請求許可。"},
  None)
Q("EN-8A-1", "modal-verb", 2, "You have a fever. You ＿＿＿ see a doctor right away.",
  ["should", "shouldn't", "don't have to", "can't"], "A",
  "發燒了，建議對方馬上去看醫生，給建議用 should（應該）。",
  ["發燒時，合理的建議是什麼？", "哪個助動詞用來給「建議」？"],
  {"B": "shouldn't 是「不應該」，發燒不看醫生不合理。", "C": "don't have to 是「不必」，和發燒要就醫的情境不合。", "D": "can't 是「不能」，意思和情境相反。"},
  None)
Q("EN-8A-1", "dialogue-response", 1, "A: Will you come to my party on Saturday?\nB: ＿＿＿ I have to help my dad at his store.",
  ["Sorry, I can't.", "Sure, I'd love to.", "Yes, I will.", "Have fun!"], "A",
  "B 後面說星期六必須去幫爸爸顧店，表示不能去派對，所以要婉拒：Sorry, I can't.",
  ["B 星期六要做什麼？", "有事不能參加時可以怎麼回答？"],
  {"B": "後面說要去幫忙，答應參加前後矛盾。", "C": "後面說要去幫忙，說會去前後矛盾。", "D": "Have fun! 是祝別人玩得開心，沒有回答自己會不會去，語意也不接後句。"},
  None)
Q("EN-8A-1", "dialogue-response", 2, "A: I'm going to take a test tomorrow.\nB: ＿＿＿",
  ["Good luck!", "Congratulations!", "You're welcome.", "That's all right."], "A",
  "對方明天要考試，事情還沒發生，要祝他好運：Good luck!",
  ["考試是已經考完了還是還沒考？", "祝福即將挑戰某件事的人，要說什麼？"],
  {"B": "Congratulations! 是恭喜已經達成的事，考試還沒考。", "C": "You're welcome. 是回應別人的道謝。", "D": "That's all right. 是回應別人的道歉或道謝。"},
  None)
Q("EN-8A-1", "reading-detail", 2,
  "Dear students,\nNext Wednesday, we will have a school trip to Sun Moon Lake. The bus will leave at 7:30 a.m., "
  "so you must be at school by 7:15. Please bring your lunch and a raincoat. You don't have to bring money. "
  "We will come back at about 5:00 p.m.\n\nWhen must the students arrive at school?",
  ["By 7:15 a.m.", "At 7:30 a.m.", "At 5:00 p.m.", "By 7:45 a.m."], "A",
  "通知寫 you must be at school by 7:15，by 是「在…之前」，所以學生必須在早上 7:15 前到校。7:30 是遊覽車出發的時間。",
  ["找到 must 出現的句子。", "7:15 和 7:30 分別是什麼時間？"],
  {"B": "7:30 是遊覽車出發時間，學生要更早到。", "C": "下午 5 點是回來的時間。", "D": "7:45 已經超過出發時間，文中沒提到。"},
  None)
Q("EN-8A-1", "reading-detail", 3,
  "Jenny's family is going to have a picnic this Saturday. Her father will drive, and her mother will make "
  "sandwiches. Jenny wants to bring her cat, but her mother says she can't because the park doesn't allow pets. "
  "The weather report says it will be sunny in the morning but rainy after 2:00 p.m., so they are going to come "
  "home before 2:00.\n\nWhich is TRUE about the picnic?",
  ["Jenny's mother will drive the car.", "Jenny will take her cat to the park.",
   "They will stay in the park until the evening.", "They will probably leave the park before it rains."], "D",
  "氣象說下午 2 點後會下雨，所以他們打算 2 點前回家，也就是在下雨前離開公園。開車的是爸爸；公園不准帶寵物；他們不會待到晚上。",
  ["逐一對照每個選項和文章內容。", "下雨是幾點？他們打算幾點回家？"],
  {"A": "文中說 Her father will drive，媽媽負責做三明治。", "B": "媽媽說不行，因為公園不准帶寵物。", "C": "他們打算 2 點前回家，不會待到晚上。"},
  None)
Q("EN-8A-1", "reading-detail", 3,
  "Hi Grandma,\nI have good news! I'm going to be in the school play next month. I will be a king. We practice "
  "every Tuesday and Thursday after school. I have to remember many words, but it's fun. The play will be on "
  "June 20 at 7 p.m. Mom and Dad will come. Can you come, too?\nLove,\nEric\n\nWhich is TRUE?",
  ["Eric will be a king in the school play.", "Eric's parents can't come to the play.",
   "The play will be in the afternoon.", "Eric doesn't like practicing."], "A",
  "信中說 I'm going to be in the school play... I will be a king.，Eric 在學校戲劇中要演國王。爸媽會來、演出在晚上 7 點、他覺得練習很有趣。",
  ["逐一檢查每個選項。", "注意 7 p.m. 是下午還是晚上？it's fun 在說什麼？"],
  {"B": "信中說 Mom and Dad will come.，爸媽會來。", "C": "演出在晚上 7 點（7 p.m.），不是下午。", "D": "Eric 說要背很多台詞 but it's fun，他覺得有趣。"},
  None)

# EN-8A-2 比較級與最高級
Q("EN-8A-2", "comparative", 1, "An elephant is ＿＿＿ than a horse.",
  ["big", "bigger", "biggest", "more big"], "B",
  "有 than 表示兩者比較，用比較級。big 是「短母音 + 單一子音」結尾，要重複字尾再加 er：bigger。",
  ["看到 than 要用哪一級？", "big 變比較級時要不要重複字尾的 g？"],
  {"A": "than 前面要用比較級，不能用原級。", "C": "biggest 是最高級，用在三者以上，不和 than 連用。", "D": "單音節形容詞加 er，不用 more。"},
  None)
Q("EN-8A-2", "comparative", 1, "This question is ＿＿＿ than that one.",
  ["difficult", "more difficult", "difficulter", "most difficult"], "B",
  "兩個問題相比用比較級。difficult 是多音節形容詞，比較級要在前面加 more：more difficult。",
  ["有 than，要用哪一級？", "長的形容詞（三個音節）比較級怎麼變？"],
  {"A": "than 前面要用比較級。", "C": "多音節形容詞不能加 er，要用 more。", "D": "most 是最高級，不能和 than 連用。"},
  None)
Q("EN-8A-2", "comparative", 2, "My new phone is ＿＿＿ better than my old one.",
  ["very", "much", "more", "most"], "B",
  "要加強比較級（好得多）要用 much、a lot、even 等，不能用 very。better 本身已經是比較級，不能再加 more。",
  ["better 是原級還是比較級？", "「…得多」要用哪個字修飾比較級？"],
  {"A": "very 只能修飾原級（very good），不能修飾比較級。", "C": "better 已經是比較級，不能再加 more。", "D": "most 是最高級用字，不能放在比較級前面。"},
  None)
Q("EN-8A-2", "comparative", 2, "Tom is 160 cm tall. His brother is 170 cm tall. Tom is ＿＿＿ than his brother.",
  ["taller", "shorter", "tallest", "shortest"], "B",
  "Tom 160 公分，哥哥 170 公分，Tom 比較矮。兩者比較用比較級，所以是 shorter than。",
  ["160 和 170，誰比較高？", "只比較兩個人，要用比較級還是最高級？"],
  {"A": "Tom 比哥哥矮，不是比較高。", "C": "tallest 是最高級，不能和 than 連用，意思也相反。", "D": "shortest 是最高級，不能和 than 連用。"},
  None)
Q("EN-8A-2", "superlative", 1, "Taipei 101 was once the ＿＿＿ building in the world.",
  ["tall", "taller", "tallest", "most tall"], "C",
  "the ... in the world 表示在全世界之中最…，用最高級。tall 是單音節，最高級加 est：the tallest。",
  ["in the world 是在幾個東西裡面比較？", "單音節形容詞的最高級怎麼變？"],
  {"A": "the ＿＿＿ in the world 要用最高級，不能用原級。", "B": "taller 是比較級，用在兩者比較。", "D": "單音節形容詞最高級加 est，不用 most。"},
  None)
Q("EN-8A-2", "superlative", 2, "Kevin is the ＿＿＿ student in our class. He always helps others.",
  ["kinder", "kindest", "kind", "kindly"], "B",
  "the ... in our class 表示在全班之中最…，要用最高級 the kindest（最和善的）。",
  ["in our class 表示和幾個人比？", "前面有 the，後面有範圍，要用哪一級？"],
  {"A": "kinder 是比較級，用在兩者比較，不配 in our class。", "C": "the ＿＿＿ in our class 表示全班最…，要用最高級。", "D": "kindly 是副詞，不能修飾名詞 student。"},
  None)
Q("EN-8A-2", "superlative", 2, "Of the three bags, the black one is ＿＿＿.",
  ["the cheapest", "cheaper", "the cheaper", "cheap"], "A",
  "Of the three bags（三個包包中）是在三者以上比較，要用最高級 the cheapest。",
  ["比較的範圍有幾個東西？", "三者以上比較要用比較級還是最高級？"],
  {"B": "比較級用在兩者比較，這裡有三個包包。", "C": "the + 比較級用在「兩者中較…的」，三個要用最高級。", "D": "Of the three bags 表示在比較，不能用原級。"},
  None)
Q("EN-8A-2", "as-as", 1, "Amy is as ＿＿＿ as her sister. They are both 155 cm.",
  ["tall", "taller", "tallest", "more tall"], "A",
  "兩人都是 155 公分，一樣高。as + 形容詞原級 + as 表示「和…一樣」，所以用原級 tall。",
  ["她們誰比較高？", "as ... as 中間要放哪一級的形容詞？"],
  {"B": "as ... as 中間要用原級，不能用比較級。", "C": "as ... as 中間要用原級，不能用最高級。", "D": "as ... as 中間要用原級，而且 tall 的比較級也不是 more tall。"},
  None)
Q("EN-8A-2", "as-as", 2, "My bike is not as new as yours. That means your bike is ＿＿＿ mine.",
  ["older than", "newer than", "as old as", "the newest"], "B",
  "not as new as yours 表示「我的腳踏車沒有你的新」，也就是你的腳踏車比我的新：newer than mine。",
  ["not as new as 是「一樣新」還是「沒那麼新」？", "換成你的腳踏車當主詞，要怎麼比較？"],
  {"A": "你的比較新，不是比較舊，意思相反。", "C": "兩台新舊不同，不能說一樣舊。", "D": "只有兩台腳踏車比較，而且後面有 mine，不能用最高級。"},
  None)
Q("EN-8A-2", "reading-detail", 2,
  "Three friends, Leo, Mandy, and Sam, ran in a 3,000-meter race last Sunday. It was a hot day, but all of them "
  "finished the race. Leo finished in 15 minutes. Mandy finished in 12 minutes, and Sam finished 2 minutes after "
  "Mandy. After the race, they drank a lot of water and ate lunch together.\n\nWho finished the race second?",
  ["Leo", "Mandy", "Sam", "Leo's brother"], "C",
  "Mandy 12 分鐘，Sam 比 Mandy 晚 2 分鐘，是 14 分鐘，Leo 15 分鐘。時間越短越快，所以順序是 Mandy、Sam、Leo，第二名是 Sam。",
  ["先算出 Sam 花了幾分鐘。", "跑步時用的時間越少，名次越前面還是後面？"],
  {"A": "Leo 花 15 分鐘，時間最長，是最後一名。", "B": "Mandy 花 12 分鐘，是第一名。", "D": "文中沒有提到 Leo 的哥哥或弟弟。"},
  None)
Q("EN-8A-2", "reading-detail", 3,
  "Summer Sale at Happy Shoes!\nModel A: NT$1,200, very light\nModel B: NT$900, the most comfortable in our store\n"
  "Model C: NT$1,500, the lightest in our store\nAll shoes come in black, white, and blue. Come and try them on today!"
  "\n\nWhich is TRUE?",
  ["Model A is the cheapest.", "Model C is lighter than Model A.", "Model B is more expensive than Model C.", "Model A is the most comfortable."], "B",
  "廣告說 Model C 是 the lightest in our store（全店最輕），所以 C 一定比 A 輕。最便宜的是 B（NT$900），最舒服的也是 B。",
  ["先找出價格最低、最輕、最舒服的分別是哪一款。", "全店最輕的鞋子和其他鞋子比，會怎麼樣？"],
  {"A": "Model B 只要 NT$900，比 A 便宜，A 不是最便宜的。", "C": "B 是 NT$900，C 是 NT$1,500，B 比較便宜。", "D": "廣告說 Model B 才是全店最舒服的。"},
  None)
Q("EN-8A-2", "reading-detail", 3,
  "Anna has two pets, a dog named Max and a cat named Kiki. Max is three years old, and Kiki is five. Max is "
  "heavier than Kiki, but Kiki is smarter. Kiki can open the door by herself! Anna's brother also has a pet, a rabbit. "
  "It is the youngest and the smallest of the three pets.\n\nWhich is TRUE about the three pets?",
  ["Kiki is the oldest.", "Max is the smallest.", "The rabbit is older than Max.", "Max is smarter than Kiki."], "A",
  "Max 3 歲、Kiki 5 歲，兔子是三隻中最年輕的，所以兔子不到 3 歲，年紀最大的是 Kiki。兔子也是最小的；Kiki 比 Max 聰明。",
  ["先整理三隻寵物的年紀。", "兔子是 the youngest，那麼誰最老？"],
  {"B": "文中說兔子才是三隻中最小的。", "C": "兔子是最年輕的，所以比 Max 小。", "D": "文中說 Kiki is smarter，是 Kiki 比 Max 聰明。"},
  None)

# ============================ 八下 ============================
# EN-8B-1 不定詞與動名詞
Q("EN-8B-1", "gerund", 1, "My sister enjoys ＿＿＿ to music in her free time.",
  ["listen", "listening", "to listen", "listens"], "B",
  "enjoy（喜愛）後面接動名詞 V-ing 當受詞，所以是 enjoys listening。",
  ["enjoy 後面的動詞要用什麼形式？", "enjoy、finish、practice 這類動詞後面接 V-ing 還是 to V？"],
  {"A": "enjoy 後面不能接原形動詞。", "C": "enjoy 後面接 V-ing，不接不定詞 to V。", "D": "句中已有動詞 enjoys，後面的動詞不能再加 s 當第二個動詞。"},
  None)
Q("EN-8B-1", "infinitive", 1, "I want ＿＿＿ a doctor in the future.",
  ["be", "to be", "being", "am"], "B",
  "want 後面接不定詞 to + 原形動詞，所以是 want to be。",
  ["want 後面的動詞要用什麼形式？", "「想要做某事」的句型是 want ＿＿ V。"],
  {"A": "want 後面要加 to 再接原形。", "C": "want 後面接不定詞，不接 V-ing。", "D": "一個句子只能有一個主要動詞，want 後面不能直接接 am。"},
  None)
Q("EN-8B-1", "gerund", 2, "Thank you for ＿＿＿ me with my homework.",
  ["help", "to help", "helping", "helped"], "C",
  "for 是介系詞，介系詞後面的動詞要改成動名詞 V-ing，所以是 for helping。",
  ["空格前面的 for 是什麼詞性？", "介系詞後面接動詞時要用什麼形式？"],
  {"A": "介系詞後面不能接原形動詞。", "B": "介系詞 for 後面不接不定詞。", "D": "介系詞後面不接過去式動詞。"},
  None)
Q("EN-8B-1", "infinitive", 2, "Mom went to the supermarket ＿＿＿ some eggs.",
  ["buy", "to buy", "buying", "bought"], "B",
  "媽媽去超市「為了」買蛋，表示目的要用不定詞 to + 原形動詞：to buy。",
  ["媽媽去超市的目的是什麼？", "表示「為了做某事」要用什麼形式？"],
  {"A": "句中已有動詞 went，不能再直接接原形 buy。", "C": "表示目的要用不定詞，不用 V-ing。", "D": "句中已有動詞 went，不能再用第二個過去式動詞，中間需要連接詞。"},
  None)
Q("EN-8B-1", "gerund", 1, "＿＿＿ is good for your health.",
  ["Swim", "Swimming", "Swims", "Swam"], "B",
  "動詞要當主詞時，要改成動名詞 V-ing。swim 是「短母音 + 單一子音」結尾，要重複 m 再加 ing：Swimming。",
  ["空格在句首，當什麼成分？", "動詞要當主詞時要怎麼變？"],
  {"A": "原形動詞不能直接當主詞。", "C": "Swims 是動詞，不能當主詞。", "D": "Swam 是過去式動詞，不能當主詞。"},
  None)
Q("EN-8B-1", "infinitive", 2, "My parents decided ＿＿＿ a new car.",
  ["buy", "to buy", "buying", "bought"], "B",
  "decide（決定）後面接不定詞 to + 原形動詞，所以是 decided to buy。",
  ["decide 後面的動詞要用什麼形式？", "want、hope、decide、plan 這類表示「打算」的動詞後面接什麼？"],
  {"A": "decide 後面要加 to 再接原形動詞。", "C": "decide 後面接不定詞，不接 V-ing。", "D": "句中已經有動詞 decided，不能再直接接另一個過去式。"},
  None)
Q("EN-8B-1", "dialogue-response", 1, "A: Would you like to have some cake?\nB: ＿＿＿",
  ["Yes, please.", "Yes, I would like.", "No, I don't.", "You're welcome."], "A",
  "Would you like...? 是禮貌地詢問要不要某樣東西，接受時說 Yes, please.（好的，麻煩了）。",
  ["Would you like...? 是在問什麼？", "接受別人提供的東西時常用哪句話？"],
  {"B": "would like 後面要接受詞，不能單獨說 I would like。", "C": "問句用 Would，不能用 don't 回答。", "D": "You're welcome. 是回應別人的道謝。"},
  None)
Q("EN-8B-1", "dialogue-response", 2, "A: I forgot to bring my umbrella.\nB: ＿＿＿ You can share mine.",
  ["Don't worry.", "Congratulations!", "Of course not.", "Me, neither."], "A",
  "A 忘了帶傘，B 說可以一起撐他的傘，所以先安慰對方：Don't worry.（別擔心）。",
  ["A 遇到了什麼麻煩？", "B 後面說可以共用雨傘，前面應該先說什麼？"],
  {"B": "忘了帶傘不是值得恭喜的事。", "C": "Of course not. 是回答 Do you mind...? 等問題，不能回應這句話。", "D": "Me, neither. 用來回應否定句，A 說的是肯定句 I forgot...。"},
  None)
Q("EN-8B-1", "reading-detail", 2,
  "Hi, I'm Jason. I love cooking. I started to cook when I was ten. At first, I only knew how to make eggs, but now "
  "I can make many dishes. My family enjoys eating the food I make. My dream is to open a restaurant someday. "
  "To make this dream come true, I practice cooking every weekend.\n\nWhat is Jason's dream?",
  ["To become a teacher", "To open a restaurant", "To learn how to make eggs", "To eat at a famous restaurant"], "B",
  "文中說 My dream is to open a restaurant someday.，Jason 的夢想是將來開一家餐廳。",
  ["找到 dream 出現的句子。", "is 後面的不定詞 to open ... 說明了什麼？"],
  {"A": "文中沒有提到當老師。", "C": "他十歲時就會煮蛋了，那不是夢想。", "D": "他想自己開餐廳，不是去有名的餐廳吃飯。"},
  None)
Q("EN-8B-1", "reading-main-idea", 2,
  "Want to Be a Better Speaker?\nJoin our English Speaking Club! We meet every Wednesday after school in Room 203. "
  "You can practice speaking English with foreign teachers, play games, and make new friends. Joining the club "
  "is free. Come and have fun!\n\nWhat is this notice for?",
  ["To ask students to join a club", "To tell students about a test", "To sell English books", "To find a new English teacher"], "A",
  "通知的標題和內容都在介紹英語會話社的時間、地點和好處，最後說 Join our English Speaking Club! Come and have fun!，目的是邀請學生加入社團。",
  ["通知一開頭要讀者做什麼？", "整篇通知都在介紹什麼？"],
  {"B": "通知沒有提到考試。", "C": "通知沒有賣書，而且說參加社團是免費的。", "D": "外籍老師是社團裡已有的，不是在徵老師。"},
  None)
Q("EN-8B-1", "reading-main-idea", 3,
  "Many students find it hard to get up early. Here are some tips. First, try going to bed before 11 p.m. "
  "Second, stop using your phone an hour before bed. Third, put your alarm clock far from your bed, so you have "
  "to get up to turn it off. Remember to do these things every day, and getting up will be easier."
  "\n\nWhat is the passage mainly about?",
  ["Why students like using phones", "How to get up early more easily", "When students should do homework", "Where to buy a good alarm clock"], "B",
  "第一句點出問題：很多學生覺得早起很難，接著 Here are some tips 列出三個方法，最後說這樣起床會更容易。全文在說如何更容易早起。",
  ["第一句提出了什麼問題？", "First、Second、Third 列出的是什麼？"],
  {"A": "手機只是其中一個建議的細節，不是全文主旨。", "C": "文中沒有提到寫作業。", "D": "鬧鐘是建議放遠一點，不是介紹去哪裡買。"},
  None)
Q("EN-8B-1", "reading-detail", 3,
  "Last week, Ms. Lin asked her students to write about their hobbies. Peter wrote about playing the guitar. "
  "Jane likes drawing, so she wrote about her favorite artist. Ted doesn't like sports or music; he likes to collect "
  "stamps. Sue enjoys riding her bike along the river on weekends.\n\nWhose hobby is a kind of exercise?",
  ["Peter's", "Jane's", "Ted's", "Sue's"], "D",
  "Sue 喜歡週末沿著河邊騎腳踏車，騎腳踏車是一種運動（exercise）。彈吉他、畫畫、集郵都不是運動。",
  ["先整理每個人的嗜好。", "哪一種嗜好會讓身體動起來？"],
  {"A": "Peter 的嗜好是彈吉他，是音樂不是運動。", "B": "Jane 的嗜好是畫畫，不是運動。", "C": "文中說 Ted 不喜歡運動，他的嗜好是集郵。"},
  None)

# EN-8B-2 連接詞與附加問句
Q("EN-8B-2", "conjunction", 1, "I wanted to go out, ＿＿＿ it was raining hard.",
  ["so", "but", "and", "or"], "B",
  "前面說想出去，後面說雨下很大，兩句意思相反（轉折），用 but（但是）。",
  ["「想出門」和「下大雨」之間是什麼關係？", "表示語意轉折的連接詞是哪一個？"],
  {"A": "so 表示結果，但下大雨不是想出門的結果。", "C": "and 連接意思順接的句子，這裡語意相反。", "D": "or 表示「或者」，不合句意。"},
  None)
Q("EN-8B-2", "conjunction", 1, "Hurry up, ＿＿＿ you will miss the bus.",
  ["and", "or", "but", "so"], "B",
  "祈使句 + or 表示「…，否則就會…」。快一點，否則你會錯過公車。",
  ["不快一點的話會怎樣？", "祈使句後面接哪個連接詞表示「否則」？"],
  {"A": "祈使句 + and 表示「…，就會…」，變成「快一點就會錯過公車」，不合理。", "C": "but 表示轉折，語意不通。", "D": "so 表示結果，「快一點所以錯過公車」不合理。"},
  None)
Q("EN-8B-2", "conjunction", 2, "＿＿＿ Kevin was sick, he still went to school.",
  ["Because", "Although", "If", "So"], "B",
  "生病了卻「仍然」去上學，前後語意相反，用 Although（雖然）。英文中 although 和 but 不能同時使用。",
  ["生病和去上學，兩件事的關係是順理成章還是出乎意料？", "句中的 still（仍然）提示了什麼關係？"],
  {"A": "Because 表示原因，「因為生病所以去上學」不合理。", "C": "If 表示假設，但句子用過去式說明已經發生的事。", "D": "So 表示結果，放句首連接兩個子句不合文法，語意也不對。"},
  None)
Q("EN-8B-2", "conjunction", 2, "I will call you ＿＿＿ I get home tonight.",
  ["when", "but", "so", "because"], "A",
  "「我今晚到家時會打電話給你」，表示時間用 when（當…時）。注意 when 引導的時間子句用現在式表示未來，所以用 get。",
  ["打電話和到家，兩件事是什麼關係？", "哪個連接詞表示「當…的時候」？"],
  {"B": "but 表示轉折，兩件事沒有相反關係。", "C": "so 表示結果，到家不是打電話的結果。", "D": "because 表示原因，「因為到家所以打給你」語意不通。"},
  None)
Q("EN-8B-2", "tag-question", 1, "You are a new student, ＿＿＿?",
  ["are you", "aren't you", "don't you", "isn't it"], "B",
  "附加問句「前肯後否」，而且要用和前句相同的動詞與主詞代名詞。前句是 You are，所以附加問句是 aren't you。",
  ["前半句是肯定還是否定？", "附加問句要用前句的哪個動詞和主詞？"],
  {"A": "前句是肯定句，附加問句要用否定。", "C": "前句用 be 動詞 are，附加問句不能用助動詞 do。", "D": "主詞是 you，附加問句不能用 it。"},
  None)
Q("EN-8B-2", "tag-question", 2, "Your father doesn't drink coffee, ＿＿＿?",
  ["does he", "doesn't he", "is he", "did he"], "A",
  "前句是否定句 doesn't，附加問句用肯定 does；Your father 用代名詞 he 代替，所以是 does he。",
  ["前句是肯定還是否定？", "Your father 要換成哪個代名詞？助動詞時態是什麼？"],
  {"B": "前句已經是否定，附加問句要用肯定。", "C": "前句用助動詞 does，附加問句不能改用 be 動詞。", "D": "前句是現在式 doesn't，附加問句不能用過去式 did。"},
  None)
Q("EN-8B-2", "tag-question", 2, "Tina and Joe went to the party last night, ＿＿＿?",
  ["didn't they", "don't they", "weren't they", "did they"], "A",
  "前句是肯定的過去式一般動詞 went，附加問句用否定的 didn't；Tina and Joe 用 they 代替，所以是 didn't they。",
  ["went 是什麼時態？是 be 動詞還是一般動詞？", "前肯後否，主詞 Tina and Joe 要換成哪個代名詞？"],
  {"B": "went 是過去式，附加問句要用 didn't，不是 don't。", "C": "went 是一般動詞，附加問句要用助動詞 did，不能用 be 動詞。", "D": "前句是肯定，附加問句要用否定。"},
  None)
Q("EN-8B-2", "dialogue-response", 1, "A: It's a beautiful day, isn't it?\nB: ＿＿＿ Let's go for a walk.",
  ["Yes, it is.", "No, it isn't.", "Yes, it isn't.", "No, it is."], "A",
  "B 後面提議去散步，表示同意天氣很好。回答附加問句時，只看事實：天氣好就用 Yes, it is.",
  ["B 覺得天氣好不好？", "英文回答時 Yes 後面要接肯定，No 後面要接否定。"],
  {"B": "如果天氣不好，就不會提議去散步。", "C": "Yes 後面要接肯定的 it is，不能接否定。", "D": "No 後面要接否定的 it isn't，不能接肯定。"},
  None)
Q("EN-8B-2", "dialogue-response", 2, "A: You didn't finish your homework, did you?\nB: ＿＿＿ I'll finish it after dinner.",
  ["No, I didn't.", "Yes, I did.", "Yes, I didn't.", "No, I did."], "A",
  "B 說晚餐後才會寫完，表示事實上還沒寫完，要用否定回答 No, I didn't.（對，我還沒寫完）。英文回答只看事實，不看問句是肯定還是否定。",
  ["B 的作業到底寫完了沒？", "事實是「沒寫完」時，要用 Yes 還是 No？"],
  {"B": "B 說晚餐後才會寫完，所以不是已經寫完了。", "C": "Yes 後面不能接否定的 I didn't。", "D": "No 後面不能接肯定的 I did。"},
  None)
Q("EN-8B-2", "reading-detail", 2,
  "Dear Mr. Brown,\nI'm sorry I can't come to school today because I have a bad cold. My mother is taking me to see "
  "a doctor this morning. If I feel better, I will come to school tomorrow. Could you please give my homework to my "
  "classmate, Ben? He lives next to me.\nThank you,\nLinda\n\nWho will take Linda's homework to her?",
  ["Mr. Brown", "Linda's mother", "Ben", "The doctor"], "C",
  "Linda 請老師把作業交給同學 Ben，因為 He lives next to me（他住我隔壁），所以由 Ben 把作業帶給她。",
  ["Linda 請老師把作業交給誰？", "為什麼 Linda 選這個人？"],
  {"A": "Brown 老師是把作業交給 Ben 的人，不是送去 Linda 家的人。", "B": "媽媽是要帶 Linda 去看醫生。", "D": "醫生和作業無關。"},
  None)
Q("EN-8B-2", "reading-detail", 3,
  "Kate and her brother Jim are very different. Kate likes to stay home and read, but Jim loves going out with his "
  "friends. Kate is good at math, while Jim is good at sports. However, they both love animals. Every Saturday, they "
  "go to the animal hospital near their home and help take care of the dogs there.\n\nWhat do Kate and Jim both like?",
  ["Reading books", "Going out with friends", "Animals", "Math"], "C",
  "前面用 but、while 說明兩人的不同，接著用 However 轉折，說 they both love animals（他們都愛動物）。",
  ["文中哪個字把「不同」轉到「相同」？", "找到 both 出現的句子。"],
  {"A": "喜歡看書的是 Kate，Jim 喜歡出去。", "B": "喜歡和朋友出去的是 Jim。", "D": "擅長數學的是 Kate，Jim 擅長運動。"},
  None)
Q("EN-8B-2", "reading-detail", 3,
  "Amy: You're going to the book fair tomorrow, aren't you?\nBen: I wanted to, but I can't. I have to go to my "
  "cousin's wedding.\nAmy: That's too bad. Well, I can buy a book for you if you want.\nBen: Really? Thanks! Please "
  "get me a comic book, but not a sad one.\n\nWhich is TRUE?",
  ["Ben will go to the book fair with Amy.", "Ben will go to a wedding tomorrow.",
   "Amy doesn't want to buy a book for Ben.", "Ben wants a sad comic book."], "B",
  "Ben 說本來想去書展 but I can't，因為要參加表哥（堂哥）的婚禮，所以明天他會去婚禮。Amy 主動說可以幫他買書，Ben 要的是「不悲傷」的漫畫。",
  ["Ben 明天為什麼不能去書展？", "注意 but not a sad one 是什麼意思。"],
  {"A": "Ben 說 I can't，他不能去書展。", "C": "Amy 主動說 I can buy a book for you。", "D": "Ben 說 not a sad one，他不要悲傷的漫畫。"},
  None)

# ============================ 九上 ============================
# EN-9A-1 現在完成式
Q("EN-9A-1", "present-perfect", 1, "I have ＿＿＿ my homework. Can I watch TV now?",
  ["finish", "finished", "finishing", "to finish"], "B",
  "現在完成式是 have/has + 過去分詞。作業已經寫完了，所以用 have finished。finish 的過去分詞是 finished。",
  ["現在完成式的公式是什麼？", "have 後面的動詞要用什麼形式？"],
  {"A": "have 後面要接過去分詞，不能接原形。", "C": "have 後面接 V-ing 不合文法，進行式要用 be 動詞。", "D": "have to finish 是「必須完成」，但後面說可以看電視了，表示已經寫完。"},
  None)
Q("EN-9A-1", "present-perfect", 1, "＿＿＿ you ever been to Hualien? — Yes, I have.",
  ["Did", "Have", "Has", "Are"], "B",
  "been 是過去分詞，ever（曾經）常和現在完成式連用。主詞 you 用 Have，疑問句把 Have 移到句首；答句 Yes, I have. 也可以印證。",
  ["空格後面的 been 是什麼形式？", "看答句用的是哪個助動詞。"],
  {"A": "Did 後面要接原形動詞，不能接過去分詞 been。", "C": "主詞是 you，要用 Have，不是 Has。", "D": "Are 不能和過去分詞 been 構成問句。"},
  None)
Q("EN-9A-1", "present-perfect", 2, "We ＿＿＿ to Kenting last summer.",
  ["went", "have gone", "have been", "go"], "A",
  "last summer 是明確的過去時間，要用過去簡單式 went。現在完成式不能和 last summer、yesterday、ago 這類明確的過去時間連用。",
  ["last summer 是明確的過去時間嗎？", "現在完成式可以和明確的過去時間一起用嗎？"],
  {"B": "現在完成式不能和 last summer 連用，而且 have gone 表示「已經去了、還沒回來」。", "C": "現在完成式不能和 last summer 這種明確的過去時間連用。", "D": "go 是現在式，和 last summer 不合。"},
  None)
Q("EN-9A-1", "present-perfect", 2, "A: Where is Tom? I can't find him.\nB: He has ＿＿＿ to the library. He'll be back soon.",
  ["been", "gone", "went", "go"], "B",
  "Tom 現在不在、等一下才會回來，表示他「已經去了圖書館、人還在那裡」，用 has gone to。has been to 是「曾經去過（已經回來）」。",
  ["Tom 現在在這裡嗎？", "have gone to 和 have been to 的差別是什麼？"],
  {"A": "has been to 表示曾經去過而且已經回來，但 Tom 現在不在。", "C": "has 後面要接過去分詞，went 是過去式。", "D": "has 後面要接過去分詞，不能接原形。"},
  None)
Q("EN-9A-1", "since-for", 1, "Mr. Lee has taught English ＿＿＿ ten years.",
  ["for", "since", "in", "ago"], "A",
  "ten years 是「一段時間」，現在完成式表示持續多久用 for + 一段時間。since 後面接「時間起點」。",
  ["ten years 是一段時間，還是一個時間點？", "for 和 since 後面分別接什麼？"],
  {"B": "since 後面要接起點，例如 since 2015，不能接一段時間。", "C": "in ten years 表示「十年後」，不能表示持續了十年。", "D": "ago 放在時間後面（ten years ago），而且要配過去式。"},
  None)
Q("EN-9A-1", "since-for", 2, "Lisa has lived in Tainan ＿＿＿ she was five.",
  ["for", "since", "ago", "until"], "B",
  "she was five（她五歲時）是一個過去的起點，現在完成式表示「從那時起一直到現在」用 since。",
  ["she was five 是一段時間還是一個起點？", "「自從…以來」要用哪個字？"],
  {"A": "for 後面接一段時間，例如 for eight years，不接起點。", "C": "ago 不能當連接詞引導子句。", "D": "until 表示「直到…為止」，和現在完成式的持續意思不合。"},
  None)
Q("EN-9A-1", "since-for", 2, "A: ＿＿＿ have you known Mary?\nB: Since we were in elementary school.",
  ["How long", "How often", "When", "How many"], "A",
  "答句 Since we were in elementary school.（從國小起）說明持續的時間長度，問「多久了」要用 How long，常搭配現在完成式。",
  ["答句用 since，說明的是什麼？", "哪個疑問詞問「持續多久」？"],
  {"B": "How often 問頻率，答案應是 twice a week 之類。", "C": "When 問時間點，而且通常不和現在完成式連用。", "D": "How many 問數量，後面要接名詞。"},
  None)
Q("EN-9A-1", "dialogue-response", 1, "A: Have you eaten lunch yet?\nB: ＿＿＿ I'm so hungry.",
  ["No, not yet.", "Yes, I have.", "Yes, I ate.", "I'm full."], "A",
  "B 說 I'm so hungry.（我好餓），表示還沒吃午餐，所以回答 No, not yet.（還沒）。",
  ["B 現在餓不餓？", "還沒吃飯的話，要怎麼回答 Have you...yet?"],
  {"B": "吃過了就不會那麼餓，和後句矛盾。", "C": "吃過了就不會那麼餓，而且回答 Have you...? 要用 I have。", "D": "I'm full.（我很飽）和 I'm so hungry. 矛盾。"},
  None)
Q("EN-9A-1", "dialogue-response", 2, "A: I have just won first prize in the speech contest!\nB: ＿＿＿",
  ["Congratulations!", "That's too bad.", "You're welcome.", "Never mind."], "A",
  "對方剛剛在演講比賽得到第一名，這是好消息，要說 Congratulations!（恭喜）。",
  ["A 說的是好消息還是壞消息？", "聽到別人得獎要說什麼？"],
  {"B": "That's too bad. 是聽到壞消息時說的。", "C": "You're welcome. 是回應別人道謝。", "D": "Never mind. 是安慰別人「沒關係」，不適合回應好消息。"},
  None)
Q("EN-9A-1", "reading-detail", 2,
  "Hi, everyone! I'm Yuki from Japan. I came to Taiwan two years ago, and I have lived in Kaohsiung since then. "
  "I have visited many places in Taiwan, like Taroko and Alishan, but I have never been to Penghu. I hope to go "
  "there this summer. I have also learned to speak some Chinese.\n\nWhich place has Yuki NOT visited?",
  ["Taroko", "Alishan", "Penghu", "Kaohsiung"], "C",
  "文中說 I have never been to Penghu.（我從來沒去過澎湖），她希望今年夏天去。太魯閣和阿里山去過，高雄是她住的地方。",
  ["找到 never 出現的句子。", "have never been to 是什麼意思？"],
  {"A": "文中說她去過太魯閣。", "B": "文中說她去過阿里山。", "D": "她兩年來一直住在高雄。"},
  None)
Q("EN-9A-1", "reading-detail", 3,
  "Mr. Chang opened a small bookstore in 1998. At that time, it had only one room. Now the store has three floors, "
  "and it has become one of the most famous bookstores in town. Mr. Chang has worked there every day since it "
  "opened. His son joined him five years ago, and he has started selling books online.\n\nWhich is TRUE?",
  ["The bookstore has always had three floors.", "Mr. Chang started working in the store five years ago.",
   "Mr. Chang's son has worked in the store for five years.", "The store has never sold books online."], "C",
  "張先生的兒子五年前加入書店，從那時工作到現在，就是「已經在書店工作五年」（has worked ... for five years）。",
  ["逐一對照每個選項。", "joined him five years ago 換成現在完成式要怎麼說？"],
  {"A": "書店一開始只有一個房間，後來才有三層樓。", "B": "張先生從 1998 年開店就在店裡工作，五年前加入的是兒子。", "D": "兒子已經開始在網路上賣書了。"},
  None)
Q("EN-9A-1", "reading-detail", 3,
  "Nick: Have you finished the science report yet?\nEmma: Not yet. I've already written the first part, but I "
  "haven't found any pictures for it.\nNick: I've found some good ones on the Internet. I can send them to you.\n"
  "Emma: That's great! Thanks.\n\nWhat has Emma done?",
  ["She has finished the whole report.", "She has written part of the report.",
   "She has found some pictures.", "She has sent pictures to Nick."], "B",
  "Emma 說 I've already written the first part（我已經寫完第一部分），所以她完成了報告的一部分，但整份還沒完成，也還沒找到圖片。",
  ["Emma 回答 Not yet 之後又說了什麼？", "找到圖片的是誰？"],
  {"A": "Emma 說 Not yet，整份報告還沒完成。", "C": "Emma 說還沒找到圖片，找到圖片的是 Nick。", "D": "是 Nick 說要把圖片寄給 Emma，不是 Emma 寄給 Nick。"},
  None)

# EN-9A-2 被動語態
Q("EN-9A-2", "passive-voice", 1, "English ＿＿＿ in many countries.",
  ["speaks", "is spoken", "is speaking", "spoke"], "B",
  "英語是「被」人說的，要用被動語態 be + 過去分詞。事實用現在式，English 是單數，所以是 is spoken。",
  ["英語會自己說話嗎？還是被人說？", "被動語態的公式是什麼？speak 的過去分詞是什麼？"],
  {"A": "speaks 是主動，變成「英語說話」，不合理。", "C": "is speaking 是進行式主動，意思是「英語正在說話」。", "D": "spoke 是過去式主動，不合句意。"},
  None)
Q("EN-9A-2", "passive-voice", 1, "This house ＿＿＿ by my grandfather in 1980.",
  ["built", "was built", "is built", "was building"], "B",
  "房子是「被」爺爺蓋的，用被動；in 1980 是過去時間，所以用過去式被動 was + 過去分詞 built。",
  ["房子是蓋的人，還是被蓋的東西？", "in 1980 要用什麼時態？"],
  {"A": "built 單獨使用是主動，變成「房子蓋了…」，缺少 be 動詞。", "C": "is built 是現在式，和 in 1980 不合。", "D": "was building 是過去進行式主動，意思不對。"},
  None)
Q("EN-9A-2", "passive-voice", 2, "The windows ＿＿＿ every Friday by the students.",
  ["clean", "are cleaned", "is cleaned", "are cleaning"], "B",
  "窗戶是被學生清潔的，用被動。every Friday 表示習慣，用現在式；The windows 是複數，所以是 are cleaned。",
  ["窗戶是做動作的人，還是接受動作的東西？", "windows 是單數還是複數？"],
  {"A": "clean 是主動，變成「窗戶清潔」，缺少被動的 be 動詞。", "C": "windows 是複數，be 動詞要用 are。", "D": "are cleaning 是主動進行式，意思是窗戶正在清潔別的東西。"},
  None)
Q("EN-9A-2", "passive-voice", 2, "The song was written ＿＿＿ a famous singer.",
  ["by", "of", "at", "on"], "A",
  "被動語態中，動作的執行者用 by 帶出：was written by a famous singer（被一位有名的歌手寫的）。",
  ["這首歌是誰寫的？", "被動語態要用哪個介系詞帶出做動作的人？"],
  {"B": "of 表示「…的」，不能帶出被動句中做動作的人。", "C": "at 表示地點或時間點。", "D": "on 表示在…之上或日期，不能帶出做動作的人。"},
  None)
Q("EN-9A-2", "passive-tense", 1, "A new library ＿＿＿ in our town next year.",
  ["will be built", "will build", "is built", "was built"], "A",
  "圖書館是被建造的，用被動；next year 是未來，未來式被動是 will be + 過去分詞：will be built。",
  ["next year 是什麼時態？", "未來式的被動語態怎麼組成？"],
  {"B": "will build 是主動，變成「圖書館會蓋東西」。", "C": "is built 是現在式，和 next year 不合。", "D": "was built 是過去式，和 next year 不合。"},
  None)
Q("EN-9A-2", "passive-tense", 2, "Many trees ＿＿＿ down by the strong wind last night.",
  ["blew", "were blown", "are blown", "will be blown"], "B",
  "樹是被強風吹倒的，用被動；last night 是過去，Many trees 是複數，所以是 were blown（blow 的過去分詞是 blown）。",
  ["樹是被什麼吹倒的？", "last night 要用什麼時態？trees 是單數還是複數？"],
  {"A": "blew 是主動，變成「樹吹倒了（別的東西）」。", "C": "are blown 是現在式，和 last night 不合。", "D": "will be blown 是未來式，和 last night 不合。"},
  None)
Q("EN-9A-2", "passive-tense", 2, "Your homework must ＿＿＿ before Friday.",
  ["finish", "be finished", "finished", "be finishing"], "B",
  "作業是被完成的，用被動。助動詞 must 後面要接原形，所以被動是 must + be + 過去分詞：must be finished。",
  ["作業是自己完成，還是被人完成？", "助動詞後面的被動語態要怎麼寫？"],
  {"A": "must finish 是主動，變成「作業必須完成（某事）」，主詞應該是人。", "C": "must 後面要接原形，不能直接接過去分詞。", "D": "be finishing 是進行式，不是被動。"},
  None)
Q("EN-9A-2", "active-passive", 1, "My bike ＿＿＿ yesterday, so I walked to school today.",
  ["stole", "was stolen", "steals", "is stealing"], "B",
  "腳踏車是「被偷」的，用被動；yesterday 是過去，所以是 was stolen（steal 的過去分詞是 stolen）。",
  ["腳踏車會自己偷東西嗎？", "yesterday 表示什麼時態？"],
  {"A": "stole 是主動，變成「腳踏車偷了東西」。", "C": "steals 是現在式主動，和 yesterday 不合，意思也不對。", "D": "is stealing 是現在進行式主動，意思和時態都不對。"},
  None)
Q("EN-9A-2", "active-passive", 2, "Many visitors ＿＿＿ the night market every weekend.",
  ["visit", "are visited", "is visited", "visited by"], "A",
  "遊客是「去逛」夜市的人，是動作的執行者，要用主動語態。every weekend 表示習慣，主詞 Many visitors 是複數，所以用 visit。",
  ["遊客是去逛的人，還是被逛的對象？", "主詞做動作時，要用主動還是被動？"],
  {"B": "are visited 是被動，變成「遊客被參觀」，主詞應該是 the night market。", "C": "is visited 是單數被動，主詞和語態都不對。", "D": "visited by 前面沒有 be 動詞，也不是正確的主動句。"},
  None)
Q("EN-9A-2", "reading-detail", 2,
  "The Lantern Festival is on the fifteenth day of the first month of the Chinese calendar. On that night, many lanterns are hung in streets "
  "and parks. In Pingxi, sky lanterns are sent into the sky, and people write their wishes on them. In the past, "
  "lanterns were made by hand, but today many of them are made in factories.\n\n"
  "According to the passage, where are many lanterns made today?",
  ["At home", "In factories", "In parks", "In schools"], "B",
  "文中說 In the past, lanterns were made by hand, but today many of them are made in factories.，現在很多燈籠是在工廠製作的。",
  ["找到 today 出現的句子。", "but 前後在比較過去和現在的什麼？"],
  {"A": "以前是手工做的，但文中沒說在家做；現在多在工廠做。", "C": "公園是掛燈籠的地方，不是做燈籠的地方。", "D": "文中沒有提到學校。"},
  None)
Q("EN-9A-2", "reading-detail", 3,
  "This old bridge was built over 100 years ago. It was damaged by a big typhoon in 2015, so it was closed for two "
  "years. After it was repaired, it was opened again in 2017. Now, cars are not allowed on it; it is used only by "
  "people who walk or ride bikes.\n\nWhich is TRUE about the bridge?",
  ["It was built in 2015.", "It was closed from 2015 to 2017.", "Cars can still use it today.", "It has never been repaired."], "B",
  "橋在 2015 年被颱風損壞而關閉兩年，2017 年修好重新開放，所以 2015 到 2017 年是關閉的。",
  ["橋是哪一年壞掉、哪一年重新開放？", "逐一檢查每個選項和文章的時間、內容。"],
  {"A": "橋是一百多年前建的，2015 年是被颱風損壞。", "C": "文中說 cars are not allowed on it，現在不准汽車通行。", "D": "文中說 After it was repaired，橋已經修好了。"},
  None)
Q("EN-9A-2", "reading-detail", 3,
  "For Sale: Used Bike\nThis bike was bought only one year ago, and it has been used for just a few months. It is "
  "kept in my garage, so it still looks new. The price is NT$2,000. Please call Ken at 0912-345-678 after 6 p.m."
  "\n\nWhat do we know about the bike?",
  ["It is brand new.", "It was bought last month.", "It has not been used much.", "Ken wants to buy a used bike."], "C",
  "廣告說這台車一年前買的，只騎了幾個月（has been used for just a few months），所以用得不多。它是二手車，看起來新但不是全新。",
  ["廣告的標題 For Sale: Used Bike 是什麼意思？", "used for just a few months 表示用得多還是少？"],
  {"A": "標題寫 Used Bike，是二手的，只是 looks new（看起來新）。", "B": "文中說 bought only one year ago，是一年前買的。", "D": "Ken 是要賣腳踏車（For Sale），不是要買。"},
  None)

# ============================ 九下 ============================
# EN-9B-1 關係代名詞
Q("EN-9B-1", "relative-person", 1, "The girl ＿＿＿ is singing on the stage is my sister.",
  ["who", "which", "whose", "what"], "A",
  "先行詞 The girl 是人，關係代名詞在子句中當主詞（後面接 is singing），用 who。",
  ["空格前面的名詞是人還是物？", "空格後面直接接動詞，關係代名詞在子句中當什麼？"],
  {"B": "which 用在先行詞是物或動物。", "C": "whose 表示所有格，後面要接名詞。", "D": "what 不能當關係代名詞接在名詞後面。"},
  None)
Q("EN-9B-1", "relative-thing", 1, "I like the bag ＿＿＿ my mom bought for me.",
  ["who", "which", "whom", "where"], "B",
  "先行詞 the bag 是物品，關係代名詞在子句中當 bought 的受詞，用 which。",
  ["the bag 是人還是物？", "物品當先行詞時要用哪個關係代名詞？"],
  {"A": "who 用在先行詞是人。", "C": "whom 用在先行詞是人，當受詞。", "D": "where 是關係副詞，表示地點，而 bought 後面缺的是受詞。"},
  None)
Q("EN-9B-1", "relative-person", 2, "Do you know the man ＿＿＿ car is parked in front of the school?",
  ["who", "whose", "which", "whom"], "B",
  "空格後接名詞 car，表示「那個男人的車」，要用所有格關係代名詞 whose。",
  ["空格後面是動詞還是名詞？", "「…的車」要用哪個表示所有格的關係代名詞？"],
  {"A": "who 後面要接動詞，不能直接接名詞 car。", "C": "which 用於物，而且不表示所有格。", "D": "whom 是受格，後面不能直接接名詞。"},
  None)
Q("EN-9B-1", "relative-thing", 1, "This is the book ＿＿＿ I told you about.",
  ["who", "which", "what", "whom"], "B",
  "先行詞 the book 是物品，當 about 的受詞，用 which。",
  ["the book 是人還是物？", "關係代名詞要能代替前面的名詞。"],
  {"A": "who 用在先行詞是人。", "C": "what 本身已包含先行詞，不能接在 the book 後面。", "D": "whom 用在先行詞是人。"},
  None)
Q("EN-9B-1", "relative-thing", 2, "The dog ＿＿＿ in the yard belongs to my neighbor.",
  ["which is sleeping", "who sleeping", "which sleeping", "it is sleeping"], "A",
  "先行詞 The dog 是動物，用 which；關係子句要有完整的動詞 is sleeping，所以是 which is sleeping。",
  ["動物當先行詞要用哪個關係代名詞？", "關係子句裡的動詞完整嗎？"],
  {"B": "動物通常用 which，而且 sleeping 前面缺少 be 動詞。", "C": "關係子句缺少 be 動詞 is，動詞不完整。", "D": "it is sleeping 是一個完整句子，兩個句子不能沒有連接詞直接相接。"},
  None)
Q("EN-9B-1", "relative-person", 2, "A dentist is a doctor ＿＿＿.",
  ["who takes care of people's teeth", "which takes care of people's teeth",
   "who take care of people's teeth", "whose takes care of people's teeth"], "A",
  "先行詞 a doctor 是人，用 who；who 代替單數的 a doctor，所以子句動詞要用第三人稱單數 takes。",
  ["先行詞 a doctor 是人還是物？", "關係子句的動詞要跟著先行詞的單複數變化。"],
  {"B": "which 用在先行詞是物，doctor 是人。", "C": "先行詞 a doctor 是單數，動詞要用 takes。", "D": "whose 後面要接名詞，不能直接接動詞。"},
  None)
Q("EN-9B-1", "relative-agreement", 1, "People who ＿＿＿ in big cities are often busy.",
  ["live", "lives", "living", "is living"], "A",
  "who 代替先行詞 People（人們，複數），所以關係子句的動詞要用複數形 live。",
  ["who 代替的是哪個名詞？", "People 是單數還是複數？"],
  {"B": "People 是複數，動詞不加 s。", "C": "關係子句需要完整的動詞，living 不能單獨當動詞。", "D": "People 是複數，be 動詞要用 are，不是 is。"},
  None)
Q("EN-9B-1", "relative-agreement", 2, "Mr. Wu is the teacher who ＿＿＿ us math last year.",
  ["teach", "teaches", "taught", "teaching"], "C",
  "關係子句有 last year，是過去時間，所以子句動詞要用過去式 taught（teach 的過去式）。",
  ["關係子句裡有什麼時間詞？", "teach 的過去式怎麼寫？"],
  {"A": "last year 是過去，不能用現在式。", "B": "teaches 是現在式，和 last year 不合。", "D": "teaching 不能單獨當關係子句的動詞。"},
  None)
Q("EN-9B-1", "reading-detail", 2,
  "Lost and Found\nI lost a black backpack on Bus 12 this morning. The backpack has a red key ring which looks like "
  "a strawberry. Inside it, you can find a math book and a pencil case that my grandma gave me. If you find it, please "
  "call Emily at 0987-654-321. Thank you!\n\nWhat does Emily's backpack look like?",
  ["It is red with a black key ring.", "It is black with a red key ring.", "It looks like a strawberry.", "It is a gift from her grandma."], "B",
  "文中說 a black backpack（黑色背包），上面有 a red key ring which looks like a strawberry（像草莓的紅色鑰匙圈），所以是黑色背包配紅色鑰匙圈。",
  ["背包是什麼顏色？鑰匙圈是什麼顏色？", "which looks like a strawberry 的 which 指的是什麼？"],
  {"A": "把背包和鑰匙圈的顏色弄反了。", "C": "看起來像草莓的是鑰匙圈，不是背包。", "D": "奶奶送的是鉛筆盒（a pencil case that my grandma gave me），不是背包。"},
  None)
Q("EN-9B-1", "reading-detail", 2,
  "Welcome to Sunny Summer Camp! We are looking for students who love nature and want to make new friends. Campers "
  "will stay in a house which is near a beautiful lake. Teachers who know a lot about birds and plants will lead the "
  "activities. The camp is for students who are 12 to 15 years old.\n\nWho can join the camp?",
  ["A 10-year-old boy who loves nature", "A 14-year-old girl who likes making friends",
   "A 17-year-old student who knows about birds", "A teacher who likes plants"], "B",
  "營隊只收 12 到 15 歲的學生，而且希望學生喜歡大自然、想交新朋友。14 歲、喜歡交朋友的女生符合條件。",
  ["營隊限制參加者幾歲？", "逐一檢查每個人的年齡和身分。"],
  {"A": "10 歲不在 12 到 15 歲的範圍內。", "C": "17 歲超過 15 歲的限制。", "D": "營隊是給學生參加的，老師是帶活動的人。"},
  None)
Q("EN-9B-1", "reading-detail", 3,
  "In my class, there are three students who are good at sports. Allen is the one who runs the fastest. Betty is a "
  "girl who can swim very well; she won first place in a swimming contest last year. Chris is the boy whose father is "
  "a basketball coach, and he plays basketball every day.\n\nWhich is TRUE?",
  ["Allen is the student whose father is a coach.", "Betty is a good swimmer.",
   "Chris runs the fastest in the class.", "Betty's father teaches basketball."], "B",
  "文中說 Betty is a girl who can swim very well，還在游泳比賽得第一名，所以 Betty 很會游泳。爸爸是籃球教練的是 Chris，跑最快的是 Allen。",
  ["把每個人和描述他的關係子句配對。", "whose father is a basketball coach 是在描述誰？"],
  {"A": "爸爸是教練的是 Chris（the boy whose father is a basketball coach）。", "C": "跑最快的是 Allen（the one who runs the fastest）。", "D": "爸爸是籃球教練的是 Chris，文中沒有提到 Betty 的爸爸。"},
  None)
Q("EN-9B-1", "reading-detail", 3,
  "Clerk: May I help you?\nWoman: Yes. I'm looking for a gift for my son, who is ten.\nClerk: How about this robot? "
  "It's the one which most kids like this year.\nWoman: It looks great, but it's a little expensive. Do you have "
  "anything that is cheaper?\nClerk: Sure. These model cars are only NT$300.\n\nWhat is probably true?",
  ["The woman is buying something for herself.", "The robot costs more than NT$300.",
   "The woman's son is twelve.", "The clerk doesn't have any cheaper toys."], "B",
  "女士覺得機器人有點貴，問有沒有更便宜的，店員推薦只要 NT$300 的模型車，可見機器人比 NT$300 貴。",
  ["女士覺得機器人怎麼樣？", "店員推薦的「更便宜的東西」多少錢？"],
  {"A": "她說要買禮物給兒子（a gift for my son）。", "C": "她說兒子 who is ten，是十歲。", "D": "店員說 Sure，並推薦了便宜的模型車。"},
  None)

# EN-9B-2 間接問句與閱讀理解
Q("EN-9B-2", "indirect-question", 1, "Do you know where ＿＿＿?",
  ["the post office is", "is the post office", "the post office", "does the post office"], "A",
  "間接問句要用直述句的語序：疑問詞 + 主詞 + 動詞。Where is the post office? 變成間接問句是 where the post office is。",
  ["疑問句放進另一個句子裡時，語序要怎麼改？", "主詞 the post office 要放在動詞 is 的前面還是後面？"],
  {"B": "這是直接問句的語序，間接問句要主詞在前、動詞在後。", "C": "缺少動詞 is，子句不完整。", "D": "間接問句不用助動詞 does，而且後面缺動詞。"},
  None)
Q("EN-9B-2", "indirect-question", 1, "Can you tell me what time ＿＿＿?",
  ["it is", "is it", "does it", "it does"], "A",
  "What time is it? 變成間接問句時，要改成直述句語序：what time it is。",
  ["間接問句的語序是「疑問詞 + 主詞 + 動詞」。", "原本的問句是 What time is it?"],
  {"B": "is it 是直接問句的語序。", "C": "間接問句不用助動詞 does，語序也不對。", "D": "原句用的是 be 動詞 is，不是 does。"},
  None)
Q("EN-9B-2", "indirect-question", 2, "I don't know ＿＿＿ to the party tomorrow.",
  ["if Amy will come", "will Amy come", "does Amy come", "Amy will come if"], "A",
  "Will Amy come...? 是 Yes/No 問句，變成間接問句要用 if（是否）連接，並改成直述句語序：if Amy will come。",
  ["原本的問句是 Yes/No 問句還是 wh- 問句？", "Yes/No 問句變成間接問句時，要加哪個字？"],
  {"B": "間接問句不能保留直接問句的倒裝語序。", "C": "間接問句不用助動詞 does 倒裝，而且和 tomorrow 時態不合。", "D": "if 的位置錯了，要放在子句的最前面。"},
  None)
Q("EN-9B-2", "indirect-question", 2, "Could you tell me ＿＿＿?",
  ["how I can get to the train station", "how can I get to the train station",
   "how do I get to the train station", "how I get can to the train station"], "A",
  "間接問句要用直述句語序：疑問詞 + 主詞 + 助動詞 + 動詞，所以是 how I can get to the train station。",
  ["間接問句中主詞 I 和助動詞 can 誰在前？", "間接問句不能再出現倒裝。"],
  {"B": "how can I 是直接問句的倒裝語序。", "C": "間接問句不需要助動詞 do 倒裝。", "D": "助動詞 can 要放在動詞 get 前面。"},
  None)
Q("EN-9B-2", "indirect-question", 1, "A: Excuse me. Do you know ＿＿＿?\nB: He lives on Park Road.",
  ["where Mr. Lin lives", "where does Mr. Lin live", "where Mr. Lin live", "where did Mr. Lin live"], "A",
  "Where does Mr. Lin live? 變成間接問句時，去掉助動詞 does，動詞要依主詞變化，Mr. Lin 是第三人稱單數，所以是 where Mr. Lin lives。",
  ["間接問句中還需要助動詞 does 嗎？", "去掉 does 以後，動詞 live 要不要加 s？"],
  {"B": "間接問句不能保留 does 倒裝的語序。", "C": "去掉 does 後，第三人稱單數的動詞要加 s。", "D": "間接問句不用 did 倒裝，而且 B 回答用現在式 lives。"},
  None)
Q("EN-9B-2", "reading-detail", 1,
  "Notice\nThe school swimming pool will be closed from July 1 to July 10 for cleaning. It will open again on "
  "July 11. During these days, students can use the school gym instead. If you have any questions, please ask "
  "Mr. Huang in the P.E. office.\n\nWhen can students use the pool again?",
  ["On July 1", "On July 10", "On July 11", "In August"], "C",
  "通知說游泳池 7 月 1 日到 7 月 10 日關閉清潔，It will open again on July 11.，所以 7 月 11 日起可以再使用。",
  ["找到 open again 出現的句子。", "7 月 1 日到 10 日是開放還是關閉？"],
  {"A": "7 月 1 日是開始關閉的日子。", "B": "7 月 10 日還在關閉期間。", "D": "7 月 11 日就開放了，不用等到 8 月。"},
  None)
Q("EN-9B-2", "reading-detail", 2,
  "Tourist: Excuse me. Could you tell me where the City Museum is?\nGirl: Sure. Go straight for two blocks and turn "
  "left at the bank. It's next to a flower shop.\nTourist: Do you know what time it closes?\nGirl: I think it closes "
  "at five, but it's closed on Mondays.\nTourist: Today is Monday! Oh, well. I'll come back tomorrow."
  "\n\nWhy will the tourist come back tomorrow?",
  ["He can't find the museum.", "The museum is closed today.", "The museum closes at five tomorrow.", "He wants to visit the flower shop."], "B",
  "女孩說博物館 closed on Mondays（星期一休館），遊客發現 Today is Monday!，所以今天進不去，只好明天再來。",
  ["博物館哪一天休館？", "今天是星期幾？"],
  {"A": "女孩已經告訴他怎麼走，問題不是找不到。", "C": "五點關門是一般的閉館時間，不是他明天再來的原因。", "D": "花店只是用來說明博物館的位置。"},
  None)
Q("EN-9B-2", "reading-main-idea", 2,
  "Many people throw away old clothes. But old clothes can still be useful. You can give them to people who need "
  "them. You can also turn old T-shirts into bags or use them to clean the house. Some stores even take old clothes "
  "and make them into new things. Before you throw away your clothes, think about how they can be used again."
  "\n\nWhat is the main idea of this passage?",
  ["Old clothes can be used in many ways.", "Stores sell cheap new clothes.", "T-shirts are the most popular clothes.", "People should buy more clothes."], "A",
  "第二句 old clothes can still be useful 是主旨，後面舉例：送給需要的人、做成袋子、打掃、商店回收再製，最後提醒丟掉前先想想如何再利用。",
  ["哪一句話說出作者的看法，後面的句子都在支持它？", "文中舉了哪些例子？這些例子都在說明什麼？"],
  {"B": "文中沒有提到商店賣便宜的新衣服。", "C": "T 恤只是舉例的細節，文中沒比較哪種衣服最受歡迎。", "D": "作者希望舊衣再利用，不是鼓勵多買衣服。"},
  None)
Q("EN-9B-2", "reading-main-idea", 2,
  "Do you often feel tired at school? Maybe you don't eat breakfast. Breakfast gives your body energy for the morning. "
  "Students who eat breakfast can usually think more clearly in class. It doesn't have to be big; a glass of milk and "
  "a piece of bread are enough. So, don't forget to eat breakfast!\n\nWhat is the writer trying to tell us?",
  ["Eating breakfast is important.", "Milk is better than bread.", "Students should sleep more.", "Big breakfasts are the healthiest."], "A",
  "作者說早餐提供上午的能量、讓學生上課思考更清楚，最後總結 don't forget to eat breakfast!，主旨是吃早餐很重要。",
  ["最後一句 So, ... 總結了什麼？", "整篇文章一直提到的是哪件事？"],
  {"B": "牛奶和麵包是一起舉例的，作者沒有比較兩者。", "C": "文中沒有提到睡眠。", "D": "作者說早餐 doesn't have to be big（不必很豐盛）。"},
  None)
Q("EN-9B-2", "reading-detail", 2,
  "Mom: Where are you? It's already 7:30.\nLeo: Sorry, I'm still at school. Our basketball practice ended late.\n"
  "Mom: Do you know when the next bus will come?\nLeo: I checked. It comes at 7:45. I'll be home at about 8:15.\n"
  "Mom: OK. I'll keep your dinner warm.\n\nAbout how long will it take Leo to get home after the bus comes?",
  ["15 minutes", "30 minutes", "45 minutes", "An hour"], "B",
  "公車 7:45 來，Leo 大約 8:15 到家，8:15 − 7:45 = 30 分鐘。",
  ["公車幾點來？Leo 幾點會到家？", "把兩個時間相減。"],
  {"A": "用 7:45 減 7:30，算的是現在到公車來的時間。", "C": "用 8:15 減 7:30，算的是從現在到回家的時間。", "D": "時間相減時算錯了。"},
  None)
Q("EN-9B-2", "reading-inference", 3,
  "Ms. Chen: Kevin, do you know why Tim isn't in class today?\nKevin: He didn't feel well this morning. His mom called "
  "me and asked if I could take his homework to school.\nMs. Chen: I see. Could you also tell him what we learned "
  "today?\nKevin: Sure. I live next door to him, so I'll visit him after school.\n\nWhat can we learn about Kevin?",
  ["He is Tim's brother.", "He is Tim's neighbor.", "He is sick today.", "He is Tim's teacher."], "B",
  "Kevin 說 I live next door to him（我住他隔壁），住在隔壁的人就是鄰居（neighbor）。",
  ["Kevin 住在哪裡？", "live next door to someone 的人，我們叫他什麼？"],
  {"A": "Tim 的媽媽打電話給 Kevin，而且 Kevin 住在 Tim 隔壁，他們不是住一起的兄弟。", "C": "身體不舒服的是 Tim，不是 Kevin。", "D": "老師是 Ms. Chen，Kevin 是 Tim 的同學。"},
  None)
Q("EN-9B-2", "reading-inference", 3,
  "Last Sunday, Jill went to a new restaurant with her family. They waited for almost an hour to get a table. The "
  "food was not bad, but the soup was too salty and the waiter forgot to bring their drinks. When they left, Jill's "
  "father said, 'I wonder if we will ever come here again.'\n\nHow did Jill's father probably feel about the restaurant?",
  ["He loved it very much.", "He wasn't very happy with it.", "He wanted to work there.", "He thought the soup was not salty enough."], "B",
  "他們等了快一小時、湯太鹹、服務生忘了送飲料，爸爸離開時說「不知道我們還會不會再來」，表示他對這家餐廳不太滿意。",
  ["他們在這家餐廳遇到哪些問題？", "爸爸說的 I wonder if we will ever come here again. 帶有什麼語氣？"],
  {"A": "等很久、湯太鹹、服務不好，爸爸又懷疑會不會再來，不像很喜歡。", "C": "文中沒有任何線索說爸爸想在那裡工作。", "D": "文中說湯 too salty（太鹹），不是不夠鹹。"},
  None)
