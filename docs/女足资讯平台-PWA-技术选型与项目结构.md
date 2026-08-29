# 女足资讯平台 PWA 技术选型与项目结构

> 本文是开发实施依据。产品范围以《女足资讯平台-PWA-需求文档.md》为准；本文定义工程结构、技术边界与实施顺序。

## 1. 目标与原则

本项目是 WSL（英格兰女子超级联赛）资讯 PWA 黑客松作品。目标是在 56 小时内交付可部署、可演示、可接入真实数据 API 的移动端优先产品。

- 前端、服务端接口和页面路由使用同一个 Next.js 项目。
- 登录、用户数据、内容和审核状态由 Supabase 承担。
- 赛事数据 API 暂未确定，必须通过适配器隔离，页面不得直接依赖供应商字段。
- 使用 Vercel 部署，避免维护服务器。
- 优先完成真实数据路径和核心用户闭环，不在首版引入独立 CMS、运营后台或复杂实时推送。

## 2. 技术选型

| 模块 | 选型 | 职责 | 优点 |
| --- | --- | --- | --- |
| 前端与服务端 | Next.js App Router + TypeScript | 页面、动态路由、Route Handlers、SEO、服务端数据编排 | 单仓库完成全栈开发；适合动态详情页和 Vercel 部署 |
| UI | Tailwind CSS + shadcn/ui | 响应式布局、设计变量、基础组件 | 黑客松迭代快；便于统一紫色 `#64077E` 品牌视觉 |
| 数据库与身份 | Supabase Postgres + Auth + RLS | 登录、用户资料、文章、评论、关注、收藏、点赞、举报、缓存 | 关系型数据适合赛事和互动关系；无需自建后端 |
| 数据请求状态 | TanStack Query | 客户端缓存、重试、刷新、loading/error 状态 | 减少重复请求；方便处理接口异常和刷新 |
| 部署 | Vercel | 预览部署、生产部署、环境变量、Serverless 运行时 | Next.js 集成最顺畅，适合快速公开演示 |
| PWA | Next.js `manifest.ts` + Serwist/Workbox | 安装信息、离线缓存、网络恢复 | 可缓存应用外壳与已读资讯，满足 PWA 基础体验 |
| WSL 数据 | 自备 API + Adapter | 赛程、积分、球队、球员、比赛详情 | 后续替换 API 时不影响页面、组件和数据库结构 |

### 2.1 备选方案与取舍

| 方案 | 优点 | 不选为首选的原因 |
| --- | --- | --- |
| Vite + React + Supabase + Cloudflare Pages | 轻量、免费额度充足 | API 代理、服务端缓存与 SEO 需要额外拼装，新手成本更高 |
| Next.js + Firebase + Vercel | 登录和实时能力成熟 | 赛事、球队、球员、互动关系更适合 Postgres 而不是文档数据库 |
| Next.js + Sanity + Supabase + Vercel | 新闻编辑体验更专业 | 多一套内容系统，56 小时首版不划算 |

## 3. 系统职责边界

### Next.js

- `app/`：页面路由、页面级数据编排、加载/错误/空状态。
- `app/api/`：对前端暴露稳定的内部 HTTP 接口。
- `components/`：可复用 UI 和交互，不处理供应商数据格式。
- `lib/`：API 适配、Supabase、缓存、鉴权、校验、格式化等基础能力。

### Supabase

- `Auth`：Email Magic Link 登录和会话。
- `Postgres`：用户数据、文章、互动、评论审核、API 缓存。
- `RLS`：限制用户只能写入和修改自己的数据。
- `Table Editor`：黑客松阶段临时代替新闻发布和评论审核后台。

### Vercel

- 承载 Next.js 站点和 Route Handlers。
- 保存生产、预览环境变量。
- 提供预览链接和正式线上链接。

### 自备 WSL API

- 只在 `lib/wsl-api/` 中调用。
- API key 只在服务端环境变量使用，绝不传入浏览器。
- 供应商响应先经过 normalizer 转换为项目类型。
- 未确定 API 前，由 `mock-adapter.ts` 提供可演示数据。

## 4. WSL API 适配器设计

前端、页面和组件只能使用项目内部类型，不得读取供应商字段。

```ts
interface WslApiAdapter {
  getFixtures(params?: FixtureQuery): Promise<ApiResult<Fixture[]>>;
  getStandings(params?: StandingQuery): Promise<ApiResult<StandingRow[]>>;
  getTeams(params?: TeamQuery): Promise<ApiResult<Team[]>>;
  getTeam(teamId: string): Promise<ApiResult<TeamDetail>>;
  getPlayer(playerId: string): Promise<ApiResult<PlayerDetail>>;
  getMatch(matchId: string): Promise<ApiResult<MatchDetail>>;
}
```

统一返回结构：

```ts
type ApiResult<T> = {
  data: T;
  source: "live" | "cache" | "mock";
  updatedAt: string;
  isStale: boolean;
};
```

