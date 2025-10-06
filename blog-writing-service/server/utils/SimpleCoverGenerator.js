/**
 * 简化的封面生成器 - 不依赖Canvas
 * 使用HTML/CSS生成封面图片
 */
class SimpleCoverGenerator {
    /**
     * 生成封面HTML
     */
    static generateCoverHtml(title, template = 'default') {
        const templates = {
            default: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textColor: '#ffffff',
                fontSize: '2.5rem'
            },
            tech: {
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                textColor: '#ffffff',
                fontSize: '2.5rem'
            },
            share: {
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                textColor: '#333333',
                fontSize: '2.5rem'
            },
            tutorial: {
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                textColor: '#333333',
                fontSize: '2.5rem'
            }
        };

        const selectedTemplate = templates[template] || templates.default;

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 800px;
            height: 400px;
            background: ${selectedTemplate.background};
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
            overflow: hidden;
        }
        .title {
            color: ${selectedTemplate.textColor};
            font-size: ${selectedTemplate.fontSize};
            font-weight: bold;
            text-align: center;
            padding: 40px;
            max-width: 720px;
            line-height: 1.2;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <div class="title">${this.escapeHtml(title)}</div>
</body>
</html>`;
    }

    /**
     * 转义HTML字符
     */
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * 生成封面文件名
     */
    static generateCoverFilename(title) {
        const cleanTitle = title
            .replace(/[【】\[\]]/g, '')
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .toLowerCase();
        
        return `${cleanTitle || 'cover'}.png`;
    }

    /**
     * 获取可用模板列表
     */
    static getAvailableTemplates() {
        return [
            { id: 'default', name: '默认模板', description: '蓝紫渐变背景' },
            { id: 'tech', name: '技术模板', description: '深蓝色背景，适合技术文章' },
            { id: 'share', name: '分享模板', description: '粉色渐变背景，适合经验分享' },
            { id: 'tutorial', name: '教程模板', description: '清新渐变背景，适合教程文章' }
        ];
    }

    /**
     * 根据标题自动选择模板
     */
    static autoSelectTemplate(title) {
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('技术') || lowerTitle.includes('代码') || lowerTitle.includes('开发')) {
            return 'tech';
        } else if (lowerTitle.includes('分享') || lowerTitle.includes('经验') || lowerTitle.includes('心得')) {
            return 'share';
        } else if (lowerTitle.includes('教程') || lowerTitle.includes('指南') || lowerTitle.includes('如何')) {
            return 'tutorial';
        }
        
        return 'default';
    }

    /**
     * 生成封面数据（用于前端显示）
     */
    static generateCoverData(title, template = null) {
        const selectedTemplate = template || this.autoSelectTemplate(title);
        const filename = this.generateCoverFilename(title);
        const html = this.generateCoverHtml(title, selectedTemplate);

        return {
            filename,
            template: selectedTemplate,
            html,
            title,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = SimpleCoverGenerator;