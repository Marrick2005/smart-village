from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import WaterApplication, User, FarmingBehaviorRecord
from typing import Optional

router = APIRouter()

# Schema for incoming request
class IrrigationRequest(BaseModel):
    crop_type: str
    stage: str

@router.post("/irrigation-decision")
def calculate_irrigation(req: IrrigationRequest):
    """
    接收作物的种类以及生长阶段并结合【实时气象数据】返回浇灌建议
    """
    import requests
    import config

    API_KEY = config.QWEATHER_KEY
    LOCATION_ID = "101090306"
    
    try:
        url = f"https://devapi.qweather.com/v7/weather/now?location={LOCATION_ID}&key={API_KEY}"
        res = requests.get(url, timeout=5).json()
        precip = float(res["now"]["precip"]) if res.get("code") == "200" else 0
        
        if precip > 0:
            return {"decision": f"检测到当前有降水（{precip}mm），建议利用自然降水，今日暂缓人工灌溉。"}
        
        if req.crop_type == '核桃' and req.stage == '果实膨大期':
            return {"decision": "建议：核桃正值果实膨大期，需水量大，且无降水预测，建议今日灌溉 2 小时。"}
        else:
            return {"decision": "建议：当前无降水且气象条件稳定。请按常规计划进行少量均衡补水即可。"}
            
    except Exception as e:
        return {"decision": "暂无法获取最新数据，建议根据实际土壤情况判断。"}

@router.get("/water-usage-quota")
def get_quota():
    """读取分红用水配额"""
    return {"quota_hours": 12.5}

@router.get("/weather")
def get_current_weather():
    """获取当前天气详情 (Real-time QWeather API)"""
    import requests
    from datetime import datetime
    import config
    
    API_KEY = config.QWEATHER_KEY
    LOCATION_ID = "101090306"  # 邯郸·涉县
    
    try:
        # Real-time weather
        url = f"https://devapi.qweather.com/v7/weather/now?location={LOCATION_ID}&key={API_KEY}"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        if data.get("code") == "200":
            now = data["now"]
            return {
                "date": datetime.now().strftime("%Y年%m月%d日"),
                "condition": now["text"],
                "temperature": f"{now['temp']}°C",
                "humidity": f"{now['humidity']}%",
                "windDir": now["windDir"],
                "pressure": f"{now['pressure']}hPa",
                "precip": f"{now['precip']}mm"
            }
        else:
            raise Exception(f"QWeather error code: {data.get('code')}")
            
    except Exception as e:
        print(f"Weather API Error: {e}")
        # Fallback to demo data if API fails
        return {
            "date": datetime.now().strftime("%Y年%m月%d日"),
            "condition": "获取失败",
            "temperature": "--°C",
            "humidity": "--%",
            "error": str(e)
        }

class WaterApplicationSchema(BaseModel):
    crop_type: str = "未知作物"
    duration: float
    reason: str

from routers.auth import get_current_user

from datetime import datetime

@router.post("/water-usage-apply")
def apply_water_usage(application: WaterApplicationSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """提交用水申请"""
    new_application = WaterApplication(
        user_id=current_user.user_id,
        crop_type=application.crop_type,
        amount=application.duration,
        reason=application.reason,
        apply_time=datetime.now()
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return {"status": "success", "message": "申请提交成功，请等待村支书审批"}

@router.get("/water-usage/my-applications")
def get_my_water_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(WaterApplication).filter(WaterApplication.user_id == current_user.user_id).order_by(WaterApplication.apply_time.desc()).all()
    data = []
    for app in records:
        data.append({
            "id": app.application_id,
            "crop": app.crop_type,
            "amount": f"{app.amount} 小时",
            "reason": app.reason,
            "date": app.apply_time.strftime("%Y-%m-%d %H:%M:%S") if app.apply_time else "",
            "status": app.status,
            "reject_reason": app.reject_reason
        })
    return {"data": data}

@router.get("/water-usage/list")
def get_water_usage_list(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
    """Admin endpoint to fetch water usage applications"""
    skip = (page - 1) * page_size
    query = db.query(WaterApplication, User.name, User.township).join(User, WaterApplication.user_id == User.user_id)
    records = query.order_by(WaterApplication.apply_time.desc()).offset(skip).limit(page_size).all()
    
    data = []
    for app_record, user_name, township in records:
        data.append({
            "id": app_record.application_id,
            "applicant": user_name,
            "village": township,
            "crop": app_record.crop_type,
            "amount": f"{app_record.amount} 小时",
            "reason": app_record.reason,
            "date": app_record.apply_time.strftime("%Y-%m-%d %H:%M:%S") if app_record.apply_time else "",
            "status": app_record.status
        })

    total = query.count()
    return {
        "total": total,
        "data": data
    }

class ApproveRequest(BaseModel):
    status: int
    reject_reason: Optional[str] = None
    
@router.post("/water-usage/{application_id}/status")
def update_water_usage_status(application_id: float, req: ApproveRequest, db: Session = Depends(get_db)):
    """Admin endpoint to approve or reject a water application"""
    record = db.query(WaterApplication).filter(WaterApplication.application_id == int(application_id)).first()
    if not record:
        raise HTTPException(status_code=404, detail="Application not found")
        
    record.status = req.status
    if req.status == 2 and req.reject_reason:
        record.reject_reason = req.reject_reason
        
    db.commit()
    return {"status": "success"}

class BehaviorCheckinSchema(BaseModel):
    crop_type: str
    farming_stage: str
    reminder_category: str

@router.post("/behavior-checkin")
def submit_behavior_checkin(checkin: BehaviorCheckinSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """农户提交农事打卡"""
    new_record = FarmingBehaviorRecord(
        user_id=current_user.user_id,
        record_time=datetime.now(),
        township=current_user.township,
        click_count=1,
        farming_stage=checkin.farming_stage,
        is_adopted_advice=False,
        reminder_category=checkin.reminder_category,
        crop_type=checkin.crop_type
    )
    db.add(new_record)
    db.commit()
    return {"status": "success", "message": "打卡报备成功"}

@router.get("/behavior/my-records")
def get_my_behavior_records(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """获取农户个人的农事打卡记录"""
    records = db.query(FarmingBehaviorRecord).filter(FarmingBehaviorRecord.user_id == current_user.user_id).order_by(FarmingBehaviorRecord.record_time.desc()).all()
    data = []
    for r in records:
        data.append({
            "record_id": r.record_id,
            "record_time": r.record_time.strftime("%Y-%m-%d %H:%M:%S") if r.record_time else "",
            "crop_type": r.crop_type,
            "farming_stage": r.farming_stage,
            "reminder_category": r.reminder_category,
            "is_adopted_advice": r.is_adopted_advice
        })
    return {"data": data}
