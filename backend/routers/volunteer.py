from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import PublicActivity, VolunteerFeedback, User
from datetime import datetime
from routers.auth import get_current_user

router = APIRouter()

@router.get("/activities")
def get_volunteer_activities(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """获取可参与的公益活动列表"""
    activities = db.query(PublicActivity).order_by(PublicActivity.start_time.desc()).offset(skip).limit(limit).all()
    result = []
    for activity in activities:
        result.append({
            "activity_id": activity.activity_id,
            "activity_name": activity.activity_name,
            "activity_type": activity.activity_type,
            "start_time": activity.start_time.strftime("%Y-%m-%d %H:%M:%S") if activity.start_time else "",
            "village": activity.village,
            "description": activity.activity_description
        })
    return {"data": result}

class FeedbackRequest(BaseModel):
    personal_gain_score: float
    organization_score: float
    satisfaction_score: float
    improvement_suggestion: str

@router.post("/activities/{activity_id}/feedback")
def submit_volunteer_feedback(activity_id: int, feedback: FeedbackRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """志愿者提交活动反馈打分"""
    # Check if activity exists
    activity = db.query(PublicActivity).filter(PublicActivity.activity_id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Check if user already submitted feedback
    existing = db.query(VolunteerFeedback).filter(
        VolunteerFeedback.activity_id == activity_id, 
        VolunteerFeedback.user_id == current_user.user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="您已经对该活动进行过反馈，感谢您的参与！")

    new_feedback = VolunteerFeedback(
        activity_id=activity_id,
        user_id=current_user.user_id,
        personal_gain_score=feedback.personal_gain_score,
        organization_score=feedback.organization_score,
        satisfaction_score=feedback.satisfaction_score,
        improvement_suggestion=feedback.improvement_suggestion,
        submit_time=datetime.now()
    )
    db.add(new_feedback)
    db.commit()
    return {"status": "success", "message": "反馈提交成功，感谢您的建议！"}
