from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import farming, school, culture, analytics, admin, auth, volunteer, culture_admin, guest
from fastapi.staticfiles import StaticFiles
import os
from database import engine
from models import Base

# Create database tables (in real app, use Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="涉县乡村公益数字大脑 API",
    description="后端接口文档",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: In production, specify actual frontend origins (e.g., ["https://yourdomain.com"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["认证 (Auth)"])
app.include_router(farming.router, prefix="/api/farming", tags=["智慧助农 (Farming)"])
app.include_router(school.router, prefix="/api/school", tags=["乡村学堂 (School)"])
app.include_router(culture.router, prefix="/api/culture", tags=["文化融合 (Culture)"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["数据赋能 (Analytics)"])
app.include_router(admin.router, prefix="/api/admin", tags=["后台管理 (Admin)"])
app.include_router(volunteer.router, prefix="/api/volunteer", tags=["志愿者端 (Volunteer)"])
app.include_router(culture_admin.router, prefix="/api/admin/culture", tags=["文化管理 (Admin Culture)"])
app.include_router(guest.router, prefix="/api/guest", tags=["游客端 (Guest)"])

# Mount static files directory for local videos/images
upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Village Brain API"}
