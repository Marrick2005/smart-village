from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from models import FarmingBehaviorRecord, VolunteerFeedback, PublicActivity, User

router = APIRouter()

# --- Farming Behavior Endpoints ---

class FarmingBehaviorUpdate(BaseModel):
    is_adopted: bool

@router.get("/farming-behavior")
def get_farming_behaviors(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """获取农事实践打卡反馈记录"""
    records = db.query(FarmingBehaviorRecord, User.name)\
        .join(User, FarmingBehaviorRecord.user_id == User.user_id)\
        .offset(skip).limit(limit).all()
        
    result = []
    for record, user_name in records:
        result.append({
            "record_id": record.record_id,
            "user_name": user_name,
            "record_time": record.record_time,
            "township": record.township,
            "farming_stage": record.farming_stage,
            "crop_type": record.crop_type,
            "reminder_category": record.reminder_category,
            "is_adopted_advice": record.is_adopted_advice
        })
    
    total = db.query(FarmingBehaviorRecord).count()
    return {"total": total, "data": result}

@router.post("/farming-behavior/{record_id}/adopt")
def toggle_farming_advice(record_id: int, update_data: FarmingBehaviorUpdate, db: Session = Depends(get_db)):
    """切换农事建议的“是否采纳”状态"""
    db_record = db.query(FarmingBehaviorRecord).filter(FarmingBehaviorRecord.record_id == record_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Record not found")
        
    db_record.is_adopted_advice = update_data.is_adopted
    db.commit()
    return {"status": "success", "message": "采纳状态已更新"}


# --- Volunteer Management Endpoints ---

@router.get("/volunteers")
def get_volunteers(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """获取志愿者反馈及评分记录"""
    records = db.query(VolunteerFeedback, User.name, PublicActivity.activity_name)\
        .join(User, VolunteerFeedback.user_id == User.user_id)\
        .join(PublicActivity, VolunteerFeedback.activity_id == PublicActivity.activity_id)\
        .offset(skip).limit(limit).all()
        
    result = []
    for feedback, user_name, activity_name in records:
        result.append({
            "feedback_id": feedback.feedback_id,
            "user_name": user_name,
            "activity_name": activity_name,
            "personal_gain_score": float(feedback.personal_gain_score) if feedback.personal_gain_score else 0,
            "organization_score": float(feedback.organization_score) if feedback.organization_score else 0,
            "satisfaction_score": float(feedback.satisfaction_score) if feedback.satisfaction_score else 0,
            "submit_time": feedback.submit_time,
            "improvement_suggestion": feedback.improvement_suggestion
        })
        
    total = db.query(VolunteerFeedback).count()
    return {"total": total, "data": result}


# --- Public Activity Endpoints ---

@router.get("/activities")
def get_activities(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """获取公益活动列表"""
    activities = db.query(PublicActivity).offset(skip).limit(limit).all()
    
    result = []
    for activity in activities:
        result.append({
            "activity_id": activity.activity_id,
            "activity_name": activity.activity_name,
            "activity_type": activity.activity_type,
            "start_time": activity.start_time,
            "end_time": activity.end_time,
            "village": activity.village,
            "total_budget": float(activity.total_budget) if activity.total_budget else 0,
            "activity_description": activity.activity_description
        })
        
    total = db.query(PublicActivity).count()
    return {"total": total, "data": result}