未来确定 API 后，只执行以下改动：

1. 在 `lib/wsl-api/client.ts` 配置请求地址、鉴权和超时。
2. 在 `lib/wsl-api/adapter.ts` 实现接口调用。
3. 在 `lib/wsl-api/normalizers.ts` 将供应商字段映射为内部类型。
4. 如有需要，在 `lib/cache/` 调整缓存周期。

页面、组件和数据库查询不应因此修改。

## 5. Supabase 数据模块

| 表 | 用途 | 关键规则 |
| --- | --- | --- |
| `profiles` | 用户资料、主队、首次登录状态 | 用户仅能读写自己的资料 |
| `articles` | 新闻、专题、人物、战术解析 | 已发布文章公开读取 |
| `article_relations` | 文章关联球队、球员、比赛 | 供详情页跳转和筛选使用 |
| `favorites` | 用户收藏文章 | 一位用户不能重复收藏同一文章 |
| `follows` | 用户关注球队、球员、赛事 | 一位用户不能重复关注同一对象 |
| `comments` | 新闻评论、一级回复、审核状态 | 公开列表仅读取 `approved` |
| `likes` | 资讯和公开评论点赞 | 用户只能点赞或取消自己的记录 |
| `reports` | 对评论的举报 | 同一用户同一对象重复举报合并 |
| `notification_settings` | 通知授权与提醒开关 | 用户仅能读写自己的设置 |
| `api_cache` | WSL API 最近成功响应 | 服务端写入，前端不直接访问 |

安全规则：

- `SUPABASE_SERVICE_ROLE_KEY` 只存在于服务端环境变量。
- 所有用户写操作均需服务端鉴权与 Supabase RLS 双重限制。
- 评论新建默认状态为 `pending`。
- 游客只能读公开文章与已审核评论。

## 6. PWA 与离线策略

### 必做配置

- `app/manifest.ts`：应用名称、图标、主题色、独立窗口显示。
- `public/icons/`：`icon-192.png` 和 `icon-512.png`，后续替换为正式品牌图标。
- Service Worker：使用 Serwist 或 Workbox 配置。

### 缓存策略

| 资源 | 策略 | 离线行为 |
| --- | --- | --- |
| 应用外壳、字体、样式 | Cache First | 可直接打开已访问页面 |
| 新闻列表、新闻详情 | Stale While Revalidate | 优先显示缓存，同时联网更新 |
| 赛程、积分、比赛详情 | Network First | 网络失败时显示最近成功数据并提示可能过期 |
| 登录、评论、点赞、关注、举报 | 不缓存写操作 | 离线时明确提示操作未提交 |

## 7. 完整项目结构

```text
herpitches/
├── app/
│   ├── (main)/
│   │   ├── data/
│   │   │   ├── fixtures/
│   │   │   ├── standings/
│   │   │   ├── matches/[matchId]/
│   │   │   ├── teams/[teamId]/
│   │   │   └── players/[playerId]/
│   │   ├── news/[articleId]/
│   │   ├── club/select/
│   │   ├── community/
│   │   └── me/
│   │       ├── follows/
│   │       ├── favorites/
│   │       └── notifications/
│   ├── auth/
│   │   ├── login/
│   │   └── callback/
│   ├── api/
│   │   ├── wsl/
│   │   ├── articles/
│   │   ├── comments/
│   │   └── interactions/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── manifest.ts
│   ├── globals.css
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── layout/
│   ├── ui/
│   ├── data/
│   ├── news/
│   ├── community/
│   └── user/
├── lib/
│   ├── wsl-api/
│   ├── supabase/
│   ├── cache/
│   ├── auth/
│   ├── validation/
│   ├── formatters/
│   └── constants/
├── types/
├── supabase/
│   └── migrations/
├── public/
│   ├── icons/
│   ├── images/
│   └── fonts/
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
├── .env.example
├── middleware.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

### 7.1 文件职责

| 目录 | 只负责什么 |
| --- | --- |
| `app/` | 路由、页面布局、页面级请求与状态组合 |
| `components/` | 可复用的视觉组件与交互组件 |
| `components/ui/` | 无业务含义的基础 UI，如按钮、输入框、弹窗 |
| `lib/wsl-api/` | 自备 WSL API 的请求、适配、字段转换和 mock |
| `lib/supabase/` | 浏览器/服务端 client、数据库查询、会话协助 |
| `lib/cache/` | 数据 API 缓存读取、写入和过期策略 |
| `lib/auth/` | 登录守卫和登录后跳转规则 |
| `lib/validation/` | 服务端输入校验 |
| `lib/formatters/` | 日期、比分、球员姓名等展示转换 |
| `lib/constants/` | 路由、导航、状态枚举等共享常量 |
| `types/` | 全项目共享领域类型 |
| `supabase/migrations/` | 按时间顺序执行的表结构与 RLS 变更 |
| `tests/` | 单元测试与核心用户路径端到端测试 |

## 8. 56 小时分组实施计划

### 第一组：工程基础（0-6 小时）

- 初始化 Next.js、TypeScript、Tailwind CSS。
- 配置基础主题和紫色 `#64077E` 设计变量。
- 配置 Supabase 客户端与 Vercel 环境变量。
- 建立五个一级导航入口和 loading/error/not-found 页面。

