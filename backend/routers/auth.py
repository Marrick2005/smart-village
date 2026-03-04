import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import User
import time
import random

router = APIRouter()


class LoginRequest(BaseModel):
    contact: str  # Phone number or Name
    password: str

class RegisterRequest(BaseModel):
    name: str
    contact: str
    password: str
    identity_type: str = "农户" # Default for backwards compatibility
    gender: str = ""
    township: str = ""

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.contact == req.contact).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this contact already exists")
        
    # Validate identity_type
    if req.identity_type not in ["农户", "志愿者"]:
        raise HTTPException(status_code=400, detail="Invalid identity type")
        
    new_user = User(
        name=req.name,
        contact=req.contact,
        password=req.password, # Plain text as requested
        identity_type=req.identity_type,
        gender=req.gender,
        township=req.township
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully", "user_id": new_user.user_id}

from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token.startswith("fake-jwt-token-for-user-"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = int(token.split("-")[-1])
    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    # Authenticate by contact (phone) OR name (for admin/convenience)
    user = db.query(User).filter(
        (User.contact == req.contact) | (User.name == req.contact)
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="账户或密码错误")
        
    if not user.password:
        raise HTTPException(status_code=401, detail="请先在数据库中为此账户设置密码")
        
    # Compare directly as plain text
    if user.password != req.password:
        raise HTTPException(status_code=401, detail="账户或密码错误")
        
    # Generate Token
    token = f"fake-jwt-token-for-user-{user.user_id}"
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_info": {
            "id": user.user_id,
            "name": user.name,
            "contact": user.contact,
            "identity_type": user.identity_type
        }
    }

sms_codes = {}

class SendCodeRequest(BaseModel):
    contact: str

@router.post("/send-code")
def send_verification_code(req: SendCodeRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.contact == req.contact).first()
    if not user:
        raise HTTPException(status_code=404, detail="该手机号未注册")
        
    code = str(random.randint(100000, 999999))
    sms_codes[req.contact] = {"code": "123456", "expires": time.time() + 300} 
    
    print(f"--- MOCK SMS SENT TO {req.contact} --- CODE: 123456 ---")
    return {"status": "success", "message": "验证码已发送"}

class ResetPasswordRequest(BaseModel):
    contact: str
    code: str
    new_password: str

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.contact == req.contact).first()
    if not user:
        raise HTTPException(status_code=404, detail="该手机号未注册")
        
    stored = sms_codes.get(req.contact)
    if not stored:
        raise HTTPException(status_code=400, detail="请先请求验证码")
        
    if time.time() > stored["expires"]:
        raise HTTPException(status_code=400, detail="验证码已过期")
        
    if req.code != stored["code"]:
        raise HTTPException(status_code=400, detail="验证码错误")
        
    user.password = req.new_password
    db.commit()
    
    del sms_codes[req.contact]
    
    return {"status": "success", "message": "密码修改成功"}
