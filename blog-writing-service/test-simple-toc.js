/**
 * 简单目录测试 - 模拟编辑器输入
 */
const TableOfContentsGenerator = require('./server/utils/TableOfContentsGenerator');

console.log('📝 模拟编辑器输入测试...\n');

function testSimpleInput() {
    // 模拟用户在编辑器中输入的简单内容
    const userInput = `## 介绍

这是文章的介绍部分。

## 主要内容

### 功能特性

- 功能1
- 功能2

### 使用方法

具体的使用步骤...

## 总结

文章总结内容。`;

    console.log('1️⃣ 用户输入内容:');
    console.log('---');
    console.log(userInput);
    console.log('---\n');

    console.log('2️⃣ 生成目录结构...');
    const toc = TableOfContentsGenerator.generateFromMarkdown(userInput);
    
    console.log(`   📑 目录项数量: ${toc.length}`);
    toc.forEach((item, index) => {
        const indent = '  '.repeat(item.level - 2); // 从H2开始，所以减2
        console.log(`   ${indent}${index + 1}. [H${item.level}] ${item.title} (#${item.anchor})`);
    });

    console.log('\n3️⃣ 生成目录HTML...');
    const tocHtml = TableOfContentsGenerator.generateTocHtml(toc);
    
    if (tocHtml) {
        console.log('   ✅ 目录HTML生成成功');
        console.log(`   📄 HTML长度: ${tocHtml.length} 字符`);
        
        // 检查关键特征
        const hasCollapsible = tocHtml.includes('collapsible toc-main-item');
        const hasSubmenu = tocHtml.includes('class="submenu"');
        const hasSticky = tocHtml.includes('position: sticky');
        
        console.log(`   📋 可折叠项: ${hasCollapsible ? '✅' : '❌'}`);
        console.log(`   📋 子菜单: ${hasSubmenu ? '✅' : '❌'}`);
        console.log(`   📋 粘性定位: ${hasSticky ? '✅' : '❌'}`);
    } else {
        console.log('   ❌ 目录HTML生成失败');
    }

    console.log('\n4️⃣ 测试边界情况...');
    
    // 测试只有一个标题的情况
    const singleTitle = `## 单个标题\n\n内容...`;
    const singleToc = TableOfContentsGenerator.generateFromMarkdown(singleTitle);
    const singleTocHtml = TableOfContentsGenerator.generateTocHtml(singleToc);
    
    console.log(`   📝 单标题测试: ${singleToc.length === 1 ? '✅' : '❌'}`);
    console.log(`   📄 单标题HTML: ${singleTocHtml ? '✅' : '❌'}`);
    
    // 测试没有标题的情况
    const noTitle = `这是没有标题的内容。\n\n只有普通文本。`;
    const noToc = TableOfContentsGenerator.generateFromMarkdown(noTitle);
    const noTocHtml = TableOfContentsGenerator.generateTocHtml(noToc);
    
    console.log(`   📝 无标题测试: ${noToc.length === 0 ? '✅' : '❌'}`);
    console.log(`   📄 无标题HTML: ${noTocHtml === '' ? '✅' : '❌'}`);

    console.log('\n🎉 简单目录测试完成！');
    console.log('\n💡 编辑器使用提示:');
    console.log('   - 使用 ## 创建主要章节');
    console.log('   - 使用 ### 创建子章节');
    console.log('   - 使用 #### 创建详细小节');
    console.log('   - 系统会自动生成可折叠的目录结构');
}

// 运行测试
testSimpleInput();