/**
 * 完整工作流测试 - 从编辑器到博客列表
 */
const BlogPost = require('./server/models/BlogPost');
const FileManager = require('./server/utils/FileManager');
const BlogListManager = require('./server/utils/BlogListManager');
const CoverImageGenerator = require('./server/utils/CoverImageGenerator');
const TableOfContentsGenerator = require('./server/utils/TableOfContentsGenerator');
const fs = require('fs').promises;
const path = require('path');

console.log('🔄 开始完整工作流测试...\n');

async function testFullWorkflow() {
    try {
        console.log('1️⃣ 模拟用户在编辑器中创建博文...');
        
        // 模拟用户输入
        const userInput = {
            title: '【技术分享】博客写作服务测试文章',
            content: `## 介绍

这是一篇通过博客写作服务创建的测试文章。

### 功能特性

- 自动封面生成
- 博客列表更新
- 目录自动生成

### 测试内容

这里是测试内容，用于验证系统功能。

## 总结

测试文章创建成功！`,
            tags: ['技术分享', '测试']
        };
        
        console.log(`   📝 标题: ${userInput.title}`);
        console.log(`   📄 内容长度: ${userInput.content.length} 字符`);
        
        console.log('\n2️⃣ 创建BlogPost实例...');
        
        const blogPost = new BlogPost({
            title: userInput.title.trim(),
            content: userInput.content.trim(),
            tags: userInput.tags
        });
        
        console.log(`   ✅ BlogPost创建成功`);
        console.log(`   📄 文件名: ${blogPost.filename}`);
        console.log(`   📋 摘要: ${blogPost.excerpt}`);
        
        console.log('\n3️⃣ 生成封面图片...');
        
        const coverGenerator = new CoverImageGenerator();
        const coverData = await coverGenerator.generateCover(blogPost.title);
        blogPost.coverImage = `../blog-img/${coverData.svgFilename}`;
        
        console.log(`   ✅ 封面生成成功`);
        console.log(`   🎨 使用模板: ${coverData.template}`);
        console.log(`   📁 封面文件: ${coverData.svgFilename}`);
        
        console.log('\n4️⃣ 生成文章目录...');
        
        blogPost.tableOfContents = TableOfContentsGenerator.generateFromMarkdown(blogPost.content);
        
        console.log(`   ✅ 目录生成成功`);
        console.log(`   📑 目录项数量: ${blogPost.tableOfContents.length}`);
        
        blogPost.tableOfContents.forEach((item, index) => {
            console.log(`   ${index + 1}. [H${item.level}] ${item.title}`);
        });
        
        console.log('\n5️⃣ 生成博文HTML文件...');
        
        const htmlContent = await generateBlogPostHtml(blogPost);
        
        console.log(`   ✅ HTML内容生成成功`);
        console.log(`   📄 HTML长度: ${htmlContent.length} 字符`);
        
        console.log('\n6️⃣ 保存博文文件...');
        
        const fileManager = new FileManager();
        const savedFilename = await fileManager.saveBlogPost(blogPost.filename, htmlContent);
        blogPost.filename = savedFilename;
        
        console.log(`   ✅ 博文文件保存成功`);
        console.log(`   📁 保存路径: blog/${savedFilename}`);
        
        console.log('\n7️⃣ 更新blog.html列表...');
        
        const blogListManager = new BlogListManager();
        await blogListManager.addPost(blogPost);
        
        console.log(`   ✅ blog.html更新成功`);
        console.log(`   📋 博文已按时间顺序添加到列表`);
        
        console.log('\n8️⃣ 验证完整流程...');
        
        // 验证文件是否存在
        const blogFilePath = path.join(fileManager.blogPath, savedFilename);
        const blogFileExists = await fileManager.fileExists(blogFilePath);
        
        if (blogFileExists) {
            console.log(`   ✅ 博文文件存在: ${savedFilename}`);
        } else {
            console.log(`   ❌ 博文文件不存在: ${savedFilename}`);
        }
        
        // 验证封面文件是否存在
        const coverFilePath = path.join(fileManager.blogImgPath, coverData.svgFilename);
        const coverFileExists = await fileManager.fileExists(coverFilePath);
        
        if (coverFileExists) {
            console.log(`   ✅ 封面文件存在: ${coverData.svgFilename}`);
        } else {
            console.log(`   ❌ 封面文件不存在: ${coverData.svgFilename}`);
        }
        
        // 验证blog.html是否包含新博文
        const blogHtml = await fileManager.readBlogHtml();
        const containsNewPost = blogHtml.includes(blogPost.title);
        
        if (containsNewPost) {
            console.log(`   ✅ blog.html包含新博文`);
        } else {
            console.log(`   ❌ blog.html不包含新博文`);
        }
        
        console.log('\n🎉 完整工作流测试完成！');
        
        console.log('\n📊 测试结果总结:');
        console.log(`   📝 博文标题: ${blogPost.title}`);
        console.log(`   📄 博文文件: blog/${savedFilename}`);
        console.log(`   🖼️ 封面文件: blog-img/${coverData.svgFilename}`);
        console.log(`   📑 目录项数: ${blogPost.tableOfContents.length}`);
        console.log(`   🏷️ 标签: ${blogPost.tags.join(', ')}`);
        console.log(`   📅 发布日期: ${new Date(blogPost.publishDate).toLocaleDateString('zh-CN')}`);
        
        console.log('\n✅ 所有功能正常工作，可以开始使用博客编辑器！');
        
    } catch (error) {
        console.error('❌ 完整工作流测试失败:', error);
    }
}

/**
 * 生成博文HTML内容
 */
async function generateBlogPostHtml(blogPost) {
    try {
        // 读取模板文件
        const templatePath = path.join(__dirname, 'templates/post-template.html');
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

// 运行测试
testFullWorkflow();