from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import farming, school, culture, analytics

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
    allow_origins=["*"], # In production, restrict to actual frontend urls
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(farming.router, prefix="/api/farming", tags=["智慧助农 (Farming)"])
app.include_router(school.router, prefix="/api/school", tags=["乡村学堂 (School)"])
app.include_router(culture.router, prefix="/api/culture", tags=["文化融合 (Culture)"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["数据赋能 (Analytics)"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Village Brain API"}
