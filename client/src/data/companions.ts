// 「饭桌陪伴」数据：边吃边看 / 边吃边聊 / 做饭背景音
// 内置数据，不依赖任何需要密钥的实时 API；外部链接均为搜索入口（豆瓣 / 平台 / 百度）。
//
// 设计原则：
// - 不强行用性别决定推荐；性别只作可选偏好。
// - 家庭聚餐 / 儿童 / 长辈 优先合家欢、轻松、低争议内容。
// - 话题避免政治、宗教、地域攻击、过深隐私、医疗诊断等高争议或敏感方向。

export type WatchType = "电影" | "电视剧" | "综艺" | "纪录片" | "动画";
export type AudienceTag =
  | "单人"
  | "双人"
  | "情侣"
  | "朋友"
  | "全家"
  | "儿童友好"
  | "长辈友好";
export type WatchMood =
  | "轻松"
  | "下饭"
  | "解压"
  | "温馨"
  | "搞笑"
  | "悬疑"
  | "热血"
  | "怀旧"
  | "知识"
  | "美食";

export interface SearchLink {
  label: string;
  /** 用 {q} 占位，运行时替换为编码后的关键词 */
  template: string;
}

const VIDEO_SEARCHES: SearchLink[] = [
  { label: "豆瓣", template: "https://search.douban.com/movie/subject_search?search_text={q}" },
  { label: "腾讯视频", template: "https://v.qq.com/x/search/?q={q}" },
  { label: "爱奇艺", template: "https://so.iqiyi.com/so/q_{q}" },
  { label: "Bilibili", template: "https://search.bilibili.com/all?keyword={q}" },
  { label: "百度", template: "https://www.baidu.com/s?wd={q}" },
];

const AUDIO_SEARCHES: SearchLink[] = [
  { label: "喜马拉雅", template: "https://www.ximalaya.com/search/{q}" },
  { label: "微信读书", template: "https://weread.qq.com/web/search/global?keyword={q}" },
  { label: "网易云", template: "https://music.163.com/#/search/m/?s={q}&type=1000" },
  { label: "小宇宙", template: "https://www.xiaoyuzhoufm.com/search?q={q}" },
  { label: "百度", template: "https://www.baidu.com/s?wd={q}" },
];

export interface WatchItem {
  id: string;
  title: string;
  type: WatchType;
  /** 一句话推荐理由 */
  why: string;
  /** 心情 / 标签 */
  moods: WatchMood[];
  /** 适合谁看（任一命中即可） */
  audiences: AudienceTag[];
  /** 适合的年龄区间（包含上下限），其它年龄不会被排除，只是不优先 */
  ageMin?: number;
  ageMax?: number;
  /** 单集 / 单部时长（分钟），仅作展示参考 */
  duration?: string;
  /** 是否为合家欢 / 适合家庭聚餐 */
  familyFriendly?: boolean;
  /** 是否儿童安全（无暴力 / 恐怖 / 大尺度） */
  kidSafe?: boolean;
  /** 是否长辈友好 */
  elderFriendly?: boolean;
}

export interface TopicItem {
  id: string;
  text: string;
  /** 标签：轻松开场 / 深聊一点 / 适合全家 / 避免争议 */
  tags: ("轻松开场" | "深聊一点" | "适合全家" | "避免争议" | "亲子" | "回忆" | "美食" | "旅行" | "工作" | "兴趣")[];
  /** 适合谁聊 */
  audiences: AudienceTag[];
  /** 是否儿童 / 长辈安全 */
  familyFriendly?: boolean;
  kidSafe?: boolean;
  elderFriendly?: boolean;
}

export type AudioType = "有声书" | "播客" | "故事" | "知识" | "助眠" | "音乐";

export interface AudioItem {
  id: string;
  title: string;
  type: AudioType;
  why: string;
  /** 适合多长时间的做饭场景：短=15-30 分钟，中=30-60，长=60+ */
  length: "短" | "中" | "长";
  audiences: AudienceTag[];
  /** 标签 */
  tags: ("故事" | "历史" | "人文" | "亲子" | "轻知识" | "助眠" | "做饭背景" | "悬疑" | "搞笑" | "情感")[];
  kidSafe?: boolean;
  elderFriendly?: boolean;
}

export function buildSearchLinks(query: string, kind: "video" | "audio"): { label: string; href: string }[] {
  const tpl = kind === "video" ? VIDEO_SEARCHES : AUDIO_SEARCHES;
  const q = encodeURIComponent(query);
  return tpl.map((s) => ({ label: s.label, href: s.template.replace("{q}", q) }));
}

