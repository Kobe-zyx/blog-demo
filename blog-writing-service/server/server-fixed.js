/**
 * 修复版本的Express服务器
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/editor', express.static(path.join(__dirname, '../editor')));
app.use('/templates', express.static(path.join(__dirname, '../templates')));
app.use(express.static(path.join(__dirname, '../../'))); // 服务根目录文件

// 内联API路由 - 避免模块导入问题
const BlogPost = require('./models/BlogPost');
const Draft = require('./models/Draft');
const FileManager = require('./utils/FileManager');
const TableOfContentsGenerator = require('./utils/TableOfContentsGenerator');
const SimpleCoverGenerator = require('./utils/SimpleCoverGenerator');
const CoverImageGenerator = require('./utils/CoverImageGenerator');
const BlogListManager = require('./utils/BlogListManager');
const fs = require('fs').promises;
const marked = require('marked');

// 配置 marked 以支持自定义语法
marked.use({
    extensions: [
        {
            name: 'highlight',
            level: 'inline',
            start(src) { return src.match(/==/)?.index; },
            tokenizer(src) {
                const rule = /^==([^=]+)==/;
                const match = rule.exec(src);
                if (match) {
                    return {
                        type: 'highlight',
                        raw: match[0],
                        text: match[1].trim()
                    };
                }
            },
            renderer(token) {
                return `<mark>${token.text}</mark>`;
            }
        }
    ]
});

const fileManager = new FileManager();

// 博文API路由
app.get('/api/posts', async (req, res) => {
    try {
        console.log('正在获取博文列表...');
        console.log('Blog路径:', fileManager.blogPath);
        
        const posts = await fileManager.listBlogPosts();
        console.log('找到博文数量:', posts.length);
        
        res.json({
            success: true,
            posts,
            count: posts.length,
            message: '博文列表获取成功'
        });
    } catch (error) {
        console.error('获取博文列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取博文列表失败',
            message: error.message
        });
    }
});

app.get('/api/posts/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        // 确保文件名以.html结尾
        const htmlFilename = filename.endsWith('.html') ? filename : `${filename}.html`;
        const filePath = path.join(__dirname, '../../blog', htmlFilename);
        
        // 检查文件是否存在
        const exists = await fileManager.fileExists(filePath);
        if (!exists) {
            return res.status(404).json({
                success: false,
                error: '博文未找到'
            });
        }
        
        // 读取文件内容
        const content = await fs.readFile(filePath, 'utf8');
        const stats = await fs.stat(filePath);
        
        // 解析标题和原始Markdown内容
        const h2TitleMatch = content.match(/<h2[^>]*>(.*?)<\/h2>/i);
        const titleTagMatch = content.match(/<title>(.*?)<\/title>/i);
        
        // 优先使用h2标题，如果没有则使用title标签，最后使用文件名
        let title = '';
        if (h2TitleMatch) {
            title = h2TitleMatch[1].trim();
        } else if (titleTagMatch) {
            // 从title标签中提取，去掉" | Kobe Zhang"后缀
            title = titleTagMatch[1].replace(/\s*\|\s*Kobe Zhang\s*$/, '').trim();
        } else {
            title = filename.replace('.html', '');
        }
        
        // 尝试从HTML中提取原始Markdown内容
        // 这里我们需要从HTML反向解析出Markdown
        const markdownContent = extractMarkdownFromHtml(content);
        
        res.json({
            success: true,
            post: {
                filename: htmlFilename,
                title: title,
                content: content,
                markdownContent: markdownContent,
                publishDate: stats.mtime.toISOString(),
                size: stats.size,
                url: `/blog/${htmlFilename}`
            },
            message: '博文获取成功'
        });
        
    } catch (error) {
        console.error('获取博文失败:', error);
        res.status(500).json({
            success: false,
            error: '获取博文失败',
            message: error.message
        });
    }
});

// 新增：获取文章的原始Markdown内容用于编辑
app.get('/api/posts/:filename/edit', async (req, res) => {
    try {
        const { filename } = req.params;
        
        // 确保文件名以.html结尾
        const htmlFilename = filename.endsWith('.html') ? filename : `${filename}.html`;
        const filePath = path.join(__dirname, '../../blog', htmlFilename);
        
        // 检查文件是否存在
        const exists = await fileManager.fileExists(filePath);
        if (!exists) {
            return res.status(404).json({
                success: false,
                error: '博文未找到'
            });
        }
        
        // 读取文件内容
        const htmlContent = await fs.readFile(filePath, 'utf8');
        const stats = await fs.stat(filePath);
        
        // 解析标题（从h2标签提取，这是文章的实际标题）
        const h2TitleMatch = htmlContent.match(/<h2[^>]*>(.*?)<\/h2>/i);
        const titleTagMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
        
        // 优先使用h2标题，如果没有则使用title标签，最后使用文件名
        let title = '';
        if (h2TitleMatch) {
            title = h2TitleMatch[1].trim();
        } else if (titleTagMatch) {
            // 从title标签中提取，去掉" | Kobe Zhang"后缀
            title = titleTagMatch[1].replace(/\s*\|\s*Kobe Zhang\s*$/, '').trim();
        } else {
            title = filename.replace('.html', '');
        }
        
        // 从HTML中提取原始Markdown内容
        const markdownContent = extractMarkdownFromHtml(htmlContent);
        
        res.json({
            success: true,
            post: {
                filename: htmlFilename,
                title: title,
                markdownContent: markdownContent,
                publishDate: stats.mtime.toISOString(),
                isEditing: true
            },
            message: '文章编辑数据获取成功'
        });
        
    } catch (error) {
        console.error('获取文章编辑数据失败:', error);
        res.status(500).json({
            success: false,
            error: '获取文章编辑数据失败',
            message: error.message
        });
    }
});

// 新增：更新现有文章
app.put('/api/posts/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { title, content, tags = [] } = req.body;

        // 验证输入
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: '标题和内容不能为空'
            });
        }

        // 确保文件名以.html结尾
        const htmlFilename = filename.endsWith('.html') ? filename : `${filename}.html`;
        const filePath = path.join(__dirname, '../../blog', htmlFilename);
        
        // 检查文件是否存在
        const exists = await fileManager.fileExists(filePath);
        if (!exists) {
            return res.status(404).json({
                success: false,
                error: '要更新的博文未找到'
            });
        }

        // 创建博文实例
        const blogPost = new BlogPost({
            title: title.trim(),
            content: content.trim(),
            tags,
            filename: htmlFilename
        });

        // 验证博文数据
        const validation = blogPost.validate();
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: '数据验证失败',
                details: validation.errors
            });
        }

        // 保持原有的封面图片（如果存在）
        const originalContent = await fs.readFile(filePath, 'utf8');
        
        // 提取原有的封面图片路径（只匹配blog-main-content中的图片）
        const blogMainContentMatch = originalContent.match(/<div class="blog-main-content"[^>]*>([\s\S]*?)<div class="markdown-content">/i);
        let coverMatch = null;
        
        if (blogMainContentMatch) {
            // 在blog-main-content中查找图片，但排除导航栏的logo
            coverMatch = blogMainContentMatch[1].match(/<img[^>]*src="([^"]*)"[^>]*alt="[^"]*"[^>]*>/i);
        }
        
        if (coverMatch && !coverMatch[1].includes('PicGo') && !coverMatch[1].includes('Logo')) {
            blogPost.coverImage = coverMatch[1];
            console.log('保持原有封面图片:', blogPost.coverImage);
        } else {
            // 如果没有封面，生成新的
            try {
                const coverGenerator = new CoverImageGenerator();
                const coverData = await coverGenerator.generateCover(blogPost.title);
                blogPost.coverImage = `../blog-img/${coverData.svgFilename}`;
                console.log('生成新封面图片:', blogPost.coverImage);
            } catch (coverError) {
                console.warn('封面生成失败，使用默认封面:', coverError.message);
                blogPost.coverImage = '../blog-img/default-cover.png';
            }
        }
        
        // 保持原有的发布日期
        const originalStats = await fs.stat(filePath);
        blogPost.publishDate = originalStats.birthtime || originalStats.mtime;

        // 生成目录
        blogPost.tableOfContents = TableOfContentsGenerator.generateFromMarkdown(blogPost.content);

        // 生成HTML内容
        const htmlContent = await generateBlogPostHtml(blogPost);

        // 保存更新的博文文件
        await fs.writeFile(filePath, htmlContent, 'utf8');

        // 更新blog.html列表（移除旧的，添加新的）
        try {
            const blogListManager = new BlogListManager();
            await blogListManager.updatePost(htmlFilename, blogPost);
        } catch (listError) {
            console.error('更新博文列表失败:', listError);
            // 不阻止博文更新，只记录错误
        }

        res.json({
            success: true,
            post: blogPost.toJSON(),
            message: '博文更新成功'
        });

    } catch (error) {
        console.error('更新博文失败:', error);
        res.status(500).json({
            success: false,
            error: '更新博文失败',
            message: error.message
        });
    }
});

app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, tags = [] } = req.body;

        // 验证输入
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: '标题和内容不能为空'
            });
        }

        // 创建博文实例
        const blogPost = new BlogPost({
            title: title.trim(),
            content: content.trim(),
            tags
        });

        // 验证博文数据
        const validation = blogPost.validate();
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: '数据验证失败',
                details: validation.errors
            });
        }

        // 生成封面图片
        try {
            const coverGenerator = new CoverImageGenerator();
            const coverData = await coverGenerator.generateCover(blogPost.title);
            blogPost.coverImage = `../blog-img/${coverData.svgFilename}`;
        } catch (coverError) {
            console.warn('封面生成失败，使用默认封面:', coverError.message);
            blogPost.coverImage = '../blog-img/default-cover.png';
        }

        // 生成目录
        blogPost.tableOfContents = TableOfContentsGenerator.generateFromMarkdown(blogPost.content);

        // 生成HTML内容
        const htmlContent = await generateBlogPostHtml(blogPost);

        // 保存博文文件
        const savedFilename = await fileManager.saveBlogPost(blogPost.filename, htmlContent);
        blogPost.filename = savedFilename;

        // 更新blog.html列表
        try {
            const blogListManager = new BlogListManager();
            await blogListManager.addPost(blogPost);
        } catch (listError) {
            console.error('更新博文列表失败:', listError);
            // 不阻止博文发布，只记录错误
        }

        res.json({
            success: true,
            post: blogPost.toJSON(),
            message: '博文发布成功'
        });

    } catch (error) {
        console.error('创建博文失败:', error);
        res.status(500).json({
            success: false,
            error: '创建博文失败',
            message: error.message
        });
    }
});

// 草稿API路由
app.get('/api/drafts', async (req, res) => {
    try {
        const drafts = await fileManager.listDrafts();
        
        res.json({
            success: true,
            drafts,
            message: '草稿列表获取成功'
        });
    } catch (error) {
        console.error('获取草稿列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取草稿列表失败',
            message: error.message
        });
    }
});

app.get('/api/drafts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const draftData = await fileManager.loadDraft(id);
        if (!draftData) {
            return res.status(404).json({
                success: false,
                error: '草稿未找到'
            });
        }

        const draft = Draft.fromJSON(draftData);
        
        res.json({
            success: true,
            draft: draft.toJSON(),
            message: '草稿获取成功'
        });
    } catch (error) {
        console.error('获取草稿失败:', error);
        res.status(500).json({
            success: false,
            error: '获取草稿失败',
            message: error.message
        });
    }
});

app.post('/api/drafts', async (req, res) => {
    try {
        const { id, title, content, autoSave = true } = req.body;

        // 创建或更新草稿
        let draft;
        if (id) {
            // 更新现有草稿
            const existingData = await fileManager.loadDraft(id);
            if (existingData) {
                draft = Draft.fromJSON(existingData);
                draft.update(title, content);
            } else {
                draft = new Draft({ id, title, content, autoSave });
            }
        } else {
            // 创建新草稿
            draft = new Draft({ title, content, autoSave });
        }

        // 验证草稿数据
        const validation = draft.validate();
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: '数据验证失败',
                details: validation.errors
            });
        }

        // 保存草稿
        await fileManager.saveDraft(draft.id, draft.toJSON());

        res.json({
            success: true,
            draft: draft.toJSON(),
            message: '草稿保存成功'
        });

    } catch (error) {
        console.error('保存草稿失败:', error);
        res.status(500).json({
            success: false,
            error: '保存草稿失败',
            message: error.message
        });
    }
});

app.delete('/api/drafts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await fileManager.deleteDraft(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: '草稿未找到'
            });
        }

        res.json({
            success: true,
            message: '草稿删除成功'
        });

    } catch (error) {
        console.error('删除草稿失败:', error);
        res.status(500).json({
            success: false,
            error: '删除草稿失败',
            message: error.message
        });
    }
});

// 封面生成API
app.post('/api/generate-cover', async (req, res) => {
    try {
        const { title, template } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: '标题不能为空'
            });
        }

        const coverGenerator = new CoverImageGenerator();
        const coverData = await coverGenerator.generateCover(title, template);

        res.json({
            success: true,
            cover: coverData,
            message: '封面生成成功'
        });

    } catch (error) {
        console.error('生成封面失败:', error);
        res.status(500).json({
            success: false,
            error: '生成封面失败',
            message: error.message
        });
    }
});

// 获取可用封面模板
app.get('/api/cover-templates', (req, res) => {
    try {
        const coverGenerator = new CoverImageGenerator();
        const templates = coverGenerator.getAvailableTemplates();

        res.json({
            success: true,
            templates,
            message: '模板列表获取成功'
        });
    } catch (error) {
        console.error('获取模板列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取模板列表失败',
            message: error.message
        });
    }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'blog-writing-service'
    });
});

// 根路径重定向到编辑器
app.get('/', (req, res) => {
    res.redirect('/editor/editor.html');
});

// 从HTML中提取Markdown内容的辅助函数
function extractMarkdownFromHtml(htmlContent) {
    try {
        // 首先提取文章标题（从h2标签，不是title标签）
        const titleMatch = htmlContent.match(/<h2[^>]*>(.*?)<\/h2>/i);
        const articleTitle = titleMatch ? titleMatch[1].trim() : '';
        
        // 提取markdown-content部分的内容
        const markdownContentMatch = htmlContent.match(/<div class="markdown-content"[^>]*>([\s\S]*?)<\/div>/i);
        if (!markdownContentMatch) {
            // 如果没有markdown-content，尝试提取blog-main-content
            const mainContentMatch = htmlContent.match(/<div class="blog-main-content"[^>]*>([\s\S]*?)<\/div>/i);
            if (!mainContentMatch) {
                return articleTitle ? `# ${articleTitle}\n\n` : '';
            }
            
            let content = mainContentMatch[1];
            // 移除标题、日期和封面图片部分
            content = content
                .replace(/<h2[^>]*>.*?<\/h2>/gi, '')
                .replace(/<p class="post-meta"[^>]*>.*?<\/p>/gi, '')
                .replace(/<img[^>]*>/gi, '');
        } else {
            var content = markdownContentMatch[1];
        }
        
        // HTML到Markdown转换
        let markdown = content
            // 移除HTML注释
            .replace(/<!--[\s\S]*?-->/g, '')
            // 转换标题（保持id属性中的锚点）
            .replace(/<h1[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h1>/gi, '# $2')
            .replace(/<h2[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h2>/gi, '## $2')
            .replace(/<h3[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h3>/gi, '### $2')
            .replace(/<h4[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h4>/gi, '#### $2')
            .replace(/<h5[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h5>/gi, '##### $2')
            .replace(/<h6[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h6>/gi, '###### $2')
            // 转换段落
            .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
            // 转换高亮标记
            .replace(/<mark[^>]*>(.*?)<\/mark>/gi, '==$1==')
            // 转换删除线
            .replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
            // 转换粗体和斜体
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
            .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
            // 转换代码
            .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
            .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```')
            // 转换链接
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            // 转换图片（但不包括封面图片）
            .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
            // 转换无序列表
            .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, listContent) => {
                return listContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (liMatch, liContent) => {
                    // 清理li内容中的换行和多余空格
                    const cleanContent = liContent.replace(/\n\s*/g, ' ').trim();
                    return `- ${cleanContent}\n`;
                });
            })
            // 转换有序列表
            .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, listContent) => {
                let counter = 1;
                return listContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (liMatch, liContent) => {
                    const cleanContent = liContent.replace(/\n\s*/g, ' ').trim();
                    return `${counter++}. ${cleanContent}\n`;
                });
            })
            // 转换引用
            .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
                return content.split('\n').map(line => `> ${line.trim()}`).join('\n');
            })
            // 转换换行
            .replace(/<br\s*\/?>/gi, '\n')
            // 移除其他HTML标签
            .replace(/<[^>]*>/g, '')
            // 清理多余的空行
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            // 解码HTML实体
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .trim();
        
        // 如果有标题，添加到开头
        if (articleTitle && !markdown.startsWith('#')) {
            markdown = `# ${articleTitle}\n\n${markdown}`;
        }
        
        return markdown;
    } catch (error) {
        console.error('提取Markdown内容失败:', error);
        return '';
    }
}

