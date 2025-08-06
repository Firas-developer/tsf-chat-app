from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random
from models.models import User
from schemas.schemas import UserCreate, UserLogin, TokenResponse, UserOut
from core.auth import hash_password, verify_password, create_access_token
from core.database import SessionLocal

router = APIRouter()

def generate_user_id(db: Session) -> str:
    """Generate a unique 10-digit random user ID"""
    while True:
        # Generate random 10-digit number
        user_id = str(random.randint(1000000000, 9999999999))
        # Check if this ID already exists
        existing_user = db.query(User).filter(User.id == user_id).first()
        if not existing_user:
            return user_id

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate unique 10-digit user ID
    user_id = generate_user_id(db)
    
    hashed_pw = hash_password(user.password)
    new_user = User(id=user_id, username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model=TokenResponse)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate JWT token
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
