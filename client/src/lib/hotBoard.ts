// 实时热搜聚合：多源 + 浏览器直连 + 静态 fallback。
// 设计要点：
//  - 不依赖任何私密 API key；只用公开、CORS 友好的端点。
//  - 任何端点失败必须降级到内置静态样例，保证 UI 不空白。
//  - 用户可勾选「屏蔽争议/敏感话题」开关。屏蔽词覆盖政治、社会冲突、灾难、刑案、地域攻击等，
//    但不会过分激进导致全空。
//  - 每条 hot item 都有标题、来源、可选热度、tag、为什么适合饭桌、原平台/百度搜索链接、视觉色板。

export type HotSource = "weibo" | "baidu" | "douyin" | "zhihu" | "bilibili" | "toutiao";

export interface HotItem {
  id: string;
  title: string;
  source: HotSource;
  /** 热度数值（如有），便于展示「xx 万」 */
  hot?: number;
  /** 二级描述/类型标签（如「热」「新」「沸」） */
  tag?: string;
  /** 直接跳转的链接 */
  url?: string;
  /** 描述：为什么适合 / 不适合饭桌聊 */
  dinnerHint?: string;
  /** 是否被敏感过滤标记（屏蔽时不展示） */
  flagged?: boolean;
  /** 给配图：emoji + 渐变。无网络图片，用主题渐变 + emoji 卡。 */
  visual?: {
    emoji: string;
    gradient: [string, string];
  };
}

export const HOT_SOURCE_META: Record<
  HotSource,
  { label: string; emoji: string; baseSearch: (q: string) => string; color: string }
> = {
  weibo: {
    label: "微博",
    emoji: "🟥",
    baseSearch: (q) => `https://s.weibo.com/weibo?q=${encodeURIComponent(q)}`,
    color: "#e6162d",
  },
  baidu: {
    label: "百度",
    emoji: "🔵",
    baseSearch: (q) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`,
    color: "#2932e1",
  },
  douyin: {
    label: "抖音",
    emoji: "🎵",
    baseSearch: (q) =>
      `https://www.douyin.com/search/${encodeURIComponent(q)}?type=general`,
    color: "#161823",
  },
  zhihu: {
    label: "知乎",
    emoji: "💬",
    baseSearch: (q) => `https://www.zhihu.com/search?q=${encodeURIComponent(q)}`,
    color: "#0066ff",
  },
  bilibili: {
    label: "B站",
    emoji: "📺",
    baseSearch: (q) =>
      `https://search.bilibili.com/all?keyword=${encodeURIComponent(q)}`,
    color: "#fb7299",
  },
  toutiao: {
    label: "今日头条",
    emoji: "📰",
    baseSearch: (q) =>
      `https://so.toutiao.com/search?dvpf=pc&keyword=${encodeURIComponent(q)}`,
    color: "#fa3232",
  },
};

// 敏感词：覆盖政治/社会冲突/灾难/刑案/恐怖/地域歧视等。
// 用「整词包含」而非完全匹配——但避免误伤一般食物/娱乐词。
const SENSITIVE_KEYWORDS = [
  // 政治 / 宗教
  "中央", "国务院", "政府", "政协", "中央委员会", "习近平", "李克强", "李强",
  "选举", "投票", "执政党", "在野党", "白宫", "克里姆林", "佩洛西", "拜登",
  "特朗普", "马斯克吵架",
  // 战争 / 武力 / 国际冲突
  "战争", "开战", "宣战", "武装", "导弹", "炸弹", "袭击", "无人机袭", "空袭",
  "停火", "俄乌", "以色列", "巴勒斯坦", "加沙", "中东", "伊朗", "朝鲜",
  "解放军", "军演",
  // 灾难
  "地震", "海啸", "洪水", "山火", "沉船", "坠机", "失事", "爆炸", "塌方",
  "暴雨灾害", "台风灾", "矿难", "瓦斯",
  // 刑案 / 暴力 / 自杀
  "杀害", "命案", "尸体", "凶案", "凶手", "枪击", "捅伤", "刺伤", "强奸",
  "性侵", "自杀", "自缢", "跳楼", "猥亵", "拐卖", "绑架", "纵火",
  // 重大社会冲突 / 群体事件
  "维权", "群体", "示威", "游行", "抗议", "封城", "封控", "拆迁",
  "打架", "冲突", "斗殴", "暴力", "霸凌",
  // 事故 / 案件
  "车祸", "矿难", "事故现场", "判决", "目击证词", "持续发酵",
  "刑事案件", "案件", "事故",
  // 地域 / 民族攻击
  "歧视", "排华", "辱华", "对立", "地域黑",
  // 涉黄涉赌 / 违法
  "涉黄", "嫖娼", "卖淫", "赌博", "诈骗", "贩毒", "毒品", "走私", "传销",
  // 公众人物负面（避免在饭桌制造尴尬）
  "出轨", "劈腿", "家暴", "性骚扰", "塌房",
  // 健康恐慌
  "新冠", "甲流", "病毒变异", "猴痘", "禽流感", "瘟疫",
];

