import Ionicons from '@expo/vector-icons/Ionicons';

import { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Button, Card, H1, H2, Screen, T } from '@/components/ui';
import { api, type Limits } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { APP_VERSION, contactSupport, supportAvailable } from '@/lib/support';
import { C } from '@/lib/theme';
import { goBack } from '@/lib/nav';



export default function Help() {
  const { session, profile } = useAuth();
  const [limits, setLimits] = useState<Limits | null>(null);
  useEffect(() => { api.limits().then(setLimits).catch(() => {}); }, []);
  const freeQ = limits?.free_daily_questions ?? 30;
  const freeT = limits?.free_daily_tutor ?? 3;
  const premT = limits?.premium_daily_tutor ?? 50;
  const isParent = profile?.role === 'parent';
  const store = Platform.OS === 'ios'
    ? 'iPhone「設定」→ 最上方你的名字 → 訂閱項目'
    : 'Google Play 商店 → 右上角頭像 → 付款和訂閱 → 訂閱';

  const faqs: { q: string; a: string }[] = [
    ...(isParent ? [
      { q: '怎麼看孩子的學習狀況？', a: '請孩子打開 App →「我的」，把 8 碼邀請碼告訴你，在家長首頁輸入就能看到每週練習天數、答對率與較弱的單元。家長看不到孩子和小老師的對話內容。' },
      { q: '可以每週提醒我看週報嗎？', a: '可以。到「我的」打開「每週學習摘要提醒」，每週日晚上 8 點會提醒你。' },
    ] : []),
    { q: '連勝怎麼算？', a: '每天答滿 5 題（答對答錯都算）就保住連勝。連續好幾天都有達成，火焰數字就會一直增加。' },
    { q: '保護卡是什麼？', a: '某一天忘了練習時，會自動用 1 張保護卡幫你保住連勝。註冊送 2 張，每連勝 7 天再送 1 張，最多存 5 張。' },
    { q: 'XP 是什麼？', a: '答對 1 題得 10 XP，錯題「畢業」（弄懂後隔一段時間再考也答對）再得 30 XP。XP 代表你的累積努力。' },
    { q: '錯題本怎麼運作？', a: '答錯的題目會自動收進錯題本。找小老師弄懂、答對相似題後，會在 1 天、3 天、7 天後各再考你一次，三次都答對就畢業。' },
    { q: '錯題小老師是什麼？', a: `AI 小老師會一步一步引導你想，不會直接給答案。免費版每天 ${freeT} 次（看廣告每天最多再多 2 次），完整版每天 ${premT} 次。AI 可能會講錯，以課本為準，看到錯誤請按小老師右上角「回報」。` },
    { q: '國小生可以用嗎？', a: '可以。首次設定或「我的」選五年級或六年級，就會切換成國小版：有國語和數學（五上～六下），每單元有簡單、中等、困難三種題目，一樣有段考分階段複習、錯題本、完整詳解和小老師（會用國小生聽得懂的說法）。升上七年級後改選七年級，就會換成國中五科與會考模擬考。' },
    { q: '會考模擬考怎麼用？', a: '到「練習」最上方的「會考模擬考」，選科目後計時作答，題數和時間跟會考一樣（免費版可以考迷你 10 題）。作答中不公布答案，交卷後看分數、各單元表現和錯題解析，成績會記錄下來畫成進步曲線，家長端也看得到。' },
    { q: '英語聽力怎麼練？', a: '英語的「聽力」單元和模擬考的「英語聽力」會用手機語音朗讀題目，建議戴耳機。每題可以重複播放或慢速播放，作答後會顯示聽力原文。聽不到聲音時，請確認手機沒有開靜音、音量有調大。' },
    { q: '免費版和完整版差在哪？', a: `免費版每天可以練 ${freeQ} 題、小老師 ${freeT} 次；完整版題數不限、小老師每天 ${premT} 次、沒有廣告。` },
    { q: '段考全校前三名怎麼免費使用？', a: '到首頁「段考全校前三名」上傳成績單或獎狀照片（請遮住姓名與學號），審核通過就能免費使用到學期結束。' },
    { q: '要怎麼取消訂閱？', a: `訂閱由 ${Platform.OS === 'ios' ? 'App Store' : 'Google Play'} 管理：${store}，找到「會考小老師」取消。刪除 App 或刪除帳號都不會自動取消訂閱。` },
    { q: '換了手機，完整版會不見嗎？', a: '用同一個帳號登入即可。若是訂閱，可以在升級頁按「恢復購買」重新同步。' },
    { q: '怎麼改年級、課本版本或每日練習的科目？', a: '年級和每日練習科目在「我的」修改；課本版本在「學期複習」選好科目後，在上方選康軒、南一或翰林。' },
    { q: '題目和我的課本不一樣？', a: '會考不分版本，題目各版本通用。章節對照整理自各校公開的教學進度表，如果和你的課本不同，以課本為準，也歡迎寫信告訴我們。' },
  ];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => goBack()}
        style={{ width: 44, height: 44, justifyContent: 'center' }}>
        <Ionicons name="chevron-back" size={26} color={C.ink} />
      </Pressable>
      <H1>使用說明與常見問題</H1>

      <Card style={{ gap: 0, paddingVertical: 4 }}>
        {faqs.map((f, i) => (
          <View key={f.q} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: C.line }}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: open === i }} aria-expanded={open === i}
              onPress={() => setOpen(open === i ? null : i)}
              style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 }}>
              <T weight="700" style={{ flex: 1 }}>{f.q}</T>
              <Ionicons name={open === i ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
            </Pressable>
            {open === i ? <T size={14} color={C.inkSoft} style={{ paddingBottom: 12 }}>{f.a}</T> : null}
          </View>
        ))}
      </Card>

      <Card style={{ gap: 10 }}>
        <H2>還是有問題？</H2>
        {supportAvailable ? (
          <>
            <T size={14} color={C.inkSoft}>寫信給我們，通常 2 個工作天內回覆。信裡會自動附上 App 版本，方便我們查詢。</T>
            <Button title="寫信給客服" onPress={() => contactSupport(session?.user.id)} />
            <Button title="回報 App 問題（Bug）" kind="secondary" onPress={() => contactSupport(session?.user.id, '問題回報')} />
          </>
        ) : (
          <T size={14} color={C.muted}>客服信箱設定中。</T>
        )}
      </Card>
      <T size={12} color={C.faint} style={{ textAlign: 'center' }}>會考小老師 v{APP_VERSION}</T>
    </Screen>
  );
}
