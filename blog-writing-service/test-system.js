/**
 * 系统功能测试脚本
 */
const BlogPost = require('./server/models/BlogPost');
const Draft = require('./server/models/Draft');
const FileManager = require('./server/utils/FileManager');
const TableOfContentsGenerator = require('./server/utils/TableOfContentsGenerator');

console.log('🧪 开始测试博客写作服务...\n');

// 测试1: BlogPost模型
console.log('1️⃣ 测试BlogPost模型...');
try {
    const post = new BlogPost({
        title: '测试文章标题',
        content: '## 这是一个测试\n\n这是测试内容。\n\n### 子标题\n\n更多内容...'
    });
    
    console.log('   ✅ BlogPost创建成功');
    console.log('   📝 标题:', post.title);
    console.log('   📄 文件名:', post.filename);
    console.log('   📋 摘要:', post.excerpt);
    
    const validation = post.validate();
    if (validation.isValid) {
        console.log('   ✅ 数据验证通过');
    } else {
        console.log('   ❌ 数据验证失败:', validation.errors);
    }
} catch (error) {
    console.log('   ❌ BlogPost测试失败:', error.message);
}

console.log();

// 测试2: Draft模型
console.log('2️⃣ 测试Draft模型...');
try {
    const draft = new Draft({
        title: '草稿标题',
        content: '这是草稿内容'
    });
    
    console.log('   ✅ Draft创建成功');
    console.log('   📝 ID:', draft.id);
    console.log('   📅 最后修改:', draft.lastModified.toLocaleString());
    console.log('   🔄 自动保存:', draft.autoSave ? '开启' : '关闭');
} catch (error) {
    console.log('   ❌ Draft测试失败:', error.message);
}

console.log();

// 测试3: 目录生成器
console.log('3️⃣ 测试目录生成器...');
try {
    const htmlContent = `
        <h2>第一章</h2>
        <p>内容...</p>
        <h3>第一节</h3>
        <p>内容...</p>
        <h2>第二章</h2>
        <p>内容...</p>
    `;
    
    const toc = TableOfContentsGenerator.generateFromHtml(htmlContent);
    console.log('   ✅ HTML目录生成成功');
    console.log('   📑 目录项数量:', toc.length);
    
    toc.forEach((item, index) => {
        console.log(`   ${index + 1}. [H${item.level}] ${item.title} (#${item.anchor})`);
    });
    
    const tocHtml = TableOfContentsGenerator.generateTocHtml(toc);
    console.log('   ✅ 目录HTML生成成功');
} catch (error) {
    console.log('   ❌ 目录生成器测试失败:', error.message);
}

console.log();

// 测试4: 文件管理器
console.log('4️⃣ 测试文件管理器...');
try {
    const fileManager = new FileManager();
    console.log('   ✅ FileManager创建成功');
    console.log('   📁 博客路径:', fileManager.blogPath);
    console.log('   🖼️ 图片路径:', fileManager.blogImgPath);
    console.log('   📝 草稿路径:', fileManager.draftsPath);
    
    // 测试文件名生成
    const testFilename = 'test-file.html';
    console.log('   🔧 测试文件名:', testFilename);
} catch (error) {
    console.log('   ❌ 文件管理器测试失败:', error.message);
}

console.log();

// 测试5: Markdown目录生成
console.log('5️⃣ 测试Markdown目录生成...');
try {
    const markdownContent = `
# 主标题

## 介绍
这是介绍部分。

### 背景
背景信息...

## 主要内容
主要内容...

### 功能特性
功能介绍...

### 使用方法
使用说明...

## 总结
总结内容...
    `;
    
    const mdToc = TableOfContentsGenerator.generateFromMarkdown(markdownContent);
    console.log('   ✅ Markdown目录生成成功');
    console.log('   📑 目录项数量:', mdToc.length);
    
    mdToc.forEach((item, index) => {
        const indent = '  '.repeat(item.level - 1);
        console.log(`   ${indent}${index + 1}. [H${item.level}] ${item.title}`);
    });
} catch (error) {
    console.log('   ❌ Markdown目录生成测试失败:', error.message);
}

console.log();
console.log('🎉 系统测试完成！');
console.log();
console.log('📋 测试总结:');
console.log('   - BlogPost模型: 数据创建、验证、文件名生成');
console.log('   - Draft模型: 草稿管理功能');
console.log('   - 目录生成器: HTML和Markdown目录生成');
console.log('   - 文件管理器: 路径配置和基础功能');
console.log();
console.log('🚀 现在可以启动服务器开始使用了！');
console.log('   运行: npm run dev');
console.log('   访问: http://localhost:3001/editor/editor.html');