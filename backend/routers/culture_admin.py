from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from database import get_db
from models import DialectStory, RedLandmark
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class ReviewRequest(BaseModel):
    story_id: int
    status: int # 1: Approve, 2: Reject
    reject_reason: Optional[str] = None

class LandmarkCreate(BaseModel):
    title: str
    description: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None

# --- Story Audit ---

@router.get("/pending-stories")
def get_pending_stories(db: Session = Depends(get_db)):
    return db.query(DialectStory).filter(DialectStory.status == 0).all()

@router.post("/review-story")
def review_story(req: ReviewRequest, db: Session = Depends(get_db)):
    story = db.query(DialectStory).filter(DialectStory.story_id == req.story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    story.status = req.status
    if req.status == 2:
        story.reject_reason = req.reject_reason
    
    db.commit()
    return {"message": "Review submitted successfully"}

# --- Landmark Management ---

@router.get("/landmarks")
def get_all_landmarks(db: Session = Depends(get_db)):
    return db.query(RedLandmark).all()

@router.post("/landmarks")
def create_landmark(req: LandmarkCreate, db: Session = Depends(get_db)):
    new_lm = RedLandmark(
        title=req.title,
        description=req.description,
        latitude=req.latitude,
        longitude=req.longitude,
        image_url=req.image_url,
        create_time=datetime.now()
    )
    db.add(new_lm)
    db.commit()
    db.refresh(new_lm)
    return new_lm

@router.put("/landmarks/{lm_id}")
def update_landmark(lm_id: int, req: LandmarkCreate, db: Session = Depends(get_db)):
    lm = db.query(RedLandmark).filter(RedLandmark.landmark_id == lm_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")
    
    lm.title = req.title
    lm.description = req.description
    lm.latitude = req.latitude
    lm.longitude = req.longitude
    lm.image_url = req.image_url
    
    db.commit()
    return {"message": "Landmark updated"}

@router.delete("/landmarks/{lm_id}")
def delete_landmark(lm_id: int, db: Session = Depends(get_db)):
    lm = db.query(RedLandmark).filter(RedLandmark.landmark_id == lm_id).first()
    if not lm:
        raise HTTPException(status_code=404, detail="Landmark not found")
    
    db.delete(lm)
    db.commit()
    return {"message": "Landmark deleted"}
