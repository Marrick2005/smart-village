from fastapi import APIRouter, UploadFile, File, Form, Depends
import random
import os
import shutil
from sqlalchemy.orm import Session
from database import get_db
from models import RedLandmark, DialectStory
from datetime import datetime

router = APIRouter()

# 获取当前文件所在目录下级的 uploads/audios 路径
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "audios")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.get("/red-landmarks")
def get_landmarks(db: Session = Depends(get_db)):
    """获取所有地图红色地标"""
    landmarks = db.query(RedLandmark).all()
    return {"landmarks": landmarks}

@router.get("/red-landmarks/{landmark_id}")
def get_landmark(landmark_id: int, db: Session = Depends(get_db)):
    """获取单点红色地标详细信息"""
    from fastapi import HTTPException
    lm = db.query(RedLandmark).filter(RedLandmark.landmark_id == landmark_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")
    return lm

@router.post("/upload-story")
async def upload_story(
    title: str = Form(...), 
    tags: str = Form(...), 
    audio: UploadFile = File(...),
    landmark_id: str = Form(None), # Changed to str to match form data format
    db: Session = Depends(get_db)
):
    """保存用户上传的乡村方言故事音频文件并存入数据库"""
    file_extension = os.path.splitext(audio.filename)[1]
    file_name = f"{random.randint(1000, 9999)}_{audio.filename}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
        
    # Save to database
    new_story = DialectStory(
        title=title,
        tags=tags,
        audio_url=f"/uploads/audios/{file_name}",
        upload_time=datetime.now(),
        status=0, # Pending
        landmark_id=int(landmark_id) if landmark_id and landmark_id != 'undefined' else None
    )
    db.add(new_story)
    db.commit()
    db.refresh(new_story)
        
    return {
        "status": "success", 
        "story_id": new_story.story_id, 
        "message": "音频故事上传成功，待后台审核！",
        "url": new_story.audio_url
    }

@router.get("/red-landmarks/{landmark_id}/stories")
def get_landmark_stories(landmark_id: int, db: Session = Depends(get_db)):
    """获取审核通过的该景点方言故事"""
    stories = db.query(DialectStory).filter(
        DialectStory.landmark_id == landmark_id,
        DialectStory.status == 1
    ).order_by(DialectStory.upload_time.desc()).all()
    return stories
