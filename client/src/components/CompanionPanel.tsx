// 「饭桌陪伴」模块:吃饭看什么 / 今天聊什么 / 做饭听什么。
// 三个 Tab,内置数据,推荐结果可"换一批",外链全部新窗口 + noopener noreferrer。

import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  RefreshCw,
  ExternalLink,
  Tv,
  MessageCircle,
  Headphones,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildSearchLinks } from "@/data/companions";
import {
  recommendWatch,
  recommendTopics,
  recommendAudio,
  deriveCompanionAudiences,
  type CompanionContext,
  type RecommendedWatch,
  type RecommendedTopic,
  type RecommendedAudio,
} from "@/lib/companionRecommend";

type TabKey = "watch" | "topic" | "audio";

interface Props {
  ctx: CompanionContext;
}

export function CompanionPanel({ ctx }: Props) {
  const [tab, setTab] = useState<TabKey>("watch");
  const [nonce, setNonce] = useState(0);

  // ctx 中关键字段变化时,自动重抽,避免参数变了但卡片没刷新
  const ctxKey = `${ctx.scenarioId}|${ctx.servings}|${ctx.slot}|${ctx.maxTimeMinutes ?? ""}|${ctx.age ?? ""}|${ctx.hasKids ? 1 : 0}|${ctx.elderHeavy ? 1 : 0}`;

  const watch = useMemo<RecommendedWatch[]>(
    () => recommendWatch(ctx, 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctxKey, nonce, tab === "watch"],
  );
  const topics = useMemo<RecommendedTopic[]>(
    () => recommendTopics(ctx, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctxKey, nonce, tab === "topic"],
  );
  const audio = useMemo<RecommendedAudio[]>(
    () => recommendAudio(ctx, 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctxKey, nonce, tab === "audio"],
  );

  // 当 tab 切换时,如果该 tab 还没生成过推荐,主动 nonce++
  useEffect(() => {
    setNonce((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const audiences = deriveCompanionAudiences(ctx);
  const audienceLabel = audiences.slice(0, 3).join(" / ");

  return (
    <section className="mt-10" data-testid="companion-panel">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-[1.05rem] tracking-tight">饭桌陪伴</h2>
        <span className="text-[11px] text-muted-foreground">
          <Users className="mr-1 inline h-3 w-3" />
          按当前场景 · {audienceLabel}
        </span>
      </div>

      <Card className="grain border-card-border/60 bg-card/70 p-3 sm:p-4">
        {/* Tab 切换 */}
        <div className="flex flex-wrap gap-1.5" role="tablist">
          <TabBtn active={tab === "watch"} onClick={() => setTab("watch")} testId="tab-companion-watch">
            <Tv className="h-3.5 w-3.5" /> 吃饭看什么
          </TabBtn>
          <TabBtn active={tab === "topic"} onClick={() => setTab("topic")} testId="tab-companion-topic">
            <MessageCircle className="h-3.5 w-3.5" /> 今天聊什么
          </TabBtn>
          <TabBtn active={tab === "audio"} onClick={() => setTab("audio")} testId="tab-companion-audio">
            <Headphones className="h-3.5 w-3.5" /> 做饭听什么
          </TabBtn>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setNonce((n) => n + 1)}
            data-testid="button-companion-refresh"
            className="ml-auto h-8 rounded-full text-[12px]"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> 换一批
          </Button>
        </div>

        <div className="mt-3">
          {tab === "watch" && <WatchList items={watch} />}
          {tab === "topic" && <TopicList items={topics} />}
          {tab === "audio" && <AudioList items={audio} />}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          外链均为搜索入口,新窗口打开。所有推荐基于本地内置数据,不收集你的任何信息。
        </p>
      </Card>
    </section>
  );
}

function TabBtn({
  active,
  onClick,
  children,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      role="tab"
      aria-selected={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors hover-elevate active-elevate-2 ${
        active
          ? "border-primary/50 bg-primary text-primary-foreground"
          : "border-border bg-card/60 text-foreground/80"
      }`}
    >
      {children}
    </button>
  );
}

function ExtLink({ href, children, testId }: { href: string; children: React.ReactNode; testId?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11.5px] text-foreground/80 hover-elevate active-elevate-2"
    >
      {children}
      <ExternalLink className="h-3 w-3 opacity-70" />
    </a>
  );
}

function WatchList({ items }: { items: RecommendedWatch[] }) {
  if (items.length === 0) {
    return <p className="text-[12.5px] text-muted-foreground">暂无推荐,试试切换场景或换一批。</p>;
  }
  return (
    <ul className="grid gap-2 sm:grid-cols-2" data-testid="list-companion-watch">
      {items.map((it) => {
        const links = buildSearchLinks(it.title, "video");
        return (
          <li
            key={it.id}
            className="rounded-xl border border-border/60 bg-background/40 p-3"
            data-testid={`watch-${it.id}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="truncate font-display text-[15px] tracking-tight">{it.title}</h4>
                <div className="mt-0.5 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                  <Badge variant="outline" className="rounded-full px-1.5 py-0 text-[10.5px]">
                    {it.type}
                  </Badge>
                  {it.duration && <span className="num">{it.duration}</span>}
                  {it.familyFriendly && (
                    <span className="rounded-full bg-primary/10 px-1.5 text-[10.5px] text-primary">合家欢</span>
                  )}
                  {it.kidSafe && (
                    <span className="rounded-full bg-emerald-100 px-1.5 text-[10.5px] text-emerald-700">儿童安全</span>
                  )}
                  {it.elderFriendly && (
                    <span className="rounded-full bg-amber-100 px-1.5 text-[10.5px] text-amber-700">长辈友好</span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/85">
              <Sparkles className="mr-1 inline h-3 w-3 text-primary/80" />
              {it.reason}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {links.map((l) => (
                <ExtLink key={l.label} href={l.href} testId={`watch-link-${it.id}-${l.label}`}>
                  {l.label}
                </ExtLink>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TopicList({ items }: { items: RecommendedTopic[] }) {
  if (items.length === 0) {
    return <p className="text-[12.5px] text-muted-foreground">暂无话题,试试切换场景或换一批。</p>;
  }
  return (
    <ul className="grid gap-2" data-testid="list-companion-topic">
      {items.map((it, idx) => (
        <li
          key={it.id}
          className="rounded-xl border border-border/60 bg-background/40 px-3 py-2.5"
          data-testid={`topic-${it.id}`}
        >
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[12px] text-primary num">{String(idx + 1).padStart(2, "0")}</span>
            <p className="text-[14px] leading-relaxed text-foreground">{it.text}</p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {it.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="rounded-full px-1.5 py-0 text-[10.5px]">
                {t}
              </Badge>
            ))}
            <span className="text-[11px] text-muted-foreground">· {it.reason}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AudioList({ items }: { items: RecommendedAudio[] }) {
  if (items.length === 0) {
    return <p className="text-[12.5px] text-muted-foreground">暂无推荐,试试切换场景或换一批。</p>;
  }
  return (
    <ul className="grid gap-2 sm:grid-cols-2" data-testid="list-companion-audio">
      {items.map((it) => {
        const links = buildSearchLinks(it.title, "audio");
        return (
          <li
            key={it.id}
            className="rounded-xl border border-border/60 bg-background/40 p-3"
            data-testid={`audio-${it.id}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="truncate font-display text-[15px] tracking-tight">{it.title}</h4>
                <div className="mt-0.5 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                  <Badge variant="outline" className="rounded-full px-1.5 py-0 text-[10.5px]">
                    {it.type}
                  </Badge>
                  <span className="rounded-full bg-primary/10 px-1.5 text-[10.5px] text-primary">
                    {it.length === "短" ? "短(快手)" : it.length === "中" ? "中" : "长(慢炖)"}
                  </span>
                  {it.kidSafe && (
                    <span className="rounded-full bg-emerald-100 px-1.5 text-[10.5px] text-emerald-700">亲子向</span>
                  )}
                  {it.elderFriendly && (
                    <span className="rounded-full bg-amber-100 px-1.5 text-[10.5px] text-amber-700">长辈友好</span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/85">
              <Sparkles className="mr-1 inline h-3 w-3 text-primary/80" />
              {it.reason}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {links.map((l) => (
                <ExtLink key={l.label} href={l.href} testId={`audio-link-${it.id}-${l.label}`}>
                  {l.label}
                </ExtLink>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
