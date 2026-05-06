// 生成补充菜谱（GeneratedRecipes）— 与手写的核心菜谱合并后总数 >= 300。
// 运行：`npx tsx script/generate-recipes.ts`
// 产出：client/src/data/recipes.generated.ts （ts 文件，可被 recipes.ts 直接 import）。
//
// 设计要点：
//  - 每条菜谱都基于「主料 × 做法风格」组合扩展。
//  - 食材列表必须包含至少一个可被 lookupIngredient() 识别的关键字，便于详情页估算热量/价格。
//  - `contains` 严格根据食材列表机械填充，确保「忌口」推荐不会泄漏。
//  - 标注 seasons/weathers/regions/slots/energy 用于上下文推荐加分。

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  Course,
  Cuisine,
  Difficulty,
  EnergyTag,
  MealSlotTag,
  RegionTag,
  Restriction,
  Season,
  Taste,
  WeatherTag,
} from "../client/src/data/recipes";

interface GenIngredient {
  name: string;
  qty: string;
  category: "蔬菜" | "肉蛋豆制品" | "调味/主食";
}

interface GenRecipe {
  id: string;
  name: string;
  course: Course;
  cuisine: Cuisine;
  difficulty: Difficulty;
  timeMinutes: number;
  tastes: Taste[];
  contains: Restriction[];
  steps: string[];
  reason: string;
  serves: number;
  ingredients: GenIngredient[];
  videoQuery?: string;
  seasons?: Season[];
  weathers?: WeatherTag[];
  regions?: RegionTag[];
  slots?: MealSlotTag[];
  energy?: EnergyTag[];
}

// === 主料库（按 course 分） ===
// 每条主料附带：默认菜系倾向、含的 Restriction、关键 emoji、视觉/食材库匹配字段。
type Protein = {
  key: string; // 用于 id
  display: string; // 中文显示
  ingName: string; // 写入 ingredient 时使用的 name (必须能命中 ingredients.ts)
  qty: string;
  category: GenIngredient["category"];
  contains: Restriction[]; // 例如 五花肉 -> ["无猪肉"]
  cuisine?: Cuisine;
};

const MAIN_PROTEINS: Protein[] = [
  { key: "porkbelly", display: "五花肉", ingName: "五花肉", qty: "300g", category: "肉蛋豆制品", contains: ["无猪肉"] },
  { key: "lean-pork", display: "猪里脊", ingName: "猪里脊", qty: "250g", category: "肉蛋豆制品", contains: ["无猪肉"] },
  { key: "minced-pork", display: "猪肉末", ingName: "猪肉末", qty: "200g", category: "肉蛋豆制品", contains: ["无猪肉"] },
  { key: "ribs", display: "排骨", ingName: "排骨", qty: "500g", category: "肉蛋豆制品", contains: ["无猪肉"] },
  { key: "chicken-thigh", display: "鸡腿肉", ingName: "鸡腿肉", qty: "400g", category: "肉蛋豆制品", contains: [] },
  { key: "chicken-breast", display: "鸡胸肉", ingName: "鸡胸肉", qty: "300g", category: "肉蛋豆制品", contains: [] },
  { key: "chicken-wing", display: "鸡翅", ingName: "鸡翅", qty: "10 个 (约 600g)", category: "肉蛋豆制品", contains: [] },
  { key: "whole-chicken", display: "整鸡", ingName: "整鸡", qty: "半只 (800g)", category: "肉蛋豆制品", contains: [] },
  { key: "beef", display: "牛肉", ingName: "牛肉", qty: "300g", category: "肉蛋豆制品", contains: ["无牛肉"] },
  { key: "beef-brisket", display: "牛腩", ingName: "牛腩", qty: "500g", category: "肉蛋豆制品", contains: ["无牛肉"] },
  { key: "lamb", display: "羊肉", ingName: "羊肉", qty: "400g", category: "肉蛋豆制品", contains: [], cuisine: "西北" },
  { key: "fish", display: "草鱼", ingName: "草鱼", qty: "1 条 (约 1kg)", category: "肉蛋豆制品", contains: ["无海鲜"] },
  { key: "perch", display: "鲈鱼", ingName: "鲈鱼", qty: "1 条 (约 500g)", category: "肉蛋豆制品", contains: ["无海鲜"], cuisine: "粤菜" },
  { key: "shrimp", display: "鲜虾", ingName: "鲜虾", qty: "12 只 (约 250g)", category: "肉蛋豆制品", contains: ["无海鲜"] },
  { key: "shrimp-meat", display: "虾仁", ingName: "虾仁", qty: "200g", category: "肉蛋豆制品", contains: ["无海鲜"] },
  { key: "egg", display: "鸡蛋", ingName: "鸡蛋", qty: "4 个", category: "肉蛋豆制品", contains: ["无蛋"] },
  { key: "tofu-firm", display: "老豆腐", ingName: "老豆腐", qty: "1 块 (400g)", category: "肉蛋豆制品", contains: [] },
  { key: "tofu-soft", display: "嫩豆腐", ingName: "嫩豆腐", qty: "1 盒 (400g)", category: "肉蛋豆制品", contains: [] },
];

// === 蔬菜配料 ===
type Veg = {
  key: string;
  display: string;
  ingName: string;
  qty: string;
  contains?: Restriction[];
};
const COMMON_VEG: Veg[] = [
  { key: "potato", display: "土豆", ingName: "土豆", qty: "2 个 (约 360g)" },
  { key: "eggplant", display: "茄子", ingName: "茄子", qty: "2 根 (400g)" },
  { key: "pepper-green", display: "青椒", ingName: "青椒", qty: "2 个" },
  { key: "pepper-color", display: "彩椒", ingName: "彩椒", qty: "1 个" },
  { key: "onion", display: "洋葱", ingName: "洋葱", qty: "1 个" },
  { key: "carrot", display: "胡萝卜", ingName: "胡萝卜", qty: "1 根" },
  { key: "broccoli", display: "西兰花", ingName: "西兰花", qty: "1 颗 (400g)" },
  { key: "bokchoy", display: "小白菜", ingName: "小白菜", qty: "1 把 (300g)" },
  { key: "spinach", display: "菠菜", ingName: "菠菜", qty: "1 把 (300g)" },
  { key: "cabbage", display: "包菜", ingName: "包菜", qty: "半颗 (400g)" },
  { key: "cucumber", display: "黄瓜", ingName: "黄瓜", qty: "2 根" },
  { key: "winter-melon", display: "冬瓜", ingName: "冬瓜", qty: "500g" },
  { key: "loofah", display: "丝瓜", ingName: "丝瓜", qty: "2 根 (400g)" },
  { key: "beans", display: "豆角", ingName: "豆角", qty: "300g" },
  { key: "corn", display: "玉米", ingName: "玉米", qty: "1 根" },
  { key: "mushroom", display: "香菇", ingName: "香菇", qty: "150g" },
  { key: "fungus", display: "木耳", ingName: "木耳", qty: "20g (干)" },
  { key: "lotus", display: "莲藕", ingName: "莲藕", qty: "1 节 (300g)" },
  { key: "leek", display: "韭菜", ingName: "韭菜", qty: "1 把 (300g)" },
  { key: "celery", display: "芹菜", ingName: "芹菜", qty: "300g" },
  { key: "radish", display: "白萝卜", ingName: "白萝卜", qty: "半根 (300g)" },
  { key: "bamboo", display: "竹笋", ingName: "竹笋", qty: "200g" },
  { key: "tomato", display: "番茄", ingName: "番茄", qty: "2 个 (300g)" },
  { key: "tofu-firm", display: "老豆腐", ingName: "老豆腐", qty: "1 块 (400g)" },
  { key: "tofu-soft", display: "嫩豆腐", ingName: "嫩豆腐", qty: "1 盒 (400g)" },
  { key: "doudou", display: "豆干", ingName: "豆干", qty: "200g" },
  { key: "rape", display: "油菜心", ingName: "小白菜", qty: "300g" },
];

// === 通用调味组合 ===
const GINGER_GARLIC: GenIngredient = { name: "葱姜蒜", qty: "适量", category: "蔬菜" };
const SOY_SAUCE: GenIngredient = { name: "生抽", qty: "1 大勺", category: "调味/主食" };
const DARK_SOY: GenIngredient = { name: "老抽", qty: "1 小勺", category: "调味/主食" };
const COOKING_WINE: GenIngredient = { name: "料酒", qty: "1 大勺", category: "调味/主食" };
const SUGAR: GenIngredient = { name: "糖", qty: "1 小勺", category: "调味/主食" };
const VINEGAR: GenIngredient = { name: "醋", qty: "1 大勺", category: "调味/主食" };
const SALT: GenIngredient = { name: "盐", qty: "适量", category: "调味/主食" };
const STARCH: GenIngredient = { name: "淀粉", qty: "1 小勺", category: "调味/主食" };
const OYSTER: GenIngredient = { name: "蚝油", qty: "1 大勺", category: "调味/主食" };
const PEPPER: GenIngredient = { name: "胡椒粉", qty: "1 小勺", category: "调味/主食" };
const COOKING_OIL: GenIngredient = { name: "食用油", qty: "1 大勺", category: "调味/主食" };
const DOUBANJIANG: GenIngredient = { name: "豆瓣酱", qty: "1 大勺", category: "调味/主食" };
const DRY_CHILI: GenIngredient = { name: "干辣椒", qty: "5 根", category: "调味/主食" };
const HUAJIAO: GenIngredient = { name: "花椒", qty: "1 小勺", category: "调味/主食" };

// === 做法风格 ===
type Style = {
  key: string;
  zh: string; // "红烧" "清蒸" "酸辣" 等
  difficulty: Difficulty;
  timeBase: number; // 基础时长
  tastes: Taste[];
  contains: Restriction[]; // 风格固有的（如 麻辣 -> 无辣）
  cuisine: Cuisine;
  steps: (m: string) => string[];
  extraIngs: GenIngredient[];
  reasonTpl: (m: string) => string;
  energy: EnergyTag[];
};