// === 影视 / 综艺 / 纪录片 / 动画 ===
// 每条都是「公认低争议、合家欢友好」或「特定人群高匹配」的内容；
// 没有平台直链，只用搜索链接，避免外链失效。
export const WATCH_ITEMS: WatchItem[] = [
  // —— 合家欢电影 ——
  { id: "w1", title: "你好，李焕英", type: "电影", why: "母女温情代际共鸣，家庭聚餐最稳妥的选择。", moods: ["温馨", "轻松"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true, duration: "128 分钟", ageMin: 8 },
  { id: "w2", title: "夏洛特烦恼", type: "电影", why: "笑点密集回忆杀，老中青都能笑出来。", moods: ["搞笑", "怀旧"], audiences: ["全家", "朋友", "长辈友好"], familyFriendly: true, elderFriendly: true, duration: "104 分钟", ageMin: 12 },
  { id: "w3", title: "飞驰人生 2", type: "电影", why: "热血又好笑，节奏很适合配晚饭。", moods: ["热血", "搞笑"], audiences: ["全家", "朋友", "情侣"], familyFriendly: true, duration: "99 分钟", ageMin: 12 },
  { id: "w4", title: "爱情神话", type: "电影", why: "上海中年群像生活流，慢节奏很下饭。", moods: ["温馨", "怀旧"], audiences: ["双人", "情侣", "朋友"], duration: "115 分钟", ageMin: 16 },
  { id: "w5", title: "瞬息全宇宙", type: "电影", why: "设定脑洞 + 母女和解，越吃越想看下去。", moods: ["搞笑", "温馨"], audiences: ["朋友", "情侣", "双人"], duration: "139 分钟", ageMin: 16 },
  { id: "w6", title: "心灵奇旅", type: "电影", why: "皮克斯治愈系，配晚饭看温柔又有点深度。", moods: ["温馨", "知识"], audiences: ["全家", "情侣", "单人"], familyFriendly: true, kidSafe: true, duration: "100 分钟", ageMin: 6 },
  { id: "w7", title: "千与千寻", type: "电影", why: "宫崎骏全年龄经典，全家都看过都还想再看。", moods: ["温馨", "怀旧"], audiences: ["全家", "儿童友好", "长辈友好"], familyFriendly: true, kidSafe: true, elderFriendly: true, duration: "125 分钟", ageMin: 5 },
  { id: "w8", title: "龙猫", type: "电影", why: "最适合一家人吃晚饭看的动画，几乎零冲突。", moods: ["温馨"], audiences: ["全家", "儿童友好", "长辈友好"], familyFriendly: true, kidSafe: true, elderFriendly: true, duration: "86 分钟", ageMin: 3 },
  { id: "w9", title: "寻梦环游记", type: "电影", why: "家人题材 + 音乐元素，一家人吃饭很容易共鸣。", moods: ["温馨", "怀旧"], audiences: ["全家", "儿童友好", "长辈友好"], familyFriendly: true, kidSafe: true, elderFriendly: true, duration: "105 分钟", ageMin: 6 },
  { id: "w10", title: "疯狂动物城", type: "电影", why: "节奏快、笑点稳，孩子大人各有各的乐子。", moods: ["搞笑", "热血"], audiences: ["全家", "儿童友好"], familyFriendly: true, kidSafe: true, duration: "108 分钟", ageMin: 6 },

  // —— 电视剧 / 长剧 ——
  { id: "w11", title: "请回答 1988", type: "电视剧", why: "首尔胡同里的家庭群像，温柔到下饭。", moods: ["温馨", "怀旧"], audiences: ["全家", "情侣", "长辈友好"], familyFriendly: true, elderFriendly: true, duration: "约 90 分钟/集", ageMin: 12 },
  { id: "w12", title: "庆余年", type: "电视剧", why: "权谋 + 喜剧节奏，男女老少都能追。", moods: ["搞笑", "热血"], audiences: ["全家", "朋友"], familyFriendly: true, duration: "45 分钟/集", ageMin: 14 },
  { id: "w13", title: "甄嬛传", type: "电视剧", why: "看一集吃一顿饭，国民级下饭剧。", moods: ["下饭", "怀旧"], audiences: ["全家", "长辈友好", "单人"], familyFriendly: true, elderFriendly: true, duration: "45 分钟/集", ageMin: 14 },
  { id: "w14", title: "三十而已", type: "电视剧", why: "都市女性日常，朋友姐妹一起吃聊天最合适。", moods: ["下饭"], audiences: ["朋友", "双人", "单人"], duration: "45 分钟/集", ageMin: 18 },
  { id: "w15", title: "山海情", type: "电视剧", why: "扶贫年代戏，节奏不沉重，长辈和年轻人都能看。", moods: ["温馨", "怀旧"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true, duration: "45 分钟/集", ageMin: 12 },
  { id: "w16", title: "繁花", type: "电视剧", why: "九十年代上海风味，慢慢吃慢慢看刚刚好。", moods: ["怀旧"], audiences: ["双人", "情侣", "长辈友好"], duration: "45 分钟/集", ageMin: 18 },
  { id: "w17", title: "去有风的地方", type: "电视剧", why: "云南治愈风物剧,看完想立刻去旅游。", moods: ["温馨"], audiences: ["全家", "情侣", "单人"], familyFriendly: true, elderFriendly: true, duration: "45 分钟/集", ageMin: 12 },
  { id: "w18", title: "我的事说来话长", type: "电视剧", why: "日剧家庭日常，节奏慢、台词暖。", moods: ["温馨"], audiences: ["全家", "单人"], familyFriendly: true, duration: "45 分钟/集", ageMin: 14 },
  { id: "w19", title: "孤独的美食家", type: "电视剧", why: "吃饭看吃饭，绝对不会盖过你的饭。", moods: ["美食", "下饭"], audiences: ["单人", "双人", "情侣"], duration: "25 分钟/集", ageMin: 12 },
  { id: "w20", title: "深夜食堂(日版)", type: "电视剧", why: "一集一菜一故事，温吞但很饱足。", moods: ["美食", "温馨"], audiences: ["单人", "双人", "长辈友好"], elderFriendly: true, duration: "25 分钟/集", ageMin: 14 },

  // —— 综艺 ——
  { id: "w21", title: "向往的生活", type: "综艺", why: "蘑菇屋下饭综艺标杆，长辈也爱看。", moods: ["温馨", "美食"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true, duration: "90 分钟/期", ageMin: 8 },
  { id: "w22", title: "中餐厅", type: "综艺", why: "吃饭时再看吃饭综艺，馋上加馋。", moods: ["美食", "轻松"], audiences: ["全家", "朋友"], familyFriendly: true, duration: "90 分钟/期", ageMin: 8 },
  { id: "w23", title: "极限挑战", type: "综艺", why: "兄弟团高能笑点,合家欢综艺。", moods: ["搞笑"], audiences: ["全家", "朋友"], familyFriendly: true, duration: "90 分钟/期", ageMin: 10 },
  { id: "w24", title: "奔跑吧", type: "综艺", why: "不烧脑笑点稳，小孩也能跟着乐。", moods: ["搞笑"], audiences: ["全家", "儿童友好"], familyFriendly: true, kidSafe: true, duration: "90 分钟/期", ageMin: 8 },
  { id: "w25", title: "脱口秀大会", type: "综艺", why: "段子一波接一波，朋友聚餐绝佳。", moods: ["搞笑"], audiences: ["朋友", "情侣", "单人"], duration: "90 分钟/期", ageMin: 16 },
  { id: "w26", title: "奇葩说", type: "综艺", why: "辩题轻巧但有思考，能聊起来的综艺。", moods: ["知识", "搞笑"], audiences: ["朋友", "情侣"], duration: "90 分钟/期", ageMin: 16 },
  { id: "w27", title: "声生不息", type: "综艺", why: "经典老歌音乐综艺，长辈听了亲切。", moods: ["怀旧", "温馨"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true, duration: "90 分钟/期", ageMin: 8 },
  { id: "w28", title: "百分百出品", type: "综艺", why: "美食制作综艺，做饭爱好者会喜欢。", moods: ["美食", "知识"], audiences: ["双人", "单人"], duration: "60 分钟/期", ageMin: 12 },
  { id: "w29", title: "你好星期六", type: "综艺", why: "周末感强、嘉宾杂、不烧脑。", moods: ["轻松", "搞笑"], audiences: ["全家", "朋友"], familyFriendly: true, duration: "120 分钟/期", ageMin: 8 },

  // —— 纪录片 ——
  { id: "w30", title: "舌尖上的中国", type: "纪录片", why: "看着别人做菜吃饭，比看剧还下饭。", moods: ["美食", "温馨"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true, duration: "50 分钟/集", ageMin: 6 },
  { id: "w31", title: "风味人间", type: "纪录片", why: "陈晓卿团队美食纪录片，画面治愈。", moods: ["美食", "知识"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true, duration: "50 分钟/集", ageMin: 6 },
  { id: "w32", title: "人生一串", type: "纪录片", why: "市井烧烤纪录片，朋友夜宵绝配。", moods: ["美食", "轻松"], audiences: ["朋友", "双人"], duration: "30 分钟/集", ageMin: 14 },
  { id: "w33", title: "我在故宫修文物", type: "纪录片", why: "节奏慢、画面美，长辈孩子都不闹。", moods: ["知识", "温馨"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true, duration: "50 分钟/集", ageMin: 8 },
  { id: "w34", title: "蓝色星球 II", type: "纪录片", why: "BBC 海洋纪录片，画面安静孩子也看得住。", moods: ["知识", "温馨"], audiences: ["全家", "儿童友好", "长辈友好"], familyFriendly: true, kidSafe: true, elderFriendly: true, duration: "50 分钟/集", ageMin: 5 },
  { id: "w35", title: "但是还有书籍", type: "纪录片", why: "关于书与读书人的小温暖纪录片。", moods: ["温馨", "知识"], audiences: ["单人", "双人"], duration: "30 分钟/集", ageMin: 14 },
  { id: "w36", title: "城市梦", type: "纪录片", why: "聚焦小人物的城市生活，安静但不沉闷。", moods: ["温馨", "知识"], audiences: ["单人", "双人"], duration: "100 分钟", ageMin: 16 },

  // —— 动画 / 儿童 ——
  { id: "w37", title: "蜡笔小新", type: "动画", why: "经典合家欢动画，剧场版尤其温馨。", moods: ["搞笑", "温馨"], audiences: ["全家", "儿童友好"], familyFriendly: true, kidSafe: true, duration: "25 分钟/集", ageMin: 6 },
  { id: "w38", title: "灌篮高手", type: "动画", why: "热血回忆杀，朋友一起看会嗨。", moods: ["热血", "怀旧"], audiences: ["朋友", "情侣"], duration: "25 分钟/集", ageMin: 10 },
  { id: "w39", title: "海绵宝宝", type: "动画", why: "全年龄无脑欢乐，孩子吃饭最配。", moods: ["搞笑"], audiences: ["儿童友好", "全家"], familyFriendly: true, kidSafe: true, duration: "11 分钟/集", ageMin: 4 },
  { id: "w40", title: "小猪佩奇", type: "动画", why: "2-6 岁孩子最爱，家庭氛围安全。", moods: ["温馨"], audiences: ["儿童友好", "全家"], familyFriendly: true, kidSafe: true, duration: "5 分钟/集", ageMin: 2 },
  { id: "w41", title: "中国奇谭", type: "动画", why: "国风短篇动画合集，画风惊艳。", moods: ["温馨", "知识"], audiences: ["全家", "情侣"], familyFriendly: true, duration: "20 分钟/集", ageMin: 10 },
  { id: "w42", title: "雾山五行", type: "动画", why: "国漫战斗番,画面华丽,朋友一起看刺激。", moods: ["热血"], audiences: ["朋友", "单人"], duration: "25 分钟/集", ageMin: 14 },

  // —— 单人 / 双人氛围向 ——
  { id: "w43", title: "请回答 1997", type: "电视剧", why: "更短的请回答系列，单人也能慢慢嚼。", moods: ["怀旧", "温馨"], audiences: ["单人", "双人", "情侣"], duration: "60 分钟/集", ageMin: 14 },
  { id: "w44", title: "凪的新生活", type: "电视剧", why: "一个人的治愈日剧，独居晚饭刚好。", moods: ["温馨"], audiences: ["单人", "双人"], duration: "45 分钟/集", ageMin: 18 },
  { id: "w45", title: "小森林 夏秋/冬春", type: "电影", why: "做饭吃饭的电影，看着自己也想做点什么。", moods: ["美食", "温馨"], audiences: ["单人", "双人", "情侣"], duration: "115 分钟", ageMin: 12 },
];

// === 话题 ===
// 避开政治、宗教、地域攻击、医疗诊断、过度隐私（如薪资追问、催婚催育施压）。
export const TOPIC_ITEMS: TopicItem[] = [
  // 轻松开场
  { id: "t1", text: "今天最有意思的一件小事是什么？", tags: ["轻松开场", "适合全家"], audiences: ["全家", "朋友", "情侣", "双人"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t2", text: "上次让你一口气笑出声的视频或段子是什么？", tags: ["轻松开场"], audiences: ["朋友", "情侣", "双人"], familyFriendly: true },
  { id: "t3", text: "如果今天可以再加一个小时，你最想用来做什么？", tags: ["轻松开场"], audiences: ["全家", "朋友", "情侣"], familyFriendly: true, elderFriendly: true },
  { id: "t4", text: "最近哪首歌让你单曲循环？", tags: ["轻松开场", "兴趣"], audiences: ["朋友", "情侣", "双人"], familyFriendly: true },
  { id: "t5", text: "假如下个月有 3 天连休,你会怎么安排?", tags: ["轻松开场", "旅行"], audiences: ["全家", "朋友", "情侣"], familyFriendly: true, elderFriendly: true },
  { id: "t6", text: "今天遇到的一个小确幸,你愿意分享一下吗?", tags: ["轻松开场", "适合全家"], audiences: ["全家", "情侣"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t7", text: "最近发现的一家想推荐给大家的小店?", tags: ["轻松开场", "美食"], audiences: ["全家", "朋友"], familyFriendly: true, elderFriendly: true },
  { id: "t8", text: "今天的天气最适合做什么?", tags: ["轻松开场", "适合全家"], audiences: ["全家"], familyFriendly: true, kidSafe: true, elderFriendly: true },

  // 美食
  { id: "t9", text: "你心目中的「家的味道」是哪一道菜?", tags: ["美食", "回忆", "适合全家"], audiences: ["全家", "情侣", "长辈友好"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t10", text: "如果只能选一种早餐吃一辈子,你选什么?", tags: ["美食", "轻松开场"], audiences: ["全家", "朋友"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t11", text: "上一次自己做饭做出特别满意的菜是什么时候?", tags: ["美食"], audiences: ["全家", "情侣", "朋友"], familyFriendly: true, elderFriendly: true },
  { id: "t12", text: "你能接受的最辣 / 最甜 / 最咸是什么?", tags: ["美食", "轻松开场"], audiences: ["全家", "朋友"], familyFriendly: true, kidSafe: true },
  { id: "t13", text: "小时候最盼着过年吃的那一道菜是什么?", tags: ["美食", "回忆", "适合全家"], audiences: ["全家", "长辈友好"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t14", text: "周末最想花时间慢慢做的一道菜是?", tags: ["美食"], audiences: ["全家", "情侣"], familyFriendly: true, elderFriendly: true },

  // 回忆
  { id: "t15", text: "你最难忘的一次旅行是哪一次?", tags: ["回忆", "旅行"], audiences: ["全家", "情侣", "朋友"], familyFriendly: true, elderFriendly: true },
  { id: "t16", text: "小时候最喜欢的一个游戏是什么?", tags: ["回忆", "适合全家"], audiences: ["全家", "朋友", "长辈友好"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t17", text: "学生时代有没有一首专属于你们那届的歌?", tags: ["回忆", "兴趣"], audiences: ["朋友", "情侣"], familyFriendly: true },
  { id: "t18", text: "你记忆里最热闹的一个春节是哪一年?", tags: ["回忆", "适合全家"], audiences: ["全家", "长辈友好"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t19", text: "你最早一次自己挣到钱是怎么挣的?", tags: ["回忆"], audiences: ["全家", "情侣", "朋友"], familyFriendly: true, elderFriendly: true },
  { id: "t20", text: "记忆里夏天总会有的一个声音是什么?", tags: ["回忆", "适合全家"], audiences: ["全家"], familyFriendly: true, kidSafe: true, elderFriendly: true },

  // 旅行
  { id: "t21", text: "如果可以瞬移去一个城市待 24 小时,你去哪?", tags: ["旅行", "轻松开场"], audiences: ["全家", "情侣", "朋友"], familyFriendly: true, elderFriendly: true },
  { id: "t22", text: "下一个最想带家人一起去的地方是哪儿?", tags: ["旅行", "适合全家"], audiences: ["全家", "情侣"], familyFriendly: true, elderFriendly: true },
  { id: "t23", text: "国内你还想去但没去过的省份是?", tags: ["旅行"], audiences: ["全家", "朋友"], familyFriendly: true, elderFriendly: true },
  { id: "t24", text: "旅行里最值得花钱的一项是什么(吃 / 住 / 玩)?", tags: ["旅行"], audiences: ["朋友", "情侣"], familyFriendly: true },

  // 工作 / 学习（轻松向)
  { id: "t25", text: "本周最让你有成就感的一件事是?", tags: ["工作", "轻松开场"], audiences: ["全家", "朋友", "情侣"], familyFriendly: true, elderFriendly: true },
  { id: "t26", text: "最近想学但还没开始的一项技能是什么?", tags: ["工作", "兴趣"], audiences: ["朋友", "情侣", "双人"], familyFriendly: true },
  { id: "t27", text: "如果换一个完全不同的职业,你最想试试哪个?", tags: ["工作", "深聊一点"], audiences: ["朋友", "情侣"], familyFriendly: true },
  { id: "t28", text: "工作之外的你,最近在着迷什么?", tags: ["兴趣"], audiences: ["全家", "情侣", "朋友"], familyFriendly: true, elderFriendly: true },

  // 兴趣 / 内容
  { id: "t29", text: "最近看完后会想推荐给别人的一本书 / 一部剧?", tags: ["兴趣"], audiences: ["全家", "朋友", "情侣"], familyFriendly: true, elderFriendly: true },
  { id: "t30", text: "有没有一个被低估的小爱好/小习惯,想分享一下?", tags: ["兴趣", "轻松开场"], audiences: ["全家", "朋友"], familyFriendly: true, elderFriendly: true },
  { id: "t31", text: "如果今天可以学一项新乐器,你想学什么?", tags: ["兴趣", "适合全家"], audiences: ["全家", "情侣"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t32", text: "你的相册里最近一张让你笑的照片是什么内容?", tags: ["轻松开场", "适合全家"], audiences: ["全家", "朋友", "情侣"], familyFriendly: true, kidSafe: true, elderFriendly: true },

  // 亲子 / 全家
  { id: "t33", text: "今天在学校 / 单位最有意思的一件事是?", tags: ["亲子", "适合全家"], audiences: ["全家", "儿童友好"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t34", text: "你最想长大以后做什么样的工作?(问小朋友)", tags: ["亲子", "适合全家"], audiences: ["全家", "儿童友好"], familyFriendly: true, kidSafe: true },
  { id: "t35", text: "全家一起做过印象最深的一件事是什么?", tags: ["亲子", "回忆", "适合全家"], audiences: ["全家", "长辈友好"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t36", text: "周末想全家一起做点什么好玩的?", tags: ["亲子", "适合全家"], audiences: ["全家", "儿童友好"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t37", text: "如果家里能再养一种宠物,你想养什么?", tags: ["亲子", "适合全家", "轻松开场"], audiences: ["全家", "儿童友好"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t38", text: "今天想听爸爸 / 妈妈讲一件他们小时候的事吗?", tags: ["亲子", "回忆", "适合全家"], audiences: ["全家", "长辈友好"], familyFriendly: true, kidSafe: true, elderFriendly: true },

  // 长辈友好（避免敏感话题，聚焦生活细节）
  { id: "t39", text: "您年轻时最常吃的一顿饭是什么样的?", tags: ["回忆", "适合全家"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true },
  { id: "t40", text: "您觉得我们这道菜还可以怎么改一下更好?", tags: ["美食", "适合全家"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true },
  { id: "t41", text: "最近哪部剧 / 哪首老歌让您一听就有感觉?", tags: ["回忆", "适合全家"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true },
  { id: "t42", text: "下次想去公园 / 老街转转的话,带哪一段?", tags: ["旅行", "适合全家"], audiences: ["全家", "长辈友好"], familyFriendly: true, elderFriendly: true },

  // 情侣 / 双人 / 朋友 - 偏深聊（仍避免敏感）
  { id: "t43", text: "下半年有没有特别想一起完成的一件小事?", tags: ["深聊一点"], audiences: ["情侣", "双人", "朋友"], familyFriendly: true },
  { id: "t44", text: "我们认识到现在,你印象最深的一次出门是哪一次?", tags: ["回忆", "深聊一点"], audiences: ["情侣", "双人", "朋友"], familyFriendly: true },
  { id: "t45", text: "假如未来一年可以一起养成一个新习惯,你想养什么?", tags: ["深聊一点"], audiences: ["情侣", "双人"], familyFriendly: true },
  { id: "t46", text: "最近有没有什么事是你想跟我说但还没说的?", tags: ["深聊一点"], audiences: ["情侣"], familyFriendly: true },
  { id: "t47", text: "我们两个人最适合一起做什么?最不适合一起做什么?", tags: ["轻松开场", "深聊一点"], audiences: ["情侣", "双人"], familyFriendly: true },

  // 朋友群（话题性、低争议）
  { id: "t48", text: "下个月攒一次饭局,你最想叫上谁?", tags: ["轻松开场"], audiences: ["朋友"], familyFriendly: true },
  { id: "t49", text: "最近有没有什么神器/小工具改变了生活?", tags: ["轻松开场", "兴趣"], audiences: ["朋友", "情侣", "全家"], familyFriendly: true, elderFriendly: true },
  { id: "t50", text: "你觉得我们这桌人各点一道菜的话,能拼出一桌好菜吗?", tags: ["美食", "轻松开场", "适合全家"], audiences: ["全家", "朋友"], familyFriendly: true, kidSafe: true, elderFriendly: true },
  { id: "t51", text: "如果做一档我们朋友圈的小综艺,主题会是什么?", tags: ["轻松开场", "兴趣"], audiences: ["朋友"], familyFriendly: true },
  { id: "t52", text: "回头看,这一年最值得保留的一件小事是?", tags: ["回忆", "深聊一点"], audiences: ["情侣", "双人", "朋友", "全家"], familyFriendly: true, elderFriendly: true },
  { id: "t53", text: "如果可以送一份不超过 50 元的礼物给桌上的人,你会送什么?", tags: ["适合全家", "轻松开场"], audiences: ["全家", "朋友", "情侣"], familyFriendly: true, kidSafe: true, elderFriendly: true },
];

// === 音频：有声书 / 播客 / 故事 / 助眠 ===
export const AUDIO_ITEMS: AudioItem[] = [
  // —— 有声书 / 长篇 ——
  { id: "a1", title: "三体 (有声书)", type: "有声书", why: "做饭长时间空窗期一边听一边沉浸,适合周末。", length: "长", audiences: ["单人", "双人"], tags: ["故事", "做饭背景"] },
  { id: "a2", title: "活着 余华 (有声书)", type: "有声书", why: "中文当代经典,听着情感很厚重。", length: "长", audiences: ["单人", "双人"], tags: ["故事", "情感"] },
  { id: "a3", title: "明朝那些事儿 (有声书)", type: "有声书", why: "历史口述风,做饭听一两章不无聊。", length: "长", audiences: ["单人", "双人", "长辈友好"], tags: ["历史", "做饭背景"], elderFriendly: true },
  { id: "a4", title: "百年孤独 (有声书)", type: "有声书", why: "节奏慢,长时间慢炖时配最合适。", length: "长", audiences: ["单人", "双人"], tags: ["故事", "情感"] },
  { id: "a5", title: "围城 (有声书)", type: "有声书", why: "钱锺书冷幽默,做饭也能笑出声。", length: "长", audiences: ["单人", "双人"], tags: ["故事", "搞笑"] },
  { id: "a6", title: "解忧杂货店 (有声书)", type: "有声书", why: "短篇治愈日系故事,做菜不闷。", length: "中", audiences: ["单人", "双人", "情侣"], tags: ["故事", "情感"] },
  { id: "a7", title: "霍乱时期的爱情 (有声书)", type: "有声书", why: "周末长时间烹饪的好搭档。", length: "长", audiences: ["单人", "双人"], tags: ["故事", "情感"] },
  { id: "a8", title: "盗墓笔记 (有声书)", type: "有声书", why: "做饭听悬疑,时间过得飞快。", length: "长", audiences: ["单人", "朋友"], tags: ["悬疑", "故事"] },

  // —— 中文播客 ——
  { id: "a9", title: "故事 FM", type: "播客", why: "普通人讲自己的故事,真实而平和。", length: "中", audiences: ["单人", "双人"], tags: ["故事", "情感", "做饭背景"] },
  { id: "a10", title: "日谈公园", type: "播客", why: "聊电影聊综艺聊生活,做饭很轻松。", length: "中", audiences: ["单人", "双人", "朋友"], tags: ["搞笑", "做饭背景"] },
  { id: "a11", title: "无聊斋", type: "播客", why: "笑点稳定,适合做菜不想动脑筋。", length: "中", audiences: ["单人", "双人"], tags: ["搞笑", "做饭背景"] },
  { id: "a12", title: "声东击西", type: "播客", why: "话题广,适合一边做饭一边吸收信息。", length: "中", audiences: ["单人", "双人"], tags: ["轻知识", "人文"] },
  { id: "a13", title: "忽左忽右", type: "播客", why: "深度访谈,周末慢炖时听刚刚好。", length: "长", audiences: ["单人", "双人"], tags: ["人文", "轻知识"] },
  { id: "a14", title: "随机波动", type: "播客", why: "三位女性主播的对谈,生活感强。", length: "中", audiences: ["单人", "双人", "朋友"], tags: ["人文", "情感"] },
  { id: "a15", title: "枫言枫语", type: "播客", why: "科技产品 + 数字生活闲谈,节奏舒服。", length: "中", audiences: ["单人"], tags: ["轻知识", "做饭背景"] },
  { id: "a16", title: "文化有限", type: "播客", why: "聊书聊电影,做菜时充电不上头。", length: "中", audiences: ["单人", "双人"], tags: ["人文", "做饭背景"] },
  { id: "a17", title: "展开讲讲", type: "播客", why: "硬核展开但不晦涩,周末长时间做饭。", length: "长", audiences: ["单人"], tags: ["轻知识", "人文"] },
  { id: "a18", title: "搞钱女孩", type: "播客", why: "都市女性主题日常播客。", length: "中", audiences: ["单人", "双人", "朋友"], tags: ["情感", "做饭背景"] },

  // —— 历史 / 知识 ——
  { id: "a19", title: "看理想·历史专栏", type: "知识", why: "短小好懂的历史故事,做饭一起补课。", length: "中", audiences: ["单人", "双人", "长辈友好"], tags: ["历史", "轻知识"], elderFriendly: true },
  { id: "a20", title: "袁腾飞讲历史", type: "知识", why: "口语化讲历史,吸收成本低。", length: "中", audiences: ["单人", "长辈友好"], tags: ["历史"], elderFriendly: true },
  { id: "a21", title: "易中天品三国", type: "知识", why: "经典通俗历史讲述,适合长辈一起听。", length: "长", audiences: ["全家", "长辈友好"], tags: ["历史"], elderFriendly: true },
  { id: "a22", title: "蒋勋说红楼梦", type: "知识", why: "温柔慢速,做饭背景音的天花板。", length: "长", audiences: ["单人", "双人", "长辈友好"], tags: ["人文", "助眠"], elderFriendly: true },
  { id: "a23", title: "吴晓波频道", type: "知识", why: "财经历史轻八卦,做菜补课。", length: "中", audiences: ["单人", "双人"], tags: ["轻知识", "历史"] },
  { id: "a24", title: "高晓松·晓说精选", type: "知识", why: "天南地北闲谈,做饭很解闷。", length: "中", audiences: ["单人", "长辈友好"], tags: ["人文", "做饭背景"], elderFriendly: true },

  // —— 亲子 / 儿童 ——
  { id: "a25", title: "凯叔讲故事·西游记", type: "故事", why: "孩子最爱的睡前 / 做饭背景音。", length: "短", audiences: ["儿童友好", "全家"], tags: ["亲子", "故事"], kidSafe: true },
  { id: "a26", title: "凯叔·三国演义", type: "故事", why: "比原著好懂,孩子也能跟得上。", length: "中", audiences: ["儿童友好", "全家"], tags: ["亲子", "历史"], kidSafe: true },
  { id: "a27", title: "米小圈上学记", type: "故事", why: "孩子专属热门故事,做晚饭刚刚好。", length: "短", audiences: ["儿童友好", "全家"], tags: ["亲子", "搞笑"], kidSafe: true },
  { id: "a28", title: "贝瓦儿歌", type: "音乐", why: "幼儿期最稳的背景音。", length: "短", audiences: ["儿童友好", "全家"], tags: ["亲子"], kidSafe: true },
  { id: "a29", title: "睡前故事·王二小系列", type: "故事", why: "传统故事合集,适合给孩子听。", length: "短", audiences: ["儿童友好", "全家"], tags: ["亲子", "故事"], kidSafe: true },
  { id: "a30", title: "鼹鼠的故事", type: "故事", why: "短小温柔,做完饭也刚好讲完。", length: "短", audiences: ["儿童友好", "全家"], tags: ["亲子"], kidSafe: true },

  // —— 短音频 / 快手菜 / 助眠 ——
  { id: "a31", title: "新闻早班车 (得到)", type: "知识", why: "10 分钟左右一期,煎个蛋的功夫听完。", length: "短", audiences: ["单人"], tags: ["轻知识"] },
  { id: "a32", title: "得到·每天听本书", type: "知识", why: "20 分钟一本书,快手菜时间刚好。", length: "短", audiences: ["单人", "双人"], tags: ["轻知识", "做饭背景"] },
  { id: "a33", title: "5 分钟英文晨读", type: "知识", why: "做早餐的短窗口最合适。", length: "短", audiences: ["单人"], tags: ["轻知识"] },
  { id: "a34", title: "白噪音·咖啡馆", type: "助眠", why: "纯背景音,只想专心切菜时用。", length: "中", audiences: ["单人", "双人"], tags: ["助眠", "做饭背景"] },
  { id: "a35", title: "钢琴版流行金曲", type: "音乐", why: "做菜不分散注意力,长辈也喜欢。", length: "中", audiences: ["单人", "全家", "长辈友好"], tags: ["做饭背景"], elderFriendly: true },
  { id: "a36", title: "Lo-fi Hip Hop Beats", type: "音乐", why: "做饭白噪音首选,效率拉满。", length: "中", audiences: ["单人", "双人"], tags: ["做饭背景"] },
  { id: "a37", title: "邓丽君经典金曲", type: "音乐", why: "长辈非常受用的经典金曲。", length: "中", audiences: ["全家", "长辈友好"], tags: ["做饭背景"], elderFriendly: true },
  { id: "a38", title: "周深 / 毛不易精选", type: "音乐", why: "温柔人声,合家欢氛围。", length: "中", audiences: ["全家", "长辈友好"], tags: ["做饭背景"], elderFriendly: true },

  // —— 情感 / 故事 ——
  { id: "a39", title: "声音碎片·睡前", type: "助眠", why: "节奏极慢,适合慢炖锅守候时段。", length: "中", audiences: ["单人"], tags: ["助眠"] },
  { id: "a40", title: "蒋勋·美的沉思", type: "知识", why: "美学慢讲,周末厨房氛围拉满。", length: "长", audiences: ["单人", "双人"], tags: ["人文", "做饭背景"] },
  { id: "a41", title: "我是郭杰瑞", type: "播客", why: "美食与文化轻知识,做菜搭话题。", length: "中", audiences: ["单人", "双人", "全家"], tags: ["轻知识", "做饭背景"], elderFriendly: false },
  { id: "a42", title: "无人之地·悬疑短篇", type: "故事", why: "10 分钟一个悬疑短篇,情节紧凑。", length: "短", audiences: ["单人"], tags: ["悬疑", "故事"] },
];
