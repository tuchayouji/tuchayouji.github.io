---
title: "Claude Code 最佳实践 — 官方完整指南"
published: 2026-06-23
tags: ["Claude Code", "AI", "开发工具", "最佳实践"]
category: "技术"
description: "Anthropic 官方 Claude Code 最佳实践完整指南，涵盖 CLAUDE.md、Skills、Rules、Hooks、Subagent、Plan Mode 等核心功能的使用方法和技巧。"
lang: "zh"
---

# Claude Code 最佳实践 — 官方完整指南

> 来源：Anthropic 官方文档（2025–2026）
> 整理时间：2026-06-23

---

## 目录

1. [CLAUDE.md — 核心指令文件](#1-claudemd--核心指令文件)
2. [技能系统（Skills）](#2-技能系统skills)
3. [路径规则（Rules）](#3-路径规则rules)
4. [生命周期钩子（Hooks）](#4-生命周期钩子hooks)
5. [子代理（Subagent）](#5-子代理subagent)
6. [计划模式（Plan Mode）](#6-计划模式plan-mode)
7. [高效工作流技巧](#7-高效工作流技巧)
8. [验证 — 最重要的实践](#8-验证最重要的实践)
9. [模型与 Effort 选择](#9-模型与-effort-选择)
10. [上下文管理](#10-上下文管理)
11. [命令速查表](#11-命令速查表)

---

## 1. CLAUDE.md — 核心指令文件

CLAUDE.md 是 Claude Code 读取的首要指令文件，**每次对话都会加载**。

### 文件位置（按优先级从高到低）

| 位置 | 作用域 | 说明 |
|------|--------|------|
| `./CLAUDE.local.md` | 项目本地覆盖 | 最高优先级，覆盖下层设置 |
| `./CLAUDE.md` | 项目级 | 当前项目的约定和配置 |
| `~/.claude/CLAUDE.md` | 全局 | 用户级默认指令 |

### 编写规范

- **不超过 200 行** — 超长内容拆分到 `.claude/rules/`
- **只放 Claude 无法从代码推断的信息**
- ✅ 适合放：构建/测试/运行命令、架构约束、编码规范、目录结构说明、重要上下文
- ❌ 不适合放：linter 规则、明显能从代码风格推断的约定

### @imports 导入

CLAUDE.md 支持导入其他文件片段，方便模块化管理：

```markdown
@import .claude/snippets/testing-guidelines.md
@import .claude/snippets/deployment-commands.md
```

---

## 2. 技能系统（Skills）

Skills 是 `.claude/skills/` 下的可复用专业知识包，**按需加载，不占上下文**。

### 官方 9 大技能分类

| 类别 | 用途 | 示例 |
|------|------|------|
| 🏛 库/API 参考 | 提供框架和方法的使用规范 | React Hooks 最佳实践 |
| ✅ 产品验证 | 上线前检查清单 | 发布检查表 |
| 📊 数据获取分析 | SQL/API 查询模板 | 数据报表生成 |
| 🤖 业务自动化 | 团队流程自动化 | 周报、提醒 |
| 🏗 代码脚手架 | 标准化代码生成 | 新组件/模块模板 |
| 🔍 代码质量审核 | 代码审查和规范检查 | 安全审查 checklist |
| 🔄 CI/CD 部署 | 构建部署流程 | Docker 构建、发布 |
| 📘 Runbook | 运维操作手册 | 线上事故处理 |
| 🛠 基础设施运维 | 基础设施配置 | K8s 操作、云资源管理 |

### 设计原则

1. **渐进式加载（Progressive Disclosure）** — 用户通过 `/skill-name` 调用时才加载，不浪费上下文
2. **Gotchas 章节** — 每个 skill 记录该领域的常见坑和易错点
3. **单一职责** — 一个 skill 只做一件事
4. **前置依赖声明** — 明确标注运行该 skill 需要什么环境/权限

### Skill 文件结构示例

```markdown
---
name: react-patterns
description: React 组件开发规范与最佳实践
---

# React 组件规范

## 组件结构
- 使用函数组件 + Hooks
- 自定义 Hook 以 `use` 开头

## Gotchas
- 不要在条件语句中使用 Hooks
- useEffect 依赖数组必须完整

## 依赖
- Node >= 18
- React >= 18
```

---

## 3. 路径规则（Rules）

`.claude/rules/` 用于存放按路径范围加载的规则文件：

```
.claude/rules/
├── *.mdc                # 全局规则，始终加载
├── src/*.mdc            # 编辑 src/ 下的文件时加载
├── tests/*.mdc          # 编辑 tests/ 下的文件时加载
└── docs/*.mdc           # 编辑 docs/ 下的文件时加载
```

### 适合放什么

- 目录结构详细说明
- 测试编写规范
- lint 配置（无法从代码推断的部分）
- 特定模块的架构约束

### 与 CLAUDE.md 的分工

| 文件 | 内容 | 加载时机 |
|------|------|---------|
| `CLAUDE.md` | 核心指令、常用命令、全局约定 | **始终加载** |
| `.claude/rules/*.mdc` | 详细规范、路径相关规则 | **按需加载** |

> **黄金法则：** CLAUDE.md 只放必读内容，超过 200 行就往 rules/ 拆分。

---

## 4. 生命周期钩子（Hooks）

Hooks 是 **确定性行为触发** 机制，适合不需要 AI 决策的重复性任务。

### 支持的事件

| 事件 | 触发时机 | 典型用途 |
|------|---------|---------|
| `PostToolUse` | 每次工具调用后 | 自动运行 linter |
| `Stop` | 对话结束时 | 清理临时文件 |
| `PermissionRequest` | 权限请求时 | 自定义审批规则 |

### Hook 配置示例

```json
{
  "hooks": {
    "PostToolUse": {
      "command": "npx prettier --write $(claude get-changed-files)",
      "blocking": false
    }
  }
}
```

### 使用原则

- ✅ 适合：格式化、lint 修复、日志记录
- ❌ 不适合：需要判断逻辑的任务（交给 Skills）
- ⚠️ `blocking: true` 会阻塞对话，仅用于关键检查

---

## 5. 子代理（Subagent）

Subagent 是 **独立上下文窗口** 的代理，不占用主对话上下文。

### 配置位置

`.claude/agents/` 目录下存放 agent 定义：

```yaml
# .claude/agents/code-reviewer.yaml
name: code-reviewer
description: 代码审查专家
model: claude-sonnet-4-6
tools:
  - read
  - grep
  - glob
system: |
  你是一个严格的代码审查者。关注：
  - 正确性 bug
  - 安全漏洞
  - 性能问题
  - 代码可维护性
```

### 使用场景

- **代码审查** — 每个 PR 自动跑一轮审查
- **安全扫描** — 独立安全审查 agent
- **测试生成** — 专职生成测试用例
- **文档检查** — 检查文档是否与代码一致

### 结合 Worktree 使用

```javascript
// Workflow 中隔离并行执行
agent("审核这段代码", {
  isolation: "worktree",   // 隔离的工作副本
  agentType: "code-reviewer"
})
```

---

## 6. 计划模式（Plan Mode）

`Shift+Tab` / `EnterPlanMode` — 复杂任务的最佳起点。

### 标准流程

```
探索（Explore）→ 计划（Plan）→ 编码（Code）
```

| 阶段 | 动作 | 产出 |
|------|------|------|
| 1️⃣ 探索 | 读相关文件、理解架构、找涉及面 | 问题定位 |
| 2️⃣ 计划 | 设计方案、列出改动文件、评估风险 | 计划文档 |
| 3️⃣ 编码 | 按计划执行、边改边测 | 可运行的代码 |

### 使用场景

- 跨多个文件的新功能
- 架构重构
- 不确定最佳方案的决策
- 涉及数据迁移或破坏性变更

> **官方建议：** 如果觉得任务"有点复杂"，就进 Plan Mode。宁可多规划，不要直接莽。

---

## 7. 高效工作流技巧

| 技巧 | 方式 | 说明 |
|------|------|------|
| **并行工作** | `--worktree` + `isolation: worktree` | 多任务互不干扰 |
| **/loop** | `/loop 10m /command` | 定时轮询状态 |
| **/schedule** | `/schedule "0 9 * * 1-5" 任务` | 固定时间执行 |
| **/btw** | `/btw 你的问题` | 不打断主任务提问侧边问题 |
| **/batch** | `/batch` | 批量处理独立子任务 |
| **/compact** | `/compact` | 手动压缩上下文 |
| **/effort** | `/effort high\|max` | 设置推理努力级别 |
| **/simplify** | `/simplify` | 自动清理冗余代码 |

### /btw 使用示例

```
你在写一个用户登录功能...
/btw 这个项目测试框架用的是 Jest 还是 Vitest？
```

主任务继续，Claude 会侧边回答后自动回到主任务。

---

## 8. 验证 — 最重要的实践

> **官方原话：** *"The number one thing you can do to improve Claude Code results is to give Claude a way to verify its own work."*

### 验证手段优先级

| 方式 | 适用场景 | 自动化 |
|------|---------|--------|
| 🥇 跑测试 | 逻辑代码修改 | ✅ 全自动 |
| 🥈 启动项目观察 | UI/交互修改 | 需手动确认 |
| 🥉 代码评审 | 代码质量把关 | `/code-review` 自动 |
| 🏅 人工复查 | 高风险变更 | 人肉 |

### 实践中怎么做

- **写代码时就考虑怎么验证** — 附带测试
- **改完后跑一遍确认** — `verify` 技能
- **复杂修改用 `/code-review --fix`** — 评审并自动修复
- **创建专门的验证 subagent** — 独立的审查视角

---

## 9. 模型与 Effort 选择

### 官方推荐矩阵

| 场景 | 推荐模型 | Effort 级别 |
|------|---------|-------------|
| 日常编码与简单修改 | Sonnet | `high` |
| 复杂调试与架构设计 | Opus | `max` |
| 快速搜索与简单问答 | Haiku | `medium` |
| 多步骤规划 | Opus + 思考 | `max` |
| 代码审查 | Sonnet/Opus | `high` |

### Effort 级别说明

| 级别 | 适用场景 | 效果 |
|------|---------|------|
| `low` | 简单格式化、重命名 | 快速响应 |
| `medium` | 常规 CRUD、简单修复 | 平衡速度和准确度 |
| `high` | **日常默认** | 大部分任务的最佳选择 |
| `max` | 困难调试、架构决策、安全审查 | 最深入推理 |

> **官方建议：** 默认用 `high`，遇到棘手问题升到 `max`。

---

## 10. 上下文管理

### 核心原则

> **上下文是有限资源，像内存一样管理它。**

### 管理技巧

| 手段 | 时机 | 效果 |
|------|------|------|
| 主动 `/compact` | 上下文使用率 ~50% | 释放大量空间 |
| 用 Subagent 隔离 | 大任务开始时 | 主窗口保持轻量 |
| Skills 按需加载 | 需要时才调用 | 不占上下文 |
| CLAUDE.md 精简 | 项目初始设置 | 永久减少开销 |
| 记忆中存关键决策 | 跨会话复用 | 避免重复上下文 |

### 上下文占用量预警

```
> claude-hud
[████████████░░░░] 65%   ← 接近70%可以考虑compact了
```

---

## 11. 命令速查表

### 核心命令

| 命令 | 作用 |
|------|------|
| `/init` | 交互式初始化 CLAUDE.md |
| `/code-review` | 审查当前差异 |
| `/code-review --fix` | 审查差异并自动修复 |
| `/simplify` | 清理冗余/优化代码 |
| `/compact` | 手动压缩上下文 |
| `/effort <level>` | 设置努力级别（low/medium/high/max） |

### 定时与循环

| 命令 | 作用 |
|------|------|
| `/loop <间隔> <命令>` | 定时重复执行（例：`/loop 10m /babysit-prs`） |
| `/schedule <cron> <任务>` | 按 cron 执行任务 |

### 模式切换

| 命令 | 作用 |
|------|------|
| `/plan` | 进入计划模式 |
| `/batch` | 批量模式 |
| `/btw <问题>` | 侧边提问不打断主任务 |
| `/fast` | 切换到快速模式 |

### 调试与信息

| 命令 | 作用 |
|------|------|
| `/help` | 查看所有命令 |
| `/config` | 查看/修改配置 |
| `/status` | 查看当前状态 |

---

## 附录：Cheat Sheet

```markdown
# 一句话总结

CLAUDE.md（精简）+ Skills（按需）+ Rules（路径）+ Hooks（确定行为）
+ Subagent（隔离任务）+ Plan Mode（复杂任务先规划）
+ 验证（#1 实践）+ 主动 Compact（管理上下文）
= Claude Code 最佳实践
```

---

> **参考来源：**
> - [Claude Code Power User Tips（官方）](https://support.claude.com/en/articles/14554000-claude-code-power-user-tips)
> - [Steering Claude Code（官方博客）](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)
> - [Lessons from Building Claude Code（官方博客）](https://claude.com/blog/lessons-from-building-claude-code-how-we-use-skills)
> - [CLAUDE.md: The Complete Guide](https://www.morphllm.com/claude-md-guide)
