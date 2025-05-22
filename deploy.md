# 部署指南

本文档提供了将"工作摸鱼小助手"部署到生产环境的详细步骤。

## 前期准备

1. 获取OpenRouter API密钥
   - 访问 https://openrouter.ai/keys
   - 注册账号并创建API密钥
   - 保存API密钥，稍后将在应用中使用

2. 准备部署环境
   - 静态网站托管服务（如Netlify、Vercel、GitHub Pages等）
   - 或自有服务器（Apache、Nginx等）

## 部署选项

### 选项1：使用静态网站托管服务

#### Netlify部署

1. 注册Netlify账号并登录
2. 点击"New site from Git"
3. 选择您的Git仓库
4. 构建设置：
   - 构建命令：留空（无需构建）
   - 发布目录：`.`（项目根目录）
5. 点击"Deploy site"

#### Vercel部署

1. 注册Vercel账号并登录
2. 点击"Import Project"
3. 选择您的Git仓库
4. 构建设置：
   - 框架预设：Other
   - 构建命令：留空
   - 输出目录：`.`
5. 点击"Deploy"

### 选项2：使用自有服务器

#### Apache服务器

1. 将项目文件上传到服务器的Web根目录
2. 确保`.htaccess`文件包含以下内容：

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx服务器

1. 将项目文件上传到服务器的Web根目录
2. 配置Nginx：

```
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/your/project;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # 服务工作线程特殊处理
    location /service-worker.js {
        add_header Cache-Control "no-cache";
        expires -1;
    }
}
```

## 配置HTTPS

为了确保PWA功能正常工作，必须使用HTTPS。

### 使用Let's Encrypt

1. 安装Certbot：`sudo apt-get install certbot`
2. 获取证书：`sudo certbot --nginx -d yourdomain.com`
3. 按照提示完成配置

## 部署后检查

1. 访问您的网站
2. 打开浏览器开发者工具
3. 检查Console选项卡中是否有错误
4. 检查Application选项卡中Service Worker是否正常注册
5. 测试PWA安装功能

## 更新部署

1. 将更新推送到Git仓库（如使用Netlify或Vercel）
2. 或将更新的文件上传到服务器
3. 确保service-worker.js中的CACHE_NAME已更新，以便清除旧缓存

## 故障排除

### PWA无法安装

- 确保使用HTTPS
- 检查manifest.json是否正确
- 验证所有图标是否可访问

### API调用失败

- 检查API密钥是否正确
- 确认网络连接正常
- 查看浏览器控制台是否有CORS错误

### 缓存问题

- 更新service-worker.js中的CACHE_NAME
- 在浏览器开发者工具中清除缓存
- 强制刷新页面（Ctrl+F5）