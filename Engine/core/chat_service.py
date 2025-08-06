from openai import OpenAI
from config.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_MODEL, SITE_URL, SITE_NAME
import logging
import time

# Configure OpenRouter client
client = OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=OPENROUTER_API_KEY,
)

# Fallback responses for when API is unavailable
FALLBACK_RESPONSES = [
    "I'm currently experiencing high demand. Please try again in a few moments.",
    "Thank you for your message! Due to current limitations, I'm unable to provide a detailed response right now. Please try again later.",
    "I appreciate your patience. My response system is temporarily limited. Please try your question again in a few minutes.",
    "I'm temporarily unable to process your request due to usage limits. Please try again shortly.",
]

# Mock responses for testing when API quota is exceeded
MOCK_RESPONSES = {
    "hello": "Hello! How can I help you today?",
    "hi": "Hi there! What can I do for you?",
    "how are you": "I'm doing well, thank you for asking! How are you?",
    "what is your name": "I'm TSF Chat, your AI assistant. Nice to meet you!",
    "help": "I'm here to help! You can ask me questions about various topics, and I'll do my best to assist you.",
    "what can you do": "I can help with answering questions, providing information, having conversations, and more. What would you like to know?",
    "test": "This is a test response! The chat system is working correctly.",
    "thanks": "You're welcome! Is there anything else I can help you with?",
    "bye": "Goodbye! Have a great day!",
    "default": "I understand you're asking about '{query}'. Due to current API limitations, I can only provide basic responses right now. Please try again tomorrow for more detailed assistance, or contact support for increased access."
}

def get_mock_response(user_message: str) -> str:
    """
    Get a mock response based on the user's message
    """
    import random
    
    message_lower = user_message.lower().strip()
    
    # Check for exact matches first
    for key, response in MOCK_RESPONSES.items():
        if key == "default":
            continue
        if key in message_lower:
            return response
    
    # For longer messages, provide a contextual response
    if len(user_message.split()) > 5:
        return f"Thank you for your detailed message about '{user_message[:50]}...'. Due to current API limitations, I can only provide basic responses. Please try again tomorrow for a more comprehensive answer."
    
    # Default response with the user's query
    return MOCK_RESPONSES["default"].format(query=user_message[:100])

async def get_openrouter_response(user_message: str) -> str:
    """
    Get response from OpenRouter API using OpenAI client for the given user message
    """
    try:
        # Prepare extra headers if site info is available
        extra_headers = {}
        if SITE_URL:
            extra_headers["HTTP-Referer"] = SITE_URL
        if SITE_NAME:
            extra_headers["X-Title"] = SITE_NAME
        
        # Create chat completion
        completion = client.chat.completions.create(
            extra_headers=extra_headers if extra_headers else None,
            model=OPENROUTER_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            max_tokens=1000,  # Limit response length
            temperature=0.7,
        )
        
        if completion.choices and completion.choices[0].message:
            return completion.choices[0].message.content.strip()
        else:
            return "I'm sorry, I couldn't generate a proper response. Please try rephrasing your question."
    
    except Exception as e:
        error_str = str(e).lower()
        logging.error(f"OpenRouter API error: {str(e)}")
        
        # Handle specific error types with user-friendly messages
        if "429" in error_str or "quota" in error_str or "rate limit" in error_str:
            # When quota is exceeded, use mock responses to continue testing
            return get_mock_response(user_message)
        elif "400" in error_str or "invalid" in error_str:
            return "I couldn't understand your request properly. Please try rephrasing your question."
        elif "503" in error_str or "unavailable" in error_str:
            return "My AI service is temporarily unavailable. Please try again in a few minutes."
        elif "timeout" in error_str:
            return "The response took too long to generate. Please try with a shorter or simpler question."
        else:
            # Use mock response for unknown errors too
            return get_mock_response(user_message)
