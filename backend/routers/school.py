from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Video, VideoWatchRecord, User, SchoolCheckin
from datetime import datetime
from typing import List, Optional

router = APIRouter()

@router.get("/videos")
def get_videos(category: str = "儿童动画", db: Session = Depends(get_db)):
    """
    分发视频列表（从数据库读取）
    """
    videos = db.query(Video).filter(Video.video_type == category).all()
    if not videos:
        # 如果库里没数据，返回一些初始提示或空
        return {"videos": []}
    
    return {
        "videos": [
            {
                "id": v.video_id, 
                "title": v.video_topic, 
                "category": v.video_type, 
                "views": "1.2w", # 暂时模拟播放量
                "url": v.video_url,
                "cover": v.cover_url
            } for v in videos
        ]
    }

class WatchRecordSchema(BaseModel):
    video_id: int
    user_id: int
    actual_watch_duration: int
    is_finished: bool

@router.post("/video/watch-record")
def record_video_watch(record: WatchRecordSchema, db: Session = Depends(get_db)):
    """
    用户（C端）提交视频观看流水
    """
    new_record = VideoWatchRecord(
        video_id=record.video_id,
        user_id=record.user_id,
        actual_watch_duration=record.actual_watch_duration,
        is_finished=record.is_finished,
        click_time=datetime.now()
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return {"status": "success", "id": new_record.watch_id}

from sqlalchemy import func, Integer

@router.get("/video/records")
def get_video_records(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):

    """
    管理端获取所有用户的观看汇总记录（即使时长为0的用户也会展示）
    """
    skip = (page - 1) * page_size
    
    # 构建左外连接查询，以 User 为主表，聚合并统计每个人的观看总时长和已看完视频数
    query = db.query(
        User.user_id,
        User.name.label("username"),
        User.township,
        func.coalesce(func.sum(VideoWatchRecord.actual_watch_duration), 0).label("total_duration"),
        func.sum(func.cast(VideoWatchRecord.is_finished, Integer)).label("finished_count")
    ).outerjoin(
        VideoWatchRecord, User.user_id == VideoWatchRecord.user_id
    ).group_by(
        User.user_id, User.name, User.township
    )
    
    total = db.query(User).count()
    records = query.order_by(User.user_id).offset(skip).limit(page_size).all()
    
    data = []
    for user_id, username, township, total_duration, finished_count in records:
        data.append({
            "user_id": user_id,
            "username": username,
            "township": township,
            "total_duration": int(total_duration), # SQLAlchemy sum returns Decimal
            "finished_count": int(finished_count) if finished_count else 0
        })
        
    return {
        "total": total,
        "data": data
    }

@router.get("/user/{user_id}/videos")
def get_user_video_history(user_id: int, db: Session = Depends(get_db)):
    """
    获取特定用户对【所有】视频的观看记录
    """
    # 子查询：查出该用户现有的观看记录，防止与别人的记录串了
    subquery = db.query(
        VideoWatchRecord.video_id,
        VideoWatchRecord.click_time,
        VideoWatchRecord.actual_watch_duration,
        VideoWatchRecord.is_finished
    ).filter(VideoWatchRecord.user_id == user_id).subquery()

    # 主查询：以所有存在的Video为主表，左外连接到上面的子查询
    records = db.query(
        Video.video_topic,
        subquery.c.click_time,
        subquery.c.actual_watch_duration,
        subquery.c.is_finished
    ).outerjoin(
        subquery, Video.video_id == subquery.c.video_id
    ).order_by(
        subquery.c.click_time.desc()
    ).all()
    
    history = []
    for video_title, click_time, duration, is_finished in records:
        history.append({
            "video_title": video_title,
            "watch_time": click_time.strftime("%Y-%m-%d %H:%M:%S") if click_time else "-",
            "duration": duration if duration is not None else 0,
            "is_finished": is_finished if is_finished is not None else False
        })
    
    return history

class QuizAnswer(BaseModel):
    video_id: int
    selected_option: str

@router.post("/quiz")
def submit_quiz(answer: QuizAnswer):
    """处理视频后续互动答题"""
    if answer.selected_option == 'A':
        return {"correct": True, "score_added": 10}
    return {"correct": False, "score_added": 0}

@router.post("/checkin")
def upload_checkin(image_url: str, user_id: int = 1, db: Session = Depends(get_db)):
    """
    上传打卡图片/视频
    """
    new_checkin = SchoolCheckin(
        user_id=user_id,
        image_url=image_url
    )
    db.add(new_checkin)
    db.commit()
    return {"status": "success", "message": "打卡记录上传成功！"}
