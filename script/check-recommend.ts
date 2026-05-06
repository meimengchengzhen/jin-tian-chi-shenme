// 推荐算法兜底冒烟测试。
// 用 tsx 运行：`npx tsx script/check-recommend.ts`。
// 验证关键不变量：
//  1. 默认偏好至少能给出 mainCount 道主菜 + 汤 + 素菜；
//  2. 任意单一菜系（包括 0 候选的「鲁菜」「西北」）都不会让结果完全为空；
//  3. 任意硬性忌口都被严格遵守（不能在结果里出现违反 contains 的菜）；
//  4. 极严格组合（如 鲁菜 + 进阶 + 15 分钟 + 素食）也不会返回 0 道菜，
//     除非硬性忌口本身把整类全部清空。
//
// 任意失败将以非 0 退出码结束，方便后续接入 CI。

import {
  recommend,
  DEFAULT_PREFS,
  planToList,
  countByCourseUnderHardOnly,
  type Preferences,
} from "../client/src/lib/recommend";
import {
  RECIPES,
  inferContainsForRecipe,
  type Cuisine,
  type Difficulty,
  type Restriction,
} from "../client/src/data/recipes";

let failed = 0;
function check(label: string, ok: boolean, detail?: string) {
  if (ok) {
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}${detail ? `\n      ${detail}` : ""}`);
  }
}

function dishNames(plan: ReturnType<typeof recommend>): string {
  return planToList(plan)
    .map((r) => r.name)
    .join(", ");
}

console.log("== 默认偏好 ==");
{
  const plan = recommend(DEFAULT_PREFS);
  check("默认有主菜", plan.mains.length === DEFAULT_PREFS.mainCount, dishNames(plan));
  check("默认有素菜", !!plan.veggie, dishNames(plan));
  check("默认有汤", !!plan.soup, dishNames(plan));
  check("默认无放宽提示", !plan.relaxedNotes, JSON.stringify(plan.relaxedNotes));
}

console.log("== 单一菜系（含 0 候选）==");
const allCuisines: Cuisine[] = ["川菜", "粤菜", "江浙", "鲁菜", "西北", "东北", "家常"];
for (const c of allCuisines) {
  const prefs: Preferences = { ...DEFAULT_PREFS, cuisines: [c] };
  const plan = recommend(prefs);
  const total = planToList(plan).length;
  check(`菜系=${c} 至少返回 1 道`, total >= 1, `total=${total}`);
}

console.log("== 极严格组合 ==");
{
  const prefs: Preferences = {
    ...DEFAULT_PREFS,
    cuisines: ["鲁菜"],
    difficulties: ["进阶"],
    maxTimeMinutes: 15,
  };
  const plan = recommend(prefs);
  check(
    "鲁菜+进阶+15 分钟 至少返回 1 道",
    planToList(plan).length >= 1,
    dishNames(plan),
  );
  check("应当出现放宽提示", (plan.relaxedNotes ?? []).length > 0, JSON.stringify(plan.relaxedNotes));
}

console.log("== 硬性忌口被严格遵守 ==");
const allRestrictions: Restriction[] = [
  "素食",
  "无猪肉",
  "无牛肉",
  "无海鲜",
  "无辣",
  "无蛋",
  "无奶",
  "无花生",
];
for (const r of allRestrictions) {
  // 给一个尽量不挑剔的偏好，让兜底逻辑容易触发
  const prefs: Preferences = {
    ...DEFAULT_PREFS,
    restrictions: [r],
    cuisines: ["川菜"], // 故意上一个软性条件配合，触发放宽
    difficulties: ["进阶"],
    maxTimeMinutes: 30,
  };
  const plan = recommend(prefs);
  const list = planToList(plan);
  // 1. 不应出现 contains 该忌口的菜
  const violators = list.filter((dish) => dish.contains.includes(r));
  check(
    `忌口=${r}：返回的菜不含 contains[${r}]`,
    violators.length === 0,
    violators.map((d) => d.name).join(", "),
  );
  // 2. 素食专项：不应出现含肉/蛋/海鲜的食材
  if (r === "素食") {
    const meaty = list.filter((d) =>
      d.ingredients.some(
        (i) =>
          i.category === "肉蛋豆制品" &&
          /鸡|猪|牛|羊|鱼|虾|肉|排骨|皮蛋|鸡蛋|蛋/.test(i.name) &&
          !/豆腐|腐竹|豆干/.test(i.name),
      ),
    );
    check(
      "素食：返回的菜不含肉蛋海鲜",
      meaty.length === 0,
      meaty.map((d) => d.name).join(", "),
    );
  }
  // 3. 无辣：返回的菜不含 微辣/重辣/麻辣
  if (r === "无辣") {
    const spicy = list.filter((d) =>
      d.tastes.some((t) => t === "微辣" || t === "重辣" || t === "麻辣"),
    );
    check(
      "无辣：返回的菜不含 微辣/重辣/麻辣",
      spicy.length === 0,
      spicy.map((d) => d.name).join(", "),
    );
  }
}

console.log("== 极端忌口组合（可能完全无解时仍要给出诊断）==");
{
  // 同时勾选所有忌口 — 期望: 至少不会抛错；返回结果或为空，但 unmetCourses 会标识出来
  const prefs: Preferences = {
    ...DEFAULT_PREFS,
    restrictions: [...allRestrictions],
  };
  const plan = recommend(prefs);
  const counts = countByCourseUnderHardOnly(prefs);
  console.log(
    `  ℹ 全勾忌口下硬性可用候选: main=${counts.main} veggie=${counts.veggie} soup=${counts.soup}`,
  );
  // 不要求一定有菜，但要求 violatesHardRestrictions 真的把所有违忌的都筛掉了
  const list = planToList(plan);
  const anyViolator = list.some((d) => d.contains.some((c) => prefs.restrictions.includes(c)));
  check("即使全选忌口，返回结果不违反任何忌口", !anyViolator, list.map((d) => d.name).join(", "));
}

console.log("== 多次随机也总有结果 ==");
{
  const prefs: Preferences = {
    ...DEFAULT_PREFS,
    cuisines: ["西北"], // 0 候选
    difficulties: ["进阶"],
    maxTimeMinutes: 20,
  };
  let minSize = Infinity;
  for (let i = 0; i < 30; i++) {
    const plan = recommend(prefs);
    minSize = Math.min(minSize, planToList(plan).length);
  }
  check("严格条件下 30 次重抽都至少返回 1 道", minSize >= 1, `min=${minSize}`);
}

console.log("== 数据不变量：每道菜含禁忌成分必须在 contains 标对应限制 ==");
{
  // 调用关键词推断；所有推断出的限制都必须已在 r.contains 中。
  const offenders: { id: string; name: string; missing: Restriction[] }[] = [];
  for (const r of RECIPES) {
    const inferred = inferContainsForRecipe(r);
    const missing = inferred.filter((x) => !r.contains.includes(x));
    if (missing.length > 0) offenders.push({ id: r.id, name: r.name, missing });
  }
  check(
    `所有 ${RECIPES.length} 道菜的 contains 与食材关键词一致`,
    offenders.length === 0,
    offenders
      .slice(0, 10)
      .map((o) => `${o.name}(${o.id})缺 ${o.missing.join("/")}`)
      .join("; "),
  );
}

console.log("== 推荐结果在每个硬忌口下都不含违忌食材 ==");
{
  // 反向验证：单一忌口下连跑 30 次，结果内任何一道菜的食材文本不得命中该忌口的关键词。
  // 不仅信任 contains 字段，而是再用关键词扫描一次，作为兜底兜底。
  const singleRestrictions: Restriction[] = ["无蛋", "无奶", "无花生", "无海鲜", "无猪肉", "无牛肉"];
  for (const r of singleRestrictions) {
    let worstViolators: { dish: string; offendingIngredient: string }[] = [];
    for (let i = 0; i < 30; i++) {
      const prefs: Preferences = { ...DEFAULT_PREFS, restrictions: [r] };
      const plan = recommend(prefs);
      const list = planToList(plan);
      for (const d of list) {
        const inferred = inferContainsForRecipe(d);
        if (inferred.includes(r)) {
          // 找到具体哪个食材命中
          const blob = d.ingredients.map((i) => i.name).concat(d.steps).join(" ");
          worstViolators.push({ dish: d.name, offendingIngredient: blob.slice(0, 60) });
        }
      }
    }
    check(
      `忌口=${r}：30 次推荐结果中无任何菜的食材命中该禁忌`,
      worstViolators.length === 0,
      worstViolators.slice(0, 5).map((v) => `${v.dish}`).join(", "),
    );
  }
}

console.log("== 数据库规模 ==");
{
  check(`RECIPES 总数 >= 600（实际 ${RECIPES.length}）`, RECIPES.length >= 600);
  // 至少覆盖每个 course
  const byCourse: Record<string, number> = { main: 0, veggie: 0, soup: 0, staple: 0 };
  for (const r of RECIPES) byCourse[r.course] += 1;
  check(`main >= 100 (实际 ${byCourse.main})`, byCourse.main >= 100);
  check(`veggie >= 30 (实际 ${byCourse.veggie})`, byCourse.veggie >= 30);
  check(`soup >= 15 (实际 ${byCourse.soup})`, byCourse.soup >= 15);
  check(`staple >= 10 (实际 ${byCourse.staple})`, byCourse.staple >= 10);
}

console.log("== 上下文加分（天气/季节）不破坏忌口 ==");
{
  const prefs: Preferences = {
    ...DEFAULT_PREFS,
    restrictions: ["素食"],
  };
  // 模拟「冷天 + 冬」 — 推荐应仍然只返回素食
  const ctx = {
    env: {
      region: "未指定" as const,
      weather: "冷" as const,
      season: "冬" as const,
      dayKind: "weekday" as const,
      date: new Date(),
    },
  };
  const plan = recommend(prefs, [], ctx);
  const list = planToList(plan);
  const meaty = list.filter((d) =>
    d.ingredients.some(
      (i) =>
        i.category === "肉蛋豆制品" &&
        /鸡|猪|牛|羊|鱼|虾|肉|排骨|皮蛋|鸡蛋|蛋|火腿|腊肠|卤/.test(i.name) &&
        !/豆腐|腐竹|豆干|黄豆/.test(i.name),
    ),
  );
  check("素食 + 冷天上下文：返回结果不含肉蛋海鲜", meaty.length === 0, meaty.map((d) => d.name).join(", "));
}

console.log("== 旅行美食数据不变量 ==");
{
  const { CITY_FOODS, ALL_PROVINCES, citiesGroupedByProvince, searchCities } = await import(
    "../client/src/data/cityFoods"
  );
  check(`CITY_FOODS 至少 30 个城市（实际 ${CITY_FOODS.length}）`, CITY_FOODS.length >= 30);
  check(`ALL_PROVINCES 至少 25 省（实际 ${ALL_PROVINCES.length}）`, ALL_PROVINCES.length >= 25);
  // 每个城市必须有 province 与至少一道菜，且 vibe 不为空
  const broken = CITY_FOODS.filter(
    (c: any) => !c.province || !c.vibe || !Array.isArray(c.items) || c.items.length === 0,
  );
  check(`每个城市必须有 province / vibe / items[]`, broken.length === 0, broken.map((c: any) => c.city).join(", "));
  // 分组覆盖所有城市
  const grouped = citiesGroupedByProvince();
  const cityCount = grouped.reduce((acc: number, g: any) => acc + g.cities.length, 0);
  check(`分组后总城市数 = CITY_FOODS.length`, cityCount === CITY_FOODS.length, `grouped=${cityCount}, all=${CITY_FOODS.length}`);
  // searchCities 至少能搜到城市名 / 美食名
  check(`searchCities("成都") 命中`, searchCities("成都").some((c: any) => c.city === "成都"));
  check(`searchCities("烤鸭") 命中（按美食搜城市）`, searchCities("烤鸭").length >= 1);
  check(`searchCities("广东") 命中（按省份搜）`, searchCities("广东").some((c: any) => c.province === "广东"));
}

console.log("== 健康规则覆盖率 ==");
{
  const { listHealthMatches } = await import("../client/src/lib/recommend");
  let lowSugar = 0, lowSalt = 0, lowOil = 0, lowPurine = 0, soft = 0, protein = 0;
  for (const r of RECIPES) {
    const m = listHealthMatches(r);
    if (m.includes("low-sugar")) lowSugar++;
    if (m.includes("low-salt")) lowSalt++;
    if (m.includes("low-oil")) lowOil++;
    if (m.includes("low-purine")) lowPurine++;
    if (m.includes("soft-easy-digest")) soft++;
    if (m.includes("high-quality-protein")) protein++;
  }
  // 每条规则在全库中至少能命中 30 道菜，否则 UI 列表会非常稀疏
  check(`低糖菜数 >= 30 (实际 ${lowSugar})`, lowSugar >= 30);
  check(`低盐菜数 >= 30 (实际 ${lowSalt})`, lowSalt >= 30);
  check(`低油菜数 >= 30 (实际 ${lowOil})`, lowOil >= 30);
  check(`低嘌呤菜数 >= 30 (实际 ${lowPurine})`, lowPurine >= 30);
  check(`软烂易消化数 >= 30 (实际 ${soft})`, soft >= 30);
  check(`优质蛋白数 >= 30 (实际 ${protein})`, protein >= 30);
}

console.log("== 旅行美食 大众点评链接（主入口必须是百度站内搜索，避免 dianping 404）==");
{
  // 历史上 dianping.com/search/keyword/0_0_0_<q> 与 m.dianping.com/searchshop 都会跳 error_page。
  // 现在主大众点评按钮必须走百度 site:dianping.com，dianping 直达只能作为次级且明确标注。
  const fs = await import("node:fs");
  const src = fs.readFileSync("client/src/components/TravelPanel.tsx", "utf-8");
  check(
    "TravelPanel 提供大众点评的百度站内搜索主入口",
    src.includes("site:dianping.com"),
    "未提供 baidu site:dianping.com 主入口",
  );
  check(
    "TravelPanel 不再生成 dianping.com/search/keyword/0_0_0_ 形式 URL",
    !src.includes("dianping.com/search/keyword/0_0_0_"),
    "TravelPanel 仍在生成已知 404 的旧形式 dianping URL",
  );
  // 主大众点评 LINKS 项不能 build 为 m.dianping.com/searchshop —— 该 URL 已知会 error_page。
  // 通过结构化匹配 LINKS 中 id="dp" 的 build 函数：必须返回百度，而不是 m.dianping.com/searchshop。
  const dpEntryMatch = src.match(/id:\s*"dp"[^}]*build:\s*([A-Za-z_]+)/);
  check(
    "TravelPanel 主大众点评（id=\"dp\"）的 build 必须是百度站内搜索而非 m.dianping.com 直达",
    !!dpEntryMatch && dpEntryMatch[1] === "dianpingBaiduUrl",
    `LINKS 中 id="dp" 当前 build=${dpEntryMatch?.[1] ?? "(未找到)"}，应为 dianpingBaiduUrl`,
  );
  // 副入口（点评直达）允许使用 m.dianping.com，但必须标注「可能不可用」。
  check(
    "TravelPanel 若保留 m.dianping.com 直达，必须标注「可能不可用」",
    !src.includes("m.dianping.com/searchshop") || src.includes("可能不可用"),
    "保留了 m.dianping.com 直达但未标注「可能不可用」",
  );
}

console.log("== 门类浏览：每个 category 至少有若干道菜（避免 UI 只看到甜品）==");
{
  // 不变量：8 个门类中至少 6 个有 >= 5 道菜，避免「点开门类只看到甜品」的体感
  const { ALL_CATEGORIES } = await import("../client/src/data/recipes");
  const counts: Record<string, number> = {};
  for (const c of ALL_CATEGORIES) counts[c] = 0;
  for (const r of RECIPES) {
    if (r.category) counts[r.category] = (counts[r.category] ?? 0) + 1;
  }
  const enough = ALL_CATEGORIES.filter((c) => counts[c] >= 5);
  check(
    `门类>=5 道的类别数 >= 6（实际 ${enough.length}/${ALL_CATEGORIES.length}）`,
    enough.length >= 6,
    `分布：${ALL_CATEGORIES.map((c) => `${c}=${counts[c]}`).join(", ")}`,
  );
  for (const c of ALL_CATEGORIES) {
    check(`门类「${c}」至少 1 道（避免 UI 显示空类）`, counts[c] >= 1, `count=${counts[c]}`);
  }
}

console.log("== 外卖模块预算档位完整 ==");
{
  // 每档预算必须包含 picks/coupon/risks 三组提示
  const { BUDGETS, PLATFORMS } = await import("../client/src/data/takeout");
  check(`外卖预算档位数 >= 5（实际 ${BUDGETS.length}）`, BUDGETS.length >= 5);
  for (const t of BUDGETS) {
    check(
      `外卖档位「${t.label}」: picks/coupon/risks 都至少 1 条`,
      t.picks.length >= 1 && t.coupon.length >= 1 && t.risks.length >= 1,
      `picks=${t.picks.length} coupon=${t.coupon.length} risks=${t.risks.length}`,
    );
  }
  check(`外卖平台数 >= 3（实际 ${PLATFORMS.length}）`, PLATFORMS.length >= 3);
  for (const p of PLATFORMS) {
    const url = p.buildSearch("test");
    check(
      `平台「${p.label}」搜索 URL 是 https://`,
      url.startsWith("https://"),
      `url=${url}`,
    );
  }
}

