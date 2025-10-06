const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

// 导入路由
const postsRouter = require('./routes/posts');
const draftsRouter = require('./routes/drafts');

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/editor', express.static(path.join(__dirname, '../editor')));
app.use('/templates', express.static(path.join(__dirname, '../templates')));
app.use(express.static(path.join(__dirname, '../../'))); // 服务根目录文件

// API路由
app.use('/api/posts', postsRouter);
app.use('/api/drafts', draftsRouter);

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'blog-writing-service'
    });
});

// 根路径重定向到编辑器
app.get('/', (req, res) => {
    res.redirect('/editor/editor.html');
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);

    // 开发环境返回详细错误信息
    if (process.env.NODE_ENV === 'development') {
        res.status(500).json({
            error: '服务器内部错误',
            message: err.message,
            stack: err.stack
        });
    } else {
        res.status(500).json({
            error: '服务器内部错误',
            message: '请稍后重试'
        });
    }
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        error: '页面未找到',
        path: req.path
    });
});

// 启动服务器
const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
    console.log(`🚀 博客写作服务已启动`);
    console.log(`📝 编辑器地址: http://${HOST}:${PORT}/editor/editor.html`);
    console.log(`🔧 API地址: http://${HOST}:${PORT}/api`);
    console.log(`⚡ 环境: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
});

module.exports = app;