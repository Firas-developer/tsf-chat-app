import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, conversationAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [slowResponse, setSlowResponse] = useState(false);
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Handle window resize for sidebar responsiveness
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true); // Keep sidebar open on large screens by default
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Save dark mode preference
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        // Check authentication
        const token = sessionStorage.getItem('token');
        const userData = sessionStorage.getItem('user');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        setUser(JSON.parse(userData));
        loadConversations();

    }, [navigate]);

    const loadConversations = async () => {
        try {
            setLoadingConversations(true);
            const response = await conversationAPI.getConversations();
            setConversations(response.data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const loadConversation = async (conversationId) => {
        try {
            const response = await conversationAPI.getConversation(conversationId);
            const conversation = response.data;

            // Convert messages to the format expected by the UI
            const formattedMessages = conversation.messages.map(msg => ({
                id: msg.id,
                type: msg.role === 'user' ? 'user' : 'ai',
                content: msg.content,
                timestamp: new Date(msg.created_at).toLocaleTimeString()
            }));

            setMessages(formattedMessages);
            setCurrentConversationId(conversationId);
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const createNewConversation = async () => {
        setMessages([]);
        setCurrentConversationId(null);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Close profile dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (profileDropdownOpen && !event.target.closest('.profile-dropdown')) {
                setProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileDropdownOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || loading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
        };

        setMessages(prev => [...prev, userMessage]);
        const messageToSend = inputMessage;
        setInputMessage('');
        setLoading(true);

        try {
            // Add a timeout for the API call (30 seconds)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 30000)
            );

            // Show slow response indicator after 5 seconds
            const slowResponseTimer = setTimeout(() => {
                setSlowResponse(true);
            }, 5000);

            const apiPromise = chatAPI.sendMessage({
                message: messageToSend,
                conversation_id: currentConversationId
            });

            const response = await Promise.race([apiPromise, timeoutPromise]);

            // Clear the slow response timer
            clearTimeout(slowResponseTimer);
            setSlowResponse(false);

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.data.response,
            };

            setMessages(prev => [...prev, aiMessage]);

            // If this was a new conversation, update the current conversation ID and reload conversations
            if (!currentConversationId) {
                setCurrentConversationId(response.data.conversation_id);
                loadConversations(); // Refresh the sidebar with the new conversation
            }
        } catch (error) {
            console.error('Error sending message:', error);

            let errorMessage = 'Sorry, I encountered an error. Please try again.';

            // Handle specific error types
            if (error.message === 'Request timeout') {
                errorMessage = 'The request is taking longer than usual. Please try again with a shorter message or check your internet connection.';
            } else if (error.response?.status === 429) {
                errorMessage = 'I\'m currently at my daily usage limit. Please try again tomorrow.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'The service is temporarily unavailable. Please try again in a few minutes.';
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }

            const errorMessageObj = {
                id: Date.now() + 1,
                type: 'ai',
                content: errorMessage,
            };
            setMessages(prev => [...prev, errorMessageObj]);
        } finally {
            setLoading(false);
            setSlowResponse(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Function to format AI message content
    const formatAIMessage = (content) => {
        return content
            // Convert **text** to bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Convert bullet points at the start of lines to bullet symbols
            .replace(/^\* /gm, '• ')
            // Convert line breaks to HTML breaks for better formatting
            .replace(/\n/g, '<br/>');
    };

    // Function to categorize conversations by date
    const categorizeConversations = (conversations) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
        const lastWeekStart = new Date(thisWeekStart.getTime() - (7 * 24 * 60 * 60 * 1000));
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const categories = {
            today: [],
            yesterday: [],
            thisWeek: [],
            lastWeek: [],
            thisMonth: [],
            lastMonth: [],
            older: []
        };

        conversations.forEach(conversation => {
            const convDate = new Date(conversation.updated_at);
            const convDay = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());

            if (convDay.getTime() === today.getTime()) {
                categories.today.push(conversation);
            } else if (convDay.getTime() === yesterday.getTime()) {
                categories.yesterday.push(conversation);
            } else if (convDay >= thisWeekStart && convDay < today) {
                categories.thisWeek.push(conversation);
            } else if (convDay >= lastWeekStart && convDay < thisWeekStart) {
                categories.lastWeek.push(conversation);
            } else if (convDate >= thisMonthStart && convDay < thisWeekStart) {
                categories.thisMonth.push(conversation);
            } else if (convDate >= lastMonthStart && convDate < thisMonthStart) {
                categories.lastMonth.push(conversation);
            } else {
                categories.older.push(conversation);
            }
        });

        return categories;
    };

    const categorizedConversations = categorizeConversations(conversations);

    // Add this function in your Dashboard component
    const deleteConversation = async (conversationId, e) => {
        e.stopPropagation(); // Prevent conversation from being loaded when clicking delete
        
        try {
            await conversationAPI.deleteConversation(conversationId);
            
            // Remove conversation from state
            setConversations(prev => prev.filter(conv => conv.id !== conversationId));
            
            // If the deleted conversation was the current one, clear messages
            if (currentConversationId === conversationId) {
                setMessages([]);
                setCurrentConversationId(null);
            }

            toast.success('Conversation deleted successfully');
            
        } catch (error) {
            console.error('Error deleting conversation:', error);
            toast.error(error.response?.data?.message || 'Failed to delete conversation');
        }
    };

    return (
        <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Sidebar */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                darkMode={darkMode}
                createNewConversation={createNewConversation}
                setSidebarOpen={setSidebarOpen}
                loadingConversations={loadingConversations}
                categorizedConversations={categorizedConversations}
                loadConversation={loadConversation}
                currentConversationId={currentConversationId}
                conversations={conversations}
                deleteConversation={deleteConversation}
            />

            {/* Main Chat Area */}
            <ChatContainer
                slowResponse={slowResponse}
                setSidebarOpen={setSidebarOpen}
                formatAIMessage={formatAIMessage}
                sidebarOpen={sidebarOpen}
                darkMode={darkMode}
                user={user}
                setProfileDropdownOpen={setProfileDropdownOpen}
                profileDropdownOpen={profileDropdownOpen}
                setDarkMode={setDarkMode}
                handleLogout={handleLogout}
                messages={messages}
                loading={loading}
                messagesEndRef={messagesEndRef}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleKeyPress={handleKeyPress}
                sendMessage={sendMessage}
            />

            {/* Sidebar overlay for mobile */}
            {sidebarOpen && (
                <div
                    className={`fixed inset-0 sm:z-40 lg:hidden transition-opacity duration-300 ${darkMode
                        ? 'bg-gray-800 bg-opacity-40'
                        : 'bg-white bg-opacity-30 backdrop-blur-sm'
                        }`}
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Dashboard;
