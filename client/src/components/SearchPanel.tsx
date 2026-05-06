// 菜谱搜索面板：按 菜名 / 食材 / 口味 / 菜系 / 类目 / 难度 综合搜索。
// 支持「为什么匹配」高亮，命中规则可解释。

import { useMemo, useState } from "react";
import { Search, ChevronRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DishImage } from "@/components/DishImage";
import { DishPhoto } from "@/components/DishPhoto";
import { dishVisual } from "@/lib/dishVisual";
import {
  RECIPES,
  ALL_CUISINES,
  ALL_TASTES,
  ALL_CATEGORIES,
  type Recipe,
  type Cuisine,
  type Taste,
  type Category,
} from "@/data/recipes";

interface MatchResult {
  recipe: Recipe;
  reasons: string[];
  score: number;
}

function searchRecipes(
  q: string,
  cuisine?: Cuisine | null,
  taste?: Taste | null,
  category?: Category | null,
): MatchResult[] {
  const lower = q.trim().toLowerCase();
  const out: MatchResult[] = [];
  for (const r of RECIPES) {
    if (cuisine && r.cuisine !== cuisine) continue;
    if (taste && !r.tastes.includes(taste)) continue;
    if (category && r.category !== category) continue;

    const reasons: string[] = [];
    let score = 0;

    if (!lower) {
      // 没输入文字时，按筛选条件展示
      score += 1;
      if (cuisine) reasons.push(`${cuisine}`);
      if (taste) reasons.push(`${taste}`);
      if (category) reasons.push(`${category}`);
    } else {
      const name = r.name.toLowerCase();
      if (name.includes(lower)) {
        score += 5;
        reasons.push(`菜名命中「${q}」`);
      }
      if (r.cuisine.toLowerCase().includes(lower)) {
        score += 1;
        reasons.push(`菜系: ${r.cuisine}`);
      }
      const matchedIng = r.ingredients
        .map((i) => i.name)
        .filter((n) => n.toLowerCase().includes(lower));
      if (matchedIng.length > 0) {
        score += 3;
        reasons.push(`食材: ${matchedIng.slice(0, 2).join(" / ")}`);
      }
      const matchedTaste = r.tastes.filter((t) => t.toLowerCase().includes(lower));
      if (matchedTaste.length > 0) {
        score += 2;
        reasons.push(`口味: ${matchedTaste.join(" / ")}`);
      }
      if (r.category && r.category.toLowerCase().includes(lower)) {
        score += 2;
        reasons.push(`类目: ${r.category}`);
      }
      if (r.reason.toLowerCase().includes(lower)) {
        score += 1;
        reasons.push(`描述: ${r.reason.slice(0, 18)}…`);
      }
    }

    if (score > 0) out.push({ recipe: r, reasons, score });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

export function SearchPanel({
  onPickRecipe,
  realImagesEnabled,
}: {
  onPickRecipe: (r: Recipe) => void;
  realImagesEnabled: boolean;
}) {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState<Cuisine | null>(null);
  const [taste, setTaste] = useState<Taste | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  const results = useMemo(
    () => searchRecipes(q, cuisine, taste, category),
    [q, cuisine, taste, category],
  );

  const hint = q.trim() === "" && !cuisine && !taste && !category;

  return (
    <section className="space-y-4" data-testid="search-panel">
      <header>
        <h2 className="font-display text-[1.6rem] tracking-tight">
          <Search className="mb-1 mr-1 inline h-5 w-5 text-primary" />
          菜谱搜索
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          按菜名 / 食材 / 口味 / 菜系 / 类目搜索 — 共 {RECIPES.length} 道菜可查。
        </p>
      </header>

      <Card className="grain border-card-border/60 bg-card/70 p-4 sm:p-5">
        {/* 搜索栏 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索菜名 / 食材 / 关键词，例如 牛肉、番茄、麻辣"
            data-testid="search-input"
            className="h-11 w-full rounded-full border border-border/70 bg-background/80 pl-9 pr-9 text-[14px] outline-none ring-primary/0 transition-shadow focus:ring-2 focus:ring-primary/30"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              data-testid="search-clear"
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 维度筛选 */}
        <div className="mt-3 space-y-2">
          <FilterRow
            label="菜系"
            options={ALL_CUISINES.map((c) => ({ id: c, label: c }))}
            selected={cuisine}
            onSelect={(v) => setCuisine(v as Cuisine | null)}
            testIdPrefix="filter-cuisine"
          />
          <FilterRow
            label="口味"
            options={ALL_TASTES.map((t) => ({ id: t, label: t }))}
            selected={taste}
            onSelect={(v) => setTaste(v as Taste | null)}
            testIdPrefix="filter-taste"
          />
          <FilterRow
            label="类目"
            options={ALL_CATEGORIES.map((c) => ({ id: c, label: c }))}
            selected={category}
            onSelect={(v) => setCategory(v as Category | null)}
            testIdPrefix="filter-category"
          />
        </div>

        {/* 结果列表 */}
        <div className="mt-4">
          <div className="mb-2 flex items-baseline justify-between text-[12px] text-muted-foreground">
            <span>{hint ? "输入关键词或选择筛选项开始搜索" : `命中 ${results.length} 道`}</span>
          </div>

          {results.length === 0 ? (
            <p className="py-6 text-center text-[12.5px] text-muted-foreground">
              没有找到匹配的菜，试着换个关键词或减少筛选条件。
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {results.slice(0, 30).map(({ recipe, reasons }) => {
                const visual = dishVisual(recipe.name, recipe.course, recipe.cuisine);
                return (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => onPickRecipe(recipe)}
                    data-testid={`search-result-${recipe.id}`}
                    className="group flex items-start gap-3 rounded-lg border border-border/60 bg-background/60 p-2 text-left transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                      {realImagesEnabled ? (
                        <DishPhoto
                          name={recipe.name}
                          visual={visual}
                          alt={recipe.name}
                          className="h-full w-full"
                          showSourceBadge={false}
                        />
                      ) : (
                        <DishImage visual={visual} alt={recipe.name} className="h-full w-full" name={recipe.name} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <h4 className="truncate font-display text-[14px] tracking-tight">
                          {recipe.name}
                        </h4>
                        <Badge variant="outline" className="rounded-full px-1.5 py-0 text-[10px]">
                          {recipe.cuisine}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-muted-foreground num">
                        <span>{recipe.timeMinutes} 分钟</span>
                        <span>·</span>
                        <span>{recipe.difficulty}</span>
                        <span>·</span>
                        <span>{recipe.tastes.join("/")}</span>
                      </div>
                      {reasons.length > 0 && !hint && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {reasons.slice(0, 3).map((r, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-primary/10 px-1.5 py-0 text-[10px] text-primary"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                  </button>
                );
              })}
            </div>
          )}
          {results.length > 30 && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              已展示前 30 道，可缩小关键词或加筛选条件继续筛。
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}

interface RowProps<T extends string> {
  label: string;
  options: { id: T; label: string }[];
  selected: T | null;
  onSelect: (v: T | null) => void;
  testIdPrefix: string;
}

function FilterRow<T extends string>({
  label,
  options,
  selected,
  onSelect,
  testIdPrefix,
}: RowProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 inline-flex items-center text-[11.5px] font-medium text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onSelect(null)}
        data-testid={`${testIdPrefix}-all`}
        className={`inline-flex h-7 items-center rounded-full border px-2.5 text-[11.5px] hover-elevate active-elevate-2 ${
          selected === null
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border bg-card/60 text-foreground/80"
        }`}
      >
        全部
      </button>
      {options.map((o) => {
        const active = selected === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(active ? null : o.id)}
            data-testid={`${testIdPrefix}-${o.id}`}
            className={`inline-flex h-7 items-center rounded-full border px-2.5 text-[11.5px] hover-elevate active-elevate-2 ${
              active
                ? "border-primary/55 bg-primary text-primary-foreground"
                : "border-border bg-card/60 text-foreground/80"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
