/**
 * 目录格式一致性测试
 */
const TableOfContentsGenerator = require('./server/utils/TableOfContentsGenerator');

console.log('📑 开始目录格式一致性测试...\n');

function testTocFormat() {
    console.log('1️⃣ 测试目录生成格式...');
    
    // 模拟与blog-build.html类似的标题结构
    const testContent = `
# 主标题

## 1.回顾
内容...

## 2.局限性
内容...

### 2.1主要分类
内容...

#### 1.原生开发
内容...

#### 2.Hexo框架
内容...

## 3.实际操作
内容...

### 3.1原生开发(HTML/CSS/JavaScript)
内容...

#### 3.1.1简易实现方式
内容...

#### 3.1.2普通实现方式
内容...

### 3.2Hexo框架
内容...

#### 3.2.1搭建
内容...

#### 3.2.2推送
内容...

## 4.结语
内容...
    `;
    
    console.log('2️⃣ 生成目录结构...');
    
    const toc = TableOfContentsGenerator.generateFromMarkdown(testContent);
    console.log(`   📑 目录项数量: ${toc.length}`);
    
    toc.forEach((item, index) => {
        const indent = '  '.repeat(item.level - 1);
        console.log(`   ${indent}${index + 1}. [H${item.level}] ${item.title} (#${item.anchor})`);
    });
    
    console.log('\n3️⃣ 生成目录HTML...');
    
    const tocHtml = TableOfContentsGenerator.generateTocHtml(toc);
    console.log(`   📄 HTML长度: ${tocHtml.length} 字符`);
    
    // 检查关键特征
    const checks = [
        { name: 'blog-toc类', test: tocHtml.includes('class="blog-toc"') },
        { name: 'sticky定位', test: tocHtml.includes('position: sticky') },
        { name: '可折叠项', test: tocHtml.includes('collapsible toc-main-item') },
        { name: '子菜单', test: tocHtml.includes('class="submenu"') },
        { name: '隐藏子菜单', test: tocHtml.includes('display: none') },
        { name: '正确缩进', test: tocHtml.includes('padding-left: 20px') }
    ];
    
    console.log('\n4️⃣ 格式检查结果:');
    checks.forEach(check => {
        const status = check.test ? '✅' : '❌';
        console.log(`   ${status} ${check.name}`);
    });
    
    console.log('\n5️⃣ 生成的HTML预览:');
    console.log('---');
    console.log(tocHtml);
    console.log('---');
    
    const allPassed = checks.every(check => check.test);
    
    if (allPassed) {
        console.log('\n🎉 目录格式完全符合blog-build.html标准！');
    } else {
        console.log('\n⚠️ 目录格式需要进一步调整');
    }
}

// 运行测试
testTocFormat();