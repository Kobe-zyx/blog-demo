/**
 * 真实的文章更新测试
 */
const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: result });
                } catch (error) {
                    reject(new Error('解析JSON失败: ' + error.message));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testRealUpdate() {
    console.log('🧪 开始真实的文章更新测试...\n');

    try {
        // 1. 获取文章列表
        console.log('1. 获取文章列表...');
        const postsResponse = await makeRequest('/api/posts');
        
        if (postsResponse.data.success && postsResponse.data.posts.length > 0) {
            console.log(`✅ 成功获取 ${postsResponse.data.posts.length} 篇文章`);
            
            // 选择一个测试文章
            const testPost = postsResponse.data.posts.find(post => 
                post.filename.includes('test-2')
            );
            
            if (!testPost) {
                console.log('❌ 没有找到test-2文章');
                return;
            }
            
            console.log(`📄 选择测试文章: ${testPost.title} (${testPost.filename})`);
            
            // 2. 获取文章编辑数据
            console.log('\n2. 获取文章编辑数据...');
            const editResponse = await makeRequest(`/api/posts/${testPost.filename}/edit`);
            
            if (editResponse.data.success) {
                const originalPost = editResponse.data.post;
                console.log('✅ 成功获取文章编辑数据');
                console.log(`📝 原标题: ${originalPost.title}`);
                console.log(`📄 原内容长度: ${originalPost.markdownContent.length} 字符`);
                console.log(`📖 原内容预览: ${originalPost.markdownContent.substring(0, 100)}...`);
                
                // 3. 执行真实更新
                console.log('\n3. 执行真实更新...');
                const updateData = {
                    title: originalPost.title + ' [测试更新]',
                    content: originalPost.markdownContent + '\n\n## 🧪 更新测试\n\n这是一个**真实的更新测试**，用于验证以下功能：\n\n- ✅ Markdown转换为HTML\n- ✅ 保持原有封面图片\n- ✅ 保持原有发布日期\n- ✅ 正确的HTML结构\n\n测试时间：' + new Date().toLocaleString('zh-CN'),
                    tags: ['技术分享', '测试更新']
                };
                
                console.log(`📝 新标题: ${updateData.title}`);
                console.log(`📄 新内容长度: ${updateData.content.length} 字符`);
                
                // 发送更新请求
                const updateResponse = await makeRequest(`/api/posts/${testPost.filename}`, 'PUT', updateData);
                
                if (updateResponse.data.success) {
                    console.log('✅ 文章更新成功！');
                    console.log(`📄 更新后的文章: ${updateResponse.data.post.title}`);
                    console.log(`🖼️  封面图片: ${updateResponse.data.post.coverImage}`);
                    console.log(`📅 发布日期: ${updateResponse.data.post.publishDate}`);
                    
                    // 4. 验证更新结果
                    console.log('\n4. 验证更新结果...');
                    const verifyResponse = await makeRequest(`/api/posts/${testPost.filename}`);
                    
                    if (verifyResponse.data.success) {
                        const updatedPost = verifyResponse.data.post;
                        console.log('✅ 更新验证成功');
                        console.log(`📝 验证标题: ${updatedPost.title}`);
                        console.log(`📄 HTML内容长度: ${updatedPost.content.length} 字符`);
                        
                        // 检查HTML内容是否包含更新的内容
                        if (updatedPost.content.includes('更新测试') && updatedPost.content.includes('<h2')) {
                            console.log('✅ Markdown已正确转换为HTML');
                        } else {
                            console.log('❌ Markdown转换可能有问题');
                        }
                        
                        // 检查封面图片
                        if (updatedPost.content.includes('<img') && updatedPost.content.includes('blog-img')) {
                            console.log('✅ 封面图片已保持');
                        } else {
                            console.log('❌ 封面图片可能丢失');
                        }
                        
                    } else {
                        console.log('❌ 更新验证失败:', verifyResponse.data.error);
                    }
                    
                } else {
                    console.log('❌ 文章更新失败:', updateResponse.data.error);
                }
                
            } else {
                console.log('❌ 获取文章编辑数据失败:', editResponse.data.error);
            }
            
        } else {
            console.log('❌ 获取文章列表失败');
        }

        console.log('\n🎉 真实更新测试完成！');
        console.log('\n💡 请访问以下链接查看更新结果:');
        console.log('   - 编辑器: http://localhost:3001/editor/editor.html');
        console.log('   - 博客列表: http://localhost:3001/blog.html');
        console.log('   - 更新的文章: http://localhost:3001/blog/test-2.html');
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
    }
}

// 运行测试
testRealUpdate();