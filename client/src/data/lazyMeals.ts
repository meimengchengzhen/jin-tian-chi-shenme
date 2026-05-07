// v7: 「今天懒人做什么」 — 60+ 懒人简餐模板。
// 设备 / 时间 / 冰箱剩什么 / 目标多维筛选；输出步骤 3-5 条 + 估价 + 估热量 + 适合谁 + 替代食材。
// 不接 AI；纯静态加权。

export type LazyEquipment =
  | "无设备"
  | "空气炸锅"
  | "电饭煲"
  | "早餐机"
  | "微波炉"
  | "一口锅";
export type LazyTime = 5 | 10 | 15 | 30;
export type LazyFridge =
  | "鸡蛋"
  | "米饭"
  | "青菜"
  | "火腿"
  | "鸡胸"
  | "速冻饺子"
  | "面条"
  | "土豆"
  | "番茄"
  | "玉米"
  | "牛奶"
  | "面包"
  | "豆腐"
  | "虾仁";
export type LazyGoal = "省钱" | "减脂" | "治愈" | "儿童" | "长辈";

export interface LazyMeal {
  id: string;
  name: string;
  emoji: string;
  /** 设备列表（命中任一即匹配） */
  equipment: LazyEquipment[];
  /** 估时（分钟） */
  minutes: number;
  /** 用到的食材（用作「冰箱剩什么」匹配） */
  uses: LazyFridge[];
  /** 适合的目标（命中任一即匹配） */
  goals: LazyGoal[];
  /** 估价（元，单人份）*/
  price: number;
  /** 估热量（kcal，单人份）*/
  calories: number;
  steps: string[];
  /** 替代食材建议 */
  swaps?: string;
  /** 一句话推荐理由 */
  reason: string;
  /** 搜索关键词（默认 = name + 做法） */
  searchQuery?: string;
}

