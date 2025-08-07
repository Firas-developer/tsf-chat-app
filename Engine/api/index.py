# api/index.py
from fastapi import FastAPI
from mangum import Mangum
from routes import user_routes, chat_routes, conversation_routes

app = FastAPI()

app.include_router(user_routes.router)
app.include_router(chat_routes.router)
app.include_router(conversation_routes.router)

handler = Mangum(app)
