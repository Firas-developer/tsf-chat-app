from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    email: EmailStr

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    question: str
    created_at: datetime
    conversation_id: str

class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageOut] = []

    class Config:
        from_attributes = True

class ConversationListOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    last_message: Optional[str] = None

    class Config:
        from_attributes = True

class NewConversationRequest(BaseModel):
    title: str
