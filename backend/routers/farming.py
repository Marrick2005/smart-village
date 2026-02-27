from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import WaterApplication, User
from typing import Optional

router = APIRouter()

# Schema for incoming request
class IrrigationRequest(BaseModel):
    crop_type: str
    stage: str

@router.post("/irrigation-decision")
def calculate_irrigation(req: IrrigationRequest):
    """
    接收作物的种类以及生长阶段并结合天气返回浇灌建议
    """
    if req.crop_type == '核桃' and req.stage == '果实膨大期':
        return {"decision": "今日适宜灌溉 2 小时。核桃果实膨大期需水量大，建议采用滴灌。"}
    else:
        return {"decision": "未来两日有阵雨，建议暂停灌溉，利用自然降水保墒。"}

@router.get("/water-usage-quota")
def get_quota():
    """读取分红用水配额"""
    return {"quota_hours": 12.5}

class WaterApplicationSchema(BaseModel):
    crop_type: str = "未知作物"
    duration: float
    reason: str

@router.post("/water-usage-apply")
def apply_water_usage(application: WaterApplicationSchema, db: Session = Depends(get_db)):
    """提交用水申请"""
    new_application = WaterApplication(
        user_id=1,  # Mock user identity since no auth is implemented yet
        crop_type=application.crop_type,
        amount=application.duration,
        reason=application.reason
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return {"status": "success", "message": "申请提交成功，请等待村支书审批"}

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