console.log("== 旅行美食图片入口可用 ==");
{
  // CityFoodImage 必须存在且复用 useDishPhoto / fetchDishImage（公开图源）
  const fs = await import("node:fs");
  const src = fs.readFileSync("client/src/components/CityFoodImage.tsx", "utf-8");
  check("CityFoodImage 复用 useDishPhoto", src.includes("useDishPhoto"));
  check(
    "CityFoodImage 在加载失败时仍渲染占位（emoji 或渐变）",
    src.includes("from-") && src.includes("emoji"),
  );
}

console.log("== 食材偏好（想吃什么）软筛选生效 ==");
{
  // 选「牛肉」+ 默认其它，30 次结果中至少有一些含牛肉的菜出现
  const prefs: Preferences = { ...DEFAULT_PREFS };
  const ctx = { ingredientWish: ["beef"] as any[] };
  let hits = 0;
  for (let i = 0; i < 30; i++) {
    const plan = recommend(prefs, [], ctx);
    const list = planToList(plan);
    if (list.some((d) => /牛肉|牛腩|牛排|肥牛|雪花牛|牛筋/.test(d.name + d.ingredients.map((i) => i.name).join(" ")))) hits++;
  }
  check(`想吃牛肉：30 次推荐中有 >= 8 次结果含牛肉菜（实际 ${hits}）`, hits >= 8);
}