const POSITIVE_FOOD_HINTS = [
  /美食|餐厅|食堂|早茶|火锅|烧烤|餐|饭|菜|汤|甜品|奶茶|咖啡|面|粥|烘焙|早餐|宵夜/,
  /电影|剧|演唱会|偶像|综艺|新番|动画|漫|演员|歌手|奥运|球|赛事|演技|主演/,
  /科技|发布|新品|手机|笔记本|相机|游戏|主机|更新|登录|上线/,
  /旅游|景点|出游|攻略|城市|度假|散步|展览|博物馆/,
  /搞笑|趣味|表情包|段子|有趣|温暖|治愈/,
];

export function isSensitive(title: string): boolean {
  const t = title || "";
  for (const k of SENSITIVE_KEYWORDS) {
    if (t.includes(k)) return true;
  }
  return false;
}

export function dinnerVibe(title: string): { hint: string; ok: boolean } {
  const t = title || "";
  if (isSensitive(t)) {
    return { hint: "话题偏沉重，吃饭可能不太舒服 — 已在屏蔽开关下默认隐藏", ok: false };
  }
  for (const re of POSITIVE_FOOD_HINTS) {
    if (re.test(t)) {
      return { hint: "热度话题里偏轻松愉快，饭桌可以聊一下", ok: true };
    }
  }
  return { hint: "中性话题，放心讨论", ok: true };
}

const EMOJI_BY_SOURCE: Record<HotSource, string> = {
  weibo: "🟥",
  baidu: "🔵",
  douyin: "🎵",
  zhihu: "💭",
  bilibili: "📺",
  toutiao: "📰",
};

const GRADIENT_PRESETS: [string, string][] = [
  ["#fbb273", "#c8552a"],
  ["#bce39a", "#5e9c45"],
  ["#f5c08d", "#a8794a"],
  ["#a4cef0", "#3a78b6"],
  ["#f8bbd0", "#c2185b"],
  ["#ffd180", "#f57c00"],
  ["#c5cae9", "#3f51b5"],
  ["#b2dfdb", "#00897b"],
];

function pickGradient(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return GRADIENT_PRESETS[Math.abs(h) % GRADIENT_PRESETS.length];
}

function pickEmoji(title: string, source: HotSource): string {
  const t = title || "";
  if (/电影|首映|票房|演员|演技/.test(t)) return "🎬";
  if (/演唱会|歌|乐队|音乐|偶像|出道/.test(t)) return "🎤";
  if (/球|赛|队|联赛|奥运|金牌|世界杯|冠军/.test(t)) return "🏆";
  if (/手机|相机|发布|新品|科技|AI|大模型|GPT|芯片/.test(t)) return "📱";
  if (/游戏|主机|玩家|新作/.test(t)) return "🎮";
  if (/餐|食|菜|汤|火锅|烧烤|甜|茶|奶茶|咖啡|面|粥/.test(t)) return "🍱";
  if (/旅游|景点|城市|度假|出游|攻略|展览|博物馆/.test(t)) return "🏝️";
  if (/萌|可爱|宠|猫|狗|动物/.test(t)) return "🐾";
  if (/天气|温度|降温|升温|入秋|入冬|台风|阴雨/.test(t)) return "☁️";
  return EMOJI_BY_SOURCE[source];
}

