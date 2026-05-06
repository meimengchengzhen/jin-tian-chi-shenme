// 「换一批」级别的近期菜品池：避免连续抽取出现同一道菜（如反复出现麻辣烫）。
// 与 history（保存「就吃这个了」的）不同，这个池子会在每次推荐时自动追加，
// 仅用于推荐打分时的软降权 — 候选池太小时仍允许重复，由调用方决定是否提示。

const KEY = "chishenme.recentPool.v2";
const MAX = 60; // 保留最近 60 个菜 id，约覆盖 10 次以上的换一批

import { readJSON, writeJSON } from "./storage";

export function loadRecentPool(): string[] {
  return readJSON<string[]>(KEY, []);
}

export function recentPoolSet(limit?: number): Set<string> {
  const list = loadRecentPool();
  return new Set(typeof limit === "number" ? list.slice(0, limit) : list);
}

/** 把一批菜品 id 追加到池头部（最新在前）。 */
export function pushRecent(ids: string[]): void {
  if (ids.length === 0) return;
  const cur = loadRecentPool();
  const next = [...ids];
  for (const id of cur) {
    if (next.includes(id)) continue;
    next.push(id);
    if (next.length >= MAX) break;
  }
  writeJSON(KEY, next.slice(0, MAX));
}

export function clearRecentPool(): void {
  writeJSON(KEY, []);
}
