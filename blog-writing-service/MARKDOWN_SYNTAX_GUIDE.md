# Markdown 语法完整指南

这是博客编辑器支持的所有 Markdown 语法示例。

## 文本格式

### 基础格式
**这是粗体文字**
*这是斜体文字*
***这是粗斜体文字***
~~这是删除线文字~~

### 组合使用
你可以**粗体中包含*斜体***，或者*斜体中包含**粗体***。

## 标题

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题

## 引用

> 这是一个引用块
> 可以包含多行内容
> 
> 甚至可以包含**格式化文字**和`代码`

## 代码

### 行内代码
这是一段包含 `const name = "Kobe"` 的行内代码。

### 代码块

```javascript
// JavaScript 代码示例
function greet(name) {
    console.log(`Hello, ${name}!`);
    return `Welcome to my blog!`;
}

const user = "Kobe";
greet(user);
```

```python
# Python 代码示例
def calculate_sum(numbers):
    """计算数字列表的总和"""
    total = sum(numbers)
    return total

numbers = [1, 2, 3, 4, 5]
result = calculate_sum(numbers)
print(f"总和是: {result}")
```

```html
<!-- HTML 代码示例 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>我的博客</title>
</head>
<body>
    <h1>欢迎来到我的博客</h1>
    <p>这是一个示例页面</p>
</body>
</html>
```

```css
/* CSS 代码示例 */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.button {
    background-color: #007aff;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.button:hover {
    background-color: #0051d5;
    transform: translateY(-2px);
}
```

## 列表

### 无序列表
- 第一项
- 第二项
- 第三项
  - 嵌套项 1
  - 嵌套项 2
- 第四项

### 有序列表
1. 第一步：准备环境
2. 第二步：安装依赖
3. 第三步：运行项目
4. 第四步：测试功能

### 任务列表
- [x] 完成 Markdown 解析
- [x] 添加代码高亮
- [x] 实现实时预览
- [ ] 添加图片上传
- [ ] 支持视频嵌入

## 链接和图片

### 链接
这是一个指向 [GitHub](https://github.com) 的链接。
你也可以访问 [我的博客](https://example.com) 了解更多。

### 图片
![示例图片](https://via.placeholder.com/600x400)

## 表格

| 功能 | 状态 | 优先级 | 备注 |
| --- | --- | --- | --- |
| Markdown 解析 | ✅ 完成 | 高 | 支持所有基础语法 |
| 代码高亮 | ✅ 完成 | 高 | 使用 highlight.js |
| 实时预览 | ✅ 完成 | 高 | 自动更新 |
| 图片上传 | 🚧 进行中 | 中 | 计划中 |
| 视频嵌入 | 📋 计划 | 低 | 未来功能 |

### 复杂表格示例

| 编程语言 | 类型 | 难度 | 应用场景 |
| --- | --- | --- | --- |
| JavaScript | 动态 | ⭐⭐⭐ | Web 开发、Node.js |
| Python | 动态 | ⭐⭐ | 数据科学、AI、Web |
| Java | 静态 | ⭐⭐⭐⭐ | 企业应用、Android |
| Go | 静态 | ⭐⭐⭐ | 云服务、微服务 |
| Rust | 静态 | ⭐⭐⭐⭐⭐ | 系统编程、性能优化 |

## 分隔线

使用三个或更多的横线、星号或下划线创建分隔线：

---

上面是一条分隔线

***

这是另一条分隔线

___

## 组合示例

### 技术栈介绍

我的博客使用了以下技术栈：

#### 前端技术
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **JavaScript** - 交互逻辑
- **Feather Icons** - 图标库

#### 后端技术
1. **Node.js** - 运行环境
2. **Express** - Web 框架
3. **Marked** - Markdown 解析
4. **Multer** - 文件上传

#### 开发工具
- [x] VS Code - 代码编辑器
- [x] Git - 版本控制
- [x] npm - 包管理器
- [ ] Docker - 容器化部署

---

### 代码示例：博客文章类

```javascript
class BlogPost {
    constructor(title, content, tags = []) {
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.publishDate = new Date();
        this.views = 0;
    }

    /**
     * 发布文章
     */
    publish() {
        console.log(`发布文章: ${this.title}`);
        return {
            success: true,
            message: '文章发布成功',
            post: this
        };
    }

    /**
     * 增加浏览量
     */
    incrementViews() {
        this.views++;
    }

    /**
     * 获取摘要
     */
    getSummary(length = 100) {
        return this.content.substring(0, length) + '...';
    }
}

// 使用示例
const post = new BlogPost(
    'Markdown 完整指南',
    '这是一篇关于 Markdown 语法的完整指南...',
    ['技术', 'Markdown', '教程']
);

post.publish();
```

---

### 性能对比表

| 操作 | 传统方式 | 优化后 | 提升 |
| --- | --- | --- | --- |
| 页面加载 | 2.5s | 0.8s | **68%** ⬆️ |
| 首次渲染 | 1.2s | 0.3s | **75%** ⬆️ |
| 交互响应 | 150ms | 50ms | **67%** ⬆️ |

> **注意**：以上数据基于实际测试，具体性能可能因设备而异。

---

## 最佳实践

### 写作建议
1. **保持简洁** - 使用清晰的语言
2. **合理分段** - 提高可读性
3. **添加代码** - 配合示例说明
4. **使用列表** - 组织信息
5. **插入图片** - 增强视觉效果

### 格式规范
- 标题层级不要跳跃（不要从 # 直接到 ###）
- 代码块要指定语言以获得正确的高亮
- 表格要对齐以提高可读性
- 链接要有描述性文字

---

## 总结

这个博客编辑器支持完整的 Markdown 语法，包括：

✅ **文本格式**：粗体、斜体、删除线
✅ **标题**：1-5 级标题
✅ **引用块**：支持嵌套和格式化
✅ **代码**：行内代码和代码块（带语法高亮）
✅ **列表**：无序、有序、任务列表
✅ **链接和图片**：自动解析
✅ **表格**：完整的表格支持
✅ **分隔线**：多种样式

开始使用这些语法创作你的精彩内容吧！🚀