export function decorate(items: HotItem[]): HotItem[] {
  return items.map((it) => ({
    ...it,
    visual: it.visual ?? {
      emoji: pickEmoji(it.title, it.source),
      gradient: pickGradient(it.title + it.source),
    },
    dinnerHint: it.dinnerHint ?? dinnerVibe(it.title).hint,
    flagged: it.flagged ?? isSensitive(it.title),
  }));
}

// ====== 静态 fallback 数据：API 失败 / 离线 / 没有 CORS 时仍展示 ======
// 这些是「示例话题」，不是实时热点。屏蔽过滤后剩下大多数是饭桌友好；
// 每个平台都故意保留 2-3 条会被屏蔽的话题（争议/事故/案件/冲突），
// 这样关闭屏蔽开关时能看到条目数明显增加，开启时能看到「已屏蔽 X 条」。
// 风格上每个平台尽量贴合真实调性：
//   微博 — 明星 / 综艺 / 社会话题
//   百度 — 民生 / 经济 / 设备评测
//   抖音 — 短视频 / 探店 / 挑战
//   知乎 — 长问答 / 推理 / 测评
//   B 站 — 番剧 / 数码 / 鬼畜
//   头条 — 财经 / 国际 / 民生
export const STATIC_FALLBACK: Record<HotSource, HotItem[]> = {
  weibo: [
    { id: "fb-w-1", title: "今天最适合喝什么奶茶", source: "weibo", hot: 9800000, tag: "热" },
    { id: "fb-w-2", title: "周末徒步路线分享 City Walk 全攻略", source: "weibo", hot: 7600000 },
    { id: "fb-w-3", title: "深秋必去的 5 个小众城市", source: "weibo", hot: 12300000, tag: "新" },
    { id: "fb-w-4", title: "国产电影十月新片速递", source: "weibo", hot: 5400000, tag: "🔥" },
    { id: "fb-w-5", title: "猫咪冬天怎么过冬最舒服", source: "weibo", hot: 3500000 },
    { id: "fb-w-6", title: "今晚月色真美 全国赏月地图", source: "weibo", hot: 4200000 },
    { id: "fb-w-7", title: "小说改剧年度爆款盘点", source: "weibo", hot: 8700000 },
    { id: "fb-w-8", title: "城市烟火气最浓的 10 条小街", source: "weibo", hot: 6600000 },
    { id: "fb-w-9", title: "演唱会安可名场面合集", source: "weibo", hot: 5200000, tag: "沸" },
    { id: "fb-w-10", title: "顶流明星家暴风波再起争议", source: "weibo", hot: 18800000, tag: "爆" },
    { id: "fb-w-11", title: "知名网红出轨塌房后续", source: "weibo", hot: 14500000 },
  ],
  baidu: [
    { id: "fb-b-1", title: "高德发布秋游热度榜", source: "baidu", hot: 5400000 },
    { id: "fb-b-2", title: "今年最火的国产手机评测", source: "baidu", hot: 4800000 },
    { id: "fb-b-3", title: "AI 工具年终盘点", source: "baidu", hot: 3200000 },
    { id: "fb-b-4", title: "旅游 City Walk 攻略大全", source: "baidu", hot: 2900000 },
    { id: "fb-b-5", title: "本周新片票房榜 Top 10", source: "baidu", hot: 2700000 },
    { id: "fb-b-6", title: "宠物粮怎么选 兽医说真话", source: "baidu", hot: 1900000 },
    { id: "fb-b-7", title: "热门动漫新番更新表", source: "baidu", hot: 2100000 },
    { id: "fb-b-8", title: "国产剧情片影评 豆瓣高分新作", source: "baidu", hot: 1500000 },
    { id: "fb-b-9", title: "新能源车冬天续航测试", source: "baidu", hot: 2600000 },
    { id: "fb-b-10", title: "高速车祸事故现场曝光", source: "baidu", hot: 8200000 },
    { id: "fb-b-11", title: "电信诈骗最新套路警示", source: "baidu", hot: 3300000 },
  ],
  douyin: [
    { id: "fb-d-1", title: "抖音餐饮探店周榜", source: "douyin", hot: 12300000, tag: "🔥" },
    { id: "fb-d-2", title: "舞蹈翻跳王者挑战", source: "douyin", hot: 8800000 },
    { id: "fb-d-3", title: "10 秒美食教程合集", source: "douyin", hot: 7700000 },
    { id: "fb-d-4", title: "猫狗治愈视频精选", source: "douyin", hot: 6500000 },
    { id: "fb-d-5", title: "周末旅行打卡灵感", source: "douyin", hot: 4900000 },
    { id: "fb-d-6", title: "穿搭秋冬好物分享", source: "douyin", hot: 4300000 },
    { id: "fb-d-7", title: "百万粉丝厨师教你做家常菜", source: "douyin", hot: 9100000, tag: "新" },
    { id: "fb-d-8", title: "城市夜景延时摄影合集", source: "douyin", hot: 3600000 },
    { id: "fb-d-9", title: "最近爆火的解压短剧", source: "douyin", hot: 5800000 },
    { id: "fb-d-10", title: "网红打架冲突视频疯传", source: "douyin", hot: 11000000 },
    { id: "fb-d-11", title: "外卖员被打事件持续发酵", source: "douyin", hot: 7400000 },
  ],
  zhihu: [
    { id: "fb-z-1", title: "如何挑选适合自己的咖啡豆", source: "zhihu", hot: 980000 },
    { id: "zh-2", title: "适合居家锻炼的 5 个动作", source: "zhihu", hot: 770000 },
    { id: "fb-z-3", title: "冷门但好用的 App 推荐", source: "zhihu", hot: 1300000 },
    { id: "fb-z-4", title: "最值得读的 2025 书单", source: "zhihu", hot: 1100000 },
    { id: "fb-z-5", title: "如何提高睡眠质量", source: "zhihu", hot: 880000 },
    { id: "fb-z-6", title: "如何在家煮一杯好喝的奶茶", source: "zhihu", hot: 660000 },
    { id: "fb-z-7", title: "30 岁后该不该转行 求职指南", source: "zhihu", hot: 1450000, tag: "新" },
    { id: "fb-z-8", title: "猫为什么半夜跑酷 行为学解读", source: "zhihu", hot: 920000 },
    { id: "fb-z-9", title: "刑事案件中目击证词为何不可靠", source: "zhihu", hot: 1320000 },
    { id: "fb-z-10", title: "如何看待最近这起命案的判决争议", source: "zhihu", hot: 2800000 },
  ],
  bilibili: [
    { id: "fb-bi-1", title: "新番十月推荐合集", source: "bilibili", hot: 5500000 },
    { id: "fb-bi-2", title: "纪录片新作《风味人间》第四季", source: "bilibili", hot: 4900000, tag: "新" },
    { id: "fb-bi-3", title: "国产 3A 游戏开箱实测", source: "bilibili", hot: 4100000 },
    { id: "fb-bi-4", title: "数码博主双 11 推荐", source: "bilibili", hot: 3700000 },
    { id: "fb-bi-5", title: "Vlog 挑战 7 天极简生活", source: "bilibili", hot: 2800000 },
    { id: "fb-bi-6", title: "鬼畜全明星新作上线", source: "bilibili", hot: 6200000, tag: "🔥" },
    { id: "fb-bi-7", title: "深夜美食 ASMR 治愈合集", source: "bilibili", hot: 3300000 },
    { id: "fb-bi-8", title: "学习区 100 天打卡挑战", source: "bilibili", hot: 2400000 },
    { id: "fb-bi-9", title: "国漫《雾山五行》第二季前瞻", source: "bilibili", hot: 5100000 },
    { id: "fb-bi-10", title: "校园暴力题材动画引发争议", source: "bilibili", hot: 4600000 },
    { id: "fb-bi-11", title: "知名 Up 主因游戏诈骗道歉", source: "bilibili", hot: 3800000 },
  ],
  toutiao: [
    { id: "fb-t-1", title: "国庆出游热门城市榜", source: "toutiao", hot: 1980000 },
    { id: "fb-t-2", title: "iPhone 新机首批评测", source: "toutiao", hot: 1660000 },
    { id: "fb-t-3", title: "小米汽车 SU7 详细评测", source: "toutiao", hot: 1450000 },
    { id: "fb-t-4", title: "新茶饮品牌融资盘点", source: "toutiao", hot: 1180000 },
    { id: "fb-t-5", title: "A 股周末重磅消息回顾", source: "toutiao", hot: 2240000, tag: "新" },
    { id: "fb-t-6", title: "高考志愿填报实用指南", source: "toutiao", hot: 1330000 },
    { id: "fb-t-7", title: "猪肉价格连续三周下跌", source: "toutiao", hot: 970000 },
    { id: "fb-t-8", title: "央视《舌尖上的中国》新季", source: "toutiao", hot: 2100000, tag: "🔥" },
    { id: "fb-t-9", title: "中东冲突局势再度升级", source: "toutiao", hot: 4800000 },
    { id: "fb-t-10", title: "煤矿事故矿难调查最新进展", source: "toutiao", hot: 3300000 },
  ],
};

