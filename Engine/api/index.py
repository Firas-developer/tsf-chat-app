from fastapi import FastAPI
from mangum import Mangum
from routes import user_routes, chat_routes, conversation_routes

fastapi_app = FastAPI()

# Include routes
fastapi_app.include_router(user_routes.router)
fastapi_app.include_router(chat_routes.router)
fastapi_app.include_router(conversation_routes.router)

# Rename handler → app (expected by Vercel)
app = Mangum(fastapi_app)
