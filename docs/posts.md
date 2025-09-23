# 社区帖子与评论系统数据库设计方案

## 设计概述

本文档描述了基于 uni-app + uniCloud 技术栈的社区系统中帖子和评论功能的数据库设计方案。设计遵循简洁高效的原则，支持帖子发布、评论嵌套、点赞功能等核心社区互动需求。

## 核心设计原则

- **简洁性**：去除复杂的点赞统计，简化评论表结构
- **性能优化**：通过适当的字段冗余提升查询效率
- **扩展性**：预留必要字段支持未来功能扩展
- **一致性**：统一的状态管理和时间字段规范

## 数据库表设计

### 1. 帖子表 (posts)

存储社区帖子的基本信息，包含内容、分类、统计数据等核心字段。

#### 表结构

| 字段名 | 类型 | 是否必需 | 默认值 | 说明 |
|--------|------|----------|--------|------|
| _id | string | 是 | - | 帖子ID，系统自动生成 |
| content | string | 是 | - | 帖子内容，最大5000字符 |
| images | array | 否 | [] | 图片URL数组，最多9张 |
| tag | array | 是 | "全部" | 帖子分类 |
| user_id | string | 是 | - | 发布用户ID |
| username | string | 否 | - | 发布用户昵称（冗余字段） |
| user_avatar | string | 否 | - | 发布用户头像（冗余字段） |
| like_count | int | 否 | 0 | 点赞数统计 |
| comment_count | int | 否 | 0 | 评论数统计 |
| view_count | int | 否 | 0 | 浏览数统计 |
| is_top | bool | 否 | false | 是否置顶 |
| status | int | 否 | 1 | 状态：1-已发布，0-草稿，-1-已删除 |
| create_time | timestamp | 是 | now | 创建时间 |
| update_time | timestamp | 是 | now | 更新时间 |



### 2. 评论表 (comments)

存储帖子评论信息，通过 parent_id 字段实现评论层级控制，支持无限级嵌套但建议限制在2级以内。

#### 表结构

| 字段名 | 类型 | 是否必需 | 默认值 | 说明 |
|--------|------|----------|--------|------|
| _id | string | 是 | - | 评论ID，系统自动生成 |
| post_id | string | 是 | - | 所属帖子ID |
| parent_id | string | 否 | null | 父评论ID，null表示一级评论 |
| content | string | 是 | - | 评论内容，最大1000字符 |
| user_id | string | 是 | - | 评论用户ID |
| username | string | 否 | - | 评论用户昵称（冗余字段） |
| user_avatar | string | 否 | - | 评论用户头像（冗余字段） |
| status | int | 否 | 1 | 状态：1-正常，-1-已删除 |
| create_time | timestamp | 是 | now | 创建时间 |

#### 层级关系说明
- **一级评论**：parent_id 为 null，直接对帖子的评论
- **二级回复**：parent_id 指向一级评论ID，对评论的回复
- **多级回复**：parent_id 指向上级评论ID，理论支持无限级但建议限制

#### 获取被回复用户信息
当需要显示被回复用户信息时，通过 parent_id 查询父评论即可获取：
```javascript
// 查询评论及其父评论信息
const comment = await db.collection('comments').doc(commentId).get();
if (comment.parent_id) {
  const parentComment = await db.collection('comments').doc(comment.parent_id).get();
  // parentComment.username 就是被回复用户的昵称
}