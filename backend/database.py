from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 数据库连接 URL
import urllib.parse
password = urllib.parse.quote_plus("210828@Max")
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://root:{password}@localhost/smart_village_db?charset=utf8mb4"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
