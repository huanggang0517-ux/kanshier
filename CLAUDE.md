# 玄机看事儿 (kanshier) 项目规范

## 项目说明
AI 命理小工具，古风 UI。Next.js 14 App Router + Supabase + Tailwind。

## 核心功能
- 看事儿：三字/三数测吉凶（阳/太极主角）
- 著·墨迹：每日一字/一画记录（阴/太极主角）
- 给未来的信：写给明年自己（¥0.52）
- 智慧速课：AI 一键生成多智能体互动课程（集成 OpenMAIC）
- 藏经阁：电子书 PDF 阅读（¥16.8，管理员上传/批注）
- 年卡会员：¥18.8/年，无限次（管理员人工确认收款开通）
- Admin 后台：用户管理/订单确认/书籍管理/密码重置

## 鉴权体系（2026-08 重建）
- **自建 session + httpOnly cookie**，不用 Supabase Auth。
- Cookie 名 `ks_session`（httpOnly, SameSite=Lax, 生产 Secure, 30 天有效）。
- `sessions` 表存 token（`crypto.randomBytes(32)`），服务端查表换用户，`on delete cascade`。
- 前端登录态唯一来源是 `GET /api/user/me`；登出 `POST /api/auth/logout`。
- 所有 API 从 cookie 取当前用户，**不信任请求体/query 里的 userId**。
- 管理员 = `users.is_admin` 字段（不再硬编码手机号）。
- Webhook 鉴权：`/api/zhihuisuke/job-status` 需 `x-webhook-secret` 头 === `OPENMAIC_WEBHOOK_SECRET`。
- 忘记密码：**无自助入口**，登录态内改密 + 管理员后台重置。

### 关键 lib
- `src/lib/session.js` — createSession / getSessionUser / getActiveUser / attachSessionCookie / unauth / forbidden / destroySession
- `src/lib/password.js` — hashPassword / verifyPassword（PBKDF2）
- `src/contexts/AuthContext.jsx` — 前端 `useAuth()`，暴露 `{ user, loading, login, logout, refresh }`

### 环境变量
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # 服务端专用，勿暴露
DEEPSEEK_API_KEY
OPENMAIC_BASE_URL           # 本地/自建 OpenMAIC，优先于 Vercel proxy
OPENMAIC_WEBHOOK_SECRET     # job-status webhook 共享密钥
NEXT_PUBLIC_OPENMAIC_FRONTEND_URL  # 课堂 iframe 前端域名（可选）
```

### 数据库迁移
一次性迁移 `supabase/migrations/001_auth_groundwork.sql`（建 sessions 表 + users.is_admin 列 + 置管理员手机号 17614130826 为 admin）。后续 schema 变更同样在 supabase/migrations/ 里新增文件，手动在 Supabase SQL Editor 执行。

## 目录结构
```
src/
├── app/               # 路由页面 (App Router)
│   ├── api/           # API 路由
│   ├── kanshier/      # 看事儿
│   ├── manifest/      # 著·墨迹
│   │   ├── write/     # 手写画布
│   │   └── entry/     # 日条目查看
│   ├── letter/        # 给未来的信
│   ├── ebooks/        # 藏经阁
│   ├── vip/           # 年卡会员
│   ├── admin/         # 管理后台
│   ├── zhihuisuke/    # 智慧速课
│   ├── login/         # 登录/注册
│   ├── profile/       # 我的
│   └── result/[id]/   # 结果页（看事儿 + 信件共用）
├── components/
│   ├── ui/            # 可复用基础组件
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── PageNav.jsx
│   │   ├── InkInput.jsx
│   │   ├── GoldBadge.jsx
│   │   ├── SealStamp.jsx
│   │   └── Loading.jsx
│   ├── Header.jsx
│   ├── LetterReminder.jsx   # 全局来信提醒
│   ├── ResultDisplay.jsx
│   └── ThemeToggle.jsx
├── contexts/
│   ├── ThemeContext.jsx
│   └── AuthContext.jsx
├── lib/
│   ├── session.js     # 鉴权核心
│   ├── password.js
│   ├── auth.js        # checkVipExpiry
│   ├── supabase.js
│   ├── supabase-admin.js
│   ├── deepseek.js
│   ├── utils.js       # localStorage 缓存（仅 AuthContext 用）
│   └── manifest/brush.js
```

## 设计体系 — 融合古风 × 现代 Token

### 视觉风格
- 古风灵魂：宣纸底（parchment）、墨色（ink）、金色（gold）、朱砂（cinnabar）
- 现代 Token 架构：4pt 间距栅格、圆角阶梯、阴影海拔、动效曲线
- 毛玻璃材质卡片（glass-card），配合古风角饰、内框、书缝线装饰

### 核心 Token（定义在 globals.css）
```
色彩：--color-primary (金), --color-accent (朱砂)
背景：--bg-primary, --bg-card, --bg-elevated, --bg-overlay, --bg-secondary
文字：--text-primary, --text-secondary, --text-muted
间距：--space-{1..24} (4pt 栅格)
圆角：--radius-{xs..2xl, pill}
阴影：--shadow-{xs..lg, gold, cinnabar}
动效：--duration-{fast, normal, slow}, --ease-{in-out, out, spring}
毛玻璃：--glass-bg, --glass-border, --glass-highlight
```

### 组件调用法则
1. 优先使用 `src/components/ui/` 下现成组件（Button、Card、PageNav、InkInput 等）
2. 不允许用原生 `<button>`/`<input>` 手写已有组件
3. 组合优先，搭积木式拼页面
4. 缺失组件先报告再创建

### 铁律
- ❌ 禁止硬编码数值（px/色值）
- ❌ 禁止使用纯黑纯白
- ✅ 必须使用 CSS 变量

## 运行命令
```bash
npm run dev    # 开发
npm run build  # 构建
npm start      # 生产
```

## 规范
- 不加注释，除非逻辑不直观
- 不改 .env 和 CI/CD，改前先问
- tailwind + CSS 变量混用，变量优先
- 暗色模式用 .dark class
- 前端登录态一律走 `useAuth()`，不直接 `getUser()` 判断权限
- API 一律从 session 取身份，新增 API 也按此模式
