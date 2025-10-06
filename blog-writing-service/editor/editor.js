/**
 * 博客编辑器JavaScript
 */
class BlogEditor {
    constructor() {
        this.currentDraft = null;
        this.autoSaveInterval = null;
        this.isModified = false;
        this.isEditMode = false;
        this.editingFilename = null;
        this.allPosts = [];
        this.filteredPosts = [];
        
        this.initializeElements();
        this.bindEvents();
        this.startAutoSave();
        
        console.log('📝 博客编辑器已初始化');
    }

    /**
     * 初始化DOM元素
     */
    initializeElements() {
        // 表单元素
        this.titleInput = document.getElementById('post-title');
        this.contentTextarea = document.getElementById('post-content');
        this.previewArea = document.getElementById('preview-content');
        
        // 按钮元素
        this.loadExistingBtn = document.getElementById('load-existing');
        this.newPostBtn = document.getElementById('new-post');
        this.saveDraftBtn = document.getElementById('save-draft');
        this.publishBtn = document.getElementById('publish-post');
        
        // 文章选择器元素
        this.articleSelector = document.getElementById('article-selector');
        this.articleSearch = document.getElementById('article-search');
        this.articleList = document.getElementById('article-list');
        this.cancelSelectBtn = document.getElementById('cancel-select');
        
        // 编辑模式指示器
        this.editModeIndicator = document.getElementById('edit-mode-indicator');
        this.editingFilenameSpan = document.getElementById('editing-filename');
        this.exitEditModeBtn = document.getElementById('exit-edit-mode');
        
        // 计数器元素
        this.titleCounter = document.getElementById('title-counter');
        this.contentCounter = document.getElementById('content-counter');
        
        // 模态框元素
        this.imageModal = document.getElementById('image-upload-modal');
        this.publishModal = document.getElementById('publish-modal');
        this.notification = document.getElementById('notification');
        
        // 工具栏按钮
        this.toolbarBtns = document.querySelectorAll('.toolbar-btn');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 输入事件
        this.titleInput.addEventListener('input', () => this.onTitleChange());
        this.contentTextarea.addEventListener('input', () => this.onContentChange());
        
        // 按钮事件
        this.loadExistingBtn.addEventListener('click', () => this.showArticleSelector());
        this.newPostBtn.addEventListener('click', () => this.startNewPost());
        this.saveDraftBtn.addEventListener('click', () => this.saveDraft());
        this.publishBtn.addEventListener('click', () => this.showPublishModal());
        
        // 文章选择器事件
        this.cancelSelectBtn.addEventListener('click', () => this.hideArticleSelector());
        this.articleSearch.addEventListener('input', (e) => this.filterArticles(e.target.value));
        
        // 编辑模式事件
        this.exitEditModeBtn.addEventListener('click', () => this.exitEditMode());
        
        // 工具栏事件
        this.toolbarBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleToolbarAction(e));
        });
        
        // 模态框事件
        this.bindModalEvents();
        
        // 页面离开警告
        window.addEventListener('beforeunload', (e) => {
            if (this.isModified) {
                e.preventDefault();
                e.returnValue = '您有未保存的更改，确定要离开吗？';
            }
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * 绑定模态框事件
     */
    bindModalEvents() {
        // 关闭模态框
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        // 点击模态框外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });
        
        // 发布确认
        document.getElementById('confirm-publish').addEventListener('click', () => this.publishPost());
        document.getElementById('cancel-publish').addEventListener('click', () => this.closeModals());
        
        // 图片上传
        document.getElementById('upload-area').addEventListener('click', () => {
            document.getElementById('image-input').click();
        });
        
        document.getElementById('image-input').addEventListener('change', (e) => this.handleImageUpload(e));
    }

    /**
     * 标题变化处理
     */
    onTitleChange() {
        const title = this.titleInput.value;
        this.titleCounter.textContent = `${title.length}/100`;
        this.isModified = true;
        this.updatePreview();
    }

    /**
     * 内容变化处理
     */
    onContentChange() {
        const content = this.contentTextarea.value;
        this.contentCounter.textContent = `${content.length} 字符`;
        this.isModified = true;
        this.updatePreview();
    }

    /**
     * 更新预览
     */
    updatePreview() {
        const title = this.titleInput.value;
        const content = this.contentTextarea.value;
        
        if (!title && !content) {
            this.previewArea.innerHTML = '<p class="preview-placeholder">在左侧编写内容，这里将显示实时预览...</p>';
            return;
        }
        
        // 生成完整的预览HTML，包括目录
        const previewHtml = this.generatePreviewHtml(title, content);
        this.previewArea.innerHTML = previewHtml;
    }

    /**
     * 生成完整的预览HTML，包括目录
     */
    generatePreviewHtml(title, content) {
        let html = '<div class="blog-preview-container">';
        
        // 添加标题
        if (title) {
            html += `<h1 class="blog-title">${this.escapeHtml(title)}</h1>`;
        }
        
        if (content) {
            // 解析Markdown内容
            const parsedContent = this.parseMarkdown(content);
            
            // 生成目录
            const toc = this.generateTableOfContents(content);
            
            if (toc.length > 0) {
                // 创建带目录的布局
                html += '<div class="blog-content-with-toc">';
                html += '<div class="blog-main-content">';
                html += parsedContent;
                html += '</div>';
                html += '<div class="blog-toc-preview">';
                html += this.generateTocHtml(toc);
                html += '</div>';
                html += '</div>';
            } else {
                // 没有目录时的简单布局
                html += '<div class="blog-main-content">';
                html += parsedContent;
                html += '</div>';
            }
        }
        
        html += '</div>';
        return html;
    }

    /**
     * 从Markdown内容生成目录
     */
    generateTableOfContents(content) {
        const lines = content.split('\n');
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
    generateAnchor(title, index) {
        let anchor = title
            .replace(/[【】\[\]]/g, '')
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .toLowerCase();

        if (!anchor || anchor.length < 2) {
            anchor = `heading-${index}`;
        }

        return anchor;
    }

    /**
     * 生成目录HTML - 预览版本
     */
    generateTocHtml(tableOfContents) {
        if (!tableOfContents || tableOfContents.length === 0) {
            return '';
        }

        let html = '<div class="blog-toc-preview-container">\n';
        html += '<h3>目录预览</h3>\n';
        html += '<ul class="toc-preview-list">\n';

        let currentMainItem = null;
        let subItems = [];

        tableOfContents.forEach((item, index) => {
            if (item.level <= 2) {
                // 处理之前的主项目和子项目
                if (currentMainItem && subItems.length > 0) {
                    html += `<li class="toc-main-item collapsible">\n`;
                    html += `  <a href="#${currentMainItem.anchor}">${currentMainItem.title}</a>\n`;
                    html += '  <ul class="toc-sub-list">\n';
                    
                    subItems.forEach(subItem => {
                        html += `    <li><a href="#${subItem.anchor}">${subItem.title}</a></li>\n`;
                    });
                    
                    html += '  </ul>\n';
                    html += '</li>\n';
                } else if (currentMainItem) {
                    html += `<li class="toc-main-item"><a href="#${currentMainItem.anchor}">${currentMainItem.title}</a></li>\n`;
                }

                currentMainItem = item;
                subItems = [];
            } else if (item.level === 3 && currentMainItem) {
                subItems.push(item);
            }
        });

        // 处理最后一个主项目
        if (currentMainItem && subItems.length > 0) {
            html += `<li class="toc-main-item collapsible">\n`;
            html += `  <a href="#${currentMainItem.anchor}">${currentMainItem.title}</a>\n`;
            html += '  <ul class="toc-sub-list">\n';
            
            subItems.forEach(subItem => {
                html += `    <li><a href="#${subItem.anchor}">${subItem.title}</a></li>\n`;
            });
            
            html += '  </ul>\n';
            html += '</li>\n';
        } else if (currentMainItem) {
            html += `<li class="toc-main-item"><a href="#${currentMainItem.anchor}">${currentMainItem.title}</a></li>\n`;
        }

        html += '</ul>\n';
        html += '</div>';

        return html;
    }

    /**
     * 增强的Markdown解析 - 添加锚点ID
     */
    parseMarkdown(text) {
        // 先生成目录以获取锚点信息
        const toc = this.generateTableOfContents(text);
        const anchorMap = {};
        toc.forEach(item => {
            anchorMap[item.title] = item.anchor;
        });

        let html = text;
        
        // 处理标题并添加锚点
        html = html.replace(/^#### (.*$)/gim, (match, title) => {
            const anchor = anchorMap[title] || this.generateAnchor(title, 0);
            return `<h4 id="${anchor}">${title}</h4>`;
        });
        
        html = html.replace(/^### (.*$)/gim, (match, title) => {
            const anchor = anchorMap[title] || this.generateAnchor(title, 0);
            return `<h3 id="${anchor}">${title}</h3>`;
        });
        
        html = html.replace(/^## (.*$)/gim, (match, title) => {
            const anchor = anchorMap[title] || this.generateAnchor(title, 0);
            return `<h2 id="${anchor}">${title}</h2>`;
        });
        
        html = html.replace(/^# (.*$)/gim, (match, title) => {
            const anchor = anchorMap[title] || this.generateAnchor(title, 0);
            return `<h1 id="${anchor}">${title}</h1>`;
        });

        // 其他Markdown语法
        html = html
            // 粗体和斜体
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // 代码
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            // 链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
            // 列表
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            // 段落处理
            .split('\n\n')
            .map(paragraph => {
                paragraph = paragraph.trim();
                if (!paragraph) return '';
                
                // 如果已经是HTML标签，直接返回
                if (paragraph.startsWith('<h') || paragraph.startsWith('<ul') || paragraph.startsWith('<li')) {
                    return paragraph;
                }
                
                // 否则包装为段落
                return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
            })
            .filter(p => p)
            .join('\n');

        return html;
    }

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 工具栏操作处理
     */
    handleToolbarAction(e) {
        e.preventDefault();
        const action = e.currentTarget.dataset.action;
        const textarea = this.contentTextarea;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let replacement = '';
        let cursorOffset = 0;
        
        switch (action) {
            case 'bold':
                replacement = `**${selectedText || '粗体文字'}**`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'italic':
                replacement = `*${selectedText || '斜体文字'}*`;
                cursorOffset = selectedText ? 0 : -1;
                break;
            case 'heading':
                replacement = `## ${selectedText || '标题'}`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'link':
                replacement = `[${selectedText || '链接文字'}](URL)`;
                cursorOffset = selectedText ? -4 : -6;
                break;
            case 'image':
                this.showImageModal();
                return;
            case 'code':
                replacement = `\`${selectedText || '代码'}\``;
                cursorOffset = selectedText ? 0 : -1;
                break;
            case 'list':
                replacement = `- ${selectedText || '列表项'}`;
                cursorOffset = selectedText ? 0 : -3;
                break;
        }
        
        // 替换选中文本
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        
        // 设置光标位置
        const newCursorPos = start + replacement.length + cursorOffset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
        
        this.onContentChange();
    }

    /**
     * 键盘快捷键处理
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveDraft();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.showPublishModal();
                    break;
            }
        }
    }

    /**
     * 保存草稿
     */
    async saveDraft() {
        try {
            const title = this.titleInput.value.trim();
            const content = this.contentTextarea.value.trim();
            
            if (!title && !content) {
                this.showNotification('草稿为空，无需保存', 'warning');
                return;
            }
            
            const draftData = {
                id: this.currentDraft?.id || null,
                title,
                content,
                autoSave: false
            };
            
            const response = await fetch('/api/drafts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(draftData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentDraft = result.draft;
                this.isModified = false;
                this.showNotification('草稿保存成功', 'success');
            } else {
                throw new Error(result.message || '保存失败');
            }
        } catch (error) {
            console.error('保存草稿失败:', error);
            this.showNotification('保存草稿失败: ' + error.message, 'error');
        }
    }

    /**
     * 显示发布模态框
     */
    showPublishModal() {
        const title = this.titleInput.value.trim();
        const content = this.contentTextarea.value.trim();
        
        if (!title) {
            this.showNotification('请输入文章标题', 'warning');
            this.titleInput.focus();
            return;
        }
        
        if (!content) {
            this.showNotification('请输入文章内容', 'warning');
            this.contentTextarea.focus();
            return;
        }
        
        // 更新发布信息
        document.getElementById('publish-title').textContent = title;
        document.getElementById('publish-word-count').textContent = `${content.length} 字符`;
        
        // 更新模态框标题
        const modalTitle = this.publishModal.querySelector('.modal-header h3');
        const confirmBtn = document.getElementById('confirm-publish');
        
        if (this.isEditMode) {
            modalTitle.textContent = '更新文章';
            confirmBtn.textContent = '确认更新';
        } else {
            modalTitle.textContent = '发布文章';
            confirmBtn.textContent = '确认发布';
        }
        
        this.publishModal.style.display = 'flex';
    }

    /**
     * 发布文章
     */
    async publishPost() {
        try {
            this.closeModals();
            
            const title = this.titleInput.value.trim();
            const content = this.contentTextarea.value.trim();
            
            const postData = {
                title,
                content,
                tags: ['技术分享'] // 可以后续扩展为用户选择
            };
            
            let response;
            let successMessage;
            
            if (this.isEditMode && this.editingFilename) {
                // 更新现有文章
                this.showNotification('正在更新文章...', 'info');
                response = await fetch(`/api/posts/${this.editingFilename}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                });
                successMessage = '文章更新成功！';
            } else {
                // 发布新文章
                this.showNotification('正在发布文章...', 'info');
                response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                });
                successMessage = '文章发布成功！';
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(successMessage, 'success');
                
                // 清空编辑器
                this.titleInput.value = '';
                this.contentTextarea.value = '';
                this.updatePreview();
                this.isModified = false;
                
                // 退出编辑模式
                if (this.isEditMode) {
                    this.exitEditMode();
                }
                
                // 删除对应的草稿
                if (this.currentDraft) {
                    await this.deleteDraft(this.currentDraft.id);
                    this.currentDraft = null;
                }
                
                // 3秒后跳转到博客列表
                setTimeout(() => {
                    window.location.href = '../blog.html';
                }, 3000);
            } else {
                throw new Error(result.message || '操作失败');
            }
        } catch (error) {
            console.error('操作失败:', error);
            this.showNotification('操作失败: ' + error.message, 'error');
        }
    }

    /**
     * 删除草稿
     */
    async deleteDraft(draftId) {
        try {
            await fetch(`/api/drafts/${draftId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.warn('删除草稿失败:', error);
        }
    }

    /**
     * 显示图片上传模态框
     */
    showImageModal() {
        this.imageModal.style.display = 'flex';
    }

    /**
     * 处理图片上传
     */
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showNotification('请选择图片文件', 'warning');
            return;
        }
        
        // 验证文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('图片大小不能超过5MB', 'warning');
            return;
        }
        
        // 这里可以实现图片上传功能
        // 暂时插入占位符
        const imagePlaceholder = `![${file.name}](blog-img/${file.name})`;
        this.insertTextAtCursor(imagePlaceholder);
        
        this.closeModals();
        this.showNotification('图片引用已插入（需要手动上传图片到blog-img文件夹）', 'info');
    }

    /**
     * 在光标位置插入文本
     */
    insertTextAtCursor(text) {
        const textarea = this.contentTextarea;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
        
        const newCursorPos = start + text.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
        
        this.onContentChange();
    }

    /**
     * 关闭所有模态框
     */
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }

    /**
     * 开始自动保存
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.isModified) {
                this.autoSaveDraft();
            }
        }, 30000); // 30秒自动保存
    }

    /**
     * 自动保存草稿
     */
    async autoSaveDraft() {
        try {
            const title = this.titleInput.value.trim();
            const content = this.contentTextarea.value.trim();
            
            if (!title && !content) return;
            
            const draftData = {
                id: this.currentDraft?.id || null,
                title,
                content,
                autoSave: true
            };
            
            const response = await fetch('/api/drafts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(draftData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentDraft = result.draft;
                this.isModified = false;
                console.log('📝 草稿已自动保存');
            }
        } catch (error) {
            console.warn('自动保存失败:', error);
        }
    }

    /**
     * 显示文章选择器
     */
    async showArticleSelector() {
        try {
            this.showNotification('正在加载文章列表...', 'info');
            
            // 获取文章列表
            const response = await fetch('/api/posts');
            const result = await response.json();
            
            if (result.success) {
                this.allPosts = result.posts;
                this.filteredPosts = [...this.allPosts];
                this.renderArticleList();
                this.articleSelector.style.display = 'block';
                this.articleSearch.value = '';
                this.articleSearch.focus();
                this.showNotification('文章列表加载完成', 'success');
            } else {
                throw new Error(result.message || '获取文章列表失败');
            }
        } catch (error) {
            console.error('加载文章列表失败:', error);
            this.showNotification('加载文章列表失败: ' + error.message, 'error');
        }
    }

    /**
     * 隐藏文章选择器
     */
    hideArticleSelector() {
        this.articleSelector.style.display = 'none';
        this.articleSearch.value = '';
        this.allPosts = [];
        this.filteredPosts = [];
    }

    /**
     * 渲染文章列表
     */
    renderArticleList() {
        if (this.filteredPosts.length === 0) {
            this.articleList.innerHTML = '<div class="no-articles">没有找到文章</div>';
            return;
        }

        const listHtml = this.filteredPosts.map(post => {
            const publishDate = new Date(post.publishDate).toLocaleDateString('zh-CN');
            return `
                <div class="article-item" data-filename="${post.filename}">
                    <div class="article-info">
                        <div class="article-title">${this.escapeHtml(post.title)}</div>
                        <div class="article-meta">
                            <span>发布时间: ${publishDate}</span>
                            <span>文件: ${post.filename}</span>
                        </div>
                    </div>
                    <div class="article-actions">
                        <button class="button primary edit-article" data-filename="${post.filename}">
                            <i data-feather="edit-3"></i>
                            编辑
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.articleList.innerHTML = listHtml;

        // 重新初始化feather图标
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // 绑定编辑按钮事件
        this.articleList.querySelectorAll('.edit-article').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filename = e.currentTarget.dataset.filename;
                this.loadArticleForEdit(filename);
            });
        });
    }

    /**
     * 过滤文章列表
     */
    filterArticles(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.filteredPosts = [...this.allPosts];
        } else {
            this.filteredPosts = this.allPosts.filter(post => 
                post.title.toLowerCase().includes(term) ||
                post.filename.toLowerCase().includes(term)
            );
        }
        
        this.renderArticleList();
    }

    /**
     * 加载文章进行编辑
     */
    async loadArticleForEdit(filename) {
        try {
            this.showNotification('正在加载文章内容...', 'info');
            
            const response = await fetch(`/api/posts/${filename}/edit`);
            const result = await response.json();
            
            if (result.success) {
                const post = result.post;
                
                // 设置编辑模式
                this.isEditMode = true;
                this.editingFilename = post.filename;
                
                // 填充编辑器
                this.titleInput.value = post.title;
                this.contentTextarea.value = post.markdownContent;
                
                // 更新计数器和预览
                this.onTitleChange();
                this.onContentChange();
                
                // 显示编辑模式指示器
                this.editingFilenameSpan.textContent = post.filename;
                this.editModeIndicator.style.display = 'block';
                
                // 更新发布按钮文本
                this.publishBtn.innerHTML = '<i data-feather="save"></i> 更新文章';
                
                // 隐藏文章选择器
                this.hideArticleSelector();
                
                // 重新初始化feather图标
                if (typeof feather !== 'undefined') {
                    feather.replace();
                }
                
                this.showNotification('文章加载完成，可以开始编辑', 'success');
                this.titleInput.focus();
                
            } else {
                throw new Error(result.message || '加载文章失败');
            }
        } catch (error) {
            console.error('加载文章失败:', error);
            this.showNotification('加载文章失败: ' + error.message, 'error');
        }
    }

    /**
     * 开始新文章
     */
    startNewPost() {
        if (this.isModified) {
            const confirmed = confirm('当前有未保存的更改，确定要开始新文章吗？');
            if (!confirmed) return;
        }
        
        this.exitEditMode();
        this.titleInput.value = '';
        this.contentTextarea.value = '';
        this.updatePreview();
        this.isModified = false;
        this.currentDraft = null;
        
        this.showNotification('已切换到新文章模式', 'info');
        this.titleInput.focus();
    }

    /**
     * 退出编辑模式
     */
    exitEditMode() {
        this.isEditMode = false;
        this.editingFilename = null;
        this.editModeIndicator.style.display = 'none';
        
        // 恢复发布按钮文本
        this.publishBtn.innerHTML = '<i data-feather="send"></i> 发布文章';
        
        // 重新初始化feather图标
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * 销毁编辑器
     */
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

// 页面加载完成后初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    // 初始化feather图标
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // 初始化编辑器
    window.blogEditor = new BlogEditor();
});