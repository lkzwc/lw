---
name: 修复组件库并优化UI交互
overview: 将TDesign组件替换为uni-ui组件，修复组件导入问题，并优化整体界面和交互体验
design:
  styleKeywords:
    - Minimalism
    - Clean
    - Card-based
    - Smooth
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 18px
      weight: 600
    subheading:
      size: 16px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#2979FF"
      - "#007AFF"
    background:
      - "#F5F5F5"
      - "#FFFFFF"
    text:
      - "#333333"
      - "#666666"
    functional:
      - "#FF3B30"
      - "#4CD964"
todos:
  - id: search-usage
    content: 使用 [subagent:code-explorer] 搜索项目中所有TDesign组件的使用情况
    status: completed
  - id: fix-post-detail
    content: 替换 post-detail.vue 中的TDesign组件为uni-ui组件
    status: completed
    dependencies:
      - search-usage
  - id: fix-my-posts
    content: 替换 my-posts.vue 中的TDesign组件为uni-ui组件
    status: completed
    dependencies:
      - search-usage
  - id: fix-my-skills
    content: 替换 my-skills.vue 中的TDesign组件为uni-ui组件
    status: completed
    dependencies:
      - search-usage
  - id: fix-settings
    content: 替换 settings.vue 中的TDesign组件为uni-ui组件
    status: completed
    dependencies:
      - search-usage
  - id: fix-search
    content: 替换 search.vue 中的TDesign组件为uni-ui组件
    status: completed
    dependencies:
      - search-usage
  - id: optimize-ui
    content: 优化这5个页面的UI样式和交互体验
    status: completed
    dependencies:
      - fix-post-detail
      - fix-my-posts
      - fix-my-skills
      - fix-settings
      - fix-search
---

## Product Overview

修复并优化现有uni-app小程序项目，解决组件库引用错误问题，提升界面美观度和交互流畅度。

## Core Features

- 将 `post-detail.vue`、`my-posts.vue`、`my-skills.vue`、`settings.vue`、`search.vue` 五个页面中的TDesign组件替换为uni-ui组件
- 修复组件导入路径及依赖问题
- 优化这五个页面的UI布局和视觉风格
- 增强页面交互体验，如点击反馈、过渡动画等

## Tech Stack

- 框架：uni-app (Vue.js)
- 组件库：uni-ui (替换 TDesign)
- 开发语言：TypeScript/JavaScript

## Architecture Design

### System Architecture

基于现有 uni-app 项目架构，进行局部模块修复与优化。保持原有的目录结构和路由配置，仅修改特定页面的组件引用和样式代码。

### Module Division

- **页面模块 (Pages)**：涉及修改的五个页面文件，负责界面展示和用户交互。
- **组件模块 (Components)**：引入并配置 uni-ui 组件库，替换原有的 TDesign 组件。

### Data Flow

组件替换流程：读取现有页面代码 -> 识别 TDesign 组件 -> 映射至对应的 uni-ui 组件 -> 更新 Props 和事件绑定 -> 样式适配。

## Implementation Details

### Technical Implementation Plan

1. **组件映射与替换**：

- 建立组件映射表，例如 `t-button` -> `uni-button`，`t-cell` -> `uni-list-item`，`t-icon` -> `uni-icons`。
- 检查并调整组件属性（Props）和事件，确保功能一致。

2. **样式迁移**：

- 移除 TDesign 相关的 CSS 类名。
- 使用 uni-ui 的样式变量或自定义样式复刻原设计意图，确保视觉不降级。

3. **交互优化**：

- 为列表和按钮添加点击态效果。
- 优化页面加载状态和空状态展示。

### Integration Points

- **uni-ui 配置**：确保 `pages.json` 中正确配置 easycom，支持自动引入 uni-ui 组件。
- **图标库**：将 TDesign 图标替换为 uni-icons，确保图标语义一致。

采用现代简约的小程序设计风格，强调内容的清晰展示与操作的便捷性。利用 uni-ui 组件库构建一致的视觉语言。界面将使用卡片式布局来区分不同信息区块，配合柔和的阴影和圆角设计，提升亲和力。优化列表滚动性能与点击反馈，确保交互流畅自然。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 在项目中全面搜索 TDesign 组件的使用情况，确认需要修改的文件范围
- Expected outcome: 输出所有包含 TDesign 引用的文件列表及其具体使用的组件名称