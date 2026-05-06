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
  check(`RECIPES 总数 >= 300（实际 ${RECIPES.length}）`, RECIPES.length >= 300);
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

console.log("");
if (failed === 0) {
  console.log(`✅ 全部检查通过 (RECIPES=${RECIPES.length} 道)`);
  process.exit(0);
} else {
  console.error(`❌ 失败 ${failed} 项`);
  process.exit(1);
}
