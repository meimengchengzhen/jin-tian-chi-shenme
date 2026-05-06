<div align="center">

# 今天吃什么 · 家常菜随机器

**告诉它人数、有多少时间、忌口偏好，它帮你随机搭一桌家常菜，并自动生成分类买菜清单。**

无登录 · 无后端 · 纯前端 MVP · 中文优先

[功能特性](#功能特性) · [快速开始](#快速开始) · [项目结构](#项目结构) · [菜谱数据](#菜谱数据格式) · [推荐算法](#推荐算法简介) · [路线图](#路线图) · [贡献](#贡献方式)

</div>

---

## 项目简介

「今天吃什么」是一个面向**家庭主厨、租房独居党、被「今天做什么菜」困扰的所有人**的家常菜随机器原型。

打开网页 → 拖几个滑块、勾几个标签 → 一键随机出今天的主菜 / 素菜 / 汤；不喜欢的可以「锁住」其它，单换一道；满意了直接复制按品类整理好的买菜清单到微信或备忘录。

设计取向有意识地避开两类常见外观：

- 美食类应用常见的「大红大绿 + emoji 堆砌」。
- AI 应用常见的「紫蓝渐变 + 圆角全屏发光卡片」。

取而代之的是**陶土 + 米白纸感**的家庭厨房色板，以及 Fontshare General Sans / Gambarino 的字体组合。

## 在线预览

> 预览链接占位：项目可通过 `npm run build` 产出静态站点，部署到任意静态托管（Vercel / Netlify / Cloudflare Pages / GitHub Pages）。本仓库不绑定特定部署，请在 fork 后填入自己的预览地址，例如：
>
> 🌐 **Live Demo:** `https://your-username.github.io/caipu/`

如果你只想看截图，往下翻一屏。

## 功能特性

- **偏好筛选**：人数、最长用时、主菜数量、是否配汤 / 配素菜、口味标签（清淡 / 咸鲜 / 酸甜 / 微辣 / 重辣 / 麻辣）、忌口（素食 / 无猪肉 / 无牛肉 / 无海鲜 / 无辣 / 无蛋 / 无奶 / 无花生）、菜系、难度。
- **「今天吃什么」**：一键随机一组菜，附推荐理由 / 用时 / 难度 / 食材 / 步骤。
- **「换一组」/「单换一道」/「锁定」**：增量重抽，方便迭代决策；锁定的菜不会被换掉。
- **「今日买菜清单」**：自动按 `蔬菜 / 肉蛋豆制品 / 调味·主食` 三类整理，**去重并合并相同食材**，一键复制为纯文本。
- **内置 36 道家常菜示例数据**，覆盖主菜 / 汤 / 素菜 / 主食。
- **零登录、零后端、零数据收集**：所有筛选状态保存在 React state；关掉浏览器即清空。
- **响应式 + 暗色模式**：手机一手可达，深色模式自动跟随系统。

## 截图

桌面端（1440 × 900）：

![桌面端 - 推荐结果](docs/screenshots/desktop.png)

移动端（390 × 844）：

<p>
  <img src="docs/screenshots/mobile.png" alt="移动端 - 推荐结果" width="360" />
</p>

> 截图基于 `dist/public` 的生产构建生成，命令见下方「测试 & 截图」一节。

## 快速开始

环境要求：Node.js ≥ 18，npm ≥ 9。

```bash
git clone https://github.com/<your-username>/caipu.git
cd caipu
npm install
npm run dev
```

打开 `http://localhost:5000`。前端（Vite + React + Tailwind）和后端（Express）跑在**同一端口**；当前后端为空，原型完全运行在浏览器。

构建生产产物：

```bash
npm run build
# 静态产物：dist/public/
# 服务器入口（如需）：dist/index.cjs
```

类型检查：

```bash
npm run check
```

测试 & 截图（可选）：项目使用 Playwright 截图，先 `npm run build`，再以生产模式启动（`NODE_ENV=production node dist/index.cjs`），用 Playwright 访问 `http://localhost:5000` 并截图保存到 `docs/screenshots/`。

## 项目结构

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
├── server/                     # Express 入口（当前为空壳，预留）
├── shared/                     # 前后端共享类型（预留 schema）
├── docs/
│   └── screenshots/            # README 引用的截图
├── recipes.schema.json         # ★ 菜谱 JSON Schema，可校验社区贡献
├── CONTRIBUTING.md             # 贡献指南（含菜谱内容规范）
├── LICENSE                     # MIT
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

★ 标记的是产品逻辑入口，绝大多数迭代只需要改这几个文件。

## 菜谱数据格式

所有菜谱集中在 `client/src/data/recipes.ts` 的 `RECIPES` 数组里，每个对象的形态如下（TypeScript 接口与 `recipes.schema.json` 一一对应）：

```ts
interface Recipe {
  id: string;            // kebab-case 唯一 ID
  name: string;          // 中文菜名，2-12 字
  course: "main" | "soup" | "veggie" | "staple";
  cuisine: "川菜" | "粤菜" | "江浙" | "鲁菜" | "西北" | "东北" | "家常";
  difficulty: "简单" | "中等" | "进阶";
  timeMinutes: number;   // 预计总用时（分钟）
  tastes: ("清淡" | "咸鲜" | "酸甜" | "微辣" | "重辣" | "麻辣")[];
  contains: ("素食" | "无猪肉" | "无牛肉" | "无海鲜" | "无辣" | "无蛋" | "无奶" | "无花生")[];
  reason: string;        // ≤ 40 字推荐语
  serves: number;        // 建议份数下限
  steps: string[];       // 3-6 步做法
  ingredients: {
    name: string;
    qty: string;         // "300g" / "2 根" / "1 把" / "适量"
    category: "蔬菜" | "肉蛋豆制品" | "调味/主食";
  }[];
}
```

完整字段说明、枚举、长度限制和示例见仓库根目录的 [`recipes.schema.json`](./recipes.schema.json)。

校验菜谱（可选，需要本地装 ajv-cli）：

```bash
npx ajv-cli validate -s recipes.schema.json -d your-recipe.json
```

PR 添加菜谱时只需要在 `RECIPES` 数组末尾追加一项，**无需修改其它代码**。详见 [CONTRIBUTING.md](./CONTRIBUTING.md) 的「贡献菜谱」一节。

## 推荐算法简介

实现位于 `client/src/lib/recommend.ts`。整体是一个**「过滤 → 打分 → 分类抽样 → 锁定增量」** 的轻量算法，适合不到 100 道菜的小数据集，无需任何模型：

1. **过滤**：去掉违反忌口、超时、不在所选菜系/难度的菜。
2. **打分**：
   - 口味命中：`+1.4`
   - 菜系命中：`+0.6`
   - 难度命中：`+0.4`
   - 用时短：`+0 ~ +0.3`（轻微加分，鼓励快手菜）
   - 随机扰动：`+0 ~ +0.6`（保证「换一组」每次结果不同）
3. **分类抽样**：在 `main / veggie / soup / staple` 各类的候选里取 Top N（一般 N = 6），从中随机挑选要求的数量。
4. **锁定**：用户「锁住」的菜在下一轮直接保留，不参与重抽，剩下的位置才走步骤 1-3。

副产物：`buildShoppingList(recipes)` 把所有菜的 `ingredients` 按 `category` 合并去重（同名食材数量字符串以「/」拼接），生成可直接复制的买菜清单文本。

如果未来要换成更复杂的策略（用户口味学习、本地小模型重排、营养优化），只需要替换 `recommend()` 这一个函数。

## 路线图

下面是当前计划中的几个方向，欢迎在 issue 里认领或拍砖：

| 模块                | 拓展思路                                                                  | 状态    |
| ------------------- | ------------------------------------------------------------------------- | ------- |
| 菜谱数据层          | 抽离成独立 JSON / YAML 仓库，社区 PR 贡献；加图片 / 难度分级字段。       | 计划中  |
| 推荐算法            | 接入「点赞 / 不喜欢」的口味学习，本地 IndexedDB 持久化（替代 localStorage）。| 计划中  |
| 买菜清单导出        | Markdown / 二维码 / 微信小程序卡片 / 接超市配送 API。                     | 计划中  |
| 本地化              | 单位「斤 / 把 / 克」混排切换，按城市菜场习惯调整。                        | 计划中  |
| 营养 & 预算         | 给每道菜加能量、蛋白、价格估算，扩展过滤条件。                            | 计划中  |
| PWA / 离线          | Service Worker 缓存数据 + 添加到主屏，做饭中途随时查步骤。                | 计划中  |
| i18n 英文版         | 国外华人 / 学做菜的外国朋友。                                             | 远期    |
| 截图 CI             | GitHub Actions 跑 Playwright 自动更新 README 截图。                       | 想做    |

## 贡献方式

非常欢迎贡献，最受欢迎的是**菜谱**！

- 加菜：见 [CONTRIBUTING.md](./CONTRIBUTING.md) 的「贡献菜谱」 + 用 [`recipes.schema.json`](./recipes.schema.json) 校验。
- 提 Bug / 功能建议：开 [GitHub Issue](../../issues/new)。
- 提交 PR 前请通过 PR 检查清单（见 [CONTRIBUTING.md](./CONTRIBUTING.md#四pr-检查清单)），并保持中文内容规范。

分支命名、提交信息、PR 检查清单也都在 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可证

本项目使用 [MIT](./LICENSE) 协议发布，欢迎 fork / remix / 自带菜谱来交朋友。

> 如果你有其他许可证偏好（Apache-2.0 / GPL / 自定义条款等），fork 之后替换 `LICENSE` 文件并相应更新本节即可。MIT 仅是上游默认。

---

**致谢**：感谢每一位在 issue / PR 里加菜的厨房战友。让更多人少花点时间想「今天吃什么」🍲。