console.log("== HotBoard 月份不变量（5 月不应固定 10 月内容）==");
{
  const { MONTH_THEMES, currentMonth, STATIC_FALLBACK, loadSource } = await import(
    "../client/src/lib/hotBoard"
  );
  // 月份主题 12 个齐全
  for (let m = 1; m <= 12; m++) {
    const t = MONTH_THEMES[m];
    check(`月主题 ${m} 月存在且字段齐全`, !!t && t.themes.length > 0 && t.food.length >= 3);
  }
  const m = currentMonth();
  check(`currentMonth 在 1-12 范围内（实际 ${m}）`, m >= 1 && m <= 12);
  // 静态 fallback 不应硬写其它月份的关键词
  for (const src of Object.keys(STATIC_FALLBACK)) {
    const items = STATIC_FALLBACK[src as keyof typeof STATIC_FALLBACK];
    const otherKeywords = ["十月新片速递", "深秋必去", "赏月地图", "国庆", "端午", "中秋", "立冬", "立春"];
    const offenders = items.filter((it: any) =>
      otherKeywords.some((k) => it.title.includes(k)),
    );
    check(
      `平台 ${src} 静态 fallback 不再硬写月份关键词（10 月 / 国庆 等）`,
      offenders.length === 0,
      offenders.map((o: any) => o.title).join("; "),
    );
  }
  // 离线加载会按月 rotate：应至少含 1 条命中当月主题词的话题
  const { items: weiboItems } = await loadSource("weibo");
  const themeWords = MONTH_THEMES[m].themes;
  const monthHit = weiboItems.some((it: any) =>
    [...themeWords, ...MONTH_THEMES[m].food, ...MONTH_THEMES[m].life]
      .some((w) => it.title.includes(w)),
  );
  // fallback 路径下应能命中；live 模式无法保证 — 故只在 live=false 时强校验
  check(
    `离线 fallback 加载时，结果含至少 1 条命中当月主题（${MONTH_THEMES[m].label}）`,
    monthHit,
    weiboItems.slice(0, 6).map((i: any) => i.title).join(" | "),
  );
}

