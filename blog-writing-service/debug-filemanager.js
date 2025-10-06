/**
 * 调试FileManager的博文列表功能
 */
const FileManager = require('./server/utils/FileManager');
const fs = require('fs').promises;
const path = require('path');

async function debugFileManager() {
    console.log('🔍 调试FileManager博文列表功能...\n');

    const fileManager = new FileManager();
    
    console.log('基础路径:', fileManager.basePath);
    console.log('博文路径:', fileManager.blogPath);
    
    // 检查目录是否存在
    try {
        await fs.access(fileManager.blogPath);
        console.log('✅ 博文目录存在');
    } catch (error) {
        console.log('❌ 博文目录不存在:', error.message);
        return;
    }
    
    // 列出目录中的文件
    try {
        const files = await fs.readdir(fileManager.blogPath);
        console.log(`📁 目录中的文件 (${files.length} 个):`);
        files.forEach(file => {
            console.log(`   - ${file}`);
        });
        
        const htmlFiles = files.filter(file => file.endsWith('.html'));
        console.log(`📄 HTML文件 (${htmlFiles.length} 个):`);
        htmlFiles.forEach(file => {
            console.log(`   - ${file}`);
        });
    } catch (error) {
        console.log('❌ 读取目录失败:', error.message);
        return;
    }
    
    // 测试listBlogPosts方法
    try {
        console.log('\n🧪 测试listBlogPosts方法...');
        const posts = await fileManager.listBlogPosts();
        console.log(`✅ 成功获取 ${posts.length} 篇博文:`);
        posts.forEach((post, index) => {
            console.log(`   ${index + 1}. ${post.title} (${post.filename})`);
        });
    } catch (error) {
        console.log('❌ listBlogPosts方法失败:', error.message);
        console.log('错误堆栈:', error.stack);
    }
}

debugFileManager();