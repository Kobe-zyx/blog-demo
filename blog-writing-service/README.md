# 博客写作服务

为个人网站提供完整的博客内容创建和管理功能。

## 功能特性

- 🖊️ **网页编辑器** - 直接在浏览器中编写博客文章
- 🎨 **自动封面生成** - 根据标题自动生成吸引人的封面图片
- 📅 **时间顺序管理** - 自动更新blog.html并按时间排序
- 📁 **文件组织** - 博文保存到blog文件夹，图片到blog-img文件夹
- 📑 **自动目录生成** - 左侧导航目录，支持滚动高亮
- 🎯 **完整集成** - 与现有网站样式和功能无缝集成

## 项目结构

```
blog-writing-service/
├── editor/                 # 前端编辑器
│   ├── editor.html         # 编辑器页面
│   ├── editor.css          # 编辑器样式
│   └── editor.js           # 编辑器逻辑
├── server/                 # 后端服务
│   ├── server.js           # Express服务器
│   ├── models/             # 数据模型
│   │   ├── BlogPost.js     # 博文模型
│   │   └── Draft.js        # 草稿模型
│   ├── utils/              # 工具类
│   │   ├── FileManager.js  # 文件管理
│   │   └── TableOfContentsGenerator.js # 目录生成
│   └── config/             # 配置文件
│       └── config.js       # 应用配置
├── templates/              # 模板文件
│   └── post-template.html  # 博文HTML模板
├── drafts/                 # 草稿存储（自动创建）
└── package.json            # 项目配置
```

## 安装和运行

1. 安装依赖：
```bash
cd blog-writing-service
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 访问编辑器：
打开浏览器访问 `http://localhost:3001/editor/editor.html`

## 使用说明

### 编写博文
1. 在编辑器中输入标题和内容
2. 支持Markdown语法
3. 实时预览功能
4. 自动保存草稿

### 发布文章
1. 点击"发布文章"按钮
2. 系统自动生成封面图片
3. 创建HTML文件并保存到blog文件夹
4. 自动更新blog.html列表
5. 生成文章目录

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js + Express.js
- **图片生成**: HTML5 Canvas API
- **文件存储**: 本地文件系统
- **数据格式**: JSON

## 开发状态

- [x] 项目结构搭建
- [x] 核心数据模型
- [x] 文件管理工具
- [x] 目录生成器
- [ ] 后端API服务
- [ ] 封面生成系统
- [ ] 编辑器界面
- [ ] 博文管理功能
- [ ] 系统集成测试

## 许可证

MIT License