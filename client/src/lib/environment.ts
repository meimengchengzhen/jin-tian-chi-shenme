// 环境上下文：地区 / 天气 / 日期。
// 全部由用户手动选择 — 不依赖实时定位 / 天气 API（GitHub Pages 静态站点环境友好）。
// 这些字段会作为推荐算法的「软加分」输入。

import { readJSON, writeJSON } from "./storage";

export type Region =
  | "华北"
  | "华东"
  | "华南"
  | "华中"
  | "西南"
  | "西北"
  | "东北"
  | "未指定";

export type Weather =
  | "热"
  | "冷"
  | "雨"
  | "晴"
  | "潮湿"
  | "干燥"
  | "未指定";

export type Season = "春" | "夏" | "秋" | "冬";

export type DayKind = "weekday" | "weekend";

export interface EnvContext {
  region: Region;
  weather: Weather;
  /** 用户可选覆盖；不设置则按当前日期自动推断 */
  seasonOverride?: Season;
  /** 用户可选覆盖；不设置则按当前 Date 自动推断 */
  dayKindOverride?: DayKind;
  /** ISO 日期字符串（用户选择"今天"以外的日期可手动覆盖） */
  dateOverride?: string;
}

export const DEFAULT_ENV: EnvContext = {
  region: "未指定",
  weather: "未指定",
};

export const ALL_REGIONS: Region[] = ["未指定", "华北", "华东", "华南", "华中", "西南", "西北", "东北"];
export const ALL_WEATHERS: Weather[] = ["未指定", "热", "冷", "雨", "晴", "潮湿", "干燥"];
export const ALL_SEASONS: Season[] = ["春", "夏", "秋", "冬"];

export function inferSeason(date: Date = new Date()): Season {
  const m = date.getMonth() + 1; // 1..12
  if (m >= 3 && m <= 5) return "春";
  if (m >= 6 && m <= 8) return "夏";
  if (m >= 9 && m <= 11) return "秋";
  return "冬";
}

export function inferDayKind(date: Date = new Date()): DayKind {
  const d = date.getDay(); // 0=Sun..6=Sat
  return d === 0 || d === 6 ? "weekend" : "weekday";
}

export interface ResolvedEnv extends EnvContext {
  season: Season;
  dayKind: DayKind;
  date: Date;
}

export function resolveEnv(env: EnvContext): ResolvedEnv {
  const date = env.dateOverride ? new Date(env.dateOverride) : new Date();
  const season = env.seasonOverride ?? inferSeason(date);
  const dayKind = env.dayKindOverride ?? inferDayKind(date);
  return { ...env, season, dayKind, date };
}

const ENV_KEY = "chishenme.env.v1";

export function loadEnv(): EnvContext {
  return readJSON<EnvContext>(ENV_KEY, DEFAULT_ENV);
}

export function saveEnv(env: EnvContext): void {
  writeJSON(ENV_KEY, env);
}
