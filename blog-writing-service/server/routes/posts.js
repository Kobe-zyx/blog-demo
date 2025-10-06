const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const FileManager = require('../utils/FileManager');
const TableOfContentsGenerator = require('../utils/TableOfContentsGenerator');
const SimpleCoverGenerator = require('../utils/SimpleCoverGenerator');
const BlogListManager = require('../utils/BlogListManager');
const fs = require('fs').promises;
const path = require('path');

const fileManager = new FileManager();

/**
 * 获取所有博文列表
 * GET /api/posts
 */
router.get('/', async (req, res) => {
    try {
        // 这里可以从数据库或文件系统获取博文列表
        // 暂时返回空数组，后续可以扩展
        res.json({
            success: true,
            posts: [],
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

/**
 * 创建新博文
 * POST /api/posts
 */
router.post('/', async (req, res) => {
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
            const coverData = SimpleCoverGenerator.generateCoverData(blogPost.title);
            blogPost.coverImage = `../blog-img/${coverData.filename}`;
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

/**
 * 获取单个博文
 * GET /api/posts/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // 这里可以根据ID从存储中获取博文
        // 暂时返回404，后续可以扩展
        res.status(404).json({
            success: false,
            error: '博文未找到'
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

/**
 * 更新博文
 * PUT /api/posts/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags } = req.body;

        // 暂时返回未实现，后续可以扩展
        res.status(501).json({
            success: false,
            error: '功能暂未实现'
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

/**
 * 删除博文
 * DELETE /api/posts/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 暂时返回未实现，后续可以扩展
        res.status(501).json({
            success: false,
            error: '功能暂未实现'
        });
    } catch (error) {
        console.error('删除博文失败:', error);
        res.status(500).json({
            success: false,
            error: '删除博文失败',
            message: error.message
        });
    }
});

/**
 * 生成博文HTML内容
 */
async function generateBlogPostHtml(blogPost) {
    try {
        // 读取模板文件
        const templatePath = path.join(__dirname, '../templates/post-template.html');
        let template = await fs.readFile(templatePath, 'utf8');

        // 处理内容（将Markdown转换为HTML）
        const marked = require('marked');
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

module.exports = router;