from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from schemas.schemas import ChatRequest, ChatResponse
from core.auth import verify_token
from core.chat_service import get_openrouter_response
from core.database import SessionLocal
from models.models import User, Conversation, Message

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_conversation_title(first_message: str) -> str:
    """Generate a conversation title from the first message"""
    # Take first 50 characters and clean it up
    title = first_message.strip()
    if len(title) > 50:
        title = title[:47] + "..."
    return title

@router.post("/chat", response_model=ChatResponse)
async def chat(
    chat_request: ChatRequest,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Chat endpoint that accepts user message and returns Gemini AI response
    Now with conversation management and message storage
    """
    try:
        user_message = chat_request.message
        conversation_id = chat_request.conversation_id
        
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # If no conversation_id provided, create a new conversation
        if not conversation_id:
            conversation_title = generate_conversation_title(user_message)
            conversation = Conversation(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=conversation_title
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            conversation_id = conversation.id
        else:
            # Verify the conversation belongs to the user
            conversation = db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            ).first()
            
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Save user message
        user_msg = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role="user",
            content=user_message
        )
        db.add(user_msg)
        
        # Get AI response with better error handling
        print(f"Calling API response for message: {user_message}")  # Debug log
        
        try:
            ai_response = await get_openrouter_response(user_message)
            print(f"Received API response: {ai_response[:100]}...")  # Debug log
        except Exception as api_error:
            print(f"API error: {str(api_error)}")  # Debug log
            # Provide a fallback response if API fails
            ai_response = "I'm currently experiencing technical difficulties. Please try again in a few moments, or contact support if the issue persists."
        
        # Save AI response
        ai_msg = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role="assistant",
            content=ai_response
        )
        db.add(ai_msg)
        
        # Update conversation's updated_at timestamp
        conversation.updated_at = datetime.utcnow()
        
        db.commit()
        
        return ChatResponse(
            response=ai_response,
            question=user_message,
            created_at=datetime.utcnow(),
            conversation_id=conversation_id
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Chat error: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

@router.delete('/conversations/{conversation_id}')
async def delete_conversation(
    conversation_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Delete a conversation and all associated messages
    """
    try:
        current_user_id = user_id
        # Check if conversation exists and belongs to user
        conversation = db.query(Conversation).filter_by(
            id=conversation_id, 
            user_id=current_user_id
        ).first()
        
        if not conversation:
            return {"error": "Conversation not found"}, 404
            
        # Delete all messages first
        db.query(Message).filter_by(conversation_id=conversation_id).delete()
        
        # Delete the conversation
        db.delete(conversation)
        db.commit()
        
        return {"message": "Conversation deleted successfully"}, 200
        
    except Exception as e:
        db.rollback()
        return {"error": str(e)}, 500
