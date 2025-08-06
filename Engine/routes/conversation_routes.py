from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from models.models import User, Conversation, Message
from schemas.schemas import ConversationOut, ConversationListOut, NewConversationRequest
from core.auth import verify_token
from core.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/conversations", response_model=List[ConversationListOut])
def get_conversations(current_user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Get all conversations for the current user"""
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user_id
    ).order_by(Conversation.updated_at.desc()).all()
    
    result = []
    for conv in conversations:
        # Get the last message for preview
        last_message = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.desc()).first()
        
        result.append(ConversationListOut(
            id=conv.id,
            title=conv.title,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            last_message=last_message.content[:50] + "..." if last_message and len(last_message.content) > 50 else last_message.content if last_message else None
        ))
    
    return result

@router.get("/conversations/{conversation_id}", response_model=ConversationOut)
def get_conversation(conversation_id: str, current_user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Get a specific conversation with all messages"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return conversation

@router.post("/conversations", response_model=ConversationOut)
def create_conversation(request: NewConversationRequest, current_user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Create a new conversation"""
    conversation = Conversation(
        id=str(uuid.uuid4()),
        user_id=current_user_id,
        title=request.title
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    return conversation

@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, current_user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Delete a conversation and all its messages"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conversation)
    db.commit()
    
    return {"message": "Conversation deleted successfully"}
