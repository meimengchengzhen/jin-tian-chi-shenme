// 旅行美食面板：选城市 / 搜城市 → 看当地特色食物 + 第三方搜索入口。
// 不接商户 API，仅给出搜索 URL，避免反爬 / 版权风险。

import { useMemo, useState } from "react";
import {
  Plane,
  Search,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CITY_FOODS, searchCities, type CityFood } from "@/data/cityFoods";

interface TravelLink {
  id: string;
  label: string;
  build: (q: string) => string;
  hint?: string;
}

const LINKS: TravelLink[] = [
  { id: "baidu", label: "百度", build: (q: string) => `https://www.baidu.com/s?wd=${encodeURIComponent(q + " 推荐 美食")}` },
  { id: "xhs", label: "小红书", build: (q: string) => `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(q)}` },
  {
    id: "dp",
    label: "大众点评",
    build: (q: string) => `https://www.dianping.com/search/keyword/0_0_0_${encodeURIComponent(q)}`,
    hint: "搜索入口，可能需登录",
  },
];

export function TravelPanel() {
  const [q, setQ] = useState("");
  const [activeCity, setActiveCity] = useState<string>(CITY_FOODS[0].city);

  const filtered = useMemo(() => searchCities(q), [q]);
  const city: CityFood =
    filtered.find((c) => c.city === activeCity) ?? filtered[0] ?? CITY_FOODS[0];

  return (
    <section className="space-y-4" data-testid="travel-panel">
      <header>
        <h2 className="font-display text-[1.6rem] tracking-tight">
          <Plane className="mb-1 mr-1 inline h-5 w-5 text-primary" />
          旅行美食
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          搜索城市 / 省份，看当地特色美食 — 内置 {CITY_FOODS.length} 个城市数据。
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
            placeholder="搜索城市、省份或菜系，例如 成都、广东、川菜"
            data-testid="travel-search"
            className="h-11 w-full rounded-full border border-border/70 bg-background/80 pl-9 pr-4 text-[14px] outline-none transition-shadow focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* 城市筛选 chip */}
        <div className="mt-3 flex flex-wrap gap-1.5" data-testid="city-list">
          {filtered.slice(0, 60).map((c) => {
            const active = c.city === city.city;
            return (
              <button
                key={c.city}
                type="button"
                onClick={() => setActiveCity(c.city)}
                data-testid={`city-${c.city}`}
                className={`inline-flex h-7 items-center rounded-full border px-2.5 text-[11.5px] hover-elevate active-elevate-2 ${
                  active
                    ? "border-primary/55 bg-primary text-primary-foreground"
                    : "border-border bg-card/60 text-foreground/80"
                }`}
              >
                {c.city}
                {c.cuisine && (
                  <span className={`ml-1 text-[10px] ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    · {c.cuisine}
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-2 text-[12px] text-muted-foreground">没有找到城市，换个关键词试试。</p>
          )}
        </div>

        {/* 城市详情 */}
        {city && (
          <div className="mt-5 space-y-3" data-testid={`city-detail-${city.city}`}>
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="font-display text-[1.3rem] tracking-tight">{city.city}</h3>
              <Badge variant="outline" className="rounded-full px-2 text-[11px]">
                {city.province}
              </Badge>
              {city.cuisine && (
                <Badge variant="outline" className="rounded-full px-2 text-[11px]">
                  {city.cuisine}
                </Badge>
              )}
            </div>
            <p className="rounded-md border border-primary/20 bg-primary/5 p-2 text-[12.5px] leading-relaxed text-foreground/85">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
              {city.vibe}
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {city.items.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-border/60 bg-background/60 p-3"
                  data-testid={`city-food-${city.city}-${item.name}`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-display text-[14px] tracking-tight">{item.name}</h4>
                    {item.tags && item.tags.length > 0 && (
                      <span className="flex flex-wrap gap-1">
                        {item.tags.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="rounded-full bg-primary/10 px-1.5 py-0 text-[10px] text-primary"
                          >
                            {t}
                          </Badge>
                        ))}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {LINKS.map((l) => (
                      <a
                        key={l.id}
                        href={l.build(`${city.city} ${item.name}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`travel-link-${city.city}-${item.name}-${l.id}`}
                        title={l.hint ?? `在 ${l.label} 搜索 ${city.city} ${item.name}`}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10.5px] text-primary hover-elevate active-elevate-2"
                      >
                        {l.label} 搜索
                        {l.hint && (
                          <span className="text-muted-foreground">· {l.hint}</span>
                        )}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10.5px] text-muted-foreground">
              数据为编辑整理的特色清单，搜索入口仅跳转至第三方关键词页面，不抓取任何商户 / 实时信息。
            </p>
          </div>
        )}
      </Card>
    </section>
  );
}
