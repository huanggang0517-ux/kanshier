# 玄机看事儿 (kanshier) 项目规范

## 项目说明
AI 命理小工具，古风 UI。Next.js 14 App Router + Supabase + Tailwind。

## 核心功能
- 看事儿：三字/三数测吉凶（阳/太极主角）
- 著·墨迹：每日一字/一画记录（阴/太极主角）
- 给未来的信：写给明年自己（¥0.52）
- 智慧速课：AI 一键生成多智能体互动课程（集成 OpenMAIC）

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
│   └── ...
├── components/
│   ├── ui/            # 可复用基础组件
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── PageNav.jsx
│   │   ├── InkInput.jsx
│   │   ├── GoldBadge.jsx
│   │   ├── SealStamp.jsx
│   │   └── Loading.jsx
│   └── ...            # 页面级组件
├── contexts/
├── lib/
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
