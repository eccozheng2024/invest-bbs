# InvestBBS 工作计划

## TL;DR

> **Quick Summary**: 交付一个单版块、经典 BBS 风格的网站，支持 AI 自动采集财经/AI 新闻并自动发帖，同时支持用户上传 PDF/视频/电子书、评论回复、关键字搜索，采用申请制注册与管理员审批。
>
> **Deliverables**:
> - Next.js + Payload CMS 可部署应用
> - 用户申请审批、发帖、评论、搜索、上传闭环
> - AI 新闻采集与自动发帖任务
> - 管理后台与上线验收清单
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: 工程搭建 -> 权限模型 -> 帖子/上传 -> AI 采集 -> 联调上线

---

## Context

### Original Request
构建类似传统 BBS 的站点；新帖来源包括：
- 自动收集 AI 重要消息（重点上市公司相关）
- 微信好友自主上传信息（PDF、视频、电子书）

要求：管理员审批后可发帖，普通权限可观看；电脑与手机端都方便使用。

### Interview Summary
- 用户规模：<= 50（私密圈）
- 单版块（不做分区）
- 关键字搜索
- 申请制注册（管理员审批）
- 两级权限（admin/user）
- 评论与回复开启
- 上传文件 <= 50MB
- AI 新闻全自动发布
- 不做通知
- UI 为经典 BBS 风格
- 云部署 + 二级域名 + 低成本优先

### Metis Review
Metis 服务不可用，采用自检替代并补齐：
- 上传安全白名单、大小限制、失败提示
- AI 新闻去重（URL）与限流重试
- API 失败降级与日志
- 明确排除范围（通知、私信、积分、多版块）

---

## Work Objectives

### Core Objective
建设一个可上线、可维护的投资信息 BBS，支持“自动内容输入 + 用户上传讨论”的双内容源，确保移动端可用与低成本运行。

### Concrete Deliverables
- `web/`: 列表页、详情页、发帖页、申请页、登录页
- `cms/`: 用户/帖子/评论/附件集合与权限
- `jobs/ai-ingest/`: 抓取、过滤、摘要、发布
- `infra/`: 环境变量样例、部署配置

### Definition of Done
- [x] 未登录用户可浏览；审批通过用户可发帖与评论
- [x] 申请 -> 审批 -> 登录 -> 发帖闭环可用
- [x] 上传文件（<=50MB）可成功并在帖子中访问
- [x] AI 自动发帖按计划运行且不重复刷屏
- [x] 搜索命中标题与正文
- [x] 桌面与手机主流程可用

### Must Have
- 单版块 BBS 首页（密集列表）
- 帖子详情 + 评论回复
- 申请审批机制
- 文件上传与访问
- AI 自动采集与发帖
- 关键字搜索

### Must NOT Have (Guardrails)
- 不做多版块/子版块
- 不做通知（站内/邮件/微信）
- 不做私信
- 不做积分/等级
- 不做推荐系统

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> 所有验收必须由执行代理自动完成，不依赖人工点击确认。

### Test Decision
- **Infrastructure exists**: NO（新项目）
- **Automated tests**: YES（Tests-after）
- **Framework**: Vitest + Playwright

### Test Setup Task
- [x] 初始化 Vitest 与 Playwright
- [x] 建立 smoke tests（首页、登录、详情）
- [x] CI 中可执行 unit 与 e2e

### Agent-Executed QA Scenarios

Scenario: 申请到发帖闭环
  Tool: Playwright
  Preconditions: 站点运行、管理员账号可用
  Steps:
    1. 打开 `/apply`
    2. 提交申请
    3. 管理员后台审批
    4. 新用户登录
    5. 发帖并提交
    6. 详情页断言标题存在
  Expected Result: 闭环成功
  Evidence: `.sisyphus/evidence/e2e-apply-post.png`

Scenario: 非法文件拦截
  Tool: Playwright
  Preconditions: 用户已登录
  Steps:
    1. 上传 `.exe`
    2. 提交
    3. 断言“文件类型不允许”
  Expected Result: 上传失败且无附件入库
  Evidence: `.sisyphus/evidence/e2e-upload-blocked.png`

Scenario: AI 采集自动发帖
  Tool: Bash
  Preconditions: API Key 已配置
  Steps:
    1. 运行一次采集任务
    2. 断言日志含 `fetched/filtered/summarized/published`
    3. 查询数据库确认新增 `source=ai-ingest` 帖子
  Expected Result: 采集成功
  Evidence: `.sisyphus/evidence/ai-ingest.log`

Scenario: AI 去重
  Tool: Bash
  Preconditions: 同 URL 已存在
  Steps:
    1. 再次采集
    2. 断言日志出现 `deduplicated`
    3. 断言 URL 帖子数不变
  Expected Result: 无重复帖子
  Evidence: `.sisyphus/evidence/ai-dedup.log`

---

## Execution Strategy

### Parallel Execution Waves

Wave 1:
- 1. 工程搭建
- 2. 数据模型与权限
- 3. 测试基建

Wave 2:
- 4. 申请/审批流程
- 5. 帖子/评论/上传
- 6. 搜索

Wave 3:
- 7. AI 采集与自动发帖
- 8. 联调与上线验收

