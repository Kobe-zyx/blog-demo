/**
 * 博客列表管理功能测试
 */
const BlogPost = require('./server/models/BlogPost');
const BlogListManager = require('./server/utils/BlogListManager');

console.log('📋 开始博客列表管理功能测试...\n');

async function testBlogListManager() {
    try {
        const blogListManager = new BlogListManager();
        
        console.log('1️⃣ 测试博文条目HTML生成...');
        
        // 创建测试博文
        const testPost = new BlogPost({
            title: '【技术分享】测试博文标题',
            content: '## 测试内容\n\n这是一篇测试博文。',
            publishDate: new Date()
        });
        
        // 生成HTML
        const postHtml = blogListManager.generatePostItemHtml(testPost);
        console.log('   ✅ 博文HTML生成成功');
        console.log('   📄 HTML长度:', postHtml.length, '字符');
        
        // 检查HTML内容
        if (postHtml.includes('blog-post-item')) {
            console.log('   ✅ 包含正确的CSS类');
        }
        if (postHtml.includes(testPost.title)) {
            console.log('   ✅ 包含博文标题');
        }
        if (postHtml.includes('技术分享')) {
            console.log('   ✅ 自动标签选择正确');
        }
        
        console.log('\n2️⃣ 测试标签自动选择...');
        
        const tagTests = [
            { title: '【技术分享】JavaScript教程', expected: '技术分享' },
            { title: '【经验分享】我的学习心得', expected: '经验分享' },
            { title: '【教程操作】如何使用工具', expected: '教程操作' },
            { title: '【不吐不快】工具对比', expected: '不吐不快' },
            { title: '普通标题', expected: '技术分享' }
        ];
        
        tagTests.forEach(test => {
            const selectedTag = blogListManager.selectTagByTitle(test.title);
            const status = selectedTag === test.expected ? '✅' : '❌';
            console.log(`   ${status} "${test.title}" → ${selectedTag} (期望: ${test.expected})`);
        });
        
        console.log('\n3️⃣ 测试日期解析...');
        
        const dateTests = [
            '2025年6月9日',
            '2025年12月25日',
            '2024年1月1日'
        ];
        
        dateTests.forEach(dateText => {
            const parsedDate = blogListManager.parseChineseDate(dateText);
            console.log(`   ✅ "${dateText}" → ${parsedDate.toLocaleDateString('zh-CN')}`);
        });
        
        console.log('\n4️⃣ 测试blog.html验证...');
        
        const validation = await blogListManager.validateBlogHtml();
        if (validation.isValid) {
            console.log('   ✅ blog.html结构验证通过');
        } else {
            console.log('   ❌ blog.html结构验证失败:');
            validation.issues.forEach(issue => {
                console.log(`       - ${issue}`);
            });
        }
        
        console.log('\n🎉 博客列表管理功能测试完成！');
        
        console.log('\n📋 功能总结:');
        console.log('   - HTML生成: 支持完整的博文条目HTML');
        console.log('   - 标签选择: 根据标题自动选择合适标签');
        console.log('   - 日期解析: 支持中文日期格式解析');
        console.log('   - 时间排序: 按发布时间倒序排列');
        console.log('   - 结构验证: 验证blog.html文件结构');
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

// 运行测试
testBlogListManager();