const STYLES: Style[] = [
  {
    key: "redbraised",
    zh: "红烧",
    difficulty: "中等",
    timeBase: 50,
    tastes: ["咸鲜"],
    contains: [],
    cuisine: "家常",
    steps: (m) => [
      `${m}处理切块焯水`,
      "炒糖色至枣红",
      "下主料煸炒上色，加葱姜八角",
      "加生抽老抽料酒+热水炖 30-40 分钟",
      "大火收汁亮油",
    ],
    extraIngs: [
      GINGER_GARLIC,
      { name: "冰糖", qty: "20g", category: "调味/主食" },
      SOY_SAUCE,
      DARK_SOY,
      COOKING_WINE,
      { name: "八角", qty: "2 个", category: "调味/主食" },
    ],
    reasonTpl: (m) => `红烧${m}浓油赤酱、咸甜下饭，是冬天最暖的硬菜。`,
    energy: ["驱寒", "暖胃", "下饭", "慢炖", "适合冷"],
  },
  {
    key: "kungpao",
    zh: "宫保",
    difficulty: "中等",
    timeBase: 25,
    tastes: ["微辣", "酸甜"],
    contains: ["无花生"],
    cuisine: "川菜",
    steps: (m) => [
      `${m}切丁加料酒淀粉腌 10 分钟`,
      "调汁：醋+糖+生抽+淀粉+水",
      "热油爆干辣椒花椒",
      "下主料炒变色，加葱姜蒜花生",
      "倒碗汁翻炒收汁",
    ],
    extraIngs: [
      { name: "花生米", qty: "60g", category: "调味/主食" },
      DRY_CHILI,
      HUAJIAO,
      GINGER_GARLIC,
      VINEGAR,
      SUGAR,
      SOY_SAUCE,
      STARCH,
    ],
    reasonTpl: (m) => `宫保${m}经典荔枝口，米饭杀手。`,
    energy: ["下饭"],
  },
  {
    key: "blackpepper",
    zh: "黑椒",
    difficulty: "简单",
    timeBase: 18,
    tastes: ["咸鲜"],
    contains: [],
    cuisine: "粤菜",
    steps: (m) => [
      `${m}切片腌生抽料酒淀粉油 15 分钟`,
      "热锅快炒至变色盛出",
      "下洋葱彩椒炒香",
      "回锅主料，淋黑胡椒蚝油酱汁翻匀",
    ],
    extraIngs: [
      { name: "洋葱", qty: "半个", category: "蔬菜" },
      { name: "彩椒", qty: "1 个", category: "蔬菜" },
      { name: "黑胡椒", qty: "1 大勺", category: "调味/主食" },
      OYSTER,
      SOY_SAUCE,
    ],
    reasonTpl: (m) => `黑椒${m}咸香微辛，10 几分钟出锅的快手硬菜。`,
    energy: ["快手", "下饭"],
  },
  {
    key: "twicecooked",
    zh: "回锅",
    difficulty: "中等",
    timeBase: 35,
    tastes: ["微辣", "咸鲜"],
    contains: [],
    cuisine: "川菜",
    steps: (m) => [
      `${m}煮 20 分钟切薄片`,
      "热锅煸至卷边出油",
      "加豆瓣酱+甜面酱炒香",
      "下青蒜段彩椒翻匀",
    ],
    extraIngs: [
      DOUBANJIANG,
      { name: "甜面酱", qty: "1 大勺", category: "调味/主食" },
      { name: "青蒜", qty: "3 根", category: "蔬菜" },
      { name: "彩椒", qty: "1 个", category: "蔬菜" },
    ],
    reasonTpl: (m) => `回锅${m}灯盏窝焦香、酱香扎实，川人下饭头牌。`,
    energy: ["下饭"],
  },
  {
    key: "yuxiang",
    zh: "鱼香",
    difficulty: "中等",
    timeBase: 25,
    tastes: ["微辣", "酸甜"],
    contains: [],
    cuisine: "川菜",
    steps: (m) => [
      `${m}切丝（或丁）加生抽料酒淀粉腌 10 分钟`,
      "调鱼香汁：糖+醋+生抽+淀粉+水",
      "滑炒主料变色盛出",
      "下泡椒姜蒜炒香，加木耳莴笋丝",
      "回锅主料倒鱼香汁收浓",
    ],
    extraIngs: [
      { name: "木耳", qty: "20g (干)", category: "蔬菜" },
      { name: "莴笋", qty: "1 根", category: "蔬菜" },
      { name: "胡萝卜", qty: "半根", category: "蔬菜" },
      { name: "泡椒", qty: "3 个", category: "蔬菜" },
      GINGER_GARLIC,
      SUGAR,
      VINEGAR,
      SOY_SAUCE,
      STARCH,
    ],
    reasonTpl: (m) => `鱼香${m}酸甜咸辣四味平衡，配米饭能吃两碗。`,
    energy: ["下饭"],
  },
  {
    key: "spicy-cumin",
    zh: "孜然",
    difficulty: "中等",
    timeBase: 22,
    tastes: ["微辣", "咸鲜"],
    contains: [],
    cuisine: "西北",
    steps: (m) => [
      `${m}切片腌生抽料酒淀粉油 15 分钟`,
      "热油大火快炒至变色盛出",
      "下洋葱蒜片爆香",
      "回锅主料，撒孜然辣椒粉熟白芝麻翻匀",
    ],
    extraIngs: [
      { name: "洋葱", qty: "半个", category: "蔬菜" },
      { name: "孜然", qty: "1 大勺", category: "调味/主食" },
      { name: "辣椒粉", qty: "1 大勺", category: "调味/主食" },
      SOY_SAUCE,
    ],
    reasonTpl: (m) => `孜然${m}西北烧烤味直接搬上桌，下啤酒贼爽。`,
    energy: ["下饭"],
  },
  {
    key: "steamed",
    zh: "清蒸",
    difficulty: "中等",
    timeBase: 25,
    tastes: ["清淡", "咸鲜"],
    contains: [],
    cuisine: "粤菜",
    steps: (m) => [
      `${m}处理干净，腹内塞葱姜`,
      "盘底垫葱条，开水上锅大火 8 分钟",
      "倒掉腥水，铺葱丝姜丝，淋蒸鱼豉油",
      "热油浇上激香",
    ],
    extraIngs: [
      { name: "大葱", qty: "2 根", category: "蔬菜" },
      { name: "姜", qty: "1 块", category: "蔬菜" },
      { name: "蒸鱼豉油", qty: "2 大勺", category: "调味/主食" },
      COOKING_OIL,
    ],
    reasonTpl: (m) => `清蒸${m}原汁原味，鲜嫩到能拌饭。`,
    energy: ["清爽", "适合热"],
  },
  {
    key: "sourspicy",
    zh: "酸辣",
    difficulty: "简单",
    timeBase: 15,
    tastes: ["微辣", "酸甜"],
    contains: [],
    cuisine: "川菜",
    steps: (m) => [
      `${m}切丝/片，泡水沥干`,
      "干辣椒花椒爆香",
      "大火快炒 2 分钟",
      "倒醋盐糖生抽出锅",
    ],
    extraIngs: [DRY_CHILI, HUAJIAO, VINEGAR, SUGAR, SOY_SAUCE],
    reasonTpl: (m) => `酸辣${m}爽口开胃，3 分钟出锅。`,
    energy: ["快手", "解暑", "适合热"],
  },
  {
    key: "garlic",
    zh: "蒜蓉",
    difficulty: "简单",
    timeBase: 10,
    tastes: ["清淡", "咸鲜"],
    contains: [],
    cuisine: "粤菜",
    steps: (m) => [
      `${m}洗净切段或拍碎`,
      "热油爆蒜末小米辣",
      "大火快炒 1 分钟",
      "加盐少许出锅",
    ],
    extraIngs: [
      { name: "蒜", qty: "5 瓣", category: "蔬菜" },
      { name: "小米辣", qty: "1 个 (可选)", category: "蔬菜" },
      SALT,
    ],
    reasonTpl: (m) => `蒜蓉${m}蒜香轰炸鼻腔，5 分钟出绿叶菜。`,
    energy: ["快手", "清爽"],
  },
  {
    key: "vinegar-stir",
    zh: "醋溜",
    difficulty: "简单",
    timeBase: 12,
    tastes: ["酸甜", "咸鲜"],
    contains: [],
    cuisine: "鲁菜",
    steps: (m) => [
      `${m}切片或撕段`,
      "干辣椒爆香",
      "大火快炒 1 分钟",
      "倒醋糖生抽淀粉水勾汁翻匀",
    ],
    extraIngs: [DRY_CHILI, VINEGAR, SUGAR, SOY_SAUCE, STARCH],
    reasonTpl: (m) => `醋溜${m}爽脆开胃，鲁菜里的国民下饭素菜。`,
    energy: ["快手", "解暑"],
  },
  {
    key: "stewed-soup",
    zh: "炖汤",
    difficulty: "简单",
    timeBase: 70,
    tastes: ["清淡", "咸鲜"],
    contains: [],
    cuisine: "粤菜",
    steps: (m) => [
      `${m}焯水撇沫`,
      "加葱姜枸杞红枣",
      "小火慢炖 60 分钟",
      "起锅前调盐少许",
    ],
    extraIngs: [
      GINGER_GARLIC,
      { name: "枸杞", qty: "10g", category: "调味/主食" },
      { name: "红枣", qty: "5 颗", category: "调味/主食" },
      SALT,
    ],
    reasonTpl: (m) => `${m}慢炖一锅汤，喝一口暖到胃。`,
    energy: ["暖胃", "驱寒", "慢炖", "适合冷"],
  },
  {
    key: "cold-shred",
    zh: "凉拌",
    difficulty: "简单",
    timeBase: 12,
    tastes: ["清淡", "酸甜"],
    contains: [],
    cuisine: "家常",
    steps: (m) => [
      `${m}焯水/切丝`,
      "调料：蒜末+生抽+醋+糖+香油",
      "拌匀冷藏 5 分钟更入味",
    ],
    extraIngs: [
      { name: "蒜末", qty: "1 大勺", category: "蔬菜" },
      SOY_SAUCE,
      VINEGAR,
      SUGAR,
      { name: "香油", qty: "1 小勺", category: "调味/主食" },
    ],
    reasonTpl: (m) => `凉拌${m}清爽降温，夏天必备下酒小菜。`,
    energy: ["解暑", "清爽", "适合热", "快手"],
  },
  {
    key: "soup-light",
    zh: "清汤",
    difficulty: "简单",
    timeBase: 18,
    tastes: ["清淡"],
    contains: [],
    cuisine: "家常",
    steps: (m) => [
      `${m}处理干净切块`,
      "热水下锅，加姜片",
      "煮 10 分钟撇沫",
      "调盐胡椒粉撒葱花",
    ],
    extraIngs: [{ name: "姜片", qty: "3 片", category: "蔬菜" }, SALT, PEPPER, { name: "葱花", qty: "适量", category: "蔬菜" }],
    reasonTpl: (m) => `${m}清汤清润，配着主菜整顿饭刚刚好。`,
    energy: ["清爽", "暖胃"],
  },
  {
    key: "stew-warm",
    zh: "汤煲",
    difficulty: "中等",
    timeBase: 90,
    tastes: ["咸鲜"],
    contains: [],
    cuisine: "粤菜",
    steps: (m) => [
      `${m}焯水洗净`,
      "砂锅加足量水，下姜片料酒",
      "小火煲 80 分钟",
      "起锅前调盐撒葱花",
    ],
    extraIngs: [{ name: "姜", qty: "1 块", category: "蔬菜" }, COOKING_WINE, SALT],
    reasonTpl: (m) => `${m}煲到酥烂，汤奶白浓鲜，最适合冬夜。`,
    energy: ["驱寒", "暖胃", "慢炖", "适合冷"],
  },
  {
    key: "stir-simple",
    zh: "小炒",
    difficulty: "简单",
    timeBase: 12,
    tastes: ["咸鲜"],
    contains: [],
    cuisine: "家常",
    steps: (m) => [
      `${m}处理切好`,
      "热油爆姜蒜",
      "下主料大火快炒 2 分钟",
      "调生抽蚝油盐起锅",
    ],
    extraIngs: [GINGER_GARLIC, SOY_SAUCE, OYSTER, SALT],
    reasonTpl: (m) => `家常小炒${m}快手不出错，下班 15 分钟开饭。`,
    energy: ["快手", "下饭"],
  },
  {
    key: "douban-braise",
    zh: "豆瓣烧",
    difficulty: "中等",
    timeBase: 30,
    tastes: ["微辣", "咸鲜"],
    contains: [],
    cuisine: "川菜",
    steps: (m) => [
      `${m}切块焯水沥干`,
      "豆瓣酱小火炒出红油",
      "下主料煸炒上色，加葱姜蒜",
      "加生抽糖+热水煮 15 分钟",
      "勾薄芡撒葱花",
    ],
    extraIngs: [DOUBANJIANG, GINGER_GARLIC, SOY_SAUCE, SUGAR, STARCH],
    reasonTpl: (m) => `豆瓣烧${m}红亮咸辣，川菜下饭代表。`,
    energy: ["下饭"],
  },
  {
    key: "honey-glaze",
    zh: "蜜汁",
    difficulty: "简单",
    timeBase: 25,
    tastes: ["酸甜", "咸鲜"],
    contains: [],
    cuisine: "粤菜",
    steps: (m) => [
      `${m}腌生抽料酒蜂蜜 10 分钟`,
      "热油煎至两面金黄",
      "加蜂蜜+生抽+少水中小火收汁",
      "起锅前刷一层蜂蜜",
    ],
    extraIngs: [
      { name: "蜂蜜", qty: "2 大勺", category: "调味/主食" },
      SOY_SAUCE,
      COOKING_WINE,
    ],
    reasonTpl: (m) => `蜜汁${m}亮红色挂汁，孩子最爱的甜口主菜。`,
    energy: ["下饭"],
  },
  {
    key: "salty-sour",
    zh: "番茄烧",
    difficulty: "简单",
    timeBase: 25,
    tastes: ["酸甜", "咸鲜"],
    contains: [],
    cuisine: "家常",
    steps: (m) => [
      `番茄切块炒出汁`,
      `下${m}煎香或腌后下锅`,
      "加生抽糖少水煮 10 分钟",
      "勾芡撒葱花",
    ],
    extraIngs: [
      { name: "番茄", qty: "2 个", category: "蔬菜" },
      SOY_SAUCE,
      SUGAR,
      STARCH,
    ],
    reasonTpl: (m) => `番茄${m}酸甜清爽，米饭杀手。`,
    energy: ["下饭"],
  },
  {
    key: "fragrant-sauce",
    zh: "酱爆",
    difficulty: "简单",
    timeBase: 18,
    tastes: ["咸鲜"],
    contains: [],
    cuisine: "鲁菜",
    steps: (m) => [
      `${m}切丁腌料酒淀粉`,
      "甜面酱+黄豆酱小火炒香",
      "下主料快炒变色",
      "加葱花起锅",
    ],
    extraIngs: [
      { name: "甜面酱", qty: "1 大勺", category: "调味/主食" },
      { name: "黄豆酱", qty: "1 大勺", category: "调味/主食" },
      GINGER_GARLIC,
    ],
    reasonTpl: (m) => `酱爆${m}酱香浓郁，老北京风味直接上桌。`,
    energy: ["下饭"],
  },
  {
    key: "shacha",
    zh: "沙茶",
    difficulty: "简单",
    timeBase: 20,
    tastes: ["咸鲜"],
    contains: [],
    cuisine: "粤菜",
    steps: (m) => [
      `${m}切片腌料酒淀粉`,
      "热油快炒至变色盛出",
      "下洋葱青椒煸香",
      "回锅主料调沙茶酱+蚝油+少水翻匀",
    ],
    extraIngs: [
      { name: "沙茶酱", qty: "2 大勺", category: "调味/主食" },
      OYSTER,
      { name: "洋葱", qty: "半个", category: "蔬菜" },
      { name: "青椒", qty: "1 个", category: "蔬菜" },
    ],
    reasonTpl: (m) => `沙茶${m}咸香微辛，潮汕排档招牌。`,
    energy: ["下饭"],
  },
  {
    key: "soybean-sauce-stew",
    zh: "黄豆酱烧",
    difficulty: "中等",
    timeBase: 40,
    tastes: ["咸鲜"],
    contains: [],
    cuisine: "东北",
    steps: (m) => [
      `${m}处理切块焯水`,
      "热油下八角桂皮葱姜爆香",
      "加黄豆酱炒香",
      "下主料和热水炖 30 分钟",
      "大火收汁",
    ],
    extraIngs: [
      { name: "黄豆酱", qty: "2 大勺", category: "调味/主食" },
      { name: "八角", qty: "2 个", category: "调味/主食" },
      GINGER_GARLIC,
      DARK_SOY,
    ],
    reasonTpl: (m) => `酱香${m}炖到酥烂，东北铁锅炖味道。`,
    energy: ["暖胃", "驱寒", "适合冷"],
  },
];

