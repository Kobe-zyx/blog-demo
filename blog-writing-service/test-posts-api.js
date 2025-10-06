/**
 * 测试博文管理API端点
 */
const http = require('http');

const BASE_URL = 'http://localhost:3001';

// 简单的HTTP请求函数
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = {
                        status: res.statusCode,
                        data: JSON.parse(body)
                    };
                    resolve(response);
                } catch (error) {
                    reject(new Error(`解析响应失败: ${error.message}`));
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testPostsAPI() {
    console.log('🧪 开始测试博文管理API端点...\n');

    try {
        // 测试获取博文列表
        console.log('1. 测试获取博文列表 (GET /api/posts)');
        const postsResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/posts',
            method: 'GET'
        });
        
        if (postsResponse.status === 200) {
            console.log('✅ 博文列表获取成功');
            console.log(`   - 找到 ${postsResponse.data.count || postsResponse.data.posts?.length || 0} 篇博文`);
            
            if (postsResponse.data.posts.length > 0) {
                console.log('   - 最新博文:', postsResponse.data.posts[0].title);
                
                // 测试获取单个博文
                const firstPost = postsResponse.data.posts[0];
                console.log(`\n2. 测试获取单个博文 (GET /api/posts/${firstPost.filename})`);
                const postResponse = await makeRequest({
                    hostname: 'localhost',
                    port: 3001,
                    path: `/api/posts/${firstPost.filename}`,
                    method: 'GET'
                });
                
                if (postResponse.status === 200) {
                    console.log('✅ 单个博文获取成功');
                    console.log(`   - 标题: ${postResponse.data.post.title}`);
                    console.log(`   - 文件大小: ${postResponse.data.post.size} bytes`);
                } else {
                    console.log('❌ 单个博文获取失败');
                }
            } else {
                console.log('   - 暂无博文，跳过单个博文测试');
            }
        } else {
            console.log('❌ 博文列表获取失败');
        }

        // 测试创建新博文
        console.log('\n3. 测试创建新博文 (POST /api/posts)');
        const newPost = {
            title: '测试博文 - API端点测试',
            content: `# 这是一个测试博文

这是通过API创建的测试博文，用于验证博文管理功能。

## 功能特性

- 自动生成封面图片
- 自动生成目录
- 自动更新博文列表

## 测试内容

这里是一些测试内容，包含**粗体**和*斜体*文字。

### 代码示例

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

测试完成时间: ${new Date().toLocaleString('zh-CN')}`,
            tags: ['测试', 'API']
        };

        const createResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/posts',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, newPost);

        if (createResponse.status === 200) {
            console.log('✅ 博文创建成功');
            console.log(`   - 文件名: ${createResponse.data.post.filename}`);
            console.log(`   - 封面图片: ${createResponse.data.post.coverImage}`);
            console.log(`   - 目录项数: ${createResponse.data.post.tableOfContents.length}`);

            // 再次获取博文列表验证
            console.log('\n4. 验证博文列表更新');
            const updatedPostsResponse = await makeRequest({
                hostname: 'localhost',
                port: 3001,
                path: '/api/posts',
                method: 'GET'
            });
            
            if (updatedPostsResponse.status === 200) {
                console.log('✅ 博文列表更新验证成功');
                console.log(`   - 当前博文数量: ${updatedPostsResponse.data.count || updatedPostsResponse.data.posts?.length || 0}`);
            }
        } else {
            console.log('❌ 博文创建失败');
            console.log('   - 错误信息:', createResponse.data);
        }

        console.log('\n🎉 所有博文管理API测试完成！');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 运行测试
if (require.main === module) {
    testPostsAPI();
}

module.exports = testPostsAPI;