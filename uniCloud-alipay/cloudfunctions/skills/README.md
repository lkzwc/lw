# 技能台云对象

技能台功能的后端云对象，提供技能发布、搜索、管理等完整功能。

## 功能特性

- ✅ 技能发布与管理
- ✅ 技能搜索与筛选
- ✅ 图片上传到云存储
- ✅ 用户身份验证
- ✅ 完整的CRUD操作
- ✅ 数据验证与错误处理

## API 接口

### 1. 获取技能列表
```javascript
const skills = uniCloud.importObject('skills');
const result = await skills.getSkillsList({
  keyword: '维修',      // 搜索关键词
  category: 'repair',   // 分类筛选
  page: 1,             // 页码
  pageSize: 10         // 每页数量
});
```

### 2. 发布技能
```javascript
const result = await skills.publishSkill({
  title: '专业家电维修',
  description: '10年维修经验...',
  category: 'repair',
  location: '1号楼301',
  price: 50,
  priceUnit: '小时',
  tags: ['家电维修', '经验丰富'],
  images: ['图片URL1', '图片URL2'],
  phone: '13800138000',
  wechat: 'wechat123'
});
```

### 3. 获取技能详情
```javascript
const result = await skills.getSkillDetail('技能ID');
```

### 4. 搜索技能
```javascript
const result = await skills.searchSkills('维修', {
  category: 'repair',
  page: 1,
  pageSize: 10
});
```

### 5. 上传图片
```javascript
const result = await skills.uploadImage({
  cloudPath: 'skills/image.jpg',
  fileContent: fileBuffer
});
```

### 6. 获取用户技能列表
```javascript
const result = await skills.getUserSkills({
  page: 1,
  pageSize: 10,
  status: 1  // 可选：状态筛选
});
```

### 7. 更新技能
```javascript
const result = await skills.updateSkill('技能ID', {
  title: '新标题',
  price: 60
});
```

### 8. 删除技能
```javascript
const result = await skills.deleteSkill('技能ID');
```

### 9. 获取分类列表
```javascript
const result = await skills.getCategories();
```

## 数据结构

### 技能数据结构
```javascript
{
  _id: "技能ID",
  title: "技能标题",
  description: "技能描述",
  category: "分类",
  location: "服务位置",
  price: 50,
  priceUnit: "小时",
  tags: ["标签1", "标签2"],
  images: ["图片URL1", "图片URL2"],
  phone: "联系电话",
  wechat: "微信号",
  userId: "发布用户ID",
  username: "用户名",
  userAvatar: "用户头像",
  rating: 4.8,
  reviewCount: 23,
  viewCount: 156,
  status: 1,
  createTime: "2024-01-01T00:00:00.000Z",
  updateTime: "2024-01-01T00:00:00.000Z"
}
```

### 响应格式
```javascript
{
  errCode: 0,           // 错误码，0表示成功
  errMsg: "操作成功",    // 错误信息
  data: {},            // 返回数据
  executionTime: 123   // 执行时间(ms)
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 操作成功 |
| UNAUTHORIZED | 未登录或登录已过期 |
| INVALID_PARAMS | 参数无效 |
| INVALID_TITLE | 标题无效 |
| INVALID_DESCRIPTION | 描述无效 |
| INVALID_CATEGORY | 分类无效 |
| INVALID_LOCATION | 位置无效 |
| INVALID_PRICE | 价格无效 |
| INVALID_PRICE_UNIT | 价格单位无效 |
| INVALID_TAGS | 标签无效 |
| INVALID_IMAGES | 图片无效 |
| INVALID_PHONE | 手机号无效 |
| INVALID_WECHAT | 微信号无效 |
| SKILL_NOT_FOUND | 技能不存在 |
| PUBLISH_FAILED | 发布失败 |
| UPDATE_FAILED | 更新失败 |
| DELETE_FAILED | 删除失败 |
| UPLOAD_FAILED | 上传失败 |

## 注意事项

1. 所有需要身份验证的接口都需要用户先登录
2. 图片上传支持 jpg、png、webp 格式，最多6张
3. 技能标签最多5个，每个标签最长10个字符
4. 联系方式只有技能发布者本人可以查看
5. 删除操作为软删除，不会真正删除数据