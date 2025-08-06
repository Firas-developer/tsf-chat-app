from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import user_routes, chat_routes, conversation_routes
from core.database import Base, engine

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],  # React dev server origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(user_routes.router, tags=["Users"])
app.include_router(chat_routes.router, tags=["Chat"])
app.include_router(conversation_routes.router, tags=["Conversations"])