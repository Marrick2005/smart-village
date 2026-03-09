# 涉县乡村公益数字大脑 (Smart Village Platform)

> **项目愿景与社会价值 (Social Impact)**
> 
> 本项目立足于革命老区涉县，旨在通过数字化手段深度赋能乡村振兴。系统以**一二九师纪念馆**等红色文化遗产为纽带，开发“方言故事共创”模块，让红色基因在数字化交互中代代相传；同时，通过“智慧助农”模块精准对接农户用水、病虫害反馈等实际生产痛点，将数字大脑转化为提升生产效率的实用工具，实现文化传承与民生保障的协同驱动。

“涉县乡村公益数字大脑” 是一个为涉县量身定制的乡村数字化公益服务系统。该项目主旨涵盖：**智慧助农、乡村学堂、文化融合、数据赋能** 四大核心模块。系统采用前后端分离的架构，旨在为农户、留守儿童、游客（C端用户）以及村支书/管理团队（B/G端用户）提供一体化的数字平台解决方案。

---

## 🛠️ 技术栈选型架构

本项目划分为 Web 前端（多角色门户）、管理端后台和核心服务端三层：

| 层级 | 平台/框架 | 核心技术 & 作用 |
| --- | --- | --- |
| **用户端 (To C)** | **React + Vite** | 面向农户、志愿者、游客的 Web 门户。<br>涉及：多角色视图路由、现代 UI 组件交互、原生视频/录音 Web API 接入。 |
| **管理端 (To B/G)**| **React + Vite** | 面向村支书、管理员。<br>涉及：数据看板管理、应用审批、高德地图 API 景点配置、视听资源审核。 |
| **服务端 (Backend)**| **Python (FastAPI)** | 提供轻量、高并发异步的 API 接口。<br>集成接口文档自动生成。 |
| **数据与存储库** | **MySQL**, **SQLAlchemy**| MySQL 负责持久化存储 E-R 数据实体；使用 Local Storage 暂代 OSS 存储媒体文件。 |
| **外部生态接口 (API)**| **高德地图、和风天气**| **高德地图** (AMap)：支撑文化地标的定位与地图选点业务。<br>**和风天气** (QWeather)：提供气象数据支撑智慧助农模块的节水灌溉算法。|

---

## 🚀 核心功能模块划分 (开发进度)

### 模块一：智慧助农 (✅ 全面完成)
- **前端门户：** 农户可以在农业大厅查看最新资讯、向管理员提交农事问题反馈（带图），并在线提交果园用水时长的申请。
- **后台审批：** 管理员/村支书在后台可一键通过或驳回农户的用水申请，并记录审核意见。

### 模块二：乡村学堂 (教育赋能) (✅ 核心已完成)
- **分龄推普与法治影院：** 面向农户与儿童的在线视频学习库。前端支持视频流式播放与观看记录打点。
- **管理端视频监控：** 管理员可上传新的教学视频，并在后台实时查看各视频的完播率与每个农户的实际观看时长进度。

### 模块三：文化融合 (LBS + UGC 体验) (✅ 全面完成)
- **红色地标网格：** 在文化页展示涉县一二九师纪念馆等红色地标列表。
- **方言故事共创：** 详情页支持**在线麦克风录音**和**本地音频上传**，故事精准绑定特定景点打卡。
- **景点与审核管理：** 管理后台集成了**高德地图取点组件**，搜索关键词可直接在地图上定位新建景点。同时支持对用户上传的方言故事进行在线试听审核。

### 模块四：游客模式 (✅ 开发完成)
- **免登录访问：** 游客可直接进入专属门户，通过数字地图浏览红色地标、收听乡音故事。
- **互动回馈：** 游客可在线提交旅行心得或改进建议，反馈数据将实时推送至管理后台。

---

## ⚙️ 本地快速运行与配置指南

