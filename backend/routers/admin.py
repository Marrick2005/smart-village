from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from models import FarmingBehaviorRecord, VolunteerFeedback, PublicActivity, User, Video

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

@router.get("/activities/{activity_id}/participants")
def get_activity_participants(activity_id: int, db: Session = Depends(get_db)):
    """获取特定活动的参与人员名单"""
    from models import ActivityParticipation
    
    participants = db.query(ActivityParticipation, User.name)\
        .join(User, ActivityParticipation.user_id == User.user_id)\
        .filter(ActivityParticipation.activity_id == activity_id).all()
        
    result = []
    for participation, user_name in participants:
        result.append({
            "participation_id": participation.participation_id,
            "user_name": user_name,
            "role": participation.role,
            "duration": float(participation.participation_duration) if participation.participation_duration else 0
        })
        
    return result

@router.get("/volunteers/list")
def get_volunteers_list(db: Session = Depends(get_db)):
    """获取所有志愿者名单，用于新建活动时选择参与人员"""
    volunteers = db.query(User).filter(User.identity_type == '志愿者').all()
    result = [{"user_id": v.user_id, "name": v.name} for v in volunteers]
    return result

from datetime import datetime

class ActivityCreate(BaseModel):
    activity_name: str
    activity_type: str
    start_time: str
    end_time: str
    village: str
    activity_description: str
    total_budget: float
    volunteer_ids: List[int] = []

@router.post("/activities/new")
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    """新建公益活动并分配志愿者"""
    try:
        start_time = datetime.strptime(activity.start_time, "%Y-%m-%d")
        end_time = datetime.strptime(activity.end_time, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")

    new_activity = PublicActivity(
        activity_name=activity.activity_name,
        activity_type=activity.activity_type,
        start_time=start_time,
        end_time=end_time,
        village=activity.village,
        activity_description=activity.activity_description,
        total_budget=activity.total_budget
    )
    db.add(new_activity)
    db.flush() # Get the new activity_id

    # Add participants
    from models import ActivityParticipation
    for uid in activity.volunteer_ids:
        participation = ActivityParticipation(
            activity_id=new_activity.activity_id,
            user_id=uid,
            role="志愿者",
            participation_duration=0 # Default, they update it later
        )
        db.add(participation)
        
    db.commit()
    return {"status": "success", "message": "活动创建成功", "activity_id": new_activity.activity_id}

# --- Video Management Endpoints ---

@router.get("/videos/list")
def get_admin_videos(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """获取所有视频列表供管理员管理"""
    videos = db.query(Video).offset(skip).limit(limit).all()
    result = []
    for v in videos:
        result.append({
            "video_id": v.video_id,
            "video_topic": v.video_topic,
            "video_type": v.video_type,
            "video_duration": v.video_duration,
            "publish_time": v.publish_time,
            "video_url": v.video_url,
            "cover_url": v.cover_url
        })
    total = db.query(Video).count()
    return {"total": total, "data": result}

class VideoCreate(BaseModel):
    video_topic: str
    video_type: str
    video_url: str
    cover_url: str
    video_duration: int = 0

@router.post("/videos/new")
def create_video(video: VideoCreate, db: Session = Depends(get_db)):
    """管理员新增教育视频"""
    new_video = Video(
        video_topic=video.video_topic,
        video_type=video.video_type,
        video_url=video.video_url,
        cover_url=video.cover_url,
        video_duration=video.video_duration,
        publish_time=datetime.now(),
        target_age_group='所有群体' # 默认兜底
    )
    db.add(new_video)
    db.commit()
    return {"status": "success", "message": "视频添加成功"}

@router.delete("/videos/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    """管理员删除教育视频"""
    video = db.query(Video).filter(Video.video_id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    db.delete(video)
    db.commit()
    return {"status": "success", "message": "视频已删除"}
