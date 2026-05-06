// 门类浏览器：按 category 分组展示「甜品 / 饮品 / 小吃 / 早餐 / 烘焙 / 轻食 / 下午茶 / 夜宵」
// 这些菜不会进入主推荐（main/veggie/soup/staple），但可以在这里被发现。
import { useMemo, useState } from "react";
import { ChefHat, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DishImage } from "@/components/DishImage";
import { dishVisual } from "@/lib/dishVisual";
import { ALL_CATEGORIES, RECIPES, type Category, type Recipe } from "@/data/recipes";

const CATEGORY_META: Record<Category, { emoji: string; description: string }> = {
  甜品: { emoji: "🍰", description: "糖水、奶冻、糕饼、果冻" },
  饮品: { emoji: "🥤", description: "茶饮、特调、咖啡、果汁" },
  小吃: { emoji: "🥟", description: "肉夹馍、煎饺、春卷、街头味" },
  早餐: { emoji: "🌅", description: "包子、烧饼、肠粉、煎饼" },
  夜宵: { emoji: "🌙", description: "麻辣烫、烤串、大排档" },
  烘焙: { emoji: "🧁", description: "蛋糕、饼干、塔派、月饼" },
  轻食: { emoji: "🥗", description: "沙拉碗、坡奇、酸奶碗" },
  下午茶: { emoji: "☕", description: "马芬、司康、磅蛋糕" },
};

interface Props {
  onPickRecipe: (r: Recipe) => void;
}

export function CategoryBrowser({ onPickRecipe }: Props) {
  const [selected, setSelected] = useState<Category>("甜品");

  const grouped = useMemo(() => {
    const m: Record<Category, Recipe[]> = {} as any;
    for (const c of ALL_CATEGORIES) m[c] = [];
    for (const r of RECIPES) {
      if (r.category && m[r.category]) m[r.category].push(r);
    }
    return m;
  }, []);

  const list = grouped[selected] ?? [];

  return (
    <section className="mt-10" data-testid="section-category-browser">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-[1.4rem] tracking-tight">
            <ChefHat className="mb-1 mr-1 inline h-5 w-5 text-primary" />
            门类浏览
          </h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            主推荐之外，{Object.values(grouped).reduce((a, b) => a + b.length, 0)} 道甜品 / 饮品 / 小吃 / 烘焙等你挑
          </p>
        </div>
      </div>

      <Card className="grain border-card-border/60 bg-card/70 p-4 sm:p-5">
        {/* 门类 Tabs */}
        <div className="mb-3 flex flex-wrap gap-1.5" data-testid="category-tabs">
          {ALL_CATEGORIES.map((c) => {
            const active = selected === c;
            const count = grouped[c]?.length ?? 0;
            const meta = CATEGORY_META[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelected(c)}
                disabled={count === 0}
                data-testid={`category-tab-${c}`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors hover-elevate active-elevate-2 ${
                  active
                    ? "border-primary/50 bg-primary text-primary-foreground"
                    : "border-border bg-background/60 text-foreground/80"
                } ${count === 0 ? "opacity-50" : ""}`}
              >
                <span aria-hidden>{meta.emoji}</span>
                {c}
                <span className={`rounded-full px-1.5 text-[10.5px] num ${active ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mb-3 text-[11.5px] text-muted-foreground" data-testid="category-desc">
          {CATEGORY_META[selected].description}
        </p>

        {/* 菜谱列表 */}
        {list.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-muted-foreground">这一类还没有菜谱。</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {list.slice(0, 12).map((r) => {
              const visual = dishVisual(r.name, r.course, r.cuisine);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onPickRecipe(r)}
                  data-testid={`category-recipe-${r.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 p-2 text-left transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <DishImage visual={visual} alt={r.name} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-display text-[14px] tracking-tight">{r.name}</h4>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-muted-foreground num">
                      <span>{r.timeMinutes} 分钟</span>
                      <span>·</span>
                      <span>{r.difficulty}</span>
                      <span>·</span>
                      <span>{r.cuisine}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                </button>
              );
            })}
          </div>
        )}
        {list.length > 12 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            还有 {list.length - 12} 道{selected}没展示，可以收藏后到「我收藏的菜」查看。
          </p>
        )}
      </Card>
    </section>
  );
}
