/**
 * 草稿数据模型
 */
class Draft {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || '';
        this.content = data.content || '';
        this.lastModified = data.lastModified || new Date();
        this.autoSave = data.autoSave !== undefined ? data.autoSave : true;
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'draft-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 更新草稿内容
     */
    update(title, content) {
        this.title = title || this.title;
        this.content = content || this.content;
        this.lastModified = new Date();
    }

    /**
     * 验证草稿数据
     */
    validate() {
        const errors = [];
        
        if (this.title && this.title.length > 100) {
            errors.push('标题长度不能超过100个字符');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 检查是否为空草稿
     */
    isEmpty() {
        return (!this.title || this.title.trim().length === 0) && 
               (!this.content || this.content.trim().length === 0);
    }

    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            lastModified: this.lastModified,
            autoSave: this.autoSave
        };
    }

    /**
     * 从JSON对象创建Draft实例
     */
    static fromJSON(json) {
        return new Draft(json);
    }
}

module.exports = Draft;