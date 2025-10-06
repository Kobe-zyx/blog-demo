/**
 * 目录生成器 - 与blog-build.html格式完全一致
 */
class TableOfContentsGenerator {
    /**
     * 从HTML内容生成目录
     */
    static generateFromHtml(htmlContent) {
        // 匹配所有标题标签
        const headingRegex = /<h([1-6])([^>]*?)>(.*?)<\/h[1-6]>/gi;
        const headings = [];
        let match;

        while ((match = headingRegex.exec(htmlContent)) !== null) {
            const level = parseInt(match[1]);
            const attributes = match[2];
            const title = match[3].replace(/<[^>]*>/g, '').trim(); // 移除HTML标签
            
            // 提取或生成id
            let anchor = '';
            const idMatch = attributes.match(/id\s*=\s*["']([^"']+)["']/i);
            if (idMatch) {
                anchor = idMatch[1];
            } else {
                // 生成anchor
                anchor = this.generateAnchor(title, headings.length);
            }

            headings.push({
                level,
                title,
                anchor
            });
        }

        return headings;
    }

    /**
     * 从Markdown内容生成目录
     */
    static generateFromMarkdown(markdownContent) {
        const lines = markdownContent.split('\n');
        const headings = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // 匹配 # 开头的标题
            const match = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const title = match[2].trim();
                const anchor = this.generateAnchor(title, headings.length);

                headings.push({
                    level,
                    title,
                    anchor
                });
            }
        });

        return headings;
    }

    /**
     * 生成锚点ID
     */
    static generateAnchor(title, index) {
        // 移除特殊字符，转换为小写，用连字符替换空格
        let anchor = title
            .replace(/[【】\[\]]/g, '') // 移除中文括号
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '') // 只保留中文、英文、数字和空格
            .trim()
            .replace(/\s+/g, '-')
            .toLowerCase();

        // 如果anchor为空或太短，使用索引
        if (!anchor || anchor.length < 2) {
            anchor = `heading-${index}`;
        }

        return anchor;
    }

    /**
     * 生成目录HTML - 完全匹配blog-build.html格式
     */
    static generateTocHtml(tableOfContents) {
        if (!tableOfContents || tableOfContents.length === 0) {
            return '';
        }

        // 完全按照blog-build.html的格式生成目录
        let html = '<div class="blog-toc" style="position: sticky; top: 2rem; align-self: start; background: var(--card-bg); padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">\n';
        html += '                        <h3>目录</h3>\n';
        html += '                        <ul style="list-style: none; padding: 0;">\n';

        // 构建简化的层级结构，避免过度嵌套
        html += this.generateSimplifiedTocItems(tableOfContents);

        html += '                        </ul>\n';
        html += '                    </div>';

        return html;
    }

    /**
     * 生成简化的目录项HTML - 匹配blog-build.html的简洁结构
     */
    static generateSimplifiedTocItems(tableOfContents) {
        let html = '';
        let currentMainItem = null;
        let subItems = [];

        tableOfContents.forEach((item, index) => {
            if (item.level <= 2) {
                // 处理之前的主项目和子项目
                if (currentMainItem && subItems.length > 0) {
                    html += `                            <li style="margin: 0.5rem 0;" class="collapsible toc-main-item">\n`;
                    html += `                                <a href="#${currentMainItem.anchor}">${currentMainItem.title}</a>\n`;
                    html += '                                <ul class="submenu" style="list-style: none; padding-left: 20px; display: none;">\n';
                    
                    subItems.forEach(subItem => {
                        if (subItem.children && subItem.children.length > 0) {
                            html += `                                    <li style="margin: 0.5rem 0;"><a href="#${subItem.anchor}">${subItem.title}</a>\n`;
                            html += '                                        <ul style="list-style: none; padding-left: 20px;">\n';
                            subItem.children.forEach(child => {
                                html += `                                            <li style="margin: 0.5rem 0;"><a href="#${child.anchor}">${child.title}</a></li>\n`;
                            });
                            html += '                                        </ul>\n';
                            html += '                                    </li>\n';
                        } else {
                            html += `                                    <li style="margin: 0.5rem 0;"><a href="#${subItem.anchor}">${subItem.title}</a></li>\n`;
                        }
                    });
                    
                    html += '                                </ul>\n';
                    html += '                            </li>\n';
                } else if (currentMainItem) {
                    // 没有子项目的主项目
                    html += `                            <li style="margin: 0.5rem 0;" class="toc-main-item"><a href="#${currentMainItem.anchor}">${currentMainItem.title}</a></li>\n`;
                }

                // 开始新的主项目
                currentMainItem = item;
                subItems = [];
            } else if (item.level === 3 && currentMainItem) {
                // 收集子项目
                const subItem = { ...item, children: [] };
                
                // 查找这个子项目的子子项目
                for (let j = index + 1; j < tableOfContents.length; j++) {
                    const nextItem = tableOfContents[j];
                    if (nextItem.level <= 3) break;
                    if (nextItem.level === 4) {
                        subItem.children.push(nextItem);
                    }
                }
                
                subItems.push(subItem);
            }
        });

        // 处理最后一个主项目
        if (currentMainItem && subItems.length > 0) {
            html += `                            <li style="margin: 0.5rem 0;" class="collapsible toc-main-item">\n`;
            html += `                                <a href="#${currentMainItem.anchor}">${currentMainItem.title}</a>\n`;
            html += '                                <ul class="submenu" style="list-style: none; padding-left: 20px; display: none;">\n';
            
            subItems.forEach(subItem => {
                if (subItem.children && subItem.children.length > 0) {
                    html += `                                    <li style="margin: 0.5rem 0;"><a href="#${subItem.anchor}">${subItem.title}</a>\n`;
                    html += '                                        <ul style="list-style: none; padding-left: 20px;">\n';
                    subItem.children.forEach(child => {
                        html += `                                            <li style="margin: 0.5rem 0;"><a href="#${child.anchor}">${child.title}</a></li>\n`;
                    });
                    html += '                                        </ul>\n';
                    html += '                                    </li>\n';
                } else {
                    html += `                                    <li style="margin: 0.5rem 0;"><a href="#${subItem.anchor}">${subItem.title}</a></li>\n`;
                }
            });
            
            html += '                                </ul>\n';
            html += '                            </li>\n';
        } else if (currentMainItem) {
            html += `                            <li style="margin: 0.5rem 0;" class="toc-main-item"><a href="#${currentMainItem.anchor}">${currentMainItem.title}</a></li>\n`;
        }

        return html;
    }

    /**
     * 为HTML内容添加锚点ID
     */
    static addAnchorsToHtml(htmlContent, tableOfContents) {
        let updatedContent = htmlContent;
        
        tableOfContents.forEach((item, index) => {
            const { level, title, anchor } = item;
            
            // 查找对应的标题标签并添加id
            const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const headingRegex = new RegExp(
                `<h${level}([^>]*?)>\\s*${escapedTitle}\\s*</h${level}>`,
                'gi'
            );
            
            updatedContent = updatedContent.replace(headingRegex, (match, attributes) => {
                // 检查是否已经有id属性
                if (attributes.includes('id=')) {
                    return match;
                }
                
                // 添加id属性
                return `<h${level}${attributes} id="${anchor}">${title}</h${level}>`;
            });
        });

        return updatedContent;
    }
}

module.exports = TableOfContentsGenerator;