// 生成博文HTML内容的辅助函数
async function generateBlogPostHtml(blogPost) {
    try {
        // 读取模板文件
        const templatePath = path.join(__dirname, '../templates/post-template.html');
        let template = await fs.readFile(templatePath, 'utf8');

        // 处理内容（将Markdown转换为HTML）
        const htmlContent = marked.parse(blogPost.content);

        // 为HTML内容添加锚点
        const contentWithAnchors = TableOfContentsGenerator.addAnchorsToHtml(htmlContent, blogPost.tableOfContents);

        // 生成目录HTML
        const tocHtml = blogPost.tableOfContents.length > 0 
            ? TableOfContentsGenerator.generateTocHtml(blogPost.tableOfContents)
            : '';

        // 生成封面图片HTML
        const coverImageHtml = blogPost.coverImage 
            ? `<img src="${blogPost.coverImage}" alt="${blogPost.title}">`
            : '';

        // 格式化发布日期
        const publishDate = new Date(blogPost.publishDate).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 替换模板变量
        template = template
            .replace(/\{\{TITLE\}\}/g, blogPost.title)
            .replace(/\{\{CONTENT\}\}/g, contentWithAnchors)
            .replace(/\{\{COVER_IMAGE\}\}/g, coverImageHtml)
            .replace(/\{\{PUBLISH_DATE\}\}/g, publishDate)
            .replace(/\{\{TABLE_OF_CONTENTS\}\}/g, tocHtml);

        return template;
    } catch (error) {
        console.error('生成HTML内容失败:', error);
        throw new Error('生成HTML内容失败: ' + error.message);
    }
}

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    
    res.status(500).json({
        error: '服务器内部错误',
        message: err.message
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        error: '页面未找到',
        path: req.path
    });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
    console.log(`🚀 博客写作服务已启动（修复版本）`);
    console.log(`📝 编辑器地址: http://${HOST}:${PORT}/editor/editor.html`);
    console.log(`🔧 API地址: http://${HOST}:${PORT}/api`);
    console.log(`⚡ 环境: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
});

module.exports = app;