const marked = require('marked');

// 配置 marked 以支持自定义语法
marked.use({
    extensions: [
        {
            name: 'highlight',
            level: 'inline',
            start(src) { return src.match(/==/)?.index; },
            tokenizer(src) {
                const rule = /^==([^=]+)==/;
                const match = rule.exec(src);
                if (match) {
                    return {
                        type: 'highlight',
                        raw: match[0],
                        text: match[1].trim()
                    };
                }
            },
            renderer(token) {
                return `<mark>${token.text}</mark>`;
            }
        }
    ]
});

// 测试
const testText = `
# 测试高亮

这是普通文字，==这是高亮文字==，继续普通文字。

可以==标记重点==内容。

## 组合使用

- ==**粗体高亮**==
- ==*斜体高亮*==
`;

console.log('输入:');
console.log(testText);
console.log('\n输出:');
console.log(marked.parse(testText));
