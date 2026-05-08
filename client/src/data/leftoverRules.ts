// F3 — 剩菜变花样 静态规则表
// 数据完全本地，无外部依赖。
// 每条规则匹配若干"剩菜关键字"，给出 2-5 个可执行变形方案。
// MVP 覆盖 30+ 种常见剩菜 + 通用兜底，每个方案含 3-5 步做法。

export type RemixDifficulty = "easy" | "medium" | "hard";

export interface RemixOption {
  id: string;
  /** 变形后菜名 */
  title: string;
  /** 一句话说明 */
  description: string;
  difficulty: RemixDifficulty;
  /** 额外耗时（分钟） */
  extraMinutes: number;
  /** 还需要的额外食材（标准名 + 是否可选） */
  additionalIngredients: { name: string; optional?: boolean }[];
  /** 简化做法（3-5 步） */
  steps: string[];
  /** 场景标签（"省时/下饭/暖胃/解腻/孩子爱"） */
  tags: string[];
}

export interface LeftoverRule {
  /** 匹配关键词（任一命中即触发） */
  keywords: string[];
  /** 变形方案 */
  remixes: RemixOption[];
  /** 说明剩菜本身的提示（可选） */
  note?: string;
}

export const LEFTOVER_RULES: LeftoverRule[] = [
  // ===== 红烧 / 卤味肉类 =====
  {
    keywords: ["红烧肉", "卤肉", "扣肉", "梅菜扣肉", "东坡肉"],
    remixes: [
      {
        id: "rbr-noodle",
        title: "红烧肉拌面",
        description: "把肉和汤汁直接当浇头，5 分钟搞定",
        difficulty: "easy",
        extraMinutes: 8,
        additionalIngredients: [
          { name: "面条" },
          { name: "葱", optional: true },
          { name: "青菜", optional: true },
        ],
        steps: [
          "煮一锅水，下面条至断生捞出",
          "锅里把红烧肉连汤汁加热，火不要太大",
          "汤汁浇在面上，肉块铺面",
          "撒葱花，可烫一把青菜垫底",
        ],
        tags: ["省时", "下饭", "解馋"],
      },
      {
        id: "rbr-rice",
        title: "梅菜扣肉饭",
        description: "加一把梅干菜上锅蒸 20 分钟，秒变卤肉饭",
        difficulty: "medium",
        extraMinutes: 25,
        additionalIngredients: [
          { name: "梅干菜" },
          { name: "米饭" },
        ],
        steps: [
          "梅干菜冷水泡发 10 分钟，挤干切碎",
          "把红烧肉切片铺在小碗底，梅菜铺在上面",
          "倒入原汤汁，上锅大火蒸 20 分钟",
          "倒扣到米饭上",
        ],
        tags: ["节约", "下饭", "家常"],
      },
      {
        id: "rbr-bun",
        title: "红烧肉夹馍 / 包子",
        description: "馒头从中间切开夹进去，秒变夜宵",
        difficulty: "easy",
        extraMinutes: 6,
        additionalIngredients: [
          { name: "馒头" },
          { name: "黄瓜", optional: true },
          { name: "香菜", optional: true },
        ],
        steps: [
          "馒头蒸热，从中间剖开",
          "红烧肉切碎，淋一点原汤",
          "夹进馒头，再加点黄瓜丝/香菜增加层次",
        ],
        tags: ["省时", "夜宵"],
      },
      {
        id: "rbr-stewed-veggies",
        title: "红烧肉烧土豆/萝卜",
        description: "倒回锅，加几样耐炖的菜再焖一锅",
        difficulty: "medium",
        extraMinutes: 25,
        additionalIngredients: [
          { name: "土豆" },
          { name: "胡萝卜", optional: true },
        ],
        steps: [
          "土豆胡萝卜切大块",
          "锅里下红烧肉与原汤，加水没过菜",
          "中小火炖 20 分钟，收汁出锅",
        ],
        tags: ["全家", "下饭"],
      },
    ],
  },

  // ===== 鸡肉类 =====
  {
    keywords: ["白切鸡", "盐焗鸡", "卤鸡", "口水鸡", "鸡腿", "蒸鸡"],
    remixes: [
      {
        id: "ck-congee",
        title: "鸡肉粥",
        description: "撕成丝煮到米软烂，清淡暖胃",
        difficulty: "easy",
        extraMinutes: 25,
        additionalIngredients: [
          { name: "米饭" },
          { name: "姜", optional: true },
          { name: "葱", optional: true },
        ],
        steps: [
          "米饭加 4 倍水，大火煮开",
          "改小火煮 15-20 分钟至粘稠",
          "鸡肉撕丝下锅再煮 3 分钟",
          "加盐、姜丝、葱花调味",
        ],
        tags: ["清淡", "暖胃", "老人友好"],
      },
      {
        id: "ck-noodle",
        title: "鸡丝拌面",
        description: "面条 + 鸡丝 + 黄瓜，夏天一拌就好",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [
          { name: "面条" },
          { name: "黄瓜", optional: true },
        ],
        steps: [
          "面条煮熟过冷水",
          "鸡肉撕成丝，黄瓜切丝",
          "用酱油+醋+香油+糖+蒜末调汁",
          "面条铺底，鸡丝黄瓜摆面，淋汁拌匀",
        ],
        tags: ["夏天", "清爽", "快手"],
      },
      {
        id: "ck-sandwich",
        title: "鸡肉三明治",
        description: "撕鸡丝拌沙拉酱，夹面包带饭都行",
        difficulty: "easy",
        extraMinutes: 5,
        additionalIngredients: [
          { name: "面包" },
          { name: "生菜", optional: true },
          { name: "番茄", optional: true },
        ],
        steps: [
          "鸡丝撕碎，与少许沙拉酱、黑胡椒拌匀",
          "面包铺生菜，加入鸡肉沙拉",
          "盖上另一片面包，对角切开",
        ],
        tags: ["带饭", "孩子爱"],
      },
    ],
  },

  // ===== 米饭 =====
  {
    keywords: ["米饭", "剩饭", "白饭"],
    note: "剩米饭炒比新饭更香，颗粒分明",
    remixes: [
      {
        id: "rice-fried",
        title: "蛋炒饭",
        description: "经典中的经典 — 隔夜饭专属",
        difficulty: "easy",
        extraMinutes: 8,
        additionalIngredients: [
          { name: "鸡蛋" },
          { name: "葱", optional: true },
          { name: "胡萝卜", optional: true },
        ],
        steps: [
          "鸡蛋打散加少许盐",
          "热锅热油，倒入蛋液炒至七分熟，盛出",
          "锅留底油，下饭翻炒至颗粒分明",
          "加回鸡蛋、葱花，盐少许出锅",
        ],
        tags: ["经典", "快手", "省钱"],
      },
      {
        id: "rice-baked",
        title: "焗饭",
        description: "盖上奶酪烤 10 分钟，孩子最爱",
        difficulty: "medium",
        extraMinutes: 18,
        additionalIngredients: [
          { name: "奶酪" },
          { name: "番茄酱", optional: true },
          { name: "鸡蛋", optional: true },
        ],
        steps: [
          "饭里拌点番茄酱或者剩菜碎",
          "倒入烤盘，铺上奶酪丝",
          "烤箱 200°C 烤 10-12 分钟至奶酪化开金黄",
        ],
        tags: ["孩子爱", "周末"],
      },
      {
        id: "rice-congee",
        title: "皮蛋瘦肉粥",
        description: "煮粥比干饭更顶饿、更暖",
        difficulty: "easy",
        extraMinutes: 25,
        additionalIngredients: [
          { name: "皮蛋", optional: true },
          { name: "猪肉", optional: true },
        ],
        steps: [
          "饭加 5 倍水煮开",
          "加切碎的肉末和皮蛋丁",
          "中小火煮 15 分钟至粘稠",
          "盐和白胡椒粉调味",
        ],
        tags: ["暖胃", "夜宵"],
      },
      {
        id: "rice-ball",
        title: "饭团 / 紫菜包饭",
        description: "包点剩菜做带饭",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [
          { name: "紫菜" },
          { name: "黄瓜", optional: true },
          { name: "鸡蛋", optional: true },
        ],
        steps: [
          "紫菜片铺平，铺一层米饭压平",
          "中间放黄瓜条、煎蛋条等",
          "卷起来切成段",
        ],
        tags: ["带饭", "孩子爱"],
      },
    ],
  },

  // ===== 青菜叶菜 =====
  {
    keywords: ["青菜", "白菜", "菠菜", "油菜", "生菜", "炒青菜", "上海青"],
    remixes: [
      {
        id: "veg-soup",
        title: "蔬菜豆腐汤",
        description: "加点豆腐和盐，5 分钟一锅清汤",
        difficulty: "easy",
        extraMinutes: 8,
        additionalIngredients: [{ name: "豆腐" }],
        steps: [
          "豆腐切块",
          "锅里加水煮开，加豆腐 2 分钟",
          "下剩青菜稍煮 30 秒",
          "盐和几滴香油调味",
        ],
        tags: ["清淡", "暖胃", "快手"],
      },
      {
        id: "veg-noodle-soup",
        title: "青菜面",
        description: "下一把面，连菜带汤吃饱",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [
          { name: "面条" },
          { name: "鸡蛋", optional: true },
        ],
        steps: [
          "锅烧水，下面条",
          "面条快熟时下青菜、磕个蛋",
          "盐酱油调味出锅",
        ],
        tags: ["快手", "暖胃"],
      },
      {
        id: "veg-pancake",
        title: "蔬菜煎饼",
        description: "切碎拌面糊一煎，懒人早餐",
        difficulty: "easy",
        extraMinutes: 12,
        additionalIngredients: [
          { name: "面粉" },
          { name: "鸡蛋", optional: true },
        ],
        steps: [
          "青菜切碎",
          "加鸡蛋、面粉、少水、盐拌成糊",
          "平底锅小火两面煎金黄",
        ],
        tags: ["早餐", "快手"],
      },
    ],
  },

  // ===== 鱼 =====
  {
    keywords: ["鱼", "红烧鱼", "清蒸鱼", "煎鱼", "鱼块"],
    remixes: [
      {
        id: "fish-congee",
        title: "鱼肉粥",
        description: "拆肉去骨煮粥，暖胃易消化",
        difficulty: "medium",
        extraMinutes: 25,
        additionalIngredients: [
          { name: "米饭" },
          { name: "姜", optional: true },
        ],
        steps: [
          "鱼肉细心拆出，去刺",
          "米饭加水煮粥 15 分钟",
          "下鱼肉、姜丝再煮 3 分钟",
          "盐和白胡椒调味",
        ],
        tags: ["暖胃", "老人友好"],
      },
      {
        id: "fish-fried-rice",
        title: "鱼肉炒饭",
        description: "鱼肉撕碎入饭，香味融合",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [
          { name: "米饭" },
          { name: "鸡蛋", optional: true },
        ],
        steps: [
          "鱼肉去刺撕碎",
          "蛋炒散，下饭炒散",
          "加鱼肉与原汁少许，翻炒入味",
          "盐与葱花调味",
        ],
        tags: ["快手", "下饭"],
      },
    ],
  },

  // ===== 豆腐 =====
  {
    keywords: ["豆腐", "麻婆豆腐", "家常豆腐"],
    remixes: [
      {
        id: "tofu-soup",
        title: "豆腐番茄汤",
        description: "番茄一切片，5 分钟酸鲜暖胃",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [
          { name: "番茄" },
          { name: "鸡蛋", optional: true },
        ],
        steps: [
          "番茄切块",
          "锅里少油炒番茄至出汁",
          "加水煮开，下豆腐再煮 3 分钟",
          "淋蛋花，盐和香油调味",
        ],
        tags: ["快手", "暖胃"],
      },
      {
        id: "tofu-bake",
        title: "铁板豆腐",
        description: "加点孜然辣椒粉，重新调味变下酒菜",
        difficulty: "easy",
        extraMinutes: 8,
        additionalIngredients: [{ name: "孜然", optional: true }],
        steps: [
          "豆腐切厚片",
          "平底锅热油煎两面金黄",
          "撒孜然、辣椒粉、盐，再煎一会出锅",
        ],
        tags: ["下酒", "夜宵"],
      },
    ],
  },

  // ===== 番茄炒蛋 =====
  {
    keywords: ["番茄炒蛋", "西红柿炒蛋"],
    remixes: [
      {
        id: "tomatoegg-soup",
        title: "番茄蛋花面汤",
        description: "锅里加水加面条，秒变快手汤面",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [{ name: "面条" }],
        steps: [
          "锅里加水煮开",
          "倒入剩番茄炒蛋稍煮",
          "下面条煮熟",
          "盐和香油出锅",
        ],
        tags: ["快手", "暖胃"],
      },
      {
        id: "tomatoegg-rice",
        title: "番茄蛋盖饭",
        description: "盖在米饭上，再淋点酱油",
        difficulty: "easy",
        extraMinutes: 5,
        additionalIngredients: [{ name: "米饭" }],
        steps: [
          "番茄炒蛋微波炉热透",
          "盖在米饭上",
          "淋少许生抽即可",
        ],
        tags: ["快手", "省钱"],
      },
    ],
  },

  // ===== 土豆类 =====
  {
    keywords: ["土豆", "土豆丝", "土豆片", "醋溜土豆", "酸辣土豆"],
    remixes: [
      {
        id: "potato-cake",
        title: "土豆饼",
        description: "压成泥煎金黄，孩子最爱",
        difficulty: "easy",
        extraMinutes: 12,
        additionalIngredients: [
          { name: "鸡蛋", optional: true },
          { name: "面粉", optional: true },
        ],
        steps: [
          "土豆压成泥",
          "加鸡蛋、面粉、盐拌成糊",
          "平底锅小火煎成饼，两面金黄",
        ],
        tags: ["孩子爱", "早餐"],
      },
      {
        id: "potato-soup",
        title: "土豆浓汤",
        description: "加点牛奶搅打，西式浓汤即刻",
        difficulty: "medium",
        extraMinutes: 18,
        additionalIngredients: [
          { name: "牛奶", optional: true },
          { name: "洋葱", optional: true },
        ],
        steps: [
          "土豆切碎加水煮软",
          "搅拌机打成泥（或用勺压）",
          "加少许牛奶/盐/黑胡椒调味",
          "烧开即可",
        ],
        tags: ["暖胃", "西式"],
      },
    ],
  },

  // ===== 面条/饺子 =====
  {
    keywords: ["饺子", "水饺"],
    remixes: [
      {
        id: "dumpling-pan",
        title: "煎饺",
        description: "平底锅一煎变锅贴",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [],
        steps: [
          "平底锅刷油，饺子摆好",
          "中小火煎底变金黄",
          "倒入半碗水盖盖焖至水干",
          "出锅前淋几滴油，底脆",
        ],
        tags: ["夜宵", "孩子爱"],
      },
      {
        id: "dumpling-soup",
        title: "饺子汤",
        description: "下点紫菜虾皮，秒成一碗汤饺",
        difficulty: "easy",
        extraMinutes: 8,
        additionalIngredients: [
          { name: "紫菜", optional: true },
          { name: "虾皮", optional: true },
        ],
        steps: [
          "锅烧水煮开",
          "下饺子煮至浮起",
          "撒紫菜虾皮、葱花",
          "盐胡椒香油调味",
        ],
        tags: ["快手", "暖胃"],
      },
    ],
  },
  {
    keywords: ["面条", "拌面", "炒面", "汤面"],
    remixes: [
      {
        id: "noodle-soup",
        title: "番茄鸡蛋面",
        description: "重新煮汤的方法把剩面变热汤面",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [
          { name: "番茄" },
          { name: "鸡蛋" },
        ],
        steps: [
          "锅里少油炒番茄出汁",
          "加水煮开，淋蛋液",
          "下剩面条加热入味",
          "盐和葱花出锅",
        ],
        tags: ["暖胃", "快手"],
      },
      {
        id: "noodle-fried",
        title: "干炒面",
        description: "锅里小火炒香，加酱油就好吃",
        difficulty: "easy",
        extraMinutes: 8,
        additionalIngredients: [
          { name: "鸡蛋", optional: true },
          { name: "青菜", optional: true },
        ],
        steps: [
          "锅烧热少油",
          "下面条用筷子拨散",
          "加酱油、盐、青菜炒匀",
        ],
        tags: ["快手", "下饭"],
      },
    ],
  },

  // ===== 排骨 =====
  {
    keywords: ["排骨", "糖醋排骨", "红烧排骨", "蒸排骨"],
    remixes: [
      {
        id: "rib-soup",
        title: "排骨萝卜汤",
        description: "把肉和汤汁一起加水重新炖",
        difficulty: "medium",
        extraMinutes: 30,
        additionalIngredients: [
          { name: "白萝卜" },
        ],
        steps: [
          "白萝卜切块",
          "排骨与原汤倒锅，加水没过",
          "煮开后转小火炖 25 分钟",
          "盐调味即可",
        ],
        tags: ["暖胃", "全家"],
      },
      {
        id: "rib-fried-rice",
        title: "排骨炒饭",
        description: "把肉撕碎拌饭一炒",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [{ name: "米饭" }],
        steps: [
          "排骨拆肉撕碎",
          "锅里下油，下饭炒散",
          "加肉与少许原汤翻炒",
          "盐和葱花调味",
        ],
        tags: ["快手", "下饭"],
      },
    ],
  },

  // ===== 牛肉 =====
  {
    keywords: ["牛肉", "卤牛肉", "酱牛肉", "炖牛肉", "牛腩"],
    remixes: [
      {
        id: "beef-noodle",
        title: "红烧牛肉面",
        description: "原汤煮面，街边味回家",
        difficulty: "easy",
        extraMinutes: 12,
        additionalIngredients: [
          { name: "面条" },
          { name: "青菜", optional: true },
        ],
        steps: [
          "原汤加水烧开，煮面",
          "加切片牛肉",
          "汆青菜",
          "盐与葱花调味",
        ],
        tags: ["下饭", "暖胃"],
      },
      {
        id: "beef-cold",
        title: "凉拌牛肉",
        description: "切薄片淋酱汁，下酒菜",
        difficulty: "easy",
        extraMinutes: 6,
        additionalIngredients: [
          { name: "香菜", optional: true },
          { name: "辣椒油", optional: true },
        ],
        steps: [
          "牛肉切薄片",
          "酱油+醋+蒜末+辣椒油调汁",
          "淋上拌匀",
        ],
        tags: ["下酒", "夏天"],
      },
    ],
  },

  // ===== 茄子 =====
  {
    keywords: ["茄子", "鱼香茄子", "红烧茄子", "蒸茄子"],
    remixes: [
      {
        id: "eggplant-rice",
        title: "茄子盖饭",
        description: "盖在米饭上淋汁",
        difficulty: "easy",
        extraMinutes: 5,
        additionalIngredients: [{ name: "米饭" }],
        steps: [
          "茄子加热",
          "米饭装碗",
          "茄子和汁淋上即可",
        ],
        tags: ["快手", "省钱"],
      },
    ],
  },

  // ===== 虾 =====
  {
    keywords: ["虾", "白灼虾", "盐水虾", "油焖虾"],
    remixes: [
      {
        id: "shrimp-fried-rice",
        title: "虾仁炒饭",
        description: "去壳剁碎一炒，咸鲜",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [
          { name: "米饭" },
          { name: "鸡蛋", optional: true },
        ],
        steps: [
          "虾去壳切丁",
          "蛋炒散，下饭炒散",
          "下虾肉炒香",
          "盐和葱花调味",
        ],
        tags: ["快手", "下饭"],
      },
    ],
  },

  // ===== 鱼香味 / 麻婆 =====
  {
    keywords: ["鱼香肉丝", "回锅肉", "辣子鸡"],
    remixes: [
      {
        id: "spicy-noodle",
        title: "麻辣盖浇面",
        description: "把剩菜直接盖到面上",
        difficulty: "easy",
        extraMinutes: 8,
        additionalIngredients: [{ name: "面条" }],
        steps: [
          "煮一锅面",
          "剩菜微波加热",
          "盖在面上拌匀",
        ],
        tags: ["下饭", "快手"],
      },
    ],
  },

  // ===== 小炒 / 通用蔬菜混炒 =====
  {
    keywords: ["小炒", "炒杂菜", "杂菜", "时蔬", "炒时蔬"],
    remixes: [
      {
        id: "veg-fried-rice",
        title: "蔬菜炒饭",
        description: "切碎下饭一炒就成",
        difficulty: "easy",
        extraMinutes: 8,
        additionalIngredients: [
          { name: "米饭" },
          { name: "鸡蛋", optional: true },
        ],
        steps: [
          "剩菜切碎",
          "蛋炒散下饭",
          "加菜碎翻炒",
          "盐和葱花出锅",
        ],
        tags: ["快手", "省钱"],
      },
    ],
  },

  // ===== 馒头/包子 =====
  {
    keywords: ["馒头", "花卷", "包子"],
    remixes: [
      {
        id: "mantou-fried",
        title: "炸馒头片 / 黄金馒头",
        description: "切片煎到两面金黄，蘸炼乳",
        difficulty: "easy",
        extraMinutes: 8,
        additionalIngredients: [
          { name: "鸡蛋", optional: true },
          { name: "炼乳", optional: true },
        ],
        steps: [
          "馒头切片，可裹蛋液",
          "平底锅热油煎金黄",
          "蘸炼乳或撒糖",
        ],
        tags: ["孩子爱", "早餐"],
      },
    ],
  },

  // ===== 火锅剩菜 =====
  {
    keywords: ["火锅", "麻辣烫", "涮锅"],
    remixes: [
      {
        id: "hotpot-noodle",
        title: "火锅汤面",
        description: "原汤下面，火锅第二顿",
        difficulty: "easy",
        extraMinutes: 8,
        additionalIngredients: [
          { name: "面条" },
          { name: "青菜", optional: true },
        ],
        steps: [
          "火锅汤煮开",
          "下面条煮熟",
          "加青菜烫熟出锅",
        ],
        tags: ["夜宵", "暖胃"],
      },
    ],
  },

  // ===== 沙拉 / 凉菜 =====
  {
    keywords: ["凉菜", "拌菜", "沙拉"],
    remixes: [
      {
        id: "salad-wrap",
        title: "蔬菜卷饼",
        description: "卷进薄饼里夹一夹",
        difficulty: "easy",
        extraMinutes: 5,
        additionalIngredients: [{ name: "面饼" }],
        steps: [
          "面饼平摊",
          "凉菜铺中间",
          "卷起切段",
        ],
        tags: ["快手", "带饭"],
      },
    ],
  },

  // ===== 汤 =====
  {
    keywords: ["汤", "炖汤", "鸡汤", "排骨汤"],
    remixes: [
      {
        id: "soup-noodle",
        title: "汤面 / 浇头面",
        description: "原汤下面，简单又顶饱",
        difficulty: "easy",
        extraMinutes: 10,
        additionalIngredients: [{ name: "面条" }],
        steps: [
          "原汤烧开",
          "加水适量",
          "下面条煮熟出锅",
        ],
        tags: ["快手", "暖胃"],
      },
      {
        id: "soup-rice",
        title: "汤泡饭",
        description: "饭泡进汤里，清淡养胃",
        difficulty: "easy",
        extraMinutes: 3,
        additionalIngredients: [{ name: "米饭" }],
        steps: ["米饭装碗", "原汤加热浇在饭上"],
        tags: ["老人友好", "快手"],
      },
    ],
  },
];