// ====== 实时拉取 ======
// 这里使用 imsyy 的公开热点 API（多次镜像）。任何端点失败 → 下个 → 静态 fallback。
// 注意：免费公开端点不保证可用性 / CORS；UI 必须能在任何情况下正常渲染。
const HOT_API_BASES = [
  "https://api-hot.imsyy.top/",
  "https://api-hot.efefee.cn/",
  "https://hot-api.vercel.app/",
];

const SOURCE_PATH: Record<HotSource, string> = {
  weibo: "weibo",
  baidu: "baidu",
  douyin: "douyin",
  zhihu: "zhihu",
  bilibili: "bilibili",
  toutiao: "toutiao",
};

/** 拉取单源；失败抛错由调用方降级。 */
async function fetchOneSource(source: HotSource, base: string, timeoutMs = 4000): Promise<HotItem[]> {
  const path = SOURCE_PATH[source];
  const url = `${base.replace(/\/$/, "")}/${path}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const arr: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    if (!arr.length) throw new Error("empty");
    return arr.slice(0, 12).map((it, i) => ({
      id: `${source}-${(it.id ?? it.title ?? i).toString().slice(0, 64)}`,
      title: String(it.title ?? it.desc ?? "").trim(),
      source,
      hot: typeof it.hot === "number" ? it.hot : typeof it.hot_score === "number" ? it.hot_score : undefined,
      tag: it.tag || it.icon || undefined,
      url: it.mobil_url || it.mobileUrl || it.url || it.link,
    })).filter((x) => x.title.length > 0);
  } finally {
    clearTimeout(t);
  }
}

/** 拉取一个 source；任意 base 成功就返回。 */
export async function loadSource(source: HotSource): Promise<{ items: HotItem[]; live: boolean; error?: string }> {
  let lastErr: unknown = undefined;
  for (const base of HOT_API_BASES) {
    try {
      const items = await fetchOneSource(source, base);
      return { items: decorate(items), live: true };
    } catch (e) {
      lastErr = e;
    }
  }
  // 全 fail，使用静态
  const items = decorate(STATIC_FALLBACK[source] || []);
  return {
    items,
    live: false,
    error: lastErr instanceof Error ? lastErr.message : "all sources failed",
  };
}

export function applySensitiveFilter(items: HotItem[], blockSensitive: boolean): HotItem[] {
  if (!blockSensitive) return items;
  return items.filter((it) => !it.flagged);
}

export function searchUrlFor(item: HotItem): string {
  if (item.url) return item.url;
  return HOT_SOURCE_META[item.source].baseSearch(item.title);
}

export function baiduUrlFor(item: HotItem): string {
  return HOT_SOURCE_META.baidu.baseSearch(item.title);
}

const SETTINGS_KEY = "chishenme.hotboard.v1";

export interface HotBoardSettings {
  blockSensitive: boolean;
  source: HotSource;
}

const DEFAULT_SETTINGS: HotBoardSettings = {
  blockSensitive: true,
  source: "weibo",
};

export function loadHotBoardSettings(): HotBoardSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      blockSensitive: typeof parsed.blockSensitive === "boolean" ? parsed.blockSensitive : true,
      source: (["weibo","baidu","douyin","zhihu","bilibili","toutiao"] as HotSource[]).includes(parsed.source) ? parsed.source : "weibo",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveHotBoardSettings(s: HotBoardSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