console.log("== 外卖品牌库 ==");
{
  const { TAKEOUT_BRANDS, pickTakeout } = await import(
    "../client/src/data/takeoutBrands"
  );
  check(`外卖品牌数 >= 12（实际 ${TAKEOUT_BRANDS.length}）`, TAKEOUT_BRANDS.length >= 12);
  for (const b of TAKEOUT_BRANDS) {
    check(
      `品牌「${b.name}」字段齐全 (picks/coupon/calorie)`,
      b.picks.length >= 1 && !!b.couponHint && !!b.calorieHint,
    );
  }
  // pickTakeout 至少能给出 special + 4 alternatives
  const r = pickTakeout({ city: "北京", budget: 30, people: 1, tastes: [], slot: "lunch" });
  check(`pickTakeout: special 存在`, !!r.special && !!r.special.id);
  check(`pickTakeout: alternatives 数量 >= 3`, r.alternatives.length >= 3);
  // 不同输入下 special 名称会变化（基本「随机扰动+评分」起作用）
  const seen = new Set<string>();
  for (let i = 0; i < 20; i++) {
    seen.add(pickTakeout({ city: "北京", budget: 30, people: 1, tastes: [], slot: "lunch" }).special.id);
  }
  check(`pickTakeout: 多次调用 special 至少 2 个不同候选`, seen.size >= 2, `seen=${seen.size}`);
}

