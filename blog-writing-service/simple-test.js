/**
 * 简单功能测试
 */
console.log('🧪 开始简单功能测试...\n');

// 测试1: 基础模块加载
console.log('1️⃣ 测试模块加载...');
try {
    const BlogPost = require('./server/models/BlogPost');
    const Draft = require('./server/models/Draft');
    const FileManager = require('./server/utils/FileManager');
    const SimpleCoverGenerator = require('./server/utils/SimpleCoverGenerator');
    
    console.log('   ✅ 所有模块加载成功');
} catch (error) {
    console.log('   ❌ 模块加载失败:', error.message);
    process.exit(1);
}

// 测试2: BlogPost功能
console.log('\n2️⃣ 测试BlogPost功能...');
try {
    const BlogPost = require('./server/models/BlogPost');
    const post = new BlogPost({
        title: '测试文章',
        content: '## 测试标题\n\n这是测试内容。'
    });
    
    console.log('   ✅ BlogPost创建成功');
    console.log('   📝 标题:', post.title);
    console.log('   📄 文件名:', post.filename);
    console.log('   📋 摘要:', post.excerpt);
} catch (error) {
    console.log('   ❌ BlogPost测试失败:', error.message);
}

// 测试3: 封面生成器
console.log('\n3️⃣ 测试封面生成器...');
try {
    const SimpleCoverGenerator = require('./server/utils/SimpleCoverGenerator');
    const coverData = SimpleCoverGenerator.generateCoverData('测试文章标题');
    
    console.log('   ✅ 封面生成成功');
    console.log('   🎨 模板:', coverData.template);
    console.log('   📁 文件名:', coverData.filename);
    console.log('   📏 HTML长度:', coverData.html.length, '字符');
} catch (error) {
    console.log('   ❌ 封面生成器测试失败:', error.message);
}

// 测试4: Express依赖
console.log('\n4️⃣ 测试Express依赖...');
try {
    const express = require('express');
    const cors = require('cors');
    const marked = require('marked');
    
    console.log('   ✅ Express依赖加载成功');
    console.log('   🌐 Express版本:', require('express/package.json').version);
} catch (error) {
    console.log('   ❌ Express依赖测试失败:', error.message);
    console.log('   💡 请运行: npm install express cors marked multer cheerio');
}

console.log('\n🎉 基础功能测试完成！');
console.log('\n📋 下一步:');
console.log('   1. 确保所有依赖已安装: npm install express cors marked multer cheerio');
console.log('   2. 启动服务器: node server/server.js');
console.log('   3. 访问编辑器: http://localhost:3001/editor/editor.html');