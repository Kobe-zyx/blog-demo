# 📡 博客写作服务 API 路由文档

## 🎯 概述

博客写作服务提供了完整的RESTful API，支持文章的创建、读取、更新和删除操作。

## 📋 API 端点列表

### 📄 文章管理

#### 1. 获取所有文章
```http
GET /api/posts
```

**响应示例：**
```json
{
  "success": true,
  "posts": [
    {
      "filename": "test-article.html",
      "title": "测试文章",
      "publishDate": "2025-10-06T06:25:30.133Z",
      "size": 1024,
      "url": "/blog/test-article.html"
    }
  ],
  "count": 1,
  "message": "博文列表获取成功"
}
```

#### 2. 获取单篇文章详情
```http
GET /api/posts/:filename
```

**参数：**
- `filename`: 文章文件名（可选.html后缀）

**响应示例：**
```json
{
  "success": true,
  "post": {
    "filename": "test-article.html",
    "title": "测试文章",
    "content": "<html>...</html>",
    "markdownContent": "# 测试文章\n\n这是内容...",
    "publishDate": "2025-10-06T06:25:30.133Z",
    "size": 1024,
    "url": "/blog/test-article.html"
  },
  "message": "博文获取成功"
}
```

#### 3. 获取文章编辑数据 🆕
```http
GET /api/posts/:filename/edit
```

**参数：**
- `filename`: 文章文件名

**响应示例：**
```json
{
  "success": true,
  "post": {
    "filename": "test-article.html",
    "title": "测试文章",
    "markdownContent": "# 测试文章\n\n这是Markdown格式的内容...",
    "publishDate": "2025-10-06T06:25:30.133Z",
    "isEditing": true
  },
  "message": "文章编辑数据获取成功"
}
```

#### 4. 创建新文章
```http
POST /api/posts
```

**请求体：**
```json
{
  "title": "新文章标题",
  "content": "# 新文章\n\n这是Markdown内容...",
  "tags": ["技术分享"]
}
```

**响应示例：**
```json
{
  "success": true,
  "post": {
    "filename": "新文章标题.html",
    "title": "新文章标题",
    "content": "# 新文章\n\n这是Markdown内容...",
    "publishDate": "2025-10-06T09:00:00.000Z",
    "coverImage": "../blog-img/新文章标题.svg"
  },
  "message": "博文发布成功"
}
```

#### 5. 更新现有文章 🆕
```http
PUT /api/posts/:filename
```

**参数：**
- `filename`: 要更新的文章文件名

**请求体：**
```json
{
  "title": "更新后的标题",
  "content": "# 更新后的内容\n\n这是修改后的内容...",
  "tags": ["技术分享", "更新"]
}
```

**响应示例：**
```json
{
  "success": true,
  "post": {
    "filename": "original-filename.html",
    "title": "更新后的标题",
    "content": "# 更新后的内容\n\n这是修改后的内容...",
    "publishDate": "2025-10-06T06:25:30.133Z"
  },
  "message": "博文更新成功"
}
```

### 📝 草稿管理

#### 6. 获取所有草稿
```http
GET /api/drafts
```

#### 7. 获取单个草稿
```http
GET /api/drafts/:id
```

#### 8. 保存草稿
```http
POST /api/drafts
```

#### 9. 删除草稿
```http
DELETE /api/drafts/:id
```

### 🎨 封面生成

#### 10. 生成封面
```http
POST /api/generate-cover
```

**请求体：**
```json
{
  "title": "文章标题",
  "template": "modern"
}
```

#### 11. 获取封面模板
```http
GET /api/cover-templates
```

### 🔧 系统管理

#### 12. 健康检查
```http
GET /api/health
```

**响应示例：**
```json
{
  "status": "ok",
  "timestamp": "2025-10-06T09:07:48.246Z",
  "service": "blog-writing-service"
}
```

## 🆕 新增功能说明

### 文章编辑功能

1. **获取编辑数据** (`GET /api/posts/:filename/edit`)
   - 专门为编辑器设计的API
   - 返回Markdown格式的内容
   - 包含编辑状态标识

2. **更新文章** (`PUT /api/posts/:filename`)
   - 更新现有文章内容
   - 保持原有发布时间
   - 自动更新博客列表

3. **HTML到Markdown转换**
   - 自动将存储的HTML内容转换回Markdown
   - 支持标题、段落、列表、链接、图片等
   - 保持格式结构

## 🔒 错误处理

所有API都遵循统一的错误响应格式：

```json
{
  "success": false,
  "error": "错误类型",
  "message": "详细错误信息"
}
```

常见HTTP状态码：
- `200`: 成功
- `400`: 请求参数错误
- `404`: 资源未找到
- `500`: 服务器内部错误

## 🧪 测试API

你可以使用以下工具测试API：

### 使用curl
```bash
# 获取文章列表
curl http://localhost:3001/api/posts

# 获取文章编辑数据
curl http://localhost:3001/api/posts/test-article.html/edit

# 健康检查
curl http://localhost:3001/api/health
```

### 使用测试脚本
```bash
cd blog-writing-service
node test-edit-feature.js
```

## 📚 相关文档

- [编辑功能使用指南](EDIT_FEATURE_GUIDE.md)
- [完整使用说明](../使用说明.md)

---

**注意：所有API都需要服务器运行在 http://localhost:3001**