# 涉县乡村公益数字大脑 - 部署说明文档

本手册旨在指导如何将项目部署至云端服务器（如阿里云、腾讯云等）。

## 1. 环境要求
部署前请确保服务器已安装以下基础环境：

- **操作系统**: Ubuntu 20.04+ 或 CentOS 7.6+ (建议使用 Linux)
- **后端环境**: Python 3.9+
- **前端环境**: Node.js 16+ (建议使用 LTS 版本)
- **数据库**: MySQL 8.0+
- **Web 服务器**: Nginx (用于反向代理和静态资源分发)

---

## 2. 数据库部署 (MySQL)

1. **创建数据库**:
   ```sql
   CREATE DATABASE smart_village_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. **导入结构与种子数据**:
   使用 `mysql` 命令行或图形化工具（如 Navicat/HeidiSQL）按顺序执行：
   - 首先执行 `NewSQL.sql`（创建核心结构）。
   - 可选执行 `test0.sql`（导入基础测试数据）。

---

## 3. 后端部署 (FastAPI)

1. **获取代码并创建虚拟环境**:
   ```bash
   cd /your/deploy/path/backend
   python3 -m venv venv
   source venv/bin/activate  # Linux/Mac
   ```
2. **安装依赖**:
   ```bash
   pip install -r requirements.txt
   ```
3. **配置文件修改**:
   - 编辑 `database.py`: 修改 `SQLALCHEMY_DATABASE_URL` 链接，替换为您在服务器上设置的 MySQL 用户名、密码和地址。
   - 编辑 `main.py`: 找到 `allow_origins=["*"]`，将通配符替换为您正式的前端域名，以增强安全性。
4. **运行服务 (建议使用 Gunicorn)**:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000 --daemon
   ```

---

## 4. 前端部署 (React + Vite)

1. **编译生产环境包**:
   在本地或 CI/CD 服务器上进入 `Web-frontend` 目录：
   ```bash
   npm install
   npm run build
   ```
   编译后会生成 `dist` 文件夹。
2. **脱敏与配置**:
   - 确保 `src/pages/guest/GuestHome.jsx` 和 `src/pages/admin/CultureManagement.jsx` 中的高德地图 API Key 已替换为您的生产 Key。
   - 检查 API 调用基地址是否已指向您的云端后端接口。
3. **分发静态文件**:
   将 `dist` 文件夹上传至服务器指定目录。

---

## 5. Nginx 配置示例

在 `/etc/nginx/conf.d/` 下新建项目配置文件：

```nginx
server {
    listen 80;
    server_name your_domain.com; # 替换您的域名

    # 前端静态资源
    location / {
        root /your/deploy/path/Web-frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 文件上传目录映射
    location /uploads {
        alias /your/deploy/path/backend/uploads;
        expires 30d;
    }
}
```

---

## 6. 上手实测检查点 (Checkpoint)

- [ ] **跨域设置**: 检查 `main.py` 的 CORS 是否已允许前端域名。
- [ ] **文件权限**: 确保 `backend/uploads` 具有可写权限。
- [ ] **高德安全设置**: 若高德地图无法加载，检查 Nginx 是否正确传递了安全秘钥或在前端代码中配置了 `_AMapSecurityConfig`。
- [ ] **数据库连接**: 验证后端的虚拟环境能否正常连接云端 MySQL。

---
*祝部署顺利！项目现已进入维护阶段，云端运行建议开启常规日志监控。*
