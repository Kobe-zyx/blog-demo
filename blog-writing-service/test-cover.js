/**
 * 封面生成功能测试
 */
const CoverImageGenerator = require('./server/utils/CoverImageGenerator');

console.log('🎨 开始封面生成功能测试...\n');

async function testCoverGeneration() {
    try {
        const coverGenerator = new CoverImageGenerator();
        
        console.log('1️⃣ 测试基础封面生成...');
        
        // 测试不同类型的标题
        const testTitles = [
            '【技术分享】如何搭建博客系统',
            '【经验分享】我的编程学习心得',
            '【教程指南】快速入门JavaScript',
            '普通文章标题测试'
        ];
        
        for (const title of testTitles) {
            console.log(`\n   📝 测试标题: "${title}"`);
            
            const coverData = await coverGenerator.generateCover(title);
            
            console.log(`   ✅ 封面生成成功`);
            console.log(`   🎨 使用模板: ${coverData.template}`);
            console.log(`   📄 HTML文件: ${coverData.htmlFilename}`);
            console.log(`   🖼️ SVG文件: ${coverData.svgFilename}`);
            console.log(`   📁 保存路径: ${coverData.svgPath}`);
        }
        
        console.log('\n2️⃣ 测试模板系统...');
        
        const templates = coverGenerator.getAvailableTemplates();
        console.log(`   📋 可用模板数量: ${templates.length}`);
        
        templates.forEach(template => {
            console.log(`   🎨 ${template.name} (${template.id}): ${template.description}`);
        });
        
        console.log('\n3️⃣ 测试自动模板选择...');
        
        const autoTests = [
            { title: '技术文章测试', expected: 'tech' },
            { title: '分享我的经验', expected: 'share' },
            { title: '教程：如何学习', expected: 'tutorial' },
            { title: '普通标题', expected: 'default' }
        ];
        
        autoTests.forEach(test => {
            const selected = coverGenerator.autoSelectTemplate(test.title);
            const status = selected === test.expected ? '✅' : '❌';
            console.log(`   ${status} "${test.title}" → ${selected} (期望: ${test.expected})`);
        });
        
        console.log('\n4️⃣ 测试批量生成...');
        
        const batchTitles = ['批量测试1', '批量测试2', '批量测试3'];
        const batchResults = await coverGenerator.generateBatchCovers(batchTitles);
        
        console.log(`   📊 批量生成结果:`);
        batchResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`   ${status} "${result.title}"`);
            if (!result.success) {
                console.log(`       错误: ${result.error}`);
            }
        });
        
        console.log('\n🎉 封面生成功能测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

// 运行测试
testCoverGeneration();