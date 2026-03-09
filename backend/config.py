# config.py
# 这是一个统一的配置文件，您可以在此处快速修改数据库密码和 API 密钥等信息。

# ================================
# 数据库配置 (Database Config)
# ================================
DB_USER = "root"
DB_PASSWORD = "your_actual_password_here"  # 请在此处填写您的实际数据库密码
DB_HOST = "localhost"
DB_PORT = "3306"
DB_NAME = "smart_village_db"

# ================================
# API 与密钥配置 (API & Secrets)
# ================================
AMAP_KEY = "your_amap_key_here" # 在这里填入您实际的高德地图 Key
AMAP_SECURITY_CODE = "your_amap_security_code_here" # 高德地图安全密钥
QWEATHER_KEY = "your_qweather_key_here" # 和风天气 Key