### 1. 数据库构建
1. 在本地建立 MySQL 数据库：
   ```sql
   CREATE DATABASE smart_village_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. 使用 `mysql` 命令行或图形化工具（如 Navicat/DataGrip）按顺序执行：
   - 首先执行 `NewSQL.sql`（创建核心数据库结构）。
   - 可选执行 `test0.sql`（导入基础测试数据）。

### 2. API 密钥与数据库配置 (`backend/config.py`)
为了简化配置，所有的数据库账号、密码以及第三方 API Key 都已集中在 `backend/config.py` 中管理。
请打开并根据您的实际环境填写以下信息：
```python
# backend/config.py
DB_USER = "root"
DB_PASSWORD = "your_actual_password"  # 您本地 MySQL 的实际密码
DB_HOST = "localhost"
DB_PORT = "3306"
DB_NAME = "smart_village_db"

AMAP_KEY = "your_amap_key_here" # 高德地图 Key
AMAP_SECURITY_CODE = "your_amap_security_code_here" # 高德地图安全密钥
QWEATHER_KEY = "your_qweather_key_here" # 和风天气 Key
```

### 3. 启动后端服务 (FastAPI)
进入 `backend` 目录，安装依赖并启动热更新服务器：
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows 环境
# source venv/bin/activate # Linux/Mac 环境

pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```
后端服务默认运行在 `http://127.0.0.1:8000`。

### 4. 启动前端服务 (React + Vite)
进入 `Web-frontend` 目录：
```bash
cd Web-frontend
npm install
npm run dev
```
前端服务默认运行在 `http://localhost:5173`。

---

## ☁️ 云端服务器部署说明 (生产环境)

本指南适用于将项目部署至阿里云、腾讯云等云端服务器。

### 1. 环境要求
部署前请确保服务器已安装以下基础环境：
- **操作系统**: Ubuntu 20.04+ 或 CentOS 7.6+ (建议使用 Linux)
- **后端环境**: Python 3.9+
- **前端环境**: Node.js 16+ (建议使用 LTS 版本)
- **数据库**: MySQL 8.0+
- **Web 服务器**: Nginx (用于反向代理和静态资源分发)

### 2. 数据库部署 (云端 MySQL)
- 若使用云端 RDS 或自建 MySQL，请按前文的「数据库构建」执行建表及导入结构。

### 3. 后端部署 (Gunicorn)
1. **获取代码并创建虚拟环境**:
   ```bash
   cd /your/deploy/path/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. **配置文件修改**:
   - 同样需要修改 `backend/config.py`，录入正确的生产环境数据库密码和各项 API 密钥。
   - 编辑 `main.py`: 找到 `allow_origins=["*"]`，将通配符替换为您正式的前端生产域名，以增强安全性。
3. **运行服务 (建议使用 Gunicorn 守护进程)**:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000 --daemon
   ```

### 4. 前端部署
1. **编译生产环境包**:
   在开发机或 CI 服务器上进入 `Web-frontend` 目录：
   ```bash
   npm install
   npm run build
   ```
   编译后会生成 `dist` 文件夹，该文件夹包含了压缩优化过的静态资源。
2. **配置检查**:
   - 确保 `backend/config.py` 的相关 API key 已经就绪（前端动态通过 `/api/config` 获取接口安全配置）。
   - 检查前端连接后端的 API 调用基地址变量（如 `API_BASE_URL`）是否指向您的正式后端域名。
3. **分发静态文件**:
   将生成的 `dist` 文件夹完整上传至服务器指定的 Web 目录。

### 5. Nginx 代理配置示例
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

### 6. 部署上线实测检查点 (Checkpoint)
- [ ] **跨域设置**: 检查 `main.py` 的 CORS 是否已允许正式的前端域名。
- [ ] **文件权限**: 确保云服务器的 `backend/uploads` 目录对后端进程拥有可写与可读权限。
- [ ] **数据库与API测试**: 验证后端服务能否正常连接云端 MySQL 以及天气/地图 API 密钥没有填错或被访问限制。

---

## 📞 开发者与支持

对本项目有任何建议，欢迎通过以下方式联系：
- **个人微信联系方式**：`Marrick0928`
