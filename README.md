# 今天吃什么 · 家常菜随机器

一个面向家庭主厨、租房独居党、被「今天做什么菜」困扰的所有人的菜单随机器原型。
告诉它人数、能花多少时间、口味偏好和忌口，它帮你随机搭一桌家常菜，并按 **蔬菜 / 肉蛋豆制品 / 调味·主食** 三类生成可一键复制的买菜清单。

> **原型 (MVP) 目标**：在不登录、无后端的前提下，提供一个「打开就能用」的可分享网页。

## 核心特性

- 偏好筛选：人数、最长用时、主菜数量、是否配汤 / 配素菜、口味、忌口、菜系、难度。
- 「今天吃什么」：一键随机一组菜，附推荐理由 / 用时 / 难度 / 食材 / 步骤。
- 「换一组」/「只换这一道」/「锁定」：增量重抽，方便迭代决策。
- 「今日买菜清单」：自动按品类整理，去重并合并相同食材，一键复制为纯文本（可粘贴微信 / 备忘录）。
- 内置 36 道家常菜示例数据。无后端、无登录、无数据收集。

## 快速开始

```bash
cd caipu
npm install
npm run dev
```

服务跑在 `http://localhost:5000`。前端（Vite + React）和后端（Express）同端口。
当前后端为空，本原型完全运行在前端。

构建：

```bash
npm run build
# 产物在 dist/public （静态站点）
```

## 文件结构

```
caipu/
├── client/
│   ├── index.html              # 标题、字体 (Fontshare General Sans + Gambarino)、favicon
│   ├── public/favicon.svg      # 自定义 SVG 图标
│   └── src/
│       ├── App.tsx             # 路由（Hash router）
│       ├── index.css           # 设计系统：暖陶土 + 米白配色，暗色模式
│       ├── components/
│       │   └── Logo.tsx        # 自定义 SVG 锅 logo + Wordmark
│       ├── data/
│       │   └── recipes.ts      # ★ 菜谱数据 (36 道示例)
│       ├── lib/
│       │   └── recommend.ts    # ★ 推荐算法 + 买菜清单聚合
│       └── pages/
│           └── Home.tsx        # ★ 主页面 (核心 UI)
├── tailwind.config.ts          # 模板配置 (HSL token)
└── README.md
```

带 ★ 的是产品逻辑入口，按 README 末尾路线图替换即可形成独立模块。

## 数据模型

`client/src/data/recipes.ts` 中：

```ts
interface Recipe {
  id: string;
  name: string;
  course: "main" | "soup" | "veggie" | "staple";
  cuisine: "川菜" | "粤菜" | "江浙" | "鲁菜" | "西北" | "东北" | "家常";
  difficulty: "简单" | "中等" | "进阶";
  timeMinutes: number;
  tastes: ("清淡" | "咸鲜" | "酸甜" | "微辣" | "重辣" | "麻辣")[];
  contains: ("素食" | "无猪肉" | "无牛肉" | "无海鲜" | "无辣" | "无蛋" | "无奶" | "无花生")[];
  reason: string;
  serves: number;
  steps: string[];
  ingredients: { name: string; qty: string; category: "蔬菜" | "肉蛋豆制品" | "调味/主食" }[];
}
```

PR 添加菜谱时只需追加一项即可，无需修改其它代码。

## 推荐算法

`client/src/lib/recommend.ts`：

1. **过滤**：去掉违反忌口、超时、不在所选菜系/难度的菜。
2. **打分**：口味命中 +1.4 / 菜系命中 +0.6 / 难度命中 +0.4 / 用时短轻微加分 / 随机扰动 0~0.6。
3. **抽样**：每个分类（主菜 / 素菜 / 汤）取 Top N 候选，再随机挑选，保证「换一组」每次都有变化。
4. **锁定**：被锁定的菜品在下一轮直接保留，不参与重抽。

## 设计决策

- **配色**：陶土 (Terracotta `hsl(18 65% 47%)`) + 米白纸感背景 (`hsl(38 47% 95%)`) + 柔和鼠尾草绿 accent。来自家常厨房的颜色记忆，刻意避开常见的「美食 app 大红大绿」与「AI 紫蓝渐变」。
- **字体**：Fontshare 的 General Sans (UI / 正文) + Gambarino (展示标题)，配合中文系统栈 (`PingFang SC` / `Microsoft YaHei`)。专门避开 Inter / Poppins / Roboto。
- **质感**：通过 SVG noise (`.grain` 工具类) 给卡片加纸感，所有 token 都是 HSL 变量。
- **动效**：菜品卡片 `animate-rise` 升起；CTA 上的小图标在点击时 `wiggle`，像在「摇骰子」。
- **无 emoji**：用 lucide 图标 + 自绘 SVG 表达"汤""素菜""主食"。
- **logo**：手写的 SVG —— 一只发光的炒锅，里面三粒饭，三缕蒸气。Monochrome，一笔到位。

## 后续编辑约定

- 改 UI 文案：编辑 `client/src/pages/Home.tsx`。
- 改 / 增 菜谱：编辑 `client/src/data/recipes.ts`，每道菜对象自包含。
- 改算法：编辑 `client/src/lib/recommend.ts` —— 函数 `recommend(prefs, locked)` 是入口。
- 改配色：编辑 `client/src/index.css` 中的 `:root` 与 `.dark` HSL 变量。
- 改 Logo：编辑 `client/src/components/Logo.tsx` 的 SVG。
- 路由用 hash (`#/`)；新增页面 → `client/src/pages/`，再到 `App.tsx` 注册。
- **不要使用 `localStorage` / `sessionStorage`**：模板运行在 sandboxed iframe 中会崩溃；持久化用 React state 或后端。

## 适合作为开源 MVP 的拓展方向

| 模块             | 拓展思路                                                                |
| ---------------- | ----------------------------------------------------------------------- |
| 菜谱数据层       | 抽离成独立 JSON / YAML 仓库，社区 PR 贡献；加图片字段。                 |
| 推荐算法         | 接入用户口味学习（点赞 / 不喜欢）或本地小模型重排。                     |
| 买菜清单导出     | 加 Markdown / 二维码 / 微信小程序卡片导出；接对接超市配送 API。         |
| 本地化           | 单位「斤 / 把 / 克」混排切换，按城市菜场习惯。                          |
| 营养 & 预算      | 给每道菜加能量、蛋白、价格估算，扩展过滤条件。                          |
| PWA / 离线       | Service Worker 缓存数据 + 添加到主屏，做饭中途随时查步骤。              |

---

MIT-style 原型作品，欢迎 fork / remix / 自带菜谱来交朋友。