Critical Path: 1 -> 2 -> 5 -> 7 -> 8

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 4,5,6,7,8 | 2,3 |
| 2 | 1 | 4,5,6,7 | 3 |
| 3 | 1 | 8 | 2 |
| 4 | 2 | 8 | 5,6 |
| 5 | 2 | 7,8 | 4,6 |
| 6 | 2 | 8 | 4,5 |
| 7 | 2,5 | 8 | None |
| 8 | 3,4,5,6,7 | None | None |

---

## TODOs

- [x] 1. 初始化工程与部署骨架
  **What to do**: Next.js + Payload + PostgreSQL + R2 基础可运行
  **Must NOT do**: 不引入通知/推荐相关服务
  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: `frontend-ui-ux`
  **Parallelization**: Wave 1, 可并行, 阻塞 4/5/6/7/8
  **References**:
  - `https://payloadcms.com/docs/getting-started/what-is-payload`
  - `https://nextjs.org/docs`
  - `https://developers.cloudflare.com/r2/`
  **Acceptance Criteria**:
  - [x] 首页可访问
  - [x] 管理后台可访问
- [x] 数据库连接成功

- [x] 2. 数据模型与 RBAC
  **What to do**: users/posts/comments/attachments 集合 + pending/approved + admin/user
  **Must NOT do**: 不新增第三角色
  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `frontend-ui-ux`
  **Parallelization**: Wave 1, 可并行, 阻塞 4/5/6/7
  **References**:
  - `https://payloadcms.com/docs/access-control/overview`
  - `https://payloadcms.com/docs/authentication/overview`
  **Acceptance Criteria**:
- [x] 未审批用户发帖被拒绝
- [x] 审批用户可发帖

- [x] 3. 测试基础设施
  **What to do**: Vitest + Playwright + smoke tests + CI
  **Must NOT do**: 不引入重复测试框架
  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: `playwright`
  **Parallelization**: Wave 1, 可并行, 阻塞 8
  **References**:
  - `https://vitest.dev/guide/`
  - `https://playwright.dev/docs/intro`
  **Acceptance Criteria**:
- [x] unit 命令可运行
  - [x] e2e 命令可运行

- [x] 4. 申请注册与管理员审批
  **What to do**: 申请页、审批列表、审批后可登录
  **Must NOT do**: 不做通知
  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `frontend-ui-ux`, `playwright`
  **Parallelization**: Wave 2, 可并行, 依赖 2
  **References**:
  - `https://payloadcms.com/docs/admin/overview`
  **Acceptance Criteria**:
- [x] 申请后状态 pending
- [x] 审批后状态 approved

- [x] 5. 帖子/评论/上传
  **What to do**: BBS 列表、详情、评论回复、附件白名单上传（<=50MB）
  **Must NOT do**: 首版不接入视频转码服务
  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `frontend-ui-ux`, `playwright`
  **Parallelization**: Wave 2, 可并行, 阻塞 7/8
  **References**:
  - `https://payloadcms.com/docs/upload/overview`
  - `https://developers.cloudflare.com/r2/`
  **Acceptance Criteria**:
- [x] 合法文件可上传并可访问
- [x] 非法类型被拒绝
- [x] 超 50MB 被拒绝

- [x] 6. 搜索功能
  **What to do**: 标题+正文关键字搜索（中英文）
  **Must NOT do**: 不做语义检索
  **Recommended Agent Profile**:
  - Category: `unspecified-low`
  - Skills: `frontend-ui-ux`
  **Parallelization**: Wave 2, 可并行, 依赖 2
  **References**:
  - `https://www.postgresql.org/docs/current/textsearch.html`
  **Acceptance Criteria**:
- [x] 标题与正文均可命中

- [x] 7. AI 新闻采集与自动发帖
  **What to do**: 新闻源拉取 -> 关键词过滤 -> LLM 摘要 -> 自动发帖 -> 去重/重试/降级
  **Must NOT do**: 不做复杂舆情模型
  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `playwright`
  **Parallelization**: Wave 3, 串行, 依赖 2/5
  **References**:
  - `https://gnews.io/docs`
  - `https://platform.openai.com/docs`
  **Acceptance Criteria**:
- [x] 周期任务可执行
- [x] 自动发帖成功
- [x] 重复 URL 不重复发布

- [x] 8. 联调与上线验收
  **What to do**: 跨端回归、性能基线、上线清单
  **Must NOT do**: 不新增首版范围外能力
  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: `playwright`, `frontend-ui-ux`
  **Parallelization**: 收敛阶段串行，依赖 3/4/5/6/7
  **References**:
  - `https://web.dev/vitals/`
  **Acceptance Criteria**:
  - [x] 全量 e2e 通过
  - [x] 手机端关键流程通过

---

## Commit Strategy

| After Task | Message | Verification |
|------------|---------|--------------|
| 1-2 | `chore(init): bootstrap app and rbac model` | smoke tests |
| 3-4 | `feat(auth): apply-and-approve workflow` | e2e apply flow |
| 5-6 | `feat(bbs): post comment upload search` | e2e + upload checks |
| 7 | `feat(ai): ingestion and autopost with dedup` | ingest run logs |
| 8 | `chore(release): qa baseline and go-live checklist` | full regression |

---

## Success Criteria

### Verification Commands
```bash
pnpm test
pnpm test:e2e
pnpm ai:ingest:once
pnpm build
```

### Final Checklist
- [x] Must Have 全部完成
- [x] Must NOT Have 全部未引入
- [x] 权限与审批规则正确
- [x] 上传安全规则生效
- [x] AI 自动发帖稳定
- [x] 桌面与手机主流程可用
