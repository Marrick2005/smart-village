from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

@router.get("/videos")
def get_videos(category: str = "儿童动画"):
    """
    分发视频列表
    """
    if category == "职场普通话":
        return {
            "videos": [
                {"id": 4, "title": "职场沟通技巧：如何流利做汇报", "category": category, "views": "1.5w"},
                {"id": 5, "title": "外出务工标准普通话发音指南", "category": category, "views": "3.2k"},
            ]
        }
    elif category == "老年防诈":
        return {
            "videos": [
                {"id": 6, "title": "警惕！新型养老理财骗局大揭秘", "category": category, "views": "10w+"},
                {"id": 7, "title": "手机收到不明来源的短信千万别点", "category": category, "views": "8.8w"},
            ]
        }
        
    return {
        "videos": [
            {"id": 1, "title": "普通话小课堂：基础拼音", "category": category, "views": "1.2w"},
            {"id": 2, "title": "科学小实验：会飞的鸡蛋", "category": category, "views": "8k"},
            {"id": 3, "title": "儿童防诈骗动画：大灰狼不敲门", "category": category, "views": "2.2w"},
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
