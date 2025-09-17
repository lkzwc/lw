# hxzyL 小程序项目

这是一个基于 uni-app 开发的跨平台小程序项目，集成了 uni-ui 组件库，支持微信小程序、支付宝小程序等多个平台。

## 项目结构

```
├── pages/                  # 页面文件
│   ├── index/              # 首页
│   ├── community/          # 社区相关页面
│   │   ├── community.vue   # 社区列表
│   │   ├── post-detail.vue # 帖子详情
│   │   └── publish.vue     # 发布帖子
│   └── me/                 # 个人中心
├── static/                 # 静态资源
│   └── tabbar/            # 底部导航图标
├── uniCloud-alipay/       # 云函数
│   └── cloudfunctions/    # 云函数目录
├── App.vue                # 应用入口
├── main.js                # 主入口文件
├── pages.json             # 页面配置
└── manifest.json          # 应用配置
```

## 功能特性

### 🏠 首页
- 轮播图展示
- 功能菜单区域（天气、技能台等）
- 快捷功能入口
- 推荐内容展示

### 👥 社区
- 帖子列表浏览
- 分类筛选
- 帖子搜索
- 发布新帖子
- 帖子详情查看
- 评论互动
- 点赞功能

### 👤 我的
- 个人信息展示
- 微信登录
- 个人数据统计
- 功能菜单
- 设置选项

## 技术栈

- **框架**: uni-app
- **UI组件**: uni-ui
- **前端**: Vue 3 + Composition API
- **云服务**: uniCloud
- **开发工具**: HBuilderX

## 安装使用

### 1. 安装 uni-ui 组件库

项目已配置 easycom 自动引入，无需手动安装。如需手动安装：

```bash
npm install @dcloudio/uni-ui
```

### 2. 配置说明

#### pages.json 配置
```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^uni-(.*)": "@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue"
    }
  }
}
```

#### manifest.json 配置
- 已配置微信小程序 appid
- 已配置各平台基础设置
- 已配置必要的权限

### 3. 云函数配置

项目使用 uniCloud 云服务，已包含：
- Login 云函数：处理微信登录

### 4. 运行项目

1. 使用 HBuilderX 打开项目
2. 选择运行到微信小程序开发者工具
3. 在微信开发者工具中预览

## 主要组件使用

### uni-ui 组件
- `uni-swiper-dot`: 轮播图指示器
- `uni-grid`: 网格布局
- `uni-icons`: 图标组件
- `uni-search-bar`: 搜索栏
- `uni-tag`: 标签组件
- `uni-load-more`: 加载更多
- `uni-popup`: 弹窗组件
- `uni-data-select`: 数据选择器

### 自定义功能
- 微信登录集成
- 图片上传预览
- 评论系统
- 点赞功能
- 草稿保存

## 开发说明

### 页面路由
- 首页: `/pages/index/index`
- 社区: `/pages/community/community`
- 帖子详情: `/pages/community/post-detail`
- 发布帖子: `/pages/community/publish`
- 我的: `/pages/me/me`

### 数据存储
- 用户信息存储在本地 Storage
- 草稿数据本地缓存
- 云端数据通过 uniCloud 处理

### 样式规范
- 使用 rpx 响应式单位
- 统一的颜色规范
- 圆角和阴影效果
- 适配深色模式

## 注意事项

1. **图标文件**: 当前使用占位符文件，实际使用时需要替换为真实的图标文件
2. **云函数**: 需要在 uniCloud 控制台配置云函数
3. **微信配置**: 需要配置正确的微信小程序 appid 和密钥
4. **权限配置**: 根据实际需求调整 manifest.json 中的权限配置

## 更新日志

### v1.0.0
- 完成基础框架搭建
- 实现首页、社区、我的三个主要模块
- 集成 uni-ui 组件库
- 实现微信登录功能
- 完成帖子发布和浏览功能

## 联系方式

如有问题，请联系开发团队。