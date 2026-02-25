from fastapi import APIRouter
from pydantic import BaseModel

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

class WaterApplication(BaseModel):
    duration: float
    reason: str

@router.post("/water-usage-apply")
def apply_water_usage(application: WaterApplication):
    """提交用水申请"""
    return {"status": "success", "message": "申请提交成功，请等待村支书审批"}