export const LAZY_MEALS: LazyMeal[] = [
  // ==== 蛋炒饭家族 ====
  { id: "egg-fried-rice", name: "经典蛋炒饭", emoji: "🍚", equipment: ["一口锅"], minutes: 10, uses: ["鸡蛋", "米饭"], goals: ["省钱", "治愈"], price: 6, calories: 520, steps: ["剩米饭散开，鸡蛋打散加少许盐", "热油先炒蛋至嫩半熟", "下米饭翻炒，沿锅边淋一勺生抽，撒葱花"], swaps: "无米饭可换隔夜面条；无葱可省略", reason: "5 分钟救场国民炒饭；越冷的米饭越好炒。" },
  { id: "ham-fried-rice", name: "火腿玉米蛋炒饭", emoji: "🌽", equipment: ["一口锅"], minutes: 12, uses: ["鸡蛋", "米饭", "火腿", "玉米"], goals: ["省钱", "儿童"], price: 9, calories: 560, steps: ["火腿切丁，玉米解冻", "鸡蛋滑炒至嫩，盛出", "下米饭炒散，加火腿玉米，回锅鸡蛋；生抽白胡椒翻匀"], swaps: "玉米可换豌豆 / 胡萝卜丁", reason: "颜色好看小朋友爱吃，营养基本到位。" },
  { id: "chaos-fried-rice", name: "乱七八糟炒饭（清冰箱）", emoji: "🍳", equipment: ["一口锅"], minutes: 12, uses: ["鸡蛋", "米饭", "青菜", "火腿"], goals: ["省钱", "治愈"], price: 8, calories: 540, steps: ["把冰箱里能切的都切丁：火腿/青菜/胡萝卜", "鸡蛋摊成蛋皮再切丝，备用", "热油爆香蒜末，下料炒香，加米饭和蛋丝；生抽老抽各一勺翻匀"], swaps: "几乎什么都能加，唯一原则是丁要小米饭要散", reason: "懒人版「黄金炒饭」，治愈系冰箱清空神器。" },
  { id: "shrimp-fried-rice", name: "虾仁滑蛋炒饭", emoji: "🍤", equipment: ["一口锅"], minutes: 15, uses: ["鸡蛋", "米饭", "虾仁"], goals: ["治愈", "减脂"], price: 16, calories: 480, steps: ["虾仁解冻擦干，盐料酒抓匀", "热油快速滑虾至变色，盛出", "鸡蛋滑炒至嫩，下米饭翻炒，回锅虾仁，少盐白胡椒"], swaps: "无鲜虾可用速冻虾仁", reason: "扬州炒饭家庭版，蛋白足味道正。" },
  { id: "pickle-fried-rice", name: "酱瓜肉末炒饭", emoji: "🥒", equipment: ["一口锅"], minutes: 12, uses: ["鸡蛋", "米饭"], goals: ["省钱", "治愈"], price: 8, calories: 580, steps: ["酱瓜切丁，肉末用料酒抓匀", "油锅炒散肉末，下酱瓜炒香", "下米饭和蛋液，翻匀至每粒裹上蛋液"], swaps: "酱瓜可换榨菜 / 萝卜干", reason: "重口下饭，记忆中那勺童年酱瓜炒饭。" },
  { id: "tomato-egg-rice", name: "番茄鸡蛋盖饭", emoji: "🍅", equipment: ["一口锅"], minutes: 12, uses: ["鸡蛋", "米饭", "番茄"], goals: ["治愈", "儿童"], price: 7, calories: 520, steps: ["番茄切块，鸡蛋打散", "炒蛋盛出，番茄炒出汁加少许糖盐", "回锅鸡蛋，淋在热米饭上"], swaps: "可加 1 个柿子椒补色", reason: "永远的国民盖饭，10 分钟开饭。" },
  { id: "soy-rice-bowl", name: "酱油拌饭（无设备版）", emoji: "🍚", equipment: ["无设备", "微波炉"], minutes: 5, uses: ["鸡蛋", "米饭"], goals: ["省钱", "治愈"], price: 5, calories: 480, steps: ["热米饭打入一个生鸡蛋（怕生菌可用熟鸡蛋切碎）", "淋 1 勺生抽 + 半勺香油 + 少许糖", "撒葱花海苔碎拌匀"], swaps: "可加韩式辣酱变拌饭", reason: "5 分钟吃饱不动脑；全靠一勺好酱油。" },

  // ==== 空气炸锅家族 ====
  { id: "af-chicken-wing", name: "空气炸锅蜜汁鸡翅", emoji: "🍗", equipment: ["空气炸锅"], minutes: 25, uses: [], goals: ["治愈", "儿童"], price: 18, calories: 380, steps: ["鸡翅划两刀，用生抽+蜂蜜+蒜末+黑胡椒腌 15 分钟", "200°C 预热 3 分钟", "翻面 200°C 烤 12 分钟，刷一次蜜汁再烤 3 分钟"], swaps: "蜂蜜可换冰糖水 / 烧烤酱", reason: "家里来小朋友直接封神，不油烟。" },
  { id: "af-chicken-breast", name: "空气炸锅嫩鸡胸", emoji: "🥩", equipment: ["空气炸锅"], minutes: 18, uses: ["鸡胸"], goals: ["减脂"], price: 15, calories: 220, steps: ["鸡胸用盐+黑胡椒+橄榄油腌 10 分钟", "180°C 预热", "180°C 8 分钟，翻面再 4 分钟，静置 2 分钟切片"], swaps: "可裹一层蛋液+面包糠变酥皮版", reason: "高蛋白低脂，减脂期早午餐主角。" },
  { id: "af-fries", name: "空气炸锅自制薯条", emoji: "🍟", equipment: ["空气炸锅"], minutes: 22, uses: ["土豆"], goals: ["省钱", "儿童"], price: 4, calories: 320, steps: ["土豆切条泡冷水 10 分钟去淀粉", "擦干撒盐+少量油拌匀", "200°C 12 分钟，中途翻面一次"], swaps: "想脆撒一点玉米淀粉", reason: "比快餐店便宜还少 70% 油。" },
  { id: "af-toast", name: "空气炸锅厚切吐司布丁", emoji: "🍞", equipment: ["空气炸锅"], minutes: 15, uses: ["面包", "鸡蛋", "牛奶"], goals: ["治愈", "儿童"], price: 6, calories: 380, steps: ["吐司切方块，放入碗中", "鸡蛋+牛奶+少许糖打匀，淋上吐司浸 5 分钟", "180°C 烤 10 分钟，撒糖粉"], swaps: "可加葡萄干 / 切片香蕉", reason: "周末早餐机也能替代，治愈早晨。" },
  { id: "af-corn-rib", name: "空气炸锅孜然玉米排", emoji: "🌽", equipment: ["空气炸锅"], minutes: 20, uses: ["玉米"], goals: ["治愈", "省钱"], price: 5, calories: 220, steps: ["玉米切段对半再切条", "刷油撒盐+孜然+辣椒粉", "200°C 烤 15 分钟翻一次"], swaps: "怕辣不放辣椒粉就行", reason: "夜市小吃在家做，10 块钱解决夜宵。" },
  { id: "af-tofu", name: "空气炸锅椒盐豆腐", emoji: "🟨", equipment: ["空气炸锅"], minutes: 18, uses: ["豆腐"], goals: ["减脂", "长辈"], price: 6, calories: 240, steps: ["老豆腐切块拍干粉，盐+花椒粉+少油拌一下", "180°C 12 分钟", "撒葱花椒盐"], swaps: "嫩豆腐易碎，建议用老豆腐", reason: "外脆内嫩，零油烟版椒盐豆腐。" },
  { id: "af-egg-tart", name: "空气炸锅速冻蛋挞", emoji: "🥧", equipment: ["空气炸锅"], minutes: 18, uses: ["鸡蛋", "牛奶"], goals: ["治愈", "儿童"], price: 9, calories: 350, steps: ["蛋挞皮放入炸篮", "鸡蛋+牛奶+糖打匀，倒入蛋挞皮 8 分满", "200°C 烤 15 分钟"], swaps: "懒人可直接用蛋挞水", reason: "冰箱常备速冻挞皮的最佳归宿。" },
  { id: "af-shrimp", name: "空气炸锅蒜蓉虾", emoji: "🦐", equipment: ["空气炸锅"], minutes: 15, uses: ["虾仁"], goals: ["治愈"], price: 22, calories: 200, steps: ["大虾开背去虾线，用蒜末+黄油+盐填入开背处", "180°C 烤 10 分钟"], swaps: "无黄油可用橄榄油+蒜蓉酱", reason: "10 元食材烤出 50 元餐厅味。" },

  // ==== 电饭煲一锅出 ====
  { id: "rc-omurice", name: "电饭煲懒人腊肠饭", emoji: "🍱", equipment: ["电饭煲"], minutes: 35, uses: ["米饭"], goals: ["省钱", "治愈"], price: 12, calories: 580, steps: ["米淘好按正常水量，铺上腊肠片+冰冻青菜", "按煮饭键", "起锅淋一勺豉油+一点芝麻油翻匀"], swaps: "腊肠可换鸡腿肉 / 排骨", reason: "广式煲仔饭懒版，按一下键吃饱。" },
  { id: "rc-pumpkin-rice", name: "电饭煲南瓜糙米饭", emoji: "🎃", equipment: ["电饭煲"], minutes: 40, uses: ["米饭"], goals: ["减脂", "长辈"], price: 5, calories: 420, steps: ["糙米提前泡 30 分钟更软", "南瓜切块和米一起入锅，正常水量", "饭好后撒少许盐拌匀"], swaps: "南瓜可换紫薯 / 红薯", reason: "高纤维低 GI，长辈和减脂都友好。" },
  { id: "rc-chicken-rice", name: "电饭煲海南鸡饭", emoji: "🍗", equipment: ["电饭煲"], minutes: 45, uses: ["米饭", "鸡胸"], goals: ["治愈"], price: 18, calories: 560, steps: ["米炒香（可省）入锅，加姜片葱段", "鸡腿/鸡胸抹盐，搁米上一起煮", "按煮饭键；蘸料：生抽+蒜末+小米辣"], swaps: "用整鸡腿肉更嫩；鸡胸怕柴可裹保鲜膜", reason: "一锅出主菜+饭，懒得分锅。" },
  { id: "rc-congee", name: "电饭煲皮蛋瘦肉粥", emoji: "🥣", equipment: ["电饭煲"], minutes: 50, uses: ["米饭"], goals: ["长辈", "治愈"], price: 6, calories: 320, steps: ["米：水 = 1:8", "瘦肉切丝盐+生抽+淀粉抓匀", "选煮粥模式；最后 10 分钟下肉丝皮蛋"], swaps: "无瘦肉可用 1 颗鸡蛋", reason: "胃不舒服或长辈都喝得下。" },
  { id: "rc-veg-rice", name: "电饭煲菜饭", emoji: "🥬", equipment: ["电饭煲"], minutes: 35, uses: ["米饭", "青菜"], goals: ["省钱", "治愈"], price: 7, calories: 460, steps: ["上海青切碎+少量油盐拌匀", "铺在米上正常水量", "煮好淋一勺猪油翻匀（怕油可省）"], swaps: "可加香肠丁 / 虾米", reason: "上海弄堂咸菜饭升级版。" },
  { id: "rc-tomato-rice", name: "电饭煲整颗番茄饭", emoji: "🍅", equipment: ["电饭煲"], minutes: 38, uses: ["米饭", "番茄"], goals: ["治愈", "儿童"], price: 8, calories: 510, steps: ["米加少许橄榄油盐拌匀", "正中央放整颗番茄+几块培根/玉米", "按煮饭键，跳后压扁番茄拌匀"], swaps: "番茄换芒果做泰式风", reason: "INS 火过两年，懒人神器。" },

  // ==== 早餐机 / 三明治 ====
  { id: "bm-sandwich", name: "早餐机三明治三分钟", emoji: "🥪", equipment: ["早餐机", "微波炉"], minutes: 5, uses: ["面包", "鸡蛋", "火腿"], goals: ["省钱", "治愈"], price: 8, calories: 380, steps: ["三明治机预热 1 分钟", "面包+火腿+芝士+鸡蛋", "盖上压 2-3 分钟"], swaps: "无三明治机用平底锅+重物压", reason: "上班/上学路上抓一个就跑。" },
  { id: "bm-toast-egg", name: "早餐机太阳吐司", emoji: "🍳", equipment: ["早餐机"], minutes: 6, uses: ["面包", "鸡蛋"], goals: ["治愈", "儿童"], price: 6, calories: 320, steps: ["吐司挖一个圆洞", "鸡蛋打入洞里", "早餐机/平底锅煎到蛋白凝固"], swaps: "可以撒奶酪丝再焗", reason: "拍照超好看，孩子被治愈。" },
  { id: "bm-toast-set", name: "早餐机三件套", emoji: "🍞", equipment: ["早餐机"], minutes: 8, uses: ["面包", "鸡蛋", "牛奶"], goals: ["治愈"], price: 9, calories: 450, steps: ["上格煎一个鸡蛋 + 培根", "中格烤吐司", "下格热一杯牛奶；3 分钟全部就绪"], swaps: "牛奶可换豆浆 / 燕麦奶", reason: "5 分钟搞定一桌早餐，仪式感拉满。" },

  // ==== 微波炉 / 无设备 ====
  { id: "mw-oats", name: "微波炉燕麦杯", emoji: "🥣", equipment: ["微波炉", "无设备"], minutes: 5, uses: ["牛奶"], goals: ["减脂", "省钱"], price: 5, calories: 280, steps: ["即食燕麦+牛奶（或水）盖到刚没过", "微波 1 分 30 秒", "撒坚果 / 切片香蕉 / 蓝莓"], swaps: "无微波炉直接热牛奶冲", reason: "5 分钟早餐，扛饿到中午。" },
  { id: "mw-egg-cup", name: "微波炉鸡蛋杯", emoji: "🍳", equipment: ["微波炉"], minutes: 4, uses: ["鸡蛋"], goals: ["减脂", "治愈"], price: 3, calories: 180, steps: ["陶瓷杯刷油，打入鸡蛋戳一下蛋黄", "盖盘子（防爆）", "中火 50 秒，按需再 20 秒"], swaps: "可加奶酪 / 火腿丁", reason: "宿舍学生党午夜救命。" },
  { id: "mw-noodles", name: "微波炉泡面升级版", emoji: "🍜", equipment: ["微波炉"], minutes: 8, uses: ["面条", "鸡蛋", "青菜"], goals: ["省钱"], price: 6, calories: 480, steps: ["碗里放水+泡面饼+调料包", "微波 4 分钟", "打鸡蛋+菜叶再微波 2 分钟"], swaps: "泡面换乌冬 / 速冻馄饨", reason: "宿舍版「全家泡面」，心理安慰拉满。" },
  { id: "mw-sweet-potato", name: "微波炉烤红薯", emoji: "🍠", equipment: ["微波炉"], minutes: 8, uses: [], goals: ["减脂", "省钱"], price: 3, calories: 210, steps: ["红薯洗净擦干用厨房纸包", "高火 4 分钟翻面", "再 3-4 分钟，按软硬度调整"], swaps: "可改空气炸锅 200°C 25 分钟", reason: "下午饿了不犯罪。" },
  { id: "no-fruit-yog", name: "无设备水果酸奶碗", emoji: "🥝", equipment: ["无设备"], minutes: 5, uses: ["牛奶"], goals: ["减脂", "治愈"], price: 12, calories: 280, steps: ["希腊酸奶 / 普通酸奶倒碗里", "切苹果 / 蓝莓 / 香蕉", "撒燕麦片 + 蜂蜜"], swaps: "无希腊酸奶可用普通酸奶+一勺奶粉", reason: "夏天午后下午茶，DIY 更好看。" },
  { id: "no-cold-noodle", name: "无设备速食冷面", emoji: "🥢", equipment: ["无设备", "微波炉"], minutes: 8, uses: ["面条"], goals: ["治愈", "省钱"], price: 7, calories: 380, steps: ["乌冬 / 凉皮泡热水 3 分钟捞出过冷水", "调汁：醋+生抽+辣油+糖+蒜末", "放黄瓜丝、煮蛋、花生"], swaps: "面条可用任何速食面 / 米线", reason: "夏夜不开火，5 分钟搞定。" },

  // ==== 速冻升级 ====
  { id: "frz-dumpling", name: "速冻饺子升级版", emoji: "🥟", equipment: ["一口锅"], minutes: 12, uses: ["速冻饺子"], goals: ["省钱", "治愈"], price: 10, calories: 460, steps: ["水开下饺子，三沸三冷", "调料：蒜末+生抽+醋+辣油+一勺花生酱", "撒香菜葱花"], swaps: "蒸饺替代煮饺也行", reason: "1 包饺子 + 1 勺花生酱 = 米其林。" },
  { id: "frz-dumpling-pan", name: "速冻煎饺", emoji: "🍱", equipment: ["一口锅"], minutes: 15, uses: ["速冻饺子"], goals: ["治愈", "儿童"], price: 12, calories: 540, steps: ["平底锅刷油，整齐码饺子", "倒水到饺子 1/3 高，盖盖", "水将干时撒一点干面粉水，再煎 1 分钟出脆底"], swaps: "脆底面粉水：1 大勺面粉 + 100ml 水", reason: "脆底冰花饺，秒变小吃店。" },
  { id: "frz-mochi", name: "微波炉糯米丸子", emoji: "🍡", equipment: ["微波炉", "一口锅"], minutes: 10, uses: [], goals: ["治愈", "儿童"], price: 8, calories: 320, steps: ["速冻糯米丸子煮 5 分钟浮起捞出", "蘸花生芝麻糖 / 黄豆面", "可淋红豆汁"], swaps: "无微波炉直接锅煮", reason: "下午茶治愈系小食。" },
  { id: "frz-baozi", name: "速冻包子救场", emoji: "🥟", equipment: ["微波炉", "一口锅"], minutes: 10, uses: [], goals: ["省钱", "治愈"], price: 6, calories: 360, steps: ["蒸锅水开蒸 8 分钟", "或微波垫湿厨房纸 3 分钟", "配一碗紫菜蛋花汤"], swaps: "汤可用速食紫菜包冲泡", reason: "起晚十分钟也能开早餐。" },

  // ==== 一口锅快手菜 ====
  { id: "pan-tomato-egg-noodle", name: "一口锅番茄鸡蛋面", emoji: "🍜", equipment: ["一口锅"], minutes: 15, uses: ["面条", "番茄", "鸡蛋"], goals: ["省钱", "治愈"], price: 8, calories: 540, steps: ["番茄切块炒出汁加水", "汤滚下面条，5 分钟", "打入鸡蛋，撒葱花生抽"], swaps: "可加香肠 / 火腿丁", reason: "全家共识的童年味。" },
  { id: "pan-mapo-tofu", name: "一口锅麻婆豆腐", emoji: "🟥", equipment: ["一口锅"], minutes: 18, uses: ["豆腐"], goals: ["省钱", "治愈"], price: 10, calories: 380, steps: ["豆腐焯盐水", "肉末+豆瓣酱炒红油", "下豆腐+花椒+水煮 5 分钟，水淀粉收汁"], swaps: "肉末可省，做素麻婆", reason: "下饭无敌，一口锅一道菜。" },
  { id: "pan-fish-cabbage", name: "一口锅炝炒包菜火腿", emoji: "🥬", equipment: ["一口锅"], minutes: 10, uses: ["火腿", "青菜"], goals: ["省钱", "减脂"], price: 6, calories: 220, steps: ["包菜手撕，火腿切片", "热油爆蒜+干辣椒", "下包菜大火快炒，加火腿+生抽"], swaps: "包菜可换大白菜 / 圆白菜", reason: "5 分钟快手素菜，下饭。" },
  { id: "pan-egg-tomato-soup", name: "一口锅番茄蛋汤", emoji: "🍲", equipment: ["一口锅"], minutes: 10, uses: ["番茄", "鸡蛋"], goals: ["治愈", "长辈"], price: 5, calories: 160, steps: ["番茄炒出汁加 2 碗水煮开", "鸡蛋打散沿筷淋入", "盐+葱花+几滴香油"], swaps: "可加紫菜 / 海带", reason: "暖胃必杀技；老人小孩都能喝。" },
  { id: "pan-chicken-rice-noodle", name: "一口锅鸡丝米线", emoji: "🍜", equipment: ["一口锅"], minutes: 18, uses: ["鸡胸"], goals: ["减脂", "治愈"], price: 12, calories: 380, steps: ["鸡胸煮熟撕丝", "米线烫熟", "调汤：鸡汤+少许酱油+白胡椒，撒葱花香菜"], swaps: "米线可换粉丝 / 河粉", reason: "云南风味在家版，清淡又满足。" },
  { id: "pan-onion-pork", name: "一口锅洋葱猪肉片", emoji: "🍳", equipment: ["一口锅"], minutes: 12, uses: [], goals: ["省钱"], price: 14, calories: 480, steps: ["猪肉片用盐酒淀粉腌 5 分钟", "热油下肉片滑炒变色盛出", "炒洋葱回锅肉片，生抽蚝油翻匀"], swaps: "洋葱可换青椒 / 韭菜", reason: "10 分钟下饭硬菜，超下饭。" },
  { id: "pan-cabbage-tofu-soup", name: "一口锅白菜豆腐汤", emoji: "🥣", equipment: ["一口锅"], minutes: 15, uses: ["豆腐", "青菜"], goals: ["长辈", "减脂"], price: 6, calories: 180, steps: ["白菜切段，豆腐切块", "锅烧水加 2 片姜煮开", "下白菜豆腐煮 8 分钟，盐胡椒粉调味"], swaps: "可加虾皮 / 蛋花", reason: "极清淡极养胃，长辈友好。" },

  // ==== 拌饭 / 拌面 / 沙拉 ====
  { id: "bibim-rice", name: "韩式拌饭懒人版", emoji: "🍚", equipment: ["微波炉", "一口锅"], minutes: 12, uses: ["米饭", "鸡蛋"], goals: ["治愈"], price: 10, calories: 540, steps: ["米饭微波热透", "撒胡萝卜丝、菠菜、火腿、煎蛋", "韩式辣酱 1 大勺 + 香油拌匀"], swaps: "无辣酱用蚝油+一点辣油", reason: "热乎拌饭，5 种颜色照亮一天。" },
  { id: "noodle-cold-sesame", name: "麻酱凉面", emoji: "🥢", equipment: ["一口锅"], minutes: 10, uses: ["面条"], goals: ["治愈", "省钱"], price: 7, calories: 460, steps: ["面条煮熟过凉水", "麻酱用温水化开+生抽+醋+糖", "黄瓜丝+花生碎+香菜拌"], swaps: "麻酱可换花生酱", reason: "夏天最爱，凉爽有蛋白。" },
  { id: "salad-chicken", name: "鸡胸沙拉碗", emoji: "🥗", equipment: ["无设备", "空气炸锅"], minutes: 15, uses: ["鸡胸"], goals: ["减脂"], price: 18, calories: 380, steps: ["鸡胸空气炸 / 平底锅煎熟切片", "生菜+小番茄+玉米+鹰嘴豆", "油醋汁 / 千岛酱"], swaps: "鸡胸换鸡蛋更省钱", reason: "减脂期主餐神器。" },
  { id: "salad-tuna", name: "金枪鱼罐头拌饭", emoji: "🐟", equipment: ["无设备", "微波炉"], minutes: 5, uses: ["米饭"], goals: ["减脂", "省钱"], price: 12, calories: 480, steps: ["热米饭打底", "金枪鱼罐头沥干扣上", "韩式辣酱 / 海苔碎 / 一颗温泉蛋拌匀"], swaps: "无温泉蛋直接打生鸡蛋（注意菌）", reason: "学生党 5 分钟救命。" },

  // ==== 治愈 / 长辈 / 儿童 专题 ====
  { id: "soup-chicken-corn", name: "玉米鸡腿汤（治愈）", emoji: "🥣", equipment: ["电饭煲", "一口锅"], minutes: 40, uses: ["玉米"], goals: ["治愈", "长辈"], price: 14, calories: 320, steps: ["鸡腿焯水", "电饭煲煮汤模式：鸡腿+玉米+胡萝卜+姜片", "煮好撒盐和葱花"], swaps: "压力锅可缩短到 20 分钟", reason: "受了委屈喝一碗，治愈。" },
  { id: "soup-pumpkin-millet", name: "南瓜小米粥（长辈）", emoji: "🎃", equipment: ["电饭煲", "一口锅"], minutes: 35, uses: [], goals: ["长辈", "治愈"], price: 4, calories: 240, steps: ["南瓜切块和小米一起煮", "电饭煲煮粥模式 / 砂锅小火 30 分钟", "可加少量冰糖"], swaps: "可加红枣 / 桂圆", reason: "暖胃易消化，给爸妈最佳。" },
  { id: "soup-pork-rib-radish", name: "白萝卜排骨汤（长辈）", emoji: "🍲", equipment: ["电饭煲", "一口锅"], minutes: 60, uses: [], goals: ["长辈"], price: 22, calories: 380, steps: ["排骨焯水", "电饭煲煮汤模式：排骨+萝卜块+姜片+少量料酒", "煮好撒盐胡椒葱花"], swaps: "可加玉米段 / 山药", reason: "周末给老人煲一锅。" },
  { id: "kid-cheese-rice", name: "芝士焗饭（儿童）", emoji: "🧀", equipment: ["空气炸锅", "微波炉"], minutes: 18, uses: ["米饭"], goals: ["儿童", "治愈"], price: 12, calories: 580, steps: ["米饭+番茄酱 1 大勺+少许牛奶拌匀", "铺火腿粒+青豆+玉米", "撒马苏里拉芝士，180°C 烤 10 分钟"], swaps: "无奶酪用咸蛋黄碎也好吃", reason: "孩子见到芝士就乖。" },
  { id: "kid-pancake", name: "鸡蛋小饼（儿童）", emoji: "🥞", equipment: ["一口锅"], minutes: 12, uses: ["鸡蛋", "牛奶"], goals: ["儿童", "治愈"], price: 6, calories: 320, steps: ["面粉 + 牛奶 + 鸡蛋调成稀面糊", "胡萝卜丝 / 火腿丁拌入", "平底锅小火两面煎黄"], swaps: "无牛奶用清水也行", reason: "饱腹又营养，DIY 早餐绘本。" },

  // ==== 减脂高蛋白 ====
  { id: "fit-egg-white", name: "蛋白炒蛋三色蔬", emoji: "🥗", equipment: ["一口锅"], minutes: 10, uses: ["鸡蛋"], goals: ["减脂"], price: 8, calories: 240, steps: ["3 个蛋白 + 1 个全蛋打散", "热锅少油下西兰花+彩椒+玉米", "倒蛋液炒散；少盐黑胡椒"], swaps: "蔬菜随你换", reason: "蛋白质 25g，脂肪低。" },
  { id: "fit-shrimp-broc", name: "西兰花虾仁（减脂）", emoji: "🥦", equipment: ["一口锅"], minutes: 12, uses: ["虾仁"], goals: ["减脂"], price: 18, calories: 260, steps: ["西兰花焯水 1 分钟", "虾仁滑炒变色", "下西兰花翻炒，蒜蓉+少许蚝油"], swaps: "无虾仁用鸡胸丁", reason: "高蛋白低油，颜色还好看。" },
  { id: "fit-konjac-noodle", name: "魔芋面拌鸡丝", emoji: "🍜", equipment: ["一口锅", "微波炉"], minutes: 10, uses: ["鸡胸"], goals: ["减脂"], price: 12, calories: 220, steps: ["魔芋面冲洗沥干", "鸡胸煮熟撕丝", "生抽+醋+辣油+蒜末拌匀"], swaps: "可加黄瓜丝 / 海苔丝", reason: "减脂期碳水救星。" },

  // ==== 治愈系夜宵 ====
  { id: "midnight-instant-pot", name: "宿舍版速食锅", emoji: "🍲", equipment: ["微波炉"], minutes: 8, uses: ["速冻饺子", "面条"], goals: ["治愈", "省钱"], price: 8, calories: 480, steps: ["大碗放水+速食骨汤块", "下面条 / 饺子+青菜", "微波 5-6 分钟"], swaps: "无骨汤块用 1 勺鸡精", reason: "学生党深夜救命。" },
  { id: "midnight-cheese-bread", name: "微波炉芝士面包", emoji: "🥖", equipment: ["微波炉"], minutes: 3, uses: ["面包"], goals: ["治愈"], price: 7, calories: 380, steps: ["面包片放奶酪丝", "微波 30 秒至化开", "撒胡椒/蜂蜜"], swaps: "可加几片火腿", reason: "3 分钟治愈，零失败。" },
  { id: "midnight-banana-milk", name: "热牛奶+香蕉助眠", emoji: "🥛", equipment: ["微波炉"], minutes: 3, uses: ["牛奶"], goals: ["治愈", "长辈"], price: 4, calories: 240, steps: ["牛奶微波 1 分 30 秒", "切香蕉片或撒燕麦", "蜂蜜调甜"], swaps: "无微波直接喝常温", reason: "失眠时喝一杯，安心。" },

  // ==== 加餐 ====
  { id: "snack-egg-tofu", name: "凉拌内酯豆腐（5 分钟）", emoji: "🟨", equipment: ["无设备"], minutes: 5, uses: ["豆腐"], goals: ["减脂", "治愈"], price: 4, calories: 180, steps: ["内酯豆腐倒扣盘子", "撒榨菜碎/葱花/虾皮", "淋生抽+香油"], swaps: "皮蛋豆腐 = 加皮蛋", reason: "夏天 5 分钟下饭凉菜。" },
  { id: "snack-green-veg", name: "白灼时蔬（10 分钟）", emoji: "🥬", equipment: ["一口锅"], minutes: 10, uses: ["青菜"], goals: ["减脂", "长辈"], price: 5, calories: 120, steps: ["水开下蔬菜烫 1 分钟", "捞出码盘", "蒸鱼豉油+热油激蒜末浇上"], swaps: "蔬菜任意：菜心/生菜/油麦菜", reason: "粤式做法，原味又下饭。" },
  { id: "egg-soy-ricecake", name: "韩式年糕辣炒（速食版）", emoji: "🍢", equipment: ["一口锅"], minutes: 15, uses: ["火腿"], goals: ["治愈"], price: 10, calories: 520, steps: ["年糕条泡热水", "锅里水+韩式辣酱+番茄酱+糖煮开", "下年糕+鱼饼+火腿煮 3-5 分钟，撒芝士"], swaps: "无年糕用速食乌冬", reason: "10 分钟亚洲街边小吃。" },
  { id: "rc-mushroom-rice", name: "电饭煲菌菇饭", emoji: "🍄", equipment: ["电饭煲"], minutes: 38, uses: ["米饭"], goals: ["治愈"], price: 9, calories: 460, steps: ["杏鲍菇+香菇切块用油盐生抽腌 5 分钟", "铺在米上正常水量煮", "撒葱花和黑胡椒"], swaps: "可加培根 / 鸡腿粒", reason: "素食友好，香气扑鼻。" },
  { id: "af-banana", name: "空气炸锅烤香蕉", emoji: "🍌", equipment: ["空气炸锅"], minutes: 12, uses: [], goals: ["治愈", "儿童"], price: 4, calories: 180, steps: ["香蕉对半切，刷一点黄油", "180°C 烤 8 分钟", "撒肉桂粉/淋蜂蜜"], swaps: "无黄油用花生酱", reason: "下午茶级甜点，0 添加。" },
  { id: "no-overnight-oats", name: "隔夜燕麦杯（无设备）", emoji: "🥣", equipment: ["无设备"], minutes: 5, uses: ["牛奶"], goals: ["减脂", "省钱"], price: 6, calories: 320, steps: ["前一晚燕麦 + 牛奶 + 奇亚籽 + 蜂蜜入罐", "冷藏 8 小时", "早起加水果坚果即食"], swaps: "牛奶可换酸奶 / 燕麦奶", reason: "早晨无需任何设备的早餐。" },
  { id: "pan-shredded-pot", name: "土豆丝下饭（10 分钟）", emoji: "🥔", equipment: ["一口锅"], minutes: 10, uses: ["土豆"], goals: ["省钱"], price: 4, calories: 280, steps: ["土豆刨丝泡水沥干", "热油爆蒜+干辣椒", "下土豆丝大火快炒+醋+盐"], swaps: "可加青椒丝", reason: "5 块钱解决一顿，下饭。" },
  { id: "soup-instant-misos", name: "5 分钟味增汤", emoji: "🍵", equipment: ["微波炉", "一口锅"], minutes: 5, uses: ["豆腐"], goals: ["治愈", "减脂"], price: 4, calories: 80, steps: ["碗里 1 大勺味增 + 热水", "加豆腐丁、海带丝、葱花", "微波 30 秒搅匀"], swaps: "无味增用 1 勺豆瓣酱", reason: "胃不舒服时一碗解千忧。" },
];

