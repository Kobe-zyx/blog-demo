const FileManager = require('./FileManager');
const cheerio = require('cheerio');

/**
 * 博客列表管理器
 * 负责更新blog.html中的博文列表
 */
class BlogListManager {
    constructor() {
        this.fileManager = new FileManager();
    }

    /**
     * 添加新博文到blog.html列表
     */
    async addPost(blogPost) {
        try {
            // 读取现有的blog.html
            const blogHtml = await this.fileManager.readBlogHtml();
            
            // 使用cheerio解析HTML
            const $ = cheerio.load(blogHtml);
            
            // 查找博文网格容器
            const blogGrid = $('.blog-posts-grid');
            if (blogGrid.length === 0) {
                throw new Error('未找到博文网格容器 .blog-posts-grid');
            }

            // 创建新的博文条目HTML
            const newPostHtml = this.generatePostItemHtml(blogPost);
            
            // 获取所有现有博文条目
            const existingPosts = [];
            blogGrid.find('.blog-post-item').each((index, element) => {
                const $item = $(element);
                const dateText = $item.find('.post-meta').text().trim();
                const date = this.parseChineseDate(dateText);
                existingPosts.push({
                    element: $item,
                    date: date,
                    html: $.html($item)
                });
            });

            // 添加新博文到数组
            const newPostDate = new Date(blogPost.publishDate);
            existingPosts.push({
                element: null,
                date: newPostDate,
                html: newPostHtml
            });

            // 按日期倒序排序（最新的在前面）
            existingPosts.sort((a, b) => b.date - a.date);

            // 清空现有内容并重新添加排序后的博文
            blogGrid.empty();
            existingPosts.forEach(post => {
                blogGrid.append(post.html);
            });

            // 获取更新后的HTML
            const updatedHtml = $.html();
            
            // 保存更新后的blog.html
            await this.fileManager.updateBlogHtml(updatedHtml);
            
            console.log(`博文 "${blogPost.title}" 已按时间顺序添加到blog.html列表`);
        } catch (error) {
            console.error('添加博文到列表失败:', error);
            throw error;
        }
    }

    /**
     * 解析中文日期格式
     */
    parseChineseDate(dateText) {
        try {
            // 匹配格式：2025年6月9日
            const match = dateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]) - 1; // JavaScript月份从0开始
                const day = parseInt(match[3]);
                return new Date(year, month, day);
            }
            
            // 如果无法解析，返回当前日期
            return new Date();
        } catch (error) {
            console.warn('日期解析失败:', dateText, error);
            return new Date();
        }
    }

    /**
     * 生成博文条目HTML
     */
    generatePostItemHtml(blogPost) {
        // 格式化发布日期
        const publishDate = new Date(blogPost.publishDate).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 处理封面图片路径
        let coverImageSrc = blogPost.coverImage;
        if (coverImageSrc.startsWith('../')) {
            coverImageSrc = coverImageSrc.replace('../', '');
        }

        // 自动选择标签
        const tag = this.selectTagByTitle(blogPost.title);

        // 生成博文条目HTML
        return `                <div class="blog-post-item">
                    <a href="blog/${blogPost.filename}">
                        <img src="${coverImageSrc}" alt="${blogPost.title}">
                    </a>
                    <h3>${blogPost.title}</h3>
                    <p class="post-meta">${publishDate}</p>
                    <div class="post-tags">
                        <span class="tag">${tag}</span>
                        <a href="blog/${blogPost.filename}" class="details-button">查看详情</a>
                    </div>
                </div>`;
    }

    /**
     * 根据标题自动选择标签
     */
    selectTagByTitle(title) {
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('技术') || lowerTitle.includes('代码') || lowerTitle.includes('开发')) {
            return '技术分享';
        } else if (lowerTitle.includes('经验') || lowerTitle.includes('心得') || lowerTitle.includes('分享')) {
            return '经验分享';
        } else if (lowerTitle.includes('教程') || lowerTitle.includes('指南') || lowerTitle.includes('如何')) {
            return '教程操作';
        } else if (lowerTitle.includes('不吐不快') || lowerTitle.includes('吐槽') || lowerTitle.includes('对比')) {
            return '不吐不快';
        }
        
        return '技术分享'; // 默认标签
    }

    /**
     * 从blog.html列表中移除博文
     */
    async removePost(filename) {
        try {
            // 读取现有的blog.html
            const blogHtml = await this.fileManager.readBlogHtml();
            
            // 使用cheerio解析HTML
            const $ = cheerio.load(blogHtml);
            
            // 查找并移除对应的博文条目
            $(`.blog-post-item a[href="blog/${filename}"]`).closest('.blog-post-item').remove();

            // 获取更新后的HTML
            const updatedHtml = $.html();
            
            // 保存更新后的blog.html
            await this.fileManager.updateBlogHtml(updatedHtml);
            
            console.log(`博文 "${filename}" 已从blog.html列表中移除`);
        } catch (error) {
            console.error('从列表移除博文失败:', error);
            throw error;
        }
    }

    /**
     * 更新博文在列表中的信息
     */
    async updatePost(oldFilename, blogPost) {
        try {
            // 先移除旧的条目
            await this.removePost(oldFilename);
            
            // 再添加新的条目
            await this.addPost(blogPost);
            
            console.log(`博文列表已更新: ${oldFilename} -> ${blogPost.filename}`);
        } catch (error) {
            console.error('更新博文列表失败:', error);
            throw error;
        }
    }

    /**
     * 获取blog.html中的所有博文条目
     */
    async getAllPosts() {
        try {
            // 读取现有的blog.html
            const blogHtml = await this.fileManager.readBlogHtml();
            
            // 使用cheerio解析HTML
            const $ = cheerio.load(blogHtml);
            
            const posts = [];
            $('.blog-post-item').each((index, element) => {
                const $item = $(element);
                const $link = $item.find('a[href^="blog/"]').first();
                const $title = $item.find('h3');
                const $date = $item.find('.post-meta');
                const $img = $item.find('img');

                if ($link.length && $title.length) {
                    posts.push({
                        filename: $link.attr('href').replace('blog/', ''),
                        title: $title.text().trim(),
                        date: $date.text().trim(),
                        coverImage: $img.attr('src') || '',
                        url: $link.attr('href')
                    });
                }
            });

            return posts;
        } catch (error) {
            console.error('获取博文列表失败:', error);
            throw error;
        }
    }

    /**
     * 验证blog.html结构
     */
    async validateBlogHtml() {
        try {
            const blogHtml = await this.fileManager.readBlogHtml();
            const $ = cheerio.load(blogHtml);
            
            const issues = [];
            
            // 检查必要的容器是否存在
            if ($('.blog-posts-grid').length === 0) {
                issues.push('缺少博文网格容器 .blog-posts-grid');
            }
            
            // 检查导航栏
            if ($('.navbar').length === 0) {
                issues.push('缺少导航栏 .navbar');
            }
            
            // 检查页脚
            if ($('footer').length === 0) {
                issues.push('缺少页脚 footer');
            }

            return {
                isValid: issues.length === 0,
                issues
            };
        } catch (error) {
            return {
                isValid: false,
                issues: [`无法读取blog.html: ${error.message}`]
            };
        }
    }
}

module.exports = BlogListManager;