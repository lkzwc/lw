# 云开发数据库设计

## 数据库集合

### 1. users - 用户表
```json
{
  "_id": "用户ID",
  "_openid": "微信OpenID",
  "nickName": "用户昵称",
  "avatarUrl": "头像URL",
  "phase": "期号（1-4期）",
  "building": "楼号（1-20栋）",
  "isAdmin": false,
  "createTime": "创建时间",
  "updateTime": "更新时间"
}
```

### 2. posts - 帖子表
```json
{
  "_id": "帖子ID",
  "_openid": "发布者OpenID",
  "userInfo": {
    "nickName": "昵称",
    "avatarUrl": "头像"
  },
  "content": "帖子内容",
  "images": ["图片URL数组"],
  "tags": ["标签数组"],
  "status": "active/deleted",
  "likeCount": 0,
  "commentCount": 0,
  "shareCount": 0,
  "createTime": "创建时间",
  "updateTime": "更新时间"
}
```

### 3. comments - 评论表
```json
{
  "_id": "评论ID",
  "_openid": "评论者OpenID",
  "postId": "帖子ID",
  "userInfo": {
    "nickName": "昵称",
    "avatarUrl": "头像"
  },
  "content": "评论内容",
  "parentId": "父评论ID（回复时）",
  "isReply": false,
  "status": "active/deleted",
  "likeCount": 0,
  "createTime": "创建时间"
}
```

### 4. likes - 点赞表
```json
{
  "_id": "点赞ID",
  "_openid": "点赞者OpenID",
  "postId": "帖子ID",
  "createTime": "创建时间"
}
```

### 5. skills - 技能表
```json
{
  "_id": "技能ID",
  "_openid": "发布者OpenID",
  "userInfo": {
    "nickName": "昵称",
    "avatarUrl": "头像"
  },
  "title": "技能标题",
  "category": "类目ID",
  "description": "详细描述",
  "price": "报价",
  "phone": "联系电话",
  "images": ["图片URL数组"],
  "status": "active/deleted",
  "viewCount": 0,
  "createTime": "创建时间",
  "updateTime": "更新时间"
}
```

### 6. notices - 公告表
```json
{
  "_id": "公告ID",
  "_openid": "发布者OpenID（管理员）",
  "title": "公告标题",
  "content": "公告内容",
  "status": "active/deleted",
  "createTime": "创建时间",
  "updateTime": "更新时间"
}
```

## 数据库权限设置

在云开发控制台设置集合权限：

- **users**: 仅创建者可写，所有人可读
- **posts**: 仅创建者可写，所有人可读
- **comments**: 仅创建者可写，所有人可读
- **likes**: 仅创建者可写，所有人可读
- **skills**: 仅创建者可写，所有人可读
- **notices**: 仅管理员可写，所有人可读

## 索引设置

建议在云开发控制台创建以下索引：

### posts 集合
- `createTime` (降序) - 用于帖子列表排序
- `status` + `createTime` - 用于筛选有效帖子
- `tags` - 用于标签筛选

### comments 集合
- `postId` + `createTime` - 用于获取帖子评论
- `_openid` - 用于获取用户评论

### skills 集合
- `category` + `createTime` - 用于分类筛选
- `status` + `createTime` - 用于筛选有效技能

### likes 集合
- `_openid` + `postId` - 用于检查点赞状态

### 7. subscriptions - 订阅授权表
```json
{
  "_id": "订阅ID",
  "_openid": "用户OpenID",
  "templateId": "模板ID",
  "type": "reply/notice",
  "acceptTime": "授权时间",
  "used": false
}
```

### 8. notifications - 通知记录表
```json
{
  "_id": "通知ID",
  "postId": "帖子ID",
  "type": "first_reply",
  "toOpenid": "接收者OpenID",
  "createTime": "发送时间"
}
```

### subscriptions 集合
- `_openid` + `templateId` - 用于查询用户订阅状态

### notifications 集合
- `postId` + `type` - 用于检查是否已发送首条评论通知