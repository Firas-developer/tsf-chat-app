# TSF Chat - AI-Powered Chat Application

TSF Chat is a modern, AI-powered chat application that provides intelligent conversations using Google Gemini AI. The application features a beautiful user interface, secure authentication, and real-time responses.

![TSF Chat Demo](https://tsf-chat-app.vercel.app/)

## Features

- 🤖 **AI-Powered Conversations**: Powered by Google Gemini AI for intelligent responses
- 🔐 **Secure Authentication**: JWT-based secure user authentication
- ⚡ **Real-time Responses**: Fast and responsive chat interface
- 🎨 **Modern UI/UX**: Clean and intuitive design with dark/light mode support
- 💾 **Conversation History**: Save and manage chat histories
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests
- React Toastify for notifications

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PyMySQL for database connectivity
- JWT for authentication
- Google Gemini AI API integration

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.9 or higher
- MySQL database
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Firas-developer/tsf-chat-app.git
cd tsf-chat-app
```

2. Set up the backend:
```bash
cd Engine
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment variables:
Create a `.env` file in the Engine directory:
```
DATABASE_URL=mysql+pymysql://user:password@host:port/database
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
OPENAI_API_KEY=your_openai_api_key
```

4. Set up the frontend:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd Engine
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel project settings
3. Deploy using Vercel's automated deployment

### Backend Deployment (Vercel)
1. Ensure your `vercel.json` is properly configured
2. Add environment variables in Vercel project settings
3. Deploy the backend to Vercel

## Project Structure

```
TSF-Chats/
├── Engine/                 # Backend
│   ├── api/               # API endpoints
│   ├── core/              # Core functionality
│   ├── models/            # Database models
│   ├── routes/            # Route handlers
│   └── schemas/           # Pydantic schemas
└── frontend/              # Frontend
    ├── public/            # Static files
    └── src/
        ├── components/    # React components
        ├── pages/         # Page components
        └── services/      # API services
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)