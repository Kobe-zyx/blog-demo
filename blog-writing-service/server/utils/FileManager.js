const fs = require('fs').promises;
const path = require('path');

/**
 * 文件管理工具类
 */
class FileManager {
    constructor() {
        // 设置基础路径（相对于项目根目录）
        this.basePath = path.resolve(__dirname, '../../../');
        this.blogPath = path.join(this.basePath, 'blog');
        this.blogImgPath = path.join(this.basePath, 'blog-img');
        this.draftsPath = path.join(this.basePath, 'blog-writing-service', 'drafts');
    }

    /**
     * 确保目录存在
     */
    async ensureDirectoryExists(dirPath) {
        try {
            await fs.access(dirPath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.mkdir(dirPath, { recursive: true });
            } else {
                throw error;
            }
        }
    }

    /**
     * 检查文件是否存在
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 生成唯一文件名（处理冲突）
     */
    async generateUniqueFilename(directory, baseFilename) {
        const ext = path.extname(baseFilename);
        const name = path.basename(baseFilename, ext);
        let counter = 1;
        let filename = baseFilename;

        while (await this.fileExists(path.join(directory, filename))) {
            filename = `${name}-${counter}${ext}`;
            counter++;
        }

        return filename;
    }

    /**
     * 保存博文HTML文件
     */
    async saveBlogPost(filename, htmlContent) {
        await this.ensureDirectoryExists(this.blogPath);
        
        // 确保文件名唯一
        const uniqueFilename = await this.generateUniqueFilename(this.blogPath, filename);
        const filePath = path.join(this.blogPath, uniqueFilename);
        
        await fs.writeFile(filePath, htmlContent, 'utf8');
        return uniqueFilename;
    }

    /**
     * 保存图片文件
     */
    async saveImage(filename, imageBuffer) {
        await this.ensureDirectoryExists(this.blogImgPath);
        
        // 确保文件名唯一
        const uniqueFilename = await this.generateUniqueFilename(this.blogImgPath, filename);
        const filePath = path.join(this.blogImgPath, uniqueFilename);
        
        await fs.writeFile(filePath, imageBuffer);
        return uniqueFilename;
    }

    /**
     * 保存草稿
     */
    async saveDraft(draftId, draftData) {
        await this.ensureDirectoryExists(this.draftsPath);
        
        const filename = `${draftId}.json`;
        const filePath = path.join(this.draftsPath, filename);
        
        await fs.writeFile(filePath, JSON.stringify(draftData, null, 2), 'utf8');
        return filename;
    }

    /**
     * 读取草稿
     */
    async loadDraft(draftId) {
        const filename = `${draftId}.json`;
        const filePath = path.join(this.draftsPath, filename);
        
        if (!await this.fileExists(filePath)) {
            return null;
        }
        
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    }

    /**
     * 删除草稿
     */
    async deleteDraft(draftId) {
        const filename = `${draftId}.json`;
        const filePath = path.join(this.draftsPath, filename);
        
        if (await this.fileExists(filePath)) {
            await fs.unlink(filePath);
            return true;
        }
        return false;
    }

    /**
     * 获取所有草稿列表
     */
    async listDrafts() {
        await this.ensureDirectoryExists(this.draftsPath);
        
        try {
            const files = await fs.readdir(this.draftsPath);
            const drafts = [];
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this.draftsPath, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    const draftData = JSON.parse(content);
                    drafts.push(draftData);
                }
            }
            
            // 按最后修改时间排序
            return drafts.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        } catch (error) {
            console.error('读取草稿列表失败:', error);
            return [];
        }
    }

    /**
     * 读取blog.html文件
     */
    async readBlogHtml() {
        const blogHtmlPath = path.join(this.basePath, 'blog.html');
        
        if (!await this.fileExists(blogHtmlPath)) {
            throw new Error('blog.html文件不存在');
        }
        
        return await fs.readFile(blogHtmlPath, 'utf8');
    }

    /**
     * 更新blog.html文件
     */
    async updateBlogHtml(htmlContent) {
        const blogHtmlPath = path.join(this.basePath, 'blog.html');
        await fs.writeFile(blogHtmlPath, htmlContent, 'utf8');
    }

    /**
     * 获取已发布的博文列表
     */
    async listBlogPosts() {
        await this.ensureDirectoryExists(this.blogPath);
        
        try {
            const files = await fs.readdir(this.blogPath);
            const posts = [];
            
            for (const file of files) {
                if (file.endsWith('.html')) {
                    const filePath = path.join(this.blogPath, file);
                    const stats = await fs.stat(filePath);
                    
                    // 读取文件内容获取标题
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    // 优先从h2标签提取标题（文章的实际标题）
                    const h2TitleMatch = content.match(/<h2[^>]*>(.*?)<\/h2>/i);
                    const titleTagMatch = content.match(/<title>(.*?)<\/title>/i);
                    
                    let title = '';
                    if (h2TitleMatch) {
                        title = h2TitleMatch[1].trim();
                    } else if (titleTagMatch) {
                        // 从title标签中提取，去掉" | Kobe Zhang"后缀
                        title = titleTagMatch[1].replace(/\s*\|\s*Kobe Zhang\s*$/, '').trim();
                    } else {
                        title = file.replace('.html', '');
                    }
                    
                    posts.push({
                        filename: file,
                        title: title,
                        publishDate: stats.mtime.toISOString(),
                        size: stats.size,
                        url: `/blog/${file}`
                    });
                }
            }
            
            // 按发布时间排序（最新的在前）
            return posts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        } catch (error) {
            console.error('读取博文列表失败:', error);
            return [];
        }
    }
}

module.exports = FileManager;