export interface LazyMealQuery {
  equipment?: LazyEquipment[];
  maxMinutes?: LazyTime;
  fridge?: LazyFridge[];
  goals?: LazyGoal[];
}

export interface LazyMealPick {
  special: LazyMeal;
  alternatives: LazyMeal[];
}

export function pickLazyMeal(q: LazyMealQuery): LazyMealPick {
  const eq = q.equipment ?? [];
  const fridge = q.fridge ?? [];
  const goals = q.goals ?? [];
  const maxMin = q.maxMinutes ?? 30;

  const scored = LAZY_MEALS.map((m) => {
    let score = Math.random() * 1.2;
    if (m.minutes <= maxMin) score += 1.5;
    else score -= (m.minutes - maxMin) / 10;
    if (eq.length > 0) {
      const hit = m.equipment.some((e) => eq.includes(e));
      score += hit ? 2.5 : -1.5;
    }
    if (fridge.length > 0) {
      const hits = m.uses.filter((u) => fridge.includes(u)).length;
      score += hits * 1.2;
    }
    if (goals.length > 0) {
      const hits = m.goals.filter((g) => goals.includes(g)).length;
      score += hits * 1.5;
    }
    return { m, score };
  }).sort((a, b) => b.score - a.score);

  const special = scored[0].m;
  const alts: LazyMeal[] = [];
  const seen = new Set<string>([special.id]);
  for (const x of scored) {
    if (alts.length >= 4) break;
    if (seen.has(x.m.id)) continue;
    alts.push(x.m);
    seen.add(x.m.id);
  }
  return { special, alternatives: alts };
}
