from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from pydantic import BaseModel
from urllib.parse import urlparse
from pathlib import Path
from database import get_db
from models import FarmingBehaviorRecord, VolunteerFeedback, PublicActivity, User, Video, GuestFeedback

router = APIRouter()
UPLOAD_ROOT = (Path(__file__).resolve().parent.parent / "uploads").resolve()


def _extract_upload_file_path(file_url: Optional[str]) -> Optional[Path]:
    """Resolve a local uploads file path from full URL or relative uploads path."""
    if not file_url:
        return None

    parsed = urlparse(file_url)
    raw_path = parsed.path if parsed.scheme else file_url

    if raw_path.startswith("/uploads/"):
        relative = raw_path[len("/uploads/"):]
    elif raw_path.startswith("uploads/"):
        relative = raw_path[len("uploads/"):]
    elif "/uploads/" in raw_path:
        relative = raw_path.split("/uploads/", 1)[1]
    else:
        return None

    candidate = (UPLOAD_ROOT / relative).resolve()
    try:
        candidate.relative_to(UPLOAD_ROOT)
    except ValueError:
        return None
    return candidate

# --- Farming Behavior Endpoints ---

class UserUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    password: Optional[str] = None
    identity_type: Optional[str] = None

@router.get("/users")
def get_all_users(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """获取所有用户信息 (Admin)"""
    users = db.query(User).offset(skip).limit(limit).all()
    result = []
    for u in users:
        result.append({
            "user_id": u.user_id,
            "name": u.name,
            "contact": u.contact,
            "password": u.password, # Sending plain text as stored
            "gender": u.gender,
            "township": u.township,
            "identity_type": u.identity_type
        })
    total = db.query(User).count()
    return {"total": total, "data": result}

@router.put("/users/{user_id}")
def update_user(user_id: int, update_data: UserUpdate, db: Session = Depends(get_db)):
    """管理员修改用户信息"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if update_data.name is not None:
        user.name = update_data.name
    if update_data.contact is not None:
        # Check if new contact conflicts with someone else
        existing = db.query(User).filter(User.contact == update_data.contact, User.user_id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Contact already exists for another user")
        user.contact = update_data.contact
    if update_data.password is not None:
        user.password = update_data.password
    if update_data.identity_type is not None:
        user.identity_type = update_data.identity_type
        
    db.commit()
    return {"status": "success", "message": "用户信息已更新"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """管理员删除用户"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # User dependencies should be handled by ON DELETE CASCADE in db schema
    db.delete(user)
    db.commit()
    return {"status": "success", "message": "用户已删除"}

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

    file_paths = [
        _extract_upload_file_path(video.video_url),
        _extract_upload_file_path(video.cover_url),
    ]

    db.delete(video)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="删除失败：该视频存在关联记录且数据库外键未级联删除，请检查约束配置。",
        )
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="删除失败：数据库操作异常")

    deleted_files = []
    file_delete_warnings = []
    for path in file_paths:
        if path is None:
            continue

        if not path.exists():
            file_delete_warnings.append(f"文件不存在: {path.name}")
            continue

        try:
            path.unlink()
            deleted_files.append(path.name)
        except OSError as exc:
            file_delete_warnings.append(f"删除失败 {path.name}: {exc}")

    return {
        "status": "success",
        "message": "视频已删除",
        "deleted_files": deleted_files,
        "file_delete_warnings": file_delete_warnings,
    }

# --- Guest Feedback Management ---

@router.get("/guest-feedbacks")
def get_guest_feedbacks(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """管理员获取所有游客意见反馈"""
    feedbacks = db.query(GuestFeedback).order_by(GuestFeedback.submit_time.desc()).offset(skip).limit(limit).all()
    result = []
    for f in feedbacks:
        result.append({
            "feedback_id": f.feedback_id,
            "content": f.content,
            "image_url": f.image_url,
            "submit_time": f.submit_time
        })
    total = db.query(GuestFeedback).count()
    return {"total": total, "data": result}
