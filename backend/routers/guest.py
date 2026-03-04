from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import GuestFeedback
from datetime import datetime

router = APIRouter()

class GuestFeedbackCreate(BaseModel):
    content: str
    image_url: str = None

@router.post("/feedback")
def submit_guest_feedback(feedback: GuestFeedbackCreate, db: Session = Depends(get_db)):
    """游客提交意见与反馈"""
    new_feedback = GuestFeedback(
        content=feedback.content,
        image_url=feedback.image_url,
        submit_time=datetime.now()
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return {"status": "success", "message": "感谢您的反馈！"}
