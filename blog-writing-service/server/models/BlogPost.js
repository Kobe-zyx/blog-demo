/**
 * 博文数据模型
 */
class BlogPost {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || '';
        this.content = data.content || '';
        this.coverImage = data.coverImage || '';
        this.publishDate = data.publishDate || new Date();
        this.filename = data.filename || this.generateFilename(this.title);
        this.excerpt = data.excerpt || this.generateExcerpt(this.content);
        this.tags = data.tags || [];
        this.tableOfContents = data.tableOfContents || [];
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 根据标题生成文件名
     */
    generateFilename(title) {
        if (!title) return `post-${this.id}.html`;
        
        // 移除特殊字符，转换为小写，用连字符替换空格
        const cleanTitle = title
            .replace(/[【】\[\]]/g, '') // 移除中文括号
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '') // 只保留中文、英文、数字和空格
            .trim()
            .replace(/\s+/g, '-')
            .toLowerCase();
        
        return `${cleanTitle}.html`;
    }

    /**
     * 生成文章摘要
     */
    generateExcerpt(content, maxLength = 100) {
        if (!content) return '';
        
        // 移除HTML标签和Markdown语法
        const plainText = content
            .replace(/<[^>]*>/g, '') // 移除HTML标签
            .replace(/[#*`_~]/g, '') // 移除Markdown语法
            .replace(/\n+/g, ' ') // 替换换行为空格
            .trim();
        
        return plainText.length > maxLength 
            ? plainText.substring(0, maxLength) + '...'
            : plainText;
    }

    /**
     * 验证博文数据
     */
    validate() {
        const errors = [];
        
        if (!this.title || this.title.trim().length === 0) {
            errors.push('标题不能为空');
        }
        
        if (!this.content || this.content.trim().length === 0) {
            errors.push('内容不能为空');
        }
        
        if (this.title && this.title.length > 100) {
            errors.push('标题长度不能超过100个字符');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            coverImage: this.coverImage,
            publishDate: this.publishDate,
            filename: this.filename,
            excerpt: this.excerpt,
            tags: this.tags,
            tableOfContents: this.tableOfContents
        };
    }

    /**
     * 从JSON对象创建BlogPost实例
     */
    static fromJSON(json) {
        return new BlogPost(json);
    }
}

module.exports = BlogPost;