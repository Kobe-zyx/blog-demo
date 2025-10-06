# 设计文档

## 概述

博客写作服务将为现有的个人网站添加一个完整的内容管理系统。该系统包括一个网页编辑器、自动封面图片生成、博文管理和自动目录生成功能。设计将与现有的网站架构和样式保持一致，使用原生HTML/CSS/JavaScript技术栈。

## 架构

### 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   博客编辑器     │    │   封面生成器     │    │   文件管理器     │
│   (editor.html)  │    │   (Canvas API)   │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   博客管理系统   │
                    │   (blog-admin)   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   现有博客系统   │
                    │   (blog.html)    │
                    └─────────────────┘
```

### 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js + Express.js
- **图片生成**: HTML5 Canvas API
- **文件存储**: 本地文件系统
- **数据格式**: JSON

## 组件和接口

### 1. 博客编辑器 (Blog Editor)

**文件**: `blog-editor.html`

**功能**:
- 富文本编辑器界面
- 实时预览功能
- 标题和内容输入
- 草稿保存功能
- 发布功能

**接口**:
```javascript
class BlogEditor {
    constructor(containerId)
    loadDraft(draftId)
    saveDraft()
    publishPost()
    generatePreview()
    validateContent()
}
```

### 2. 封面图片生成器 (Cover Generator)

**文件**: `cover-generator.js`

**功能**:
- 基于标题生成封面图片
- 使用Canvas API绘制
- 支持多种模板样式
- 自动保存到blog-img文件夹

**接口**:
```javascript
class CoverGenerator {
    generateCover(title, template = 'default')
    saveToFile(canvas, filename)
    getAvailableTemplates()
    applyTemplate(canvas, template, title)
}
```

### 3. 博文管理器 (Post Manager)

**文件**: `post-manager.js`

**功能**:
- 创建HTML博文文件
- 更新blog.html列表
- 管理文件命名
- 处理目录生成

**接口**:
```javascript
class PostManager {
    createPost(title, content, coverImage)
    updateBlogList(postData)
    generateFilename(title)
    generateTableOfContents(content)
    savePost(postData)
}
```

### 4. 后端API服务 (Backend API)

**文件**: `server.js`

**端点**:
```
POST /api/posts          - 创建新博文
PUT  /api/posts/:id      - 更新博文
GET  /api/posts          - 获取博文列表
POST /api/drafts         - 保存草稿
GET  /api/drafts/:id     - 获取草稿
POST /api/generate-cover - 生成封面图片
```

## 数据模型

### 博文数据结构

```javascript
{
  id: "string",           // 唯一标识符
  title: "string",        // 博文标题
  content: "string",      // 博文内容 (Markdown格式)
  coverImage: "string",   // 封面图片路径
  publishDate: "Date",    // 发布日期
  filename: "string",     // HTML文件名
  excerpt: "string",      // 摘要
  tags: ["string"],       // 标签数组
  tableOfContents: [{     // 目录结构
    level: "number",
    title: "string",
    anchor: "string"
  }]
}
```

### 草稿数据结构

```javascript
{
  id: "string",
  title: "string",
  content: "string",
  lastModified: "Date",
  autoSave: "boolean"
}
```

## 错误处理

### 错误类型和处理策略

1. **文件系统错误**
   - 磁盘空间不足
   - 权限问题
   - 文件名冲突

2. **图片生成错误**
   - Canvas API不支持
   - 模板加载失败
   - 保存失败

3. **内容验证错误**
   - 标题为空
   - 内容过长
   - 无效字符

4. **网络错误**
   - API请求失败
   - 超时处理
   - 连接中断

### 错误处理机制

```javascript
class ErrorHandler {
    static handleFileSystemError(error) {
        // 记录错误日志
        // 显示用户友好的错误信息
        // 提供重试选项
    }
    
    static handleValidationError(error) {
        // 高亮问题字段
        // 显示具体错误信息
        // 阻止提交操作
    }
}
```

## 测试策略

### 单元测试

- **封面生成器测试**: 验证不同标题生成正确的图片
- **文件管理器测试**: 验证文件创建、命名和保存
- **内容解析器测试**: 验证Markdown解析和目录生成
- **API端点测试**: 验证所有REST API端点

### 集成测试

- **端到端工作流测试**: 从编辑到发布的完整流程
- **文件系统集成测试**: 验证文件正确保存到指定目录
- **博客列表更新测试**: 验证新博文正确添加到blog.html

### 用户界面测试

- **编辑器功能测试**: 验证所有编辑功能正常工作
- **响应式设计测试**: 验证在不同设备上的显示效果
- **浏览器兼容性测试**: 验证主流浏览器支持

## 实现细节

### 文件结构

```
blog-writing-service/
├── editor/
│   ├── blog-editor.html      # 博客编辑器页面
│   ├── editor.css           # 编辑器样式
│   └── editor.js            # 编辑器逻辑
├── server/
│   ├── server.js            # Express服务器
│   ├── post-manager.js      # 博文管理
│   ├── cover-generator.js   # 封面生成
│   └── utils.js             # 工具函数
├── templates/
│   ├── post-template.html   # 博文HTML模板
│   └── cover-templates.js   # 封面模���
└── package.json             # 依赖配置
```

### 封面生成模板

系统将提供多种封面模板：

1. **默认模板**: 简洁的文字设计，使用网站主色调
2. **技术模板**: 适合技术博文的几何图案背景
3. **分享模板**: 适合经验分享的温暖色调
4. **教程模板**: 适合教程类文章的结构化设计

### 目录生成算法

```javascript
function generateTableOfContents(htmlContent) {
    const headings = htmlContent.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi);
    const toc = [];
    
    headings.forEach((heading, index) => {
        const level = parseInt(heading.match(/h([1-6])/)[1]);
        const title = heading.replace(/<[^>]*>/g, '');
        const anchor = `heading-${index}`;
        
        toc.push({ level, title, anchor });
    });
    
    return toc;
}
```

### 与现有系统的集成

1. **样式继承**: 新组件将使用现有的CSS变量和样式系统
2. **导航集成**: 编辑器将添加到现有导航结构中
3. **响应式适配**: 确保在所有设备上正常显示
4. **主题支持**: 支持现有的深浅模式切换功能

### 性能优化

1. **图片优化**: 生成的封面图片将使用WebP格式以减小文件大小
2. **懒加载**: 博文列表将实现图片懒加载
3. **缓存策略**: 实现草稿的本地存储缓存
4. **压缩**: 生成的HTML文件将进行压缩以提高加载速度