// === 主食模板 ===
type StapleTpl = {
  id: string;
  name: string;
  cuisine: Cuisine;
  difficulty: Difficulty;
  timeMinutes: number;
  tastes: Taste[];
  contains: Restriction[];
  reason: string;
  steps: string[];
  ingredients: GenIngredient[];
  seasons?: Season[];
  weathers?: WeatherTag[];
  regions?: RegionTag[];
  slots?: MealSlotTag[];
  energy?: EnergyTag[];
};
const STAPLES: StapleTpl[] = [
  {
    id: "scallion-noodles",
    name: "葱油拌面",
    cuisine: "江浙",
    difficulty: "简单",
    timeMinutes: 15,
    tastes: ["咸鲜"],
    contains: [],
    reason: "小香葱小火慢熬出葱油，一拌一勺鲜。",
    steps: ["小香葱切段，小火慢熬至焦黄出油", "煮面过凉", "拌入葱油+生抽+老抽+糖+少许虾米"],
    ingredients: [
      { name: "面条", qty: "300g", category: "调味/主食" },
      { name: "小香葱", qty: "1 大把", category: "蔬菜" },
      { name: "虾皮", qty: "10g", category: "肉蛋豆制品" },
      { name: "生抽", qty: "2 大勺", category: "调味/主食" },
      { name: "老抽", qty: "1 小勺", category: "调味/主食" },
      { name: "糖", qty: "1 大勺", category: "调味/主食" },
    ],
    seasons: ["春", "秋"],
    weathers: ["晴", "潮湿"],
    regions: ["华东"],
    slots: ["lunch", "dinner"],
    energy: ["快手"],
  },
  {
    id: "egg-fried-rice-classic",
    name: "黄金蛋炒饭",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 12,
    tastes: ["咸鲜"],
    contains: ["无蛋"],
    reason: "蛋液裹米饭粒粒金黄，泡饭神器。",
    steps: ["米饭打散，鸡蛋打散倒入米饭拌匀", "热油下蛋裹米饭炒散", "加葱花生抽起锅"],
    ingredients: [
      { name: "隔夜米饭", qty: "2 碗", category: "调味/主食" },
      { name: "鸡蛋", qty: "3 个", category: "肉蛋豆制品" },
      { name: "葱花", qty: "1 把", category: "蔬菜" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
      { name: "食用油", qty: "1 大勺", category: "调味/主食" },
    ],
    seasons: ["春", "夏", "秋", "冬"],
    slots: ["lunch", "dinner"],
    energy: ["快手"],
  },
  {
    id: "scallion-pancake",
    name: "葱花鸡蛋饼",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 15,
    tastes: ["咸鲜"],
    contains: ["无蛋"],
    reason: "面糊+葱花+蛋液一摊一翻，5 分钟出早餐。",
    steps: ["面粉+水+蛋液+盐调成糊，加葱花", "平底锅刷油倒一勺面糊", "中小火两面金黄"],
    ingredients: [
      { name: "面粉", qty: "200g", category: "调味/主食" },
      { name: "鸡蛋", qty: "2 个", category: "肉蛋豆制品" },
      { name: "葱花", qty: "1 把", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
      { name: "食用油", qty: "1 大勺", category: "调味/主食" },
    ],
    slots: ["breakfast", "lunch"],
    energy: ["快手"],
  },
  {
    id: "millet-porridge",
    name: "小米南瓜粥",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 35,
    tastes: ["清淡"],
    contains: [],
    reason: "金黄润胃，适合早餐或加班后晚餐替代。",
    steps: ["小米淘洗，南瓜切块", "冷水下锅大火煮开", "转小火 25 分钟煮至浓稠"],
    ingredients: [
      { name: "大米", qty: "30g", category: "调味/主食" },
      { name: "玉米", qty: "30g", category: "蔬菜" },
      { name: "南瓜", qty: "200g", category: "蔬菜" },
    ],
    seasons: ["秋", "冬"],
    weathers: ["冷"],
    slots: ["breakfast", "dinner"],
    energy: ["暖胃", "清爽"],
  },
  {
    id: "tomato-egg-noodles",
    name: "番茄鸡蛋面",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 15,
    tastes: ["酸甜", "咸鲜"],
    contains: ["无蛋"],
    reason: "国民晚餐，番茄出汁鸡蛋滑嫩，一碗暖胃。",
    steps: ["番茄切块炒出汁", "鸡蛋打散倒入炒散", "加水煮开下面条 4 分钟", "调盐生抽撒葱花"],
    ingredients: [
      { name: "面条", qty: "150g", category: "调味/主食" },
      { name: "番茄", qty: "2 个", category: "蔬菜" },
      { name: "鸡蛋", qty: "2 个", category: "肉蛋豆制品" },
      { name: "葱花", qty: "1 把", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
    ],
    seasons: ["春", "秋", "冬"],
    weathers: ["冷", "雨"],
    slots: ["lunch", "dinner"],
    energy: ["暖胃", "快手"],
  },
  {
    id: "wonton-shrimp",
    name: "鲜虾小馄饨",
    cuisine: "江浙",
    difficulty: "中等",
    timeMinutes: 35,
    tastes: ["清淡", "咸鲜"],
    contains: ["无海鲜"],
    reason: "汤清馅嫩，撒一把紫菜虾皮一秒回上海弄堂。",
    steps: ["虾仁剁茸+猪肉末+葱姜水+盐+蛋清打上劲", "馄饨皮包馅", "汤底：紫菜虾皮+小香葱+生抽+猪油", "馄饨煮浮起即捞入碗"],
    ingredients: [
      { name: "馄饨皮", qty: "1 包 (约 200g)", category: "调味/主食" },
      { name: "虾仁", qty: "150g", category: "肉蛋豆制品" },
      { name: "猪肉末", qty: "150g", category: "肉蛋豆制品" },
      { name: "鸡蛋", qty: "1 个 (取蛋清)", category: "肉蛋豆制品" },
      { name: "紫菜", qty: "5g", category: "调味/主食" },
      { name: "虾皮", qty: "10g", category: "肉蛋豆制品" },
      { name: "小香葱", qty: "1 把", category: "蔬菜" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
    ],
    seasons: ["秋", "冬"],
    weathers: ["冷", "雨"],
    regions: ["华东"],
    slots: ["lunch", "dinner"],
    energy: ["暖胃", "适合冷"],
  },
  {
    id: "scallion-rice",
    name: "葱油猪油饭",
    cuisine: "江浙",
    difficulty: "简单",
    timeMinutes: 8,
    tastes: ["咸鲜"],
    contains: [],
    reason: "猪油+生抽+葱花，十秒拌饭征服全家。",
    steps: ["米饭刚出锅", "趁热拌入猪油+生抽+老抽+葱花", "撒糖糖少许提鲜"],
    ingredients: [
      { name: "米饭", qty: "2 碗", category: "调味/主食" },
      { name: "葱花", qty: "1 大把", category: "蔬菜" },
      { name: "猪油", qty: "1 大勺", category: "调味/主食" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
      { name: "老抽", qty: "1 小勺", category: "调味/主食" },
    ],
    slots: ["lunch", "dinner"],
    energy: ["快手"],
  },
  {
    id: "potato-rice",
    name: "土豆排骨焖饭",
    cuisine: "家常",
    difficulty: "中等",
    timeMinutes: 50,
    tastes: ["咸鲜"],
    contains: ["无猪肉"],
    reason: "电饭煲一键到底，排骨吸饱酱汁香。",
    steps: ["排骨腌生抽老抽蚝油糖姜片 15 分钟", "土豆胡萝卜切块", "电饭煲底铺米，铺排骨土豆胡萝卜", "加水至没过米 1 指节，煮饭键到底"],
    ingredients: [
      { name: "大米", qty: "300g", category: "调味/主食" },
      { name: "排骨", qty: "400g", category: "肉蛋豆制品" },
      { name: "土豆", qty: "1 个", category: "蔬菜" },
      { name: "胡萝卜", qty: "1 根", category: "蔬菜" },
      { name: "生抽", qty: "2 大勺", category: "调味/主食" },
      { name: "老抽", qty: "1 大勺", category: "调味/主食" },
      { name: "蚝油", qty: "1 大勺", category: "调味/主食" },
    ],
    seasons: ["秋", "冬"],
    slots: ["dinner"],
    energy: ["暖胃", "下饭"],
  },
  {
    id: "leek-dumplings",
    name: "韭菜猪肉饺子",
    cuisine: "东北",
    difficulty: "中等",
    timeMinutes: 60,
    tastes: ["咸鲜"],
    contains: ["无猪肉"],
    reason: "皮薄馅大，沾醋一口一个，节日仪式感爆棚。",
    steps: ["面粉冷水揉光醒 30 分钟", "韭菜+猪肉末+葱姜水+生抽+香油+盐拌馅", "擀皮包饺子", "水开下锅煮至浮起加冷水共 2 次"],
    ingredients: [
      { name: "面粉", qty: "300g", category: "调味/主食" },
      { name: "韭菜", qty: "300g", category: "蔬菜" },
      { name: "猪肉末", qty: "300g", category: "肉蛋豆制品" },
      { name: "葱姜", qty: "适量", category: "蔬菜" },
      { name: "生抽", qty: "2 大勺", category: "调味/主食" },
      { name: "香油", qty: "1 大勺", category: "调味/主食" },
    ],
    seasons: ["冬"],
    weathers: ["冷"],
    regions: ["东北", "华北"],
    slots: ["lunch", "dinner"],
    energy: ["暖胃", "驱寒"],
  },
  {
    id: "century-egg-porridge",
    name: "皮蛋瘦肉粥",
    cuisine: "粤菜",
    difficulty: "简单",
    timeMinutes: 40,
    tastes: ["清淡", "咸鲜"],
    contains: ["无猪肉"],
    reason: "粤式经典夜宵，温和暖胃，感冒嗓子疼必点。",
    steps: ["猪里脊腌生抽淀粉胡椒粉", "大米淘洗加足量水煮 30 分钟至米花开", "下肉滑炒变色加皮蛋", "调盐胡椒撒葱花"],
    ingredients: [
      { name: "大米", qty: "100g", category: "调味/主食" },
      { name: "猪里脊", qty: "150g", category: "肉蛋豆制品" },
      { name: "皮蛋", qty: "2 个", category: "肉蛋豆制品" },
      { name: "葱花", qty: "1 把", category: "蔬菜" },
      { name: "胡椒粉", qty: "1 小勺", category: "调味/主食" },
    ],
    weathers: ["雨", "冷"],
    regions: ["华南", "华东"],
    slots: ["breakfast", "dinner"],
    energy: ["暖胃", "清爽"],
  },
  {
    id: "lanzhou-noodle",
    name: "兰州牛肉面",
    cuisine: "西北",
    difficulty: "中等",
    timeMinutes: 90,
    tastes: ["咸鲜", "微辣"],
    contains: ["无牛肉"],
    reason: "一清二白三红四绿五黄，西北灵魂面食。",
    steps: ["牛腩冷水下锅焯水", "加葱姜八角桂皮花椒草果煮 60 分钟", "汤滤清调盐胡椒", "煮面过凉，码牛肉萝卜片香菜葱花辣油"],
    ingredients: [
      { name: "面条", qty: "300g", category: "调味/主食" },
      { name: "牛腩", qty: "400g", category: "肉蛋豆制品" },
      { name: "白萝卜", qty: "半根", category: "蔬菜" },
      { name: "葱姜", qty: "适量", category: "蔬菜" },
      { name: "香菜", qty: "1 把", category: "蔬菜" },
      { name: "辣油", qty: "1 大勺", category: "调味/主食" },
      { name: "八角", qty: "2 个", category: "调味/主食" },
    ],
    regions: ["西北"],
    seasons: ["秋", "冬"],
    slots: ["lunch", "dinner"],
    energy: ["暖胃", "驱寒"],
  },
  {
    id: "shrimp-fried-rice",
    name: "扬州炒饭",
    cuisine: "江浙",
    difficulty: "中等",
    timeMinutes: 18,
    tastes: ["咸鲜"],
    contains: ["无海鲜"],
    reason: "金镶玉，五彩齐全，宴客也不失礼。",
    steps: ["米饭打散", "鸡蛋滑炒", "下虾仁火腿丁炒香", "加豌豆玉米下米饭翻炒至粒粒分明"],
    ingredients: [
      { name: "隔夜米饭", qty: "3 碗", category: "调味/主食" },
      { name: "虾仁", qty: "100g", category: "肉蛋豆制品" },
      { name: "火腿", qty: "100g", category: "肉蛋豆制品" },
      { name: "鸡蛋", qty: "2 个", category: "肉蛋豆制品" },
      { name: "玉米", qty: "50g", category: "蔬菜" },
      { name: "葱花", qty: "适量", category: "蔬菜" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
    ],
    regions: ["华东"],
    slots: ["lunch", "dinner"],
    energy: ["快手"],
  },
  {
    id: "soft-bao",
    name: "蒸馒头夹辣子",
    cuisine: "西北",
    difficulty: "简单",
    timeMinutes: 20,
    tastes: ["微辣", "咸鲜"],
    contains: [],
    reason: "馒头掰开夹油泼辣子，简单也满足。",
    steps: ["馒头蒸热", "辣椒粉葱花花椒+热油泼香+蒜末盐", "馒头掰开夹辣子"],
    ingredients: [
      { name: "馒头", qty: "4 个", category: "调味/主食" },
      { name: "辣椒粉", qty: "2 大勺", category: "调味/主食" },
      { name: "蒜", qty: "3 瓣", category: "蔬菜" },
      { name: "食用油", qty: "2 大勺", category: "调味/主食" },
    ],
    regions: ["西北", "华北"],
    seasons: ["秋", "冬"],
    slots: ["breakfast", "lunch"],
    energy: ["快手", "暖胃"],
  },
  {
    id: "biangbiang-noodle",
    name: "油泼面",
    cuisine: "西北",
    difficulty: "中等",
    timeMinutes: 30,
    tastes: ["微辣", "咸鲜"],
    contains: [],
    reason: "宽面+辣椒粉+葱姜蒜+热油一泼，西北人的灵魂晚餐。",
    steps: ["手擀面或买的宽面煮熟过凉", "面上铺辣椒粉+蒜末+葱花+花椒粉", "热油大火烧到冒烟泼上去", "倒生抽醋拌匀"],
    ingredients: [
      { name: "手擀面", qty: "300g", category: "调味/主食" },
      { name: "辣椒粉", qty: "3 大勺", category: "调味/主食" },
      { name: "蒜", qty: "5 瓣", category: "蔬菜" },
      { name: "葱花", qty: "1 把", category: "蔬菜" },
      { name: "花椒", qty: "1 小勺", category: "调味/主食" },
      { name: "食用油", qty: "3 大勺", category: "调味/主食" },
      { name: "生抽", qty: "2 大勺", category: "调味/主食" },
      { name: "醋", qty: "1 大勺", category: "调味/主食" },
    ],
    regions: ["西北"],
    slots: ["lunch", "dinner"],
    energy: ["快手", "下饭"],
  },
  {
    id: "rice-cake-stir",
    name: "炒年糕",
    cuisine: "江浙",
    difficulty: "简单",
    timeMinutes: 18,
    tastes: ["咸鲜"],
    contains: ["无猪肉"],
    reason: "Q 弹年糕配青菜肉丝，江浙人的童年。",
    steps: ["年糕泡软", "肉丝腌生抽淀粉滑炒变色盛出", "下青菜炒软加年糕翻炒", "回锅肉丝加生抽糖少水翻匀"],
    ingredients: [
      { name: "切片年糕", qty: "300g", category: "调味/主食" },
      { name: "猪里脊", qty: "100g", category: "肉蛋豆制品" },
      { name: "小白菜", qty: "200g", category: "蔬菜" },
      { name: "生抽", qty: "2 大勺", category: "调味/主食" },
      { name: "糖", qty: "1 小勺", category: "调味/主食" },
    ],
    regions: ["华东"],
    slots: ["lunch", "dinner"],
    energy: ["下饭"],
  },
  {
    id: "soy-milk",
    name: "原味豆浆",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 30,
    tastes: ["清淡"],
    contains: [],
    reason: "热豆浆配油条，国民级早餐双子星。",
    steps: ["黄豆泡 8 小时", "破壁机磨浆", "煮沸 5 分钟撇沫", "加糖或加盐随口"],
    ingredients: [
      { name: "黄豆", qty: "100g", category: "肉蛋豆制品" },
      { name: "白糖", qty: "1 大勺 (可选)", category: "调味/主食" },
    ],
    slots: ["breakfast"],
    energy: ["快手", "暖胃"],
  },
  {
    id: "youtiao",
    name: "现炸油条",
    cuisine: "家常",
    difficulty: "中等",
    timeMinutes: 60,
    tastes: ["咸鲜"],
    contains: [],
    reason: "蓬松金黄，配豆浆是万年经典。",
    steps: ["面粉+酵母+小苏打+盐+水揉光", "醒发 30 分钟", "切条两两叠压拉长", "180℃ 油炸至金黄"],
    ingredients: [
      { name: "面粉", qty: "300g", category: "调味/主食" },
      { name: "盐", qty: "适量", category: "调味/主食" },
      { name: "食用油", qty: "1 锅", category: "调味/主食" },
    ],
    slots: ["breakfast"],
    energy: [],
  },
  {
    id: "steamed-bun",
    name: "蒸花卷",
    cuisine: "家常",
    difficulty: "中等",
    timeMinutes: 90,
    tastes: ["清淡"],
    contains: [],
    reason: "麦香松软，配粥喝最熨贴。",
    steps: ["面粉+酵母+水揉光发酵", "擀薄抹油+葱花+椒盐", "切段卷成花卷", "蒸 20 分钟"],
    ingredients: [
      { name: "面粉", qty: "400g", category: "调味/主食" },
      { name: "葱花", qty: "1 大把", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    slots: ["breakfast", "lunch"],
    energy: ["暖胃"],
  },
  {
    id: "congee-plain",
    name: "白粥",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 50,
    tastes: ["清淡"],
    contains: [],
    reason: "胃不舒服时最暖的一碗，配咸菜或皮蛋都行。",
    steps: ["米淘洗加足量水", "大火煮开转小火", "煮 40 分钟至开花浓稠"],
    ingredients: [{ name: "大米", qty: "100g", category: "调味/主食" }],
    slots: ["breakfast", "dinner"],
    energy: ["暖胃", "清爽"],
  },
  {
    id: "egg-bread-toast",
    name: "蛋液吐司",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 10,
    tastes: ["咸鲜"],
    contains: ["无蛋", "无奶"],
    reason: "5 分钟早餐，鸡蛋牛奶裹吐司外焦内嫩。",
    steps: ["鸡蛋打散加牛奶盐", "吐司切片浸蛋液", "黄油煎至金黄"],
    ingredients: [
      { name: "面包", qty: "4 片", category: "调味/主食" },
      { name: "鸡蛋", qty: "2 个", category: "肉蛋豆制品" },
      { name: "牛奶", qty: "100ml", category: "调味/主食" },
      { name: "黄油", qty: "10g", category: "调味/主食" },
    ],
    slots: ["breakfast"],
    energy: ["快手"],
  },
  {
    id: "rice-noodle-souffle",
    name: "桂林米粉",
    cuisine: "粤菜",
    difficulty: "中等",
    timeMinutes: 30,
    tastes: ["咸鲜", "微辣"],
    contains: ["无猪肉"],
    reason: "卤味浓郁的桂林街头味，一碗比饭店还好吃。",
    steps: ["米粉煮 2 分钟过凉", "卤汁淋上", "码花生酸豆角脆豆+葱花辣椒油", "拌匀大快朵颐"],
    ingredients: [
      { name: "米粉", qty: "300g", category: "调味/主食" },
      { name: "卤猪肉", qty: "150g", category: "肉蛋豆制品" },
      { name: "花生米", qty: "30g", category: "调味/主食" },
      { name: "葱花", qty: "适量", category: "蔬菜" },
      { name: "辣油", qty: "1 大勺", category: "调味/主食" },
    ],
    regions: ["华南"],
    slots: ["lunch", "dinner"],
    energy: ["下饭"],
  },
  {
    id: "breakfast-omelet",
    name: "鸡蛋灌饼",
    cuisine: "家常",
    difficulty: "中等",
    timeMinutes: 25,
    tastes: ["咸鲜"],
    contains: ["无蛋"],
    reason: "薄饼里灌进金黄蛋液+生菜+辣酱，街边最爱。",
    steps: ["面粉+水揉光擀薄", "平底锅烙至两面起泡分层", "撕开口灌入蛋液", "再煎到熟夹生菜抹辣酱"],
    ingredients: [
      { name: "面粉", qty: "200g", category: "调味/主食" },
      { name: "鸡蛋", qty: "2 个", category: "肉蛋豆制品" },
      { name: "生菜", qty: "几片", category: "蔬菜" },
      { name: "甜面酱", qty: "1 大勺", category: "调味/主食" },
      { name: "辣油", qty: "1 小勺", category: "调味/主食" },
    ],
    slots: ["breakfast", "lunch"],
    energy: ["快手"],
  },
  {
    id: "summer-cool-noodle",
    name: "凉皮",
    cuisine: "西北",
    difficulty: "中等",
    timeMinutes: 30,
    tastes: ["微辣", "酸甜"],
    contains: [],
    reason: "夏天救命主食，酸辣酱汁让你瞬间清醒。",
    steps: ["凉皮泡软切条", "黄瓜切丝", "调汁：蒜泥+生抽+醋+辣油+糖+盐", "拌入芝麻酱"],
    ingredients: [
      { name: "凉皮", qty: "300g", category: "调味/主食" },
      { name: "黄瓜", qty: "1 根", category: "蔬菜" },
      { name: "蒜末", qty: "1 大勺", category: "蔬菜" },
      { name: "辣油", qty: "2 大勺", category: "调味/主食" },
      { name: "醋", qty: "2 大勺", category: "调味/主食" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
      { name: "芝麻酱", qty: "1 大勺", category: "调味/主食" },
    ],
    seasons: ["夏"],
    weathers: ["热"],
    regions: ["西北", "华北"],
    slots: ["lunch", "dinner"],
    energy: ["解暑", "清爽", "适合热"],
  },
];

// === 汤模板 ===
type SoupTpl = StapleTpl;
const SOUPS: SoupTpl[] = [
  {
    id: "tomato-egg-soup",
    name: "番茄蛋花汤",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 12,
    tastes: ["酸甜", "清淡"],
    contains: ["无蛋"],
    reason: "国民开胃汤，酸甜清爽，3 分钟出锅。",
    steps: ["番茄切块煸出汁", "加水煮开", "鸡蛋打散淋成蛋花", "调盐撒葱花"],
    ingredients: [
      { name: "番茄", qty: "2 个", category: "蔬菜" },
      { name: "鸡蛋", qty: "2 个", category: "肉蛋豆制品" },
      { name: "葱花", qty: "适量", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    energy: ["快手", "清爽"],
  },
  {
    id: "winter-melon-rib-soup",
    name: "冬瓜排骨汤",
    cuisine: "粤菜",
    difficulty: "简单",
    timeMinutes: 80,
    tastes: ["清淡"],
    contains: ["无猪肉"],
    reason: "汤清排骨酥烂，夏日清润代表。",
    steps: ["排骨焯水", "下姜片煮 60 分钟", "加冬瓜煮 15 分钟", "调盐少许"],
    ingredients: [
      { name: "排骨", qty: "500g", category: "肉蛋豆制品" },
      { name: "冬瓜", qty: "500g", category: "蔬菜" },
      { name: "姜片", qty: "3 片", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    seasons: ["夏"],
    weathers: ["热"],
    energy: ["清爽", "解暑", "适合热", "慢炖"],
  },
  {
    id: "radish-rib-soup",
    name: "白萝卜排骨汤",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 75,
    tastes: ["清淡"],
    contains: ["无猪肉"],
    reason: "白萝卜化痰润肺，秋冬最暖。",
    steps: ["排骨焯水", "白萝卜切块", "砂锅加水煮 60 分钟", "调盐撒葱花"],
    ingredients: [
      { name: "排骨", qty: "500g", category: "肉蛋豆制品" },
      { name: "白萝卜", qty: "1 根 (500g)", category: "蔬菜" },
      { name: "姜片", qty: "3 片", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    seasons: ["秋", "冬"],
    weathers: ["冷"],
    energy: ["暖胃", "驱寒", "适合冷", "慢炖"],
  },
  {
    id: "seaweed-egg-soup",
    name: "紫菜蛋花汤",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 8,
    tastes: ["清淡", "咸鲜"],
    contains: ["无蛋"],
    reason: "5 分钟出锅，鲜味满分。",
    steps: ["紫菜虾皮泡碗里", "热水冲开", "加鸡蛋液成花", "调盐胡椒香油"],
    ingredients: [
      { name: "紫菜", qty: "5g", category: "调味/主食" },
      { name: "虾皮", qty: "10g", category: "肉蛋豆制品" },
      { name: "鸡蛋", qty: "2 个", category: "肉蛋豆制品" },
      { name: "盐", qty: "适量", category: "调味/主食" },
      { name: "香油", qty: "1 小勺", category: "调味/主食" },
    ],
    energy: ["快手", "清爽"],
  },
  {
    id: "corn-rib-soup",
    name: "玉米排骨汤",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 75,
    tastes: ["清淡"],
    contains: ["无猪肉"],
    reason: "玉米的甜+排骨的香，孩子最爱的家庭汤。",
    steps: ["排骨焯水", "玉米切段，胡萝卜切块", "砂锅加水煮 60 分钟", "调盐"],
    ingredients: [
      { name: "排骨", qty: "500g", category: "肉蛋豆制品" },
      { name: "玉米", qty: "2 根", category: "蔬菜" },
      { name: "胡萝卜", qty: "1 根", category: "蔬菜" },
      { name: "姜片", qty: "3 片", category: "蔬菜" },
    ],
    seasons: ["秋", "冬"],
    energy: ["暖胃", "慢炖"],
  },
  {
    id: "kelp-pork-soup",
    name: "海带豆腐汤",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 25,
    tastes: ["清淡"],
    contains: [],
    reason: "海带+嫩豆腐，简单清淡刮油又补碘。",
    steps: ["海带泡发切块", "热水煮开", "下豆腐煮 5 分钟", "调盐胡椒撒葱花"],
    ingredients: [
      { name: "海带", qty: "100g", category: "蔬菜" },
      { name: "嫩豆腐", qty: "1 盒 (400g)", category: "肉蛋豆制品" },
      { name: "葱花", qty: "适量", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    energy: ["清爽"],
  },
  {
    id: "tofu-fish-soup",
    name: "鲫鱼豆腐汤",
    cuisine: "家常",
    difficulty: "中等",
    timeMinutes: 35,
    tastes: ["清淡"],
    contains: ["无海鲜"],
    reason: "汤奶白浓鲜，月子期的国民补汤。",
    steps: ["鱼煎至两面金黄", "冲入开水大火煮 15 分钟出奶白", "下豆腐煮 10 分钟", "调盐撒葱花"],
    ingredients: [
      { name: "鲫鱼", qty: "1 条 (约 500g)", category: "肉蛋豆制品" },
      { name: "嫩豆腐", qty: "1 盒", category: "肉蛋豆制品" },
      { name: "姜片", qty: "5 片", category: "蔬菜" },
      { name: "葱花", qty: "适量", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    weathers: ["冷"],
    energy: ["暖胃", "适合冷"],
  },
  {
    id: "sour-pickle-soup",
    name: "酸菜鱼片汤",
    cuisine: "川菜",
    difficulty: "中等",
    timeMinutes: 25,
    tastes: ["微辣", "酸甜"],
    contains: ["无海鲜"],
    reason: "酸辣开胃汤，下饭也好喝。",
    steps: ["鱼片用蛋清淀粉腌", "酸菜炒香加水煮汤底", "下鱼片煮 1 分半", "撒葱花辣椒油"],
    ingredients: [
      { name: "草鱼", qty: "300g (鱼片)", category: "肉蛋豆制品" },
      { name: "酸菜", qty: "200g", category: "蔬菜" },
      { name: "鸡蛋", qty: "1 个 (取蛋清)", category: "肉蛋豆制品" },
      { name: "辣油", qty: "1 大勺", category: "调味/主食" },
    ],
    energy: ["下饭"],
  },
  {
    id: "mushroom-chicken-soup",
    name: "香菇鸡汤",
    cuisine: "粤菜",
    difficulty: "简单",
    timeMinutes: 80,
    tastes: ["清淡"],
    contains: [],
    reason: "鸡肉酥烂菇香入味，全家通补冬日必喝。",
    steps: ["鸡块焯水", "下姜片香菇煮 60 分钟", "加红枣枸杞煮 10 分钟", "调盐少许"],
    ingredients: [
      { name: "整鸡", qty: "半只 (800g)", category: "肉蛋豆制品" },
      { name: "香菇", qty: "100g", category: "蔬菜" },
      { name: "红枣", qty: "5 颗", category: "调味/主食" },
      { name: "枸杞", qty: "10g", category: "调味/主食" },
      { name: "姜片", qty: "3 片", category: "蔬菜" },
    ],
    seasons: ["秋", "冬"],
    weathers: ["冷"],
    energy: ["驱寒", "暖胃", "慢炖", "适合冷"],
  },
  {
    id: "lamb-radish-soup",
    name: "羊肉萝卜汤",
    cuisine: "西北",
    difficulty: "中等",
    timeMinutes: 90,
    tastes: ["清淡", "咸鲜"],
    contains: [],
    reason: "羊肉酥香萝卜清润，零下天气最暖。",
    steps: ["羊肉焯水", "下姜片葱段花椒煮 60 分钟", "加白萝卜煮 20 分钟", "调盐撒香菜"],
    ingredients: [
      { name: "羊肉", qty: "500g", category: "肉蛋豆制品" },
      { name: "白萝卜", qty: "半根", category: "蔬菜" },
      { name: "姜", qty: "1 块", category: "蔬菜" },
      { name: "香菜", qty: "1 把", category: "蔬菜" },
      { name: "花椒", qty: "1 小勺", category: "调味/主食" },
    ],
    seasons: ["冬"],
    weathers: ["冷"],
    regions: ["西北", "华北"],
    energy: ["驱寒", "暖胃", "适合冷", "慢炖"],
  },
  {
    id: "potato-tomato-beef-soup",
    name: "番茄土豆牛肉汤",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 60,
    tastes: ["酸甜"],
    contains: ["无牛肉"],
    reason: "酸酸甜甜，胃口不好的傍晚来一碗。",
    steps: ["牛腩焯水", "番茄炒出汁", "下牛腩煮 40 分钟", "加土豆煮 15 分钟调盐"],
    ingredients: [
      { name: "牛腩", qty: "300g", category: "肉蛋豆制品" },
      { name: "番茄", qty: "3 个", category: "蔬菜" },
      { name: "土豆", qty: "2 个", category: "蔬菜" },
      { name: "葱姜", qty: "适量", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    seasons: ["秋", "冬"],
    energy: ["暖胃"],
  },
  {
    id: "cabbage-tofu-soup",
    name: "白菜豆腐汤",
    cuisine: "东北",
    difficulty: "简单",
    timeMinutes: 18,
    tastes: ["清淡"],
    contains: [],
    reason: "极简一锅汤，胃寒人士的救星。",
    steps: ["白菜手撕", "热油煸蒜片", "加水煮开下白菜豆腐", "调盐胡椒撒葱花"],
    ingredients: [
      { name: "白菜", qty: "300g", category: "蔬菜" },
      { name: "嫩豆腐", qty: "1 盒", category: "肉蛋豆制品" },
      { name: "蒜", qty: "3 瓣", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
      { name: "胡椒粉", qty: "1 小勺", category: "调味/主食" },
    ],
    seasons: ["秋", "冬"],
    weathers: ["冷"],
    regions: ["东北", "华北"],
    energy: ["暖胃", "适合冷"],
  },
  {
    id: "lotus-rib-soup",
    name: "莲藕排骨汤",
    cuisine: "江浙",
    difficulty: "简单",
    timeMinutes: 90,
    tastes: ["清淡"],
    contains: ["无猪肉"],
    reason: "莲藕粉糯排骨酥烂，秋冬补养首选。",
    steps: ["排骨焯水", "莲藕切块加姜片煮 70 分钟", "调盐撒葱花"],
    ingredients: [
      { name: "排骨", qty: "500g", category: "肉蛋豆制品" },
      { name: "莲藕", qty: "1 节 (300g)", category: "蔬菜" },
      { name: "姜片", qty: "3 片", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    seasons: ["秋", "冬"],
    weathers: ["冷"],
    regions: ["华中"],
    energy: ["暖胃", "驱寒", "慢炖"],
  },
  {
    id: "pumpkin-cream-soup",
    name: "南瓜浓汤",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 25,
    tastes: ["清淡"],
    contains: ["无奶"],
    reason: "金黄香浓，加点黑胡椒和奶油就是西餐厅味道。",
    steps: ["南瓜切块蒸熟", "破壁机加牛奶打成泥", "倒回锅煮 5 分钟", "调盐黑胡椒"],
    ingredients: [
      { name: "南瓜", qty: "500g", category: "蔬菜" },
      { name: "牛奶", qty: "200ml", category: "调味/主食" },
      { name: "黑胡椒", qty: "1 小勺", category: "调味/主食" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    seasons: ["秋"],
    energy: ["暖胃"],
  },
  {
    id: "luffa-egg-soup",
    name: "丝瓜蛋花汤",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 12,
    tastes: ["清淡"],
    contains: ["无蛋"],
    reason: "翠绿丝瓜+金黄蛋花，夏天清润首选。",
    steps: ["丝瓜削皮切滚刀", "热油爆姜片下丝瓜", "加水煮 5 分钟", "鸡蛋打散淋入成花，调盐"],
    ingredients: [
      { name: "丝瓜", qty: "2 根", category: "蔬菜" },
      { name: "鸡蛋", qty: "2 个", category: "肉蛋豆制品" },
      { name: "姜片", qty: "3 片", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    seasons: ["夏"],
    weathers: ["热"],
    energy: ["解暑", "清爽", "适合热"],
  },
];

// === 素菜模板 ===
type VegTpl = StapleTpl;
const VEGGIES: VegTpl[] = [
  {
    id: "stir-spinach",
    name: "蒜炒菠菜",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 8,
    tastes: ["清淡", "咸鲜"],
    contains: [],
    reason: "5 分钟绿叶菜，补铁解腻。",
    steps: ["菠菜洗净切段", "蒜片爆香", "大火快炒 1 分钟", "盐少许出锅"],
    ingredients: [
      { name: "菠菜", qty: "1 把 (300g)", category: "蔬菜" },
      { name: "蒜", qty: "3 瓣", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    energy: ["快手", "清爽"],
  },
  {
    id: "stir-leek-bean",
    name: "韭菜炒豆芽",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 8,
    tastes: ["清淡"],
    contains: [],
    reason: "脆嫩清爽 5 分钟出锅。",
    steps: ["韭菜切段，豆芽洗净", "热油爆蒜末", "下豆芽炒断生", "加韭菜段和盐翻匀"],
    ingredients: [
      { name: "韭菜", qty: "200g", category: "蔬菜" },
      { name: "豆芽", qty: "300g", category: "蔬菜" },
      { name: "蒜", qty: "3 瓣", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    seasons: ["春", "夏"],
    energy: ["快手", "清爽"],
  },
  {
    id: "spicy-cabbage",
    name: "干锅花菜",
    cuisine: "川菜",
    difficulty: "中等",
    timeMinutes: 18,
    tastes: ["微辣", "咸鲜"],
    contains: [],
    reason: "焦香花菜+腊肠+干辣椒，开胃下饭。",
    steps: ["花菜掰小朵焯水", "腊肠切片煸出油", "下干辣椒蒜末爆香", "回锅花菜调豆瓣酱生抽翻匀"],
    ingredients: [
      { name: "西兰花", qty: "1 颗 (400g)", category: "蔬菜" },
      { name: "腊肠", qty: "100g", category: "肉蛋豆制品" },
      { name: "干辣椒", qty: "5 根", category: "调味/主食" },
      { name: "豆瓣酱", qty: "1 大勺", category: "调味/主食" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
    ],
    energy: ["下饭"],
  },
  {
    id: "sour-fungus",
    name: "凉拌木耳",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 15,
    tastes: ["清淡", "酸甜"],
    contains: [],
    reason: "脆爽降火，宿醉第二天首选。",
    steps: ["木耳泡发焯水过凉", "调料：蒜末+生抽+醋+香油+小米辣", "拌匀冷藏 5 分钟"],
    ingredients: [
      { name: "木耳", qty: "30g (干)", category: "蔬菜" },
      { name: "蒜末", qty: "1 大勺", category: "蔬菜" },
      { name: "小米辣", qty: "2 个", category: "蔬菜" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
      { name: "醋", qty: "2 大勺", category: "调味/主食" },
      { name: "香油", qty: "1 小勺", category: "调味/主食" },
    ],
    seasons: ["夏"],
    weathers: ["热"],
    energy: ["解暑", "清爽", "适合热"],
  },
  {
    id: "stir-cabbage-pork",
    name: "醋溜白菜叶",
    cuisine: "鲁菜",
    difficulty: "简单",
    timeMinutes: 12,
    tastes: ["酸甜"],
    contains: [],
    reason: "白菜帮子吸醋香，比肉好吃。",
    steps: ["白菜帮切片，叶切大块", "干辣椒爆香", "下白菜帮快炒 1 分钟再下叶", "倒醋糖生抽勾汁翻匀"],
    ingredients: [
      { name: "白菜", qty: "半颗", category: "蔬菜" },
      { name: "干辣椒", qty: "3 根", category: "调味/主食" },
      { name: "醋", qty: "2 大勺", category: "调味/主食" },
      { name: "糖", qty: "1 大勺", category: "调味/主食" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
      { name: "淀粉", qty: "1 小勺", category: "调味/主食" },
    ],
    energy: ["快手"],
  },
  {
    id: "stir-luffa",
    name: "蒜炒丝瓜",
    cuisine: "粤菜",
    difficulty: "简单",
    timeMinutes: 8,
    tastes: ["清淡"],
    contains: [],
    reason: "翠绿丝瓜+蒜香，夏天清润。",
    steps: ["丝瓜削皮切滚刀", "热油爆蒜末", "下丝瓜大火快炒 2 分钟", "调盐少许"],
    ingredients: [
      { name: "丝瓜", qty: "2 根", category: "蔬菜" },
      { name: "蒜", qty: "3 瓣", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    seasons: ["夏"],
    weathers: ["热"],
    energy: ["解暑", "清爽", "适合热"],
  },
  {
    id: "tiger-pepper",
    name: "虎皮青椒",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 12,
    tastes: ["微辣"],
    contains: [],
    reason: "煎到起泡的青椒带焦香，饭杀手。",
    steps: ["青椒去籽不切", "少油小火煎至两面起虎皮", "倒生抽+醋+糖+少水焖 1 分钟"],
    ingredients: [
      { name: "尖椒", qty: "8 根", category: "蔬菜" },
      { name: "蒜", qty: "3 瓣", category: "蔬菜" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
      { name: "醋", qty: "1 小勺", category: "调味/主食" },
      { name: "糖", qty: "1 小勺", category: "调味/主食" },
    ],
    energy: ["下饭"],
  },
  {
    id: "stir-kale-garlic",
    name: "蒜蓉芥蓝",
    cuisine: "粤菜",
    difficulty: "简单",
    timeMinutes: 8,
    tastes: ["清淡", "咸鲜"],
    contains: [],
    reason: "脆嫩翠绿，粤式茶餐厅经典。",
    steps: ["芥蓝去筋切段焯水", "热油爆蒜末", "下芥蓝快炒，淋蚝油生抽糖"],
    ingredients: [
      { name: "小白菜", qty: "1 把 (300g)", category: "蔬菜" },
      { name: "蒜", qty: "5 瓣", category: "蔬菜" },
      { name: "蚝油", qty: "1 大勺", category: "调味/主食" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
    ],
    regions: ["华南"],
    energy: ["清爽", "快手"],
  },
  {
    id: "celery-tofu",
    name: "芹菜炒香干",
    cuisine: "江浙",
    difficulty: "简单",
    timeMinutes: 12,
    tastes: ["清淡", "咸鲜"],
    contains: [],
    reason: "脆芹菜+豆干，安静好吃的家常素菜。",
    steps: ["芹菜切段焯水 10 秒", "豆干切条", "热油爆姜蒜，下豆干芹菜大火快炒", "调盐生抽香油起锅"],
    ingredients: [
      { name: "芹菜", qty: "300g", category: "蔬菜" },
      { name: "豆干", qty: "200g", category: "肉蛋豆制品" },
      { name: "蒜", qty: "3 瓣", category: "蔬菜" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
      { name: "香油", qty: "1 小勺", category: "调味/主食" },
    ],
    energy: ["快手"],
  },
  {
    id: "carrot-sliver",
    name: "胡萝卜丝炒蛋",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 10,
    tastes: ["清淡", "咸鲜"],
    contains: ["无蛋"],
    reason: "胡萝卜素需油溶才能吸收，配蛋最对。",
    steps: ["胡萝卜切丝", "鸡蛋打散滑炒", "下胡萝卜丝炒软", "调盐少许"],
    ingredients: [
      { name: "胡萝卜", qty: "2 根", category: "蔬菜" },
      { name: "鸡蛋", qty: "2 个", category: "肉蛋豆制品" },
      { name: "盐", qty: "适量", category: "调味/主食" },
      { name: "食用油", qty: "1 大勺", category: "调味/主食" },
    ],
    slots: ["lunch", "dinner"],
    energy: ["快手"],
  },
  {
    id: "salt-cucumber",
    name: "腌脆黄瓜",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 30,
    tastes: ["酸甜", "微辣"],
    contains: [],
    reason: "脆得能听见声响，配粥神器。",
    steps: ["黄瓜切条加盐杀水 20 分钟", "挤干水分", "拌入糖醋蒜末小米辣冷藏 20 分钟"],
    ingredients: [
      { name: "黄瓜", qty: "2 根", category: "蔬菜" },
      { name: "蒜末", qty: "1 大勺", category: "蔬菜" },
      { name: "小米辣", qty: "2 个", category: "蔬菜" },
      { name: "醋", qty: "2 大勺", category: "调味/主食" },
      { name: "糖", qty: "1 大勺", category: "调味/主食" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
    ],
    seasons: ["夏"],
    weathers: ["热"],
    energy: ["解暑", "清爽", "适合热"],
  },
  {
    id: "celery-cashew",
    name: "腰果西芹百合",
    cuisine: "粤菜",
    difficulty: "简单",
    timeMinutes: 12,
    tastes: ["清淡"],
    contains: [],
    reason: "脆爽不腻、颜色淡雅，宴客拿得出手。",
    steps: ["西芹切段焯水", "腰果煸至金黄", "热油爆蒜，下西芹百合炒断生", "下腰果调盐起锅"],
    ingredients: [
      { name: "芹菜", qty: "300g", category: "蔬菜" },
      { name: "腰果", qty: "60g", category: "调味/主食" },
      { name: "蒜", qty: "3 瓣", category: "蔬菜" },
      { name: "盐", qty: "适量", category: "调味/主食" },
    ],
    energy: ["清爽"],
  },
  {
    id: "cold-tofu-skin",
    name: "凉拌豆皮",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 12,
    tastes: ["清淡", "微辣"],
    contains: [],
    reason: "豆皮吸汁，配饭配酒都行。",
    steps: ["豆皮切丝焯水过凉", "调料：蒜末+生抽+醋+辣油+香油", "拌匀冷藏 10 分钟"],
    ingredients: [
      { name: "豆干", qty: "300g", category: "肉蛋豆制品" },
      { name: "蒜末", qty: "1 大勺", category: "蔬菜" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
      { name: "醋", qty: "1 大勺", category: "调味/主食" },
      { name: "辣油", qty: "1 小勺", category: "调味/主食" },
      { name: "香油", qty: "1 小勺", category: "调味/主食" },
    ],
    energy: ["清爽", "快手"],
  },
  {
    id: "soft-eggplant",
    name: "蒸茄子",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 18,
    tastes: ["清淡", "咸鲜"],
    contains: [],
    reason: "蒸出来软糯，零油烟夏日好选。",
    steps: ["茄子切条蒸 12 分钟", "撕条装盘", "蒜末+生抽+醋+香油+小米辣淋上"],
    ingredients: [
      { name: "茄子", qty: "2 根", category: "蔬菜" },
      { name: "蒜", qty: "3 瓣", category: "蔬菜" },
      { name: "小米辣", qty: "1 个", category: "蔬菜" },
      { name: "生抽", qty: "1 大勺", category: "调味/主食" },
      { name: "香油", qty: "1 小勺", category: "调味/主食" },
    ],
    seasons: ["夏"],
    energy: ["清爽", "解暑"],
  },
];

// === id sanitizer ===
function safeId(raw: string): string {
  return raw.replace(/[^a-z0-9-]/g, "");
}

// === 主菜：主料 × 蔬菜（家常小炒搭配） ===
function genStirCombo(p: Protein, v: Veg): GenRecipe | null {
  // 限制：只用快手主料
  if (!["lean-pork", "minced-pork", "chicken-breast", "chicken-thigh", "beef", "shrimp-meat", "egg", "tofu-firm"].includes(p.key)) return null;
  // 蔬菜需要适合炒
  if (!["potato", "pepper-green", "pepper-color", "celery", "leek", "beans", "mushroom", "cabbage", "bokchoy", "fungus", "carrot", "onion", "loofah"].includes(v.key)) return null;

  const id = safeId(`combo-${p.key}-${v.key}`);
  const name = `${p.display}炒${v.display}`;
  const tastes: Taste[] = ["咸鲜"];
  const containsSet = new Set<Restriction>([...p.contains]);

  const ings: GenIngredient[] = [
    { name: p.ingName, qty: p.qty, category: p.category },
    { name: v.ingName, qty: v.qty, category: "蔬菜" },
    GINGER_GARLIC,
    SOY_SAUCE,
    OYSTER,
    SALT,
    COOKING_OIL,
  ];
  if (p.key === "lean-pork" || p.key === "chicken-breast" || p.key === "chicken-thigh" || p.key === "beef") {
    ings.push(STARCH);
    ings.push(COOKING_WINE);
  }
  return {
    id,
    name,
    course: "main",
    cuisine: "家常",
    difficulty: "简单",
    timeMinutes: 18,
    tastes,
    contains: Array.from(containsSet),
    steps: [
      `${p.display}处理切片或切丁（如有需要腌生抽料酒淀粉 10 分钟）`,
      `${v.display}处理切好`,
      "热油爆姜蒜，下主料快炒变色盛出",
      `下${v.display}炒至断生`,
      `回锅主料调生抽蚝油盐翻匀出锅`,
    ],
    reason: `${p.display}的鲜搭${v.display}的脆，家常下饭组合。`,
    serves: 3,
    ingredients: ings,
    seasons: undefined,
    weathers: undefined,
    slots: ["lunch", "dinner"],
    energy: ["快手", "下饭"],
  };
}

// === 主菜生成（主料 × 风格）===
function genMain(p: Protein, s: Style): GenRecipe | null {
  // 不合理组合排除
  if (s.key === "steamed" && !["fish", "perch", "tofu-soft"].includes(p.key)) return null;
  if (s.key === "stewed-soup" && !["chicken-thigh", "whole-chicken", "ribs", "beef-brisket", "lamb"].includes(p.key)) return null;
  if (s.key === "stew-warm" && !["whole-chicken", "ribs", "beef-brisket", "lamb"].includes(p.key)) return null;
  if (s.key === "twicecooked" && !["porkbelly"].includes(p.key)) return null;
  if (s.key === "spicy-cumin" && !["beef", "lamb"].includes(p.key)) return null;
  if (s.key === "kungpao" && !["chicken-thigh", "chicken-breast", "lean-pork"].includes(p.key)) return null;
  if (s.key === "blackpepper" && !["beef", "chicken-breast", "chicken-thigh", "shrimp-meat"].includes(p.key)) return null;
  if (s.key === "yuxiang" && !["lean-pork", "minced-pork", "tofu-firm", "eggplant"].includes(p.key)) return null;
  if (s.key === "garlic" && !["shrimp", "shrimp-meat", "tofu-firm"].includes(p.key)) return null;
  if (s.key === "sourspicy" && !["lean-pork", "tofu-firm", "fish", "shrimp-meat"].includes(p.key)) return null;
  if (s.key === "vinegar-stir" && !["lean-pork", "fish", "shrimp-meat"].includes(p.key)) return null;
  if (s.key === "stir-simple" && !["lean-pork", "chicken-breast", "beef", "shrimp-meat", "tofu-firm"].includes(p.key)) return null;
  if (s.key === "redbraised" && !["porkbelly", "ribs", "beef-brisket", "chicken-thigh", "chicken-wing", "fish"].includes(p.key)) return null;
  if (s.key === "douban-braise" && !["fish", "tofu-firm", "tofu-soft", "ribs", "shrimp"].includes(p.key)) return null;
  if (s.key === "honey-glaze" && !["chicken-wing", "ribs", "chicken-thigh"].includes(p.key)) return null;
  if (s.key === "salty-sour" && !["beef", "lean-pork", "tofu-firm", "egg", "shrimp-meat"].includes(p.key)) return null;
  if (s.key === "fragrant-sauce" && !["lean-pork", "chicken-thigh", "chicken-breast", "beef"].includes(p.key)) return null;
  if (s.key === "shacha" && !["beef", "lamb", "chicken-thigh", "shrimp", "shrimp-meat"].includes(p.key)) return null;
  if (s.key === "soybean-sauce-stew" && !["porkbelly", "ribs", "chicken-thigh", "whole-chicken", "beef-brisket"].includes(p.key)) return null;

  const id = safeId(`${s.key}-${p.key}`);
  const name = `${s.zh}${p.display}`;
  const cuisine = p.cuisine ?? s.cuisine;
  const tastes = Array.from(new Set(s.tastes)) as Taste[];
  const containsSet = new Set<Restriction>([...s.contains, ...p.contains]);
  // 食材构造
  const ings: GenIngredient[] = [
    { name: p.ingName, qty: p.qty, category: p.category },
    ...s.extraIngs,
  ];
  // 添加 contains 推断（鸡蛋/牛肉等）
  for (const ing of ings) {
    if (/鸡蛋|蛋$/.test(ing.name) && !/淀粉/.test(ing.name)) containsSet.add("无蛋");
    if (/牛肉|牛腩|牛里脊/.test(ing.name)) containsSet.add("无牛肉");
    if (/猪肉|五花|猪里脊|排骨/.test(ing.name)) containsSet.add("无猪肉");
    if (/虾|蟹|鱼|蛤|贝|海带|紫菜/.test(ing.name) && !/虾皮|紫菜$/.test(ing.name)) {
      // 海带紫菜不算海鲜
      if (/虾|蟹|鱼|蛤|贝/.test(ing.name)) containsSet.add("无海鲜");
    }
    if (/花生/.test(ing.name)) containsSet.add("无花生");
    if (/牛奶|奶/.test(ing.name) && !/豆奶/.test(ing.name)) containsSet.add("无奶");
  }
  if (tastes.some((t) => t === "微辣" || t === "重辣" || t === "麻辣")) {
    containsSet.add("无辣");
  }

  // 难度时长根据主料微调
  let timeMinutes = s.timeBase;
  if (["whole-chicken", "beef-brisket", "lamb", "ribs"].includes(p.key) && (s.key === "redbraised" || s.key === "stew-warm" || s.key === "stewed-soup")) {
    timeMinutes = Math.max(timeMinutes, 80);
  }

  // 标签：根据风格能量推断 weather/season/slot
  const seasons = inferSeasons(s.energy);
  const weathers = inferWeathers(s.energy);
  const slots: MealSlotTag[] = ["lunch", "dinner"];
  const regions: RegionTag[] | undefined = inferRegions(cuisine);

  return {
    id,
    name,
    course: "main",
    cuisine,
    difficulty: s.difficulty,
    timeMinutes,
    tastes,
    contains: Array.from(containsSet),
    steps: s.steps(p.display),
    reason: s.reasonTpl(p.display),
    serves: 3,
    ingredients: ings,
    seasons,
    weathers,
    regions,
    slots,
    energy: s.energy,
  };
}

// === 素菜生成（蔬菜 × 简单做法）===
function genVeggie(v: Veg, style: "garlic" | "vinegar-stir" | "cold-shred" | "stir-simple" | "sourspicy"): GenRecipe | null {
  const styleObj = STYLES.find((s) => s.key === style)!;
  // 凉拌不适合大块根茎
  if (style === "cold-shred" && ["potato", "winter-melon"].includes(v.key)) return null;
  if (style === "garlic" && !["bokchoy", "spinach", "leek", "cabbage", "celery", "broccoli"].includes(v.key)) return null;
  if (style === "vinegar-stir" && !["cabbage", "potato", "lotus", "carrot", "radish"].includes(v.key)) return null;
  if (style === "sourspicy" && !["potato", "lotus", "cabbage", "bamboo"].includes(v.key)) return null;
  if (style === "cold-shred" && !["cucumber", "fungus", "lotus", "carrot", "radish", "celery", "spinach", "tomato"].includes(v.key)) return null;
  if (style === "stir-simple" && !["beans", "broccoli", "celery", "loofah", "cabbage", "mushroom", "carrot"].includes(v.key)) return null;

  const id = safeId(`${style}-${v.key}-veg`);
  const name = `${styleObj.zh}${v.display}`;
  const ings: GenIngredient[] = [
    { name: v.ingName, qty: v.qty, category: "蔬菜" },
    ...styleObj.extraIngs,
  ];
  const contains: Restriction[] = styleObj.tastes.some((t) => t === "微辣" || t === "重辣" || t === "麻辣") ? ["无辣"] : [];
  const seasons = inferSeasons(styleObj.energy);
  const weathers = inferWeathers(styleObj.energy);
  return {
    id,
    name,
    course: "veggie",
    cuisine: styleObj.cuisine,
    difficulty: styleObj.difficulty,
    timeMinutes: styleObj.timeBase,
    tastes: styleObj.tastes,
    contains,
    steps: styleObj.steps(v.display),
    reason: styleObj.reasonTpl(v.display),
    serves: 2,
    ingredients: ings,
    seasons,
    weathers,
    slots: ["lunch", "dinner"],
    energy: styleObj.energy,
  };
}

function inferSeasons(energy: EnergyTag[]): Season[] | undefined {
  const has = (k: EnergyTag) => energy.includes(k);
  if (has("解暑") || has("适合热")) return ["夏"];
  if (has("驱寒") || has("适合冷")) return ["秋", "冬"];
  return undefined;
}
function inferWeathers(energy: EnergyTag[]): WeatherTag[] | undefined {
  const has = (k: EnergyTag) => energy.includes(k);
  const tags: WeatherTag[] = [];
  if (has("解暑") || has("适合热")) tags.push("热", "晴");
  if (has("驱寒") || has("适合冷")) tags.push("冷");
  if (has("适合雨天") || has("暖胃")) tags.push("雨", "潮湿");
  return tags.length ? Array.from(new Set(tags)) : undefined;
}
function inferRegions(c: Cuisine): RegionTag[] | undefined {
  switch (c) {
    case "川菜":
      return ["西南"];
    case "粤菜":
      return ["华南"];
    case "江浙":
      return ["华东"];
    case "鲁菜":
      return ["华北"];
    case "西北":
      return ["西北"];
    case "东北":
      return ["东北"];
    default:
      return undefined;
  }
}

// === 生成主体 ===
function generate(): GenRecipe[] {
  const out: GenRecipe[] = [];
  // 1) 主菜：所有 (主料 × 风格) 合理组合
  for (const p of MAIN_PROTEINS) {
    for (const s of STYLES) {
      const r = genMain(p, s);
      if (r) out.push(r);
    }
  }
  // 1b) 主料 × 蔬菜的小炒组合
  for (const p of MAIN_PROTEINS) {
    for (const v of COMMON_VEG) {
      const r = genStirCombo(p, v);
      if (r) out.push(r);
    }
  }
  // 2) 素菜
  const vegStyles: ("garlic" | "vinegar-stir" | "cold-shred" | "stir-simple" | "sourspicy")[] = [
    "garlic",
    "vinegar-stir",
    "cold-shred",
    "stir-simple",
    "sourspicy",
  ];
  for (const v of COMMON_VEG) {
    for (const s of vegStyles) {
      const r = genVeggie(v, s);
      if (r) out.push(r);
    }
  }
  // 3) 汤
  for (const t of SOUPS) {
    out.push({
      id: t.id,
      name: t.name,
      course: "soup",
      cuisine: t.cuisine,
      difficulty: t.difficulty,
      timeMinutes: t.timeMinutes,
      tastes: t.tastes,
      contains: t.contains,
      steps: t.steps,
      reason: t.reason,
      serves: 3,
      ingredients: t.ingredients,
      seasons: t.seasons,
      weathers: t.weathers,
      regions: t.regions,
      slots: t.slots ?? ["lunch", "dinner"],
      energy: t.energy,
    });
  }
  // 4) 主食
  for (const t of STAPLES) {
    out.push({
      id: t.id,
      name: t.name,
      course: "staple",
      cuisine: t.cuisine,
      difficulty: t.difficulty,
      timeMinutes: t.timeMinutes,
      tastes: t.tastes,
      contains: t.contains,
      steps: t.steps,
      reason: t.reason,
      serves: 3,
      ingredients: t.ingredients,
      seasons: t.seasons,
      weathers: t.weathers,
      regions: t.regions,
      slots: t.slots,
      energy: t.energy,
    });
  }

  // 5) 去重 id
  const seen = new Set<string>();
  return out.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

function emit(recipes: GenRecipe[], target: string): void {
  const header = `// 自动生成 — 请勿直接编辑。
// 生成脚本：script/generate-recipes.ts
// 包含 ${recipes.length} 道由模板组合扩展的菜谱（与 RECIPES 中手写菜谱合并）。
// 字段约定见 client/src/data/recipes.ts。

import type { Recipe } from "./recipes";

`;
  const body = `export const GENERATED_RECIPES: Recipe[] = ${JSON.stringify(recipes, null, 2)};\n`;
  writeFileSync(target, header + body, "utf-8");
}

const __filename = fileURLToPath(import.meta.url);
const recipes = generate();
const outPath = resolve(__filename, "../../client/src/data/recipes.generated.ts");
emit(recipes, outPath);
console.log(`Generated ${recipes.length} recipes at ${outPath}`);
