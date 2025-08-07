from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import user_routes, chat_routes, conversation_routes
from core.database import Base, engine
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this after getting your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(user_routes.router, tags=["Users"])
app.include_router(chat_routes.router, tags=["Chat"])
app.include_router(conversation_routes.router, tags=["Conversations"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))