# config.py
# 这是一个统一的配置文件，您可以在此处快速修改数据库密码和 API 密钥等信息。

# ================================
# 数据库配置 (Database Config)
# ================================
DB_USER = "root" # 数据库用户名
DB_PASSWORD = "your_actual_password_here"  # 数据库密码
DB_HOST = "localhost" # 数据库地址
DB_PORT = "3306" # 数据库端口
DB_NAME = "smart_village_db" # 数据库名

# ================================
# API 与密钥配置 (API & Secrets)
# ================================
AMAP_KEY = "your_amap_key_here" # 地图 Key
AMAP_SECURITY_CODE = "your_amap_security_code_here" # 地图安全密钥
QWEATHER_KEY = "your_qweather_key_here" # 天气 Key