完成标准：本地可启动，五个一级入口可访问，Vercel 可部署基础站点。

### 第二组：WSL 数据适配（6-14 小时）

- 定义 `Team`、`Player`、`Fixture`、`MatchDetail`、`StandingRow` 等内部类型。
- 实现 `WslApiAdapter` 和 mock adapter。
- 预留自备 API 的请求地址、鉴权、超时和错误处理。
- 实现数据来源、更新时间、数据是否过期的统一返回格式。

完成标准：未配置 API 时可演示；配置 API 后仅替换 adapter 层。

### 第三组：赛事数据页面（14-26 小时）

- 数据首页、赛程赛果、积分榜。
- 比赛详情、球队详情、球员详情。
- 阵容中的球员跳转球员页，球员所属球队跳转球队页。
- 覆盖 loading、empty、error、stale 四种状态。

完成标准：用户能从赛程进入比赛、从阵容进入球员、从球员回到球队。

### 第四组：新闻与内容（26-34 小时）

- 新闻列表、搜索、筛选与详情页。
- Markdown 内容渲染。
- 关联球队、球员、赛事入口。
- 收藏和资讯点赞。
- 用 Supabase seed 数据或 Table Editor 维护初始新闻。

完成标准：资讯浏览、关联跳转、收藏路径完整。

### 第五组：登录、主队和个人数据（34-41 小时）

- Email Magic Link 登录。
- 首登选择主队，可跳过。
- 主队页、关注、收藏列表、评论记录。
- 退出登录和会话处理。

完成标准：登录用户能够设置主队并查看个人数据。

### 第六组：评论社区（41-46 小时）

- 资讯详情评论、一层回复。
- 待审核、已通过、被拒绝、已删除四种状态。
- 作者可见自己的待审核评论，公开列表仅显示已通过评论。
- 点赞、取消点赞、举报。

完成标准：评论审核规则正确，游客只能浏览公开评论。

### 第七组：PWA 与体验（46-51 小时）

- 添加 manifest、正式图标和 Service Worker。
- 缓存应用外壳、近期新闻和已访问文章。
- 添加离线提示与图片加载失败替代信息。

完成标准：手机浏览器可安装，离线时可读缓存资讯。

### 第八组：上线与验收（51-56 小时）

- 配置生产环境变量并部署 Vercel。
- 检查移动/桌面响应式和横向溢出。
- 检查 API 失败、空数据、缓存过期、游客拦截等场景。
- 准备演示脚本，并保留 mock fallback。

完成标准：线上可访问，核心路径稳定可演示。

## 9. 防止代码混乱的约束

- 页面不直接请求第三方 API，也不直接解析供应商字段。
- 所有 WSL 数据请求只能从 `lib/wsl-api/` 发起。
- 所有跨模块类型只能在 `types/` 中定义，不在页面重复声明。
- Supabase 查询集中在 `lib/supabase/queries.ts`，不在页面散落数据库逻辑。
- 每个组件只承担一个主要视觉或交互职责。
- 业务状态使用统一枚举和常量，禁止在多个页面随意书写字符串。
- API 字段必须先经过 normalizer；供应商返回的原始 JSON 不进入组件。
- 每个 API 响应都保留数据来源、最近更新时间和是否过期。
- 写操作必须经服务端鉴权和 RLS 校验，不能依赖前端隐藏按钮。
- 每个页面都要有 loading、empty、error、stale 状态。
- 每完成一个模块保持项目可运行、可部署，不把问题堆到最后。

## 10. 验收清单

- 游客可浏览数据、新闻和已审核评论。
- 游客触发收藏、关注、评论、点赞时被引导登录，并保留阅读上下文。
- 自备 API 未配置时，mock 数据支持完整演示。
- 自备 API 配置后，页面无需改动即可切换为真实数据。
- API 失败时展示缓存或清晰错误，而非空白页面。
- 数据缺失时显示“暂未提供”，不使用假零值。
- 球队、比赛、球员之间的实体跳转正确。
- 待审核评论不出现在公开评论列表。
- 用户只能修改自己的关注、收藏、评论和设置。
- PWA 可以安装，离线能阅读缓存文章。
- 离线写操作明确提示未提交。
- 移动端和桌面端没有遮挡、溢出或无法点击的关键操作。

## 11. 环境变量预留

```dotenv
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 自备 WSL API
WSL_API_BASE_URL=
WSL_API_KEY=
WSL_API_TIMEOUT_MS=10000
```

> `SUPABASE_SERVICE_ROLE_KEY` 和 `WSL_API_KEY` 只可用于服务端，不得以 `NEXT_PUBLIC_` 前缀暴露。
