# iconfont 字体图标使用说明

## 使用步骤

### 1. 在 iconfont.cn 创建项目

访问 https://www.iconfont.cn/

1. 注册/登录账号
2. 创建项目：高科麓湾邻里圈
3. 添加需要的图标到项目

### 2. 下载字体文件

1. 在项目页面点击「Font class」
2. 点击「下载至本地」
3. 解压后将以下文件复制到此目录：
   - `iconfont.ttf`
   - `iconfont.woff`
   - `iconfont.woff2`

### 3. 更新图标类名

下载的文件中包含 `iconfont.css`，里面有图标类名映射：

```css
.icon-like:before { content: "\e001"; }
.icon-comment:before { content: "\e002"; }
.icon-share:before { content: "\e003"; }
```

将类名复制到 `app.wxss` 的图标定义区域。

## 当前图标清单

| 图标名 | 用途 | 页面 |
|--------|------|------|
| like | 点赞 | 帖子列表、详情 |
| comment | 评论 | 帖子列表、详情 |
| share | 分享/转发 | 帖子列表、详情 |
| noticeboard | 公告 | 首页公告模块 |
| home | 首页 | tabBar |
| home-active | 首页选中 | tabBar |
| me | 我的 | tabBar |
| me-active | 我的选中 | tabBar |
| skill | 技能墙 | tabBar |
| skill-active | 技能墙选中 | tabBar |
| send | 发送 | 评论发送按钮 |
| phone | 电话 | 技能详情联系电话 |
| file | 文件 | 帖子附件 |
| post | 发布 | 发布按钮 |
| uploadimage | 上传图片 | 图片上传 |

## 主题色配置

图标颜色通过 CSS `color` 属性控制：

```css
/* 默认主题色 */
.iconfont { color: var(--primary-color); }

/* 选中状态 */
.iconfont.active { color: var(--primary-color); }

/* 禁用状态 */
.iconfont.disabled { color: var(--text-placeholder); }
```

## 注意事项

- 字体文件首次加载可能有延迟，建议在 app.js 中预加载
- 小程序不支持本地字体文件，必须使用网络字体或 base64
- 推荐将字体文件上传到 CDN 或使用 base64 编码