// 通用兜底方案：任何剩菜都可以试。
export const FALLBACK_REMIXES: RemixOption[] = [
  {
    id: "fallback-fried-rice",
    title: "万能炒饭",
    description: "切碎下饭一炒就成",
    difficulty: "easy",
    extraMinutes: 8,
    additionalIngredients: [
      { name: "米饭" },
      { name: "鸡蛋", optional: true },
    ],
    steps: [
      "剩菜切小丁",
      "蛋炒散，下饭炒散",
      "加菜碎翻炒入味",
      "盐酱油调味",
    ],
    tags: ["万能", "快手"],
  },
  {
    id: "fallback-noodle",
    title: "万能盖浇面",
    description: "煮一锅面，把剩菜倒上去",
    difficulty: "easy",
    extraMinutes: 8,
    additionalIngredients: [{ name: "面条" }],
    steps: [
      "面条煮熟捞出",
      "剩菜加热",
      "盖在面上",
    ],
    tags: ["万能", "暖胃"],
  },
  {
    id: "fallback-congee",
    title: "万能粥",
    description: "煮一锅白粥，把剩菜切碎丢进去",
    difficulty: "easy",
    extraMinutes: 25,
    additionalIngredients: [{ name: "米饭" }],
    steps: [
      "米饭加 5 倍水煮开",
      "小火煮 15 分钟",
      "下剩菜碎再煮 3 分钟",
      "盐胡椒调味",
    ],
    tags: ["万能", "暖胃", "老人友好"],
  },
  {
    id: "fallback-soup",
    title: "万能蔬菜汤",
    description: "锅里加水煮开，剩菜下锅几分钟",
    difficulty: "easy",
    extraMinutes: 8,
    additionalIngredients: [{ name: "豆腐", optional: true }],
    steps: [
      "锅烧水开",
      "下剩菜与豆腐",
      "盐与香油出锅",
    ],
    tags: ["万能", "清淡"],
  },
  {
    id: "fallback-wrap",
    title: "万能卷饼",
    description: "卷进薄饼，带饭也行",
    difficulty: "easy",
    extraMinutes: 5,
    additionalIngredients: [{ name: "面饼" }],
    steps: [
      "面饼平摊",
      "剩菜铺中间，卷起",
      "切段装盘",
    ],
    tags: ["万能", "带饭"],
  },
];

// 常见剩菜快捷标签（剩菜变花样输入栏的快速选择）
export const COMMON_LEFTOVER_PRESETS: { label: string; emoji: string }[] = [
  { label: "红烧肉", emoji: "🍖" },
  { label: "白切鸡", emoji: "🍗" },
  { label: "清蒸鱼", emoji: "🐟" },
  { label: "番茄炒蛋", emoji: "🍅" },
  { label: "炒青菜", emoji: "🥬" },
  { label: "麻婆豆腐", emoji: "🧈" },
  { label: "米饭", emoji: "🍚" },
  { label: "排骨", emoji: "🍖" },
  { label: "牛肉", emoji: "🥩" },
  { label: "土豆丝", emoji: "🥔" },
  { label: "饺子", emoji: "🥟" },
  { label: "面条", emoji: "🍜" },
  { label: "茄子", emoji: "🍆" },
  { label: "虾", emoji: "🦐" },
  { label: "馒头", emoji: "🥐" },
  { label: "火锅", emoji: "🍲" },
  { label: "汤", emoji: "🥣" },
];
