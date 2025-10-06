/**
 * 封面图片生成器 - 使用HTML到图片转换
 */
const fs = require('fs').promises;
const path = require('path');

class CoverImageGenerator {
    constructor() {
        this.templates = {
            default: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textColor: '#ffffff',
                fontSize: '48px',
                fontWeight: 'bold',
                padding: '60px'
            },
            tech: {
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                textColor: '#ffffff',
                fontSize: '48px',
                fontWeight: 'bold',
                padding: '60px'
            },
            share: {
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                textColor: '#333333',
                fontSize: '48px',
                fontWeight: 'bold',
                padding: '60px'
            },
            tutorial: {
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                textColor: '#333333',
                fontSize: '48px',
                fontWeight: 'bold',
                padding: '60px'
            }
        };
    }

    /**
     * 生成封面图片HTML
     */
    generateCoverHtml(title, template = 'default') {
        const selectedTemplate = this.templates[template] || this.templates.default;
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
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
            font-weight: ${selectedTemplate.fontWeight};
            text-align: center;
            padding: ${selectedTemplate.padding};
            max-width: 720px;
            line-height: 1.2;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            word-wrap: break-word;
            hyphens: auto;
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
    escapeHtml(text) {
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
    generateCoverFilename(title) {
        const cleanTitle = title
            .replace(/[【】\[\]]/g, '')
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .toLowerCase();
        
        const timestamp = Date.now();
        return `${cleanTitle || 'cover'}-${timestamp}.png`;
    }

    /**
     * 根据标题自动选择模板
     */
    autoSelectTemplate(title) {
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
     * 生成封面数据
     */
    async generateCover(title, template = null) {
        try {
            const selectedTemplate = template || this.autoSelectTemplate(title);
            const filename = this.generateCoverFilename(title);
            const html = this.generateCoverHtml(title, selectedTemplate);

            // 保存HTML文件（用于调试）
            const htmlFilename = filename.replace('.png', '.html');
            const htmlPath = path.join(__dirname, '../../../blog-img', htmlFilename);
            
            // 确保目录存在
            await this.ensureDirectoryExists(path.dirname(htmlPath));
            await fs.writeFile(htmlPath, html, 'utf8');

            // 创建一个占位符PNG文件（实际项目中可以使用puppeteer等工具生成真实图片）
            const placeholderSvg = this.generatePlaceholderSvg(title, selectedTemplate);
            const svgFilename = filename.replace('.png', '.svg');
            const svgPath = path.join(__dirname, '../../../blog-img', svgFilename);
            await fs.writeFile(svgPath, placeholderSvg, 'utf8');

            return {
                filename,
                htmlFilename,
                svgFilename,
                template: selectedTemplate,
                title,
                path: path.join('blog-img', filename),
                htmlPath: path.join('blog-img', htmlFilename),
                svgPath: path.join('blog-img', svgFilename),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('生成封面失败:', error);
            throw new Error('封面生成失败: ' + error.message);
        }
    }

    /**
     * 生成占位符SVG
     */
    generatePlaceholderSvg(title, templateName) {
        const template = this.templates[templateName] || this.templates.default;
        
        // 提取渐变颜色
        const gradientMatch = template.background.match(/linear-gradient\(.*?#([a-fA-F0-9]{6}).*?#([a-fA-F0-9]{6})/);
        const color1 = gradientMatch ? `#${gradientMatch[1]}` : '#667eea';
        const color2 = gradientMatch ? `#${gradientMatch[2]}` : '#764ba2';

        return `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#grad1)" />
  <text x="400" y="200" font-family="Microsoft YaHei, Arial, sans-serif" 
        font-size="48" font-weight="bold" fill="${template.textColor}" 
        text-anchor="middle" dominant-baseline="middle">
    ${this.escapeHtml(title)}
  </text>
</svg>`;
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
     * 获取可用模板列表
     */
    getAvailableTemplates() {
        return Object.keys(this.templates).map(id => ({
            id,
            name: this.getTemplateName(id),
            description: this.getTemplateDescription(id),
            preview: this.templates[id]
        }));
    }

    /**
     * 获取模板名称
     */
    getTemplateName(templateId) {
        const names = {
            default: '默认模板',
            tech: '技术模板',
            share: '分享模板',
            tutorial: '教程模板'
        };
        return names[templateId] || '未知模板';
    }

    /**
     * 获取模板描述
     */
    getTemplateDescription(templateId) {
        const descriptions = {
            default: '蓝紫渐变背景，适合通用文章',
            tech: '深蓝色背景，适合技术文章',
            share: '粉色渐变背景，适合经验分享',
            tutorial: '清新渐变背景，适合教程文章'
        };
        return descriptions[templateId] || '无描述';
    }

    /**
     * 批量生成封面
     */
    async generateBatchCovers(titles, template = null) {
        const results = [];
        
        for (const title of titles) {
            try {
                const result = await this.generateCover(title, template);
                results.push({ success: true, title, result });
            } catch (error) {
                results.push({ success: false, title, error: error.message });
            }
        }
        
        return results;
    }
}

module.exports = CoverImageGenerator;