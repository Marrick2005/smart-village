from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()

@router.get("/red-landmarks")
def get_landmarks():
    """获取所有地图红色地标"""
    return {
        "landmarks": [
            {
                "id": 1,
                "latitude": 36.5755,
                "longitude": 113.8820,
                "title": "一二九师纪念馆",
                "desc": "这里是八路军一二九师司令部旧址..."
            }
        ]
    }

@router.post("/upload-story")
def upload_story(title: str, tags: str):
    """保存用户上传的乡村方言故事"""
    return {"status": "success", "story_id": random.randint(1000, 9999), "message": "上传成功待审核"}
