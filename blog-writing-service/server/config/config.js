/**
 * 应用配置
 */
const config = {
    // 服务器配置
    server: {
        port: process.env.PORT || 3001,
        host: process.env.HOST || 'localhost'
    },

    // 文件路径配置
    paths: {
        blog: 'blog',
        blogImg: 'blog-img',
        drafts: 'blog-writing-service/drafts',
        templates: 'blog-writing-service/templates'
    },

    // 封面图片配置
    cover: {
        width: 800,
        height: 400,
        defaultTemplate: 'default',
        formats: ['png', 'jpg', 'webp'],
        quality: 0.9
    },

    // 文件上传配置
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
    },

    // 博文配置
    blog: {
        maxTitleLength: 100,
        maxContentLength: 50000,
        excerptLength: 100,
        autoSaveInterval: 30000 // 30秒
    },

    // 目录配置
    toc: {
        maxDepth: 6,
        minHeadings: 1
    }
};

module.exports = config;