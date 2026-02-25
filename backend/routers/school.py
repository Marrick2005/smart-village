from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

@router.get("/videos")
def get_videos(category: str = "儿童动画"):
    """
    分发视频列表
    """
    return {
        "videos": [
            {"id": 1, "title": "普通话小课堂：基础拼音", "category": category, "views": "1.2w"},
            {"id": 2, "title": "科学小实验", "category": category, "views": "8k"},
            {"id": 3, "title": "防诈骗动画", "category": category, "views": "2.2w"},
        ]
    }

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
def upload_checkin(image_url: str):
    """
    上传打卡图片/视频
    """
    #测试数据。
    return {"status": "success", "message": "打卡记录上传成功！"}
