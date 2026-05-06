<div align="center">

# 今天吃什么 · 家常菜随机器

**告诉它人数、有多少时间、忌口偏好，它帮你随机搭一桌家常菜，并自动生成分类买菜清单。**

无登录 · 无后端 · 纯前端 MVP · 中文优先

🌐 **[在线预览 · 立即体验](https://meimengchengzhen.github.io/jin-tian-chi-shenme/)**

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

🌐 **Live Demo (GitHub Pages)：** <https://meimengchengzhen.github.io/jin-tian-chi-shenme/>

打开链接即可在浏览器里直接试用本原型 —— 无需登录、不收集数据，刷新即换一组。每次 push 到 `main` 后，GitHub Actions 会自动构建并发布到 GitHub Pages（workflow 见 [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)）。

> 备用原型预览（Perplexity 计算实例，可能受组织设置限制）：<https://www.perplexity.ai/computer/a/jin-tian-chi-shi-yao-cai-JZA2UQlEQiqcDTqlYZnfsQ>

如果你想自己 fork 后部署，项目通过 `npm run build` 产出静态站点（输出到 `dist/public/`），可托管到任意静态平台（Vercel / Netlify / Cloudflare Pages / GitHub Pages 等），fork 后把链接换成你自己的即可。

如果你只想看截图，往下翻一屏。

## 功能特性

- **偏好筛选**：人数、最长用时、主菜数量、是否配汤 / 配素菜、口味标签（清淡 / 咸鲜 / 酸甜 / 微辣 / 重辣 / 麻辣）、忌口（素食 / 无猪肉 / 无牛肉 / 无海鲜 / 无辣 / 无蛋 / 无奶 / 无花生）、菜系、难度。
- **多场景模块**：首次进入时引导选择常用场景（个人控卡 / 全家晚餐 / 快手上班餐 / 儿童友好 / 长辈清淡 / 健身增肌 / 周末下厨）。每个场景预设人数 / 餐次 / 难度 / 时间 / 倾向口味，并对推荐评分加权；首页 Tab 任意切换。
- **饭桌陪伴**：吃完菜还有什么可看 / 可聊 / 可听？三个 Tab 提供「吃饭看什么」「今天聊什么」「做饭听什么」推荐。内置 45 条影视/综艺/纪录片/动画、53 条话题、42 条有声书/播客/音乐/亲子故事，按当前场景 + 人数 + 餐次 + 用时 + 档案年龄打分；家庭聚餐优先合家欢、儿童友好、长辈友好内容；话题避开政治宗教等敏感方向。所有外链都是搜索入口（豆瓣 / 腾讯 / 爱奇艺 / B 站 / 喜马拉雅 / 微信读书 / 小宇宙 / 网易云 / 百度），新窗口 + `rel="noopener noreferrer"`，不依赖任何需要密钥的 API。
- **本地账户 / 档案**：可输入昵称创建本地档案，保存口味喜好（喜欢/不喜欢）、忌口、偏好菜系、身体信息和饮食目标；多档案切换、退出。**所有数据只保存在浏览器 localStorage，不上传任何服务器。**
- **饮食计划 + 餐次热量评估**：基于 Mifflin-St Jeor 公式估算 BMR / TDEE，结合活动水平 + 目标（维持/减脂/增肌）给出每日推荐摄入；按餐次分配（默认晚餐 35%，午餐 40%，早餐 25%）。推荐时人均热量按 course 占比（主菜 50% / 汤 18% / 素 18%）做软匹配，且按场景的 caloriePriority 加权。结果区给出当前组合「人均合计 / 目标 / 差距 / 偏轻·刚好·偏高」评估。⚠️ 仅作饮食规划参考，不构成医学/营养建议。
- **省份+城市 / 定位 / 实时天气**：选择省份 → 城市（覆盖全部 34 个省级行政区 + 主要省会/直辖市）；或一键「使用当前位置」，通过浏览器 Geolocation API（需用户授权）+ Open-Meteo（无 key 公共 API）+ BigDataCloud 反向地理编码自动填充省/市/天气/温度。任何环节失败均 graceful fallback 回手动设置。
- **餐次主题 UI**：早餐 / 午餐 / 晚餐切换不同色调（清爽明亮 / 活力暖橙 / 温暖陶红），按 `data-meal` 属性叠加 CSS 变量。
- **「就吃这个了」 / 历史 / 收藏 / 不吃重复**：「就吃这个了」一键把当前组合记到本地历史（最多 30 条）；菜品卡片和详情页可收藏；开启「不吃重复的」开关后，最近 7 条历史中出现过的菜会被显著降权。收藏的菜未来推荐概率提高。所有数据本地保存，不上传。
- **多平台搜索入口**：菜品详情提供 Bilibili / 抖音 / 百度三个搜索按钮，关键词为「菜名 家常做法」，新窗口打开。
- **真实菜品图片**：卡片和详情头图通过 Unsplash Source 拿稳定关键词图片，加载失败自动 fallback 到渐变 + emoji（不依赖私有 CDN，不引入大体积本地图片）。详情页明确标注「示意图」。
- **「今天吃什么」**：一键随机一组菜，附推荐理由 / 用时 / 难度 / 食材 / 步骤；启用饮食计划后每张卡片显示「人均热量 vs 餐次目标」。
- **「换一组」/「单换一道」/「锁定」**：增量重抽，方便迭代决策；锁定的菜不会被换掉。
- **「今日买菜清单」**：自动按 `蔬菜 / 肉蛋豆制品 / 调味·主食` 三类整理，**去重并合并相同食材**，一键复制为纯文本。
- **600+ 道菜谱**：手写核心菜 + 脚本扩展模板组合（主料 × 风格 × 蔬菜搭配 + 水果 × 甜品 × 烘焙 × 饮品 × 小吃），覆盖主菜 / 汤 / 素菜 / 主食、多菜系、多季节/天气标签。
- **门类浏览：甜品 / 饮品 / 小吃 / 早餐 / 烘焙 / 轻食 / 下午茶 / 夜宵**：与 Course 正交的 `category` 字段，主推荐保持 main/veggie/soup/staple，门类浏览模块按子门类挑菜。
- **饭桌热榜（Beta）**：聚合微博 / 百度 / 抖音 / B 站 / 知乎 / 今日头条 6 大平台公开热榜，多源 fallback；任何端点失败自动降级到内置静态示例。每条带「为什么适合饭桌」提示 + 平台/百度搜索链接 + 渐变视觉卡。**默认开启「屏蔽争议 / 敏感话题」开关**，覆盖政治/冲突/灾难/刑案/地域歧视等关键词，可一键关闭。
- **云端同步 Beta（可选）**：纯前端 + localStorage 仍是默认体验。配置 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 后启用 Supabase 邮件 OTP 登录 + 跨设备同步档案/收藏/历史；未配置时 UI 优雅降级提示「本地数据仍可用」。详见 [docs/supabase.md](docs/supabase.md)。
- **零后端 / 零数据收集**：纯前端原型，本地账户没有密码、不上传；启用云端同步需用户主动配置自己的 Supabase 实例。
- **响应式 + 暗色模式**：手机一手可达，深色模式自动跟随系统。

## 截图

> 想直接动手试？点 [在线预览](https://meimengchengzhen.github.io/jin-tian-chi-shenme/) 比看图更快。

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

类型检查 + 推荐算法冒烟测试：

```bash
npm run check            # tsc 类型检查
npm run check:recommend  # 推荐算法+忌口+数据库规模
```

重新生成扩展菜谱（基于模板组合）：

```bash
npm run gen:recipes      # 写入 client/src/data/recipes.generated.ts
```

## 云端同步（可选 · Supabase Beta）

> 默认是**纯前端**：所有档案、收藏、历史都在你的浏览器 localStorage，不上传任何服务器。
>
> 想跨设备同步？接入你自己的 Supabase 实例就好，详细步骤：

1. 创建 Supabase 项目（免费档够用），在 SQL Editor 执行 [`supabase/migration.sql`](supabase/migration.sql) — 一次建好 `user_profiles` / `user_state` / `favorites` / `history` / `preferences` 五张表，全部启用 RLS 行级策略。
2. 复制 `.env.example` 为 `.env`，填入：
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...           # Settings → API → anon public
   ```
   ⚠️ 仅使用 `anon (public) key`；`service_role` 严禁出现在前端。
3. GitHub Pages 部署时，把这两个变量加到仓库 `Settings → Variables`，并在 workflow 的 build 步骤注入（[详见教程](docs/supabase.md)）。
4. 启用后，UI 顶部「云端同步 Beta」按钮可：邮件 OTP 登录 → 一键推送本地快照 → 一键从云端合并。

**未配置时**，「云端同步 Beta」对话框会显示「未配置 Supabase，本地数据仍可用」并附上教程链接，所有功能继续 100% 可用。

## 隐私与「本地账户」说明

这是一个纯静态站点（GitHub Pages），没有后端、没有数据库。

- 「我的档案」里输入的昵称、喜好、身高体重、饮食目标都通过 `safeSet/safeGet` 写入 `localStorage`（key 前缀 `chishenme.*`）。
- 浏览器禁用 localStorage（隐私模式 / iframe 沙箱预览）时，自动退回**内存态**，刷新页面会丢；UI 顶部会有提示。
- 没有密码字段，没有跨设备同步，**不会**调用第三方 Auth/分析服务。这是一个「本地原型」，不要用在多人共用的浏览器里保存敏感个人信息。
- 想要真正的多设备登录、跨终端同步：在 `lib/profile.ts` 把读写函数替换成 Supabase / Clerk 的 SDK 即可，UI 层不需要改。
- 健康相关字段（BMR/TDEE/目标摄入）用 Mifflin-St Jeor 公式估算，**仅作饮食规划参考，不构成医学/营养建议**。

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
│       ├── components/
│       │   ├── DishDetail.tsx  # 菜品详情：食材热量/价格估算 + 视频链接
│       │   └── ProfileDialog.tsx  # ★ 档案 / 喜好 / 饮食计划 / 环境
│       ├── data/
│       │   ├── ingredients.ts  # 食材热量/价格主数据
│       │   ├── recipes.ts      # ★ 手写核心菜谱 + 合并 RECIPES 出口
│       │   └── recipes.generated.ts  # 自动生成（脚本扩展），不要直接编辑
│       ├── lib/
│       │   ├── recommend.ts    # ★ 推荐算法 + 评分（含档案/环境/热量）
│       │   ├── profile.ts      # 本地档案 + BMR/TDEE 计算
│       │   ├── environment.ts  # 地区/天气/季节/日期上下文
│       │   ├── calories.ts     # 每道菜的人均热量缓存
│       │   └── storage.ts      # 安全 localStorage 封装（不可用时退回内存）
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

实现位于 `client/src/lib/recommend.ts`。整体是一个**「硬性过滤 → 软性放宽兜底 → 打分 → 分类抽样 → 锁定增量」** 的轻量算法，适合不到 100 道菜的小数据集，无需任何模型：

1. **硬性过滤（绝不让步）**：忌口（素食 / 无猪肉 / 无牛肉 / 无海鲜 / 无辣 / 无蛋 / 无奶 / 无花生）始终遵守。
2. **软性约束 + 逐级放宽兜底**：菜系 / 难度 / 用时上限默认全部生效，但只要有一类菜（主菜 / 素菜 / 汤）填不满，就按下面这个顺序自动放宽，直到能给出推荐：
   1. 放宽**难度**
   2. 再放宽**菜系**
   3. 最后放宽**用时上限**

   只要触发了任何一级放宽，UI 上会用提示条告诉用户「已自动放宽：xxx」。
3. **打分**：
   - 口味命中：`+1.4`
   - 菜系命中：`+0.6`
   - 难度命中：`+0.4`
   - 用时短：`+0 ~ +0.3`（轻微加分，鼓励快手菜）
   - 随机扰动：`+0 ~ +0.6`（保证「换一组」每次结果不同）
4. **分类抽样**：在 `main / veggie / soup / staple` 各类的候选里取 Top N（一般 N = 6），从中随机挑选要求的数量。
5. **锁定**：用户「锁住」的菜在下一轮直接保留，不参与重抽，剩下的位置才走步骤 1-4。

**完全无解时的兜底**：如果硬性忌口本身就把整个 `course` 都筛空了（例如同时勾选「素食 + 无蛋 + 无奶」时，候选主菜可能为 0），UI 会用一条浅琥珀色提示条告诉用户「以下分类暂无符合忌口的菜：xxx，可以试试关闭对应开关或减少忌口」，而不是静默无反应。

副产物：`buildShoppingList(recipes)` 把所有菜的 `ingredients` 按 `category` 合并去重（同名食材数量字符串以「/」拼接），生成可直接复制的买菜清单文本。

如果未来要换成更复杂的策略（用户口味学习、本地小模型重排、营养优化），只需要替换 `recommend()` 这一个函数。

兜底策略带有冒烟测试，可以本地运行：

```bash
npm run check:recommend
```

会校验：默认偏好命中、单一菜系（含 0 候选）也能返回结果、所有忌口在结果里都被严格遵守、极严格组合（鲁菜 + 进阶 + 15 分钟）会触发自动放宽。

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