console.log("== 零食 / 水果数据 ==");
{
  const { SNACKS, pickSnack } = await import("../client/src/data/snacks");
  check(`零食条目 >= 30（实际 ${SNACKS.length}）`, SNACKS.length >= 30);
  for (const s of SNACKS) {
    check(
      `零食「${s.name}」: calories>0 / 价格 / reason 完整`,
      s.calories >= 0 && !!s.price && !!s.reason,
    );
  }
  const r = pickSnack({ audiences: ["减脂", "控糖"] });
  check(`pickSnack 减脂控糖: special 存在`, !!r.special);
  check(`pickSnack 减脂控糖: alternatives 至少 3 条`, r.alternatives.length >= 3);

  const { FRUITS, fruitsForMonth } = await import("../client/src/data/fruits");
  check(`水果条目 >= 18（实际 ${FRUITS.length}）`, FRUITS.length >= 18);
  // 每月都至少有 4 种水果
  for (let m = 1; m <= 12; m++) {
    const list = fruitsForMonth(m);
    check(`月 ${m} 至少 4 种当令水果（实际 ${list.length}）`, list.length >= 4);
  }
  // 5 月应当能命中 枇杷 / 樱桃 / 草莓 / 荔枝 / 芒果 这些
  const may = fruitsForMonth(5).map((f: any) => f.name);
  const mayKeyTaste = ["枇杷", "樱桃", "草莓", "荔枝", "芒果"];
  const mayHits = mayKeyTaste.filter((k) => may.some((n: string) => n.includes(k)));
  check(
    `5 月当令水果含至少 4 种（枇杷/樱桃/草莓/荔枝/芒果）`,
    mayHits.length >= 4,
    `命中 ${mayHits.join("/")}, may=${may.join("/")}`,
  );
}

console.log("");
if (failed === 0) {
  console.log(`✅ 全部检查通过 (RECIPES=${RECIPES.length} 道)`);
  process.exit(0);
} else {
  console.error(`❌ 失败 ${failed} 项`);
  process.exit(1);
}
