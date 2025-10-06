@echo off
echo ========================================
echo          博客编辑器启动
echo ========================================
echo.

echo 正在进入服务目录...
cd blog-writing-service

echo.
echo 正在检查依赖...
if not exist node_modules (
    echo 📦 正在安装依赖...
    npm install express cors marked multer cheerio
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已存在
)

echo.
echo 🚀 正在启动博客编辑器...
echo.
echo 启动成功后，请访问: http://localhost:3001/editor/editor.html
echo 按 Ctrl+C 可停止服务
echo.

node server/server-fixed.js

pause