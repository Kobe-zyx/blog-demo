/**
 * 直接测试API端点
 */
const http = require('http');

function testAPI() {
    console.log('🧪 直接测试API端点...\n');

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/posts',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应头:`, res.headers);
        
        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });
        
        res.on('end', () => {
            console.log('\n原始响应体:');
            console.log(body);
            
            try {
                const data = JSON.parse(body);
                console.log('\n解析后的数据:');
                console.log('- success:', data.success);
                console.log('- posts数组长度:', data.posts ? data.posts.length : 'undefined');
                console.log('- count:', data.count);
                console.log('- message:', data.message);
                
                if (data.posts && data.posts.length > 0) {
                    console.log('\n前3篇博文:');
                    data.posts.slice(0, 3).forEach((post, index) => {
                        console.log(`  ${index + 1}. ${post.title} (${post.filename})`);
                    });
                }
            } catch (error) {
                console.error('解析JSON失败:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('请求失败:', error.message);
    });

    req.end();
}

testAPI();