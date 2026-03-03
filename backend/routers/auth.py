import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import User

router = APIRouter()

class LoginRequest(BaseModel):
    contact: str  # Phone number or Name
    password: str

class RegisterRequest(BaseModel):
    name: str
    contact: str
    password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.contact == req.contact).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this contact already exists")
        
    new_user = User(
        name=req.name,
        contact=req.contact,
        password=req.password, # Plain text as requested
        identity_type="农户"
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
