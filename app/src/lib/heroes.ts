import type { ImageSourcePropType } from 'react-native';

/** 八位戰鬥夥伴：大廳主角與答錯時「心眼」提示的角色 */
export interface Hero {
  id: string; no: string; name: string; job: string; color: string;
  look: string; persona: string;
  /** 心眼提示開場白 */
  eye: string;
  /** 心眼特效說明（顯示在提示框標題） */
  eyeFx: string;
  /** 大廳台詞 */
  greet: string;
  image: ImageSourcePropType; face: ImageSourcePropType;
  /** 去背全身像（站在大廳舞台上）、開心（答對／升級）、鼓勵（心眼提示） */
  full: ImageSourcePropType; happy: ImageSourcePropType; cheer: ImageSourcePropType;
}

export const HEROES: Hero[] = [
  { id: 'yelin', no: '01', name: '夜凜', job: '蒼焰魔劍士', color: '#22D3FF', look: '黑短髮、黑色長大衣、青光劍', persona: '沉穩隊長',
    eye: '別急，線索就在題目裡。', eyeFx: '劍光圈出關鍵字', greet: '一起突破今天的秘境吧！',
    image: require('@/assets/heroes/yelin.jpg'), face: require('@/assets/heroes/yelin-face.jpg'),
    full: require('@/assets/heroes/yelin-full.webp'), happy: require('@/assets/heroes/yelin-happy.webp'), cheer: require('@/assets/heroes/yelin-cheer.webp') },
  { id: 'liyue', no: '02', name: '璃月', job: '星軌咒術師', color: '#B57CFF', look: '銀紫短髮、紫披肩、法書與星環', persona: '冷靜敏銳',
    eye: '把這兩條線索連起來看看。', eyeFx: '星線串起條件', greet: '星軌已經排好，今天也一起解開它。',
    image: require('@/assets/heroes/liyue.jpg'), face: require('@/assets/heroes/liyue-face.jpg'),
    full: require('@/assets/heroes/liyue-full.webp'), happy: require('@/assets/heroes/liyue-happy.webp'), cheer: require('@/assets/heroes/liyue-cheer.webp') },
  { id: 'leiyao', no: '03', name: '雷曜', job: '疾雷雙刃', color: '#FFD23F', look: '金色捲髮、機能夾克、閃電雙刃', persona: '熱血開朗',
    eye: '先突破第一步！', eyeFx: '雷光拆解步驟', greet: '衝啊！5 題一口氣打完！',
    image: require('@/assets/heroes/leiyao.jpg'), face: require('@/assets/heroes/leiyao-face.jpg'),
    full: require('@/assets/heroes/leiyao-full.webp'), happy: require('@/assets/heroes/leiyao-happy.webp'), cheer: require('@/assets/heroes/leiyao-cheer.webp') },
  { id: 'feiyin', no: '04', name: '緋音', job: '赤焰龍槍姬', color: '#FF4D6D', look: '深紅高馬尾、紅灰戰袍、長槍', persona: '直率堅毅',
    eye: '找到陷阱，就能再戰！', eyeFx: '火焰標出易漏條件', greet: '今天的魔物，一隻也不放過！',
    image: require('@/assets/heroes/feiyin.jpg'), face: require('@/assets/heroes/feiyin-face.jpg'),
    full: require('@/assets/heroes/feiyin-full.webp'), happy: require('@/assets/heroes/feiyin-happy.webp'), cheer: require('@/assets/heroes/feiyin-cheer.webp') },
  { id: 'shiyan', no: '05', name: '時硯', job: '時序策士', color: '#E8C26A', look: '灰髮、細框眼鏡、懸浮時序方塊', persona: '理性溫柔',
    eye: '慢一點，我們重新整理。', eyeFx: '時序投影重排步驟', greet: '每天一點點，時間會站在你這邊。',
    image: require('@/assets/heroes/shiyan.jpg'), face: require('@/assets/heroes/shiyan-face.jpg'),
    full: require('@/assets/heroes/shiyan-full.webp'), happy: require('@/assets/heroes/shiyan-happy.webp'), cheer: require('@/assets/heroes/shiyan-cheer.webp') },
  { id: 'shuangli', no: '06', name: '霜璃', job: '冰晶守望者', color: '#8FD8FF', look: '淡藍長髮辮、白色披肩、冰晶杖', persona: '安靜耐心',
    eye: '這一步已經對了，繼續。', eyeFx: '冰晶框住已完成的部分', greet: '我會一直守著你，慢慢來就好。',
    image: require('@/assets/heroes/shuangli.jpg'), face: require('@/assets/heroes/shuangli-face.jpg'),
    full: require('@/assets/heroes/shuangli-full.webp'), happy: require('@/assets/heroes/shuangli-happy.webp'), cheer: require('@/assets/heroes/shuangli-cheer.webp') },
  { id: 'yuekai', no: '07', name: '岳鎧', job: '玄岩盾衛', color: '#C9A15A', look: '深棕膚色、捲髮、岩石巨盾', persona: '憨厚可靠',
    eye: '我陪你，一次解決一個條件。', eyeFx: '盾面列出已知條件', greet: '有我擋在前面，放心出發！',
    image: require('@/assets/heroes/yuekai.jpg'), face: require('@/assets/heroes/yuekai-face.jpg'),
    full: require('@/assets/heroes/yuekai-full.webp'), happy: require('@/assets/heroes/yuekai-happy.webp'), cheer: require('@/assets/heroes/yuekai-cheer.webp') },
  { id: 'senya', no: '08', name: '森芽', job: '靈植藥師', color: '#5EE08A', look: '薄荷綠短髮、藥瓶腰帶、花精靈', persona: '好奇細心',
    eye: '換個角度，看看會發現什麼？', eyeFx: '花精靈送來提示', greet: '今天想種出什麼新知識呢？',
    image: require('@/assets/heroes/senya.jpg'), face: require('@/assets/heroes/senya-face.jpg'),
    full: require('@/assets/heroes/senya-full.webp'), happy: require('@/assets/heroes/senya-happy.webp'), cheer: require('@/assets/heroes/senya-cheer.webp') },
];

export const heroOf = (id: string | null | undefined): Hero => HEROES.find((h) => h.id === id) ?? HEROES[0];
