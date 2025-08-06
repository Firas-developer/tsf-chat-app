import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, conversationAPI } from '../services/api';

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

    return (
        <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-60 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transform transition-transform duration-300 ease-in-out`}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className={`flex items-center justify-between p-4`}>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className={`p-2 rounded-lg block lg:hidden transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                                title="Close Sidebar"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="w-10 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">TSF</span>
                            </div>
                            <div>
                                <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Chat</h1>
                            </div>
                        </div>
                        <button
                            onClick={createNewConversation}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            title="New Chat"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-4 mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Chat"
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-colors ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                                    } focus:ring-2 focus:ring-purple-500/20 focus:outline-none`}
                            />
                            <svg className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto px-4">
                        {loadingConversations ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-3 rounded-lg bg-gray-100 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Today */}
                                {categorizedConversations.today.length > 0 && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Today</h4>
                                        <div className="space-y-2">
                                            {categorizedConversations.today.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    onClick={() => loadConversation(conversation.id)}
                                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                        }`}
                                                >
                                                    <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{conversation.title}</h4>
                                                    {conversation.last_message && (
                                                        <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conversation.last_message}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Yesterday */}
                                {categorizedConversations.yesterday.length > 0 && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Yesterday</h4>
                                        <div className="space-y-2">
                                            {categorizedConversations.yesterday.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    onClick={() => loadConversation(conversation.id)}
                                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                        }`}
                                                >
                                                    <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{conversation.title}</h4>
                                                    {conversation.last_message && (
                                                        <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conversation.last_message}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* This Week */}
                                {categorizedConversations.thisWeek.length > 0 && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>This Week</h4>
                                        <div className="space-y-2">
                                            {categorizedConversations.thisWeek.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    onClick={() => loadConversation(conversation.id)}
                                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                        }`}
                                                >
                                                    <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{conversation.title}</h4>
                                                    {conversation.last_message && (
                                                        <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conversation.last_message}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Last Week */}
                                {categorizedConversations.lastWeek.length > 0 && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Week</h4>
                                        <div className="space-y-2">
                                            {categorizedConversations.lastWeek.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    onClick={() => loadConversation(conversation.id)}
                                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                        }`}
                                                >
                                                    <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{conversation.title}</h4>
                                                    {conversation.last_message && (
                                                        <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conversation.last_message}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* This Month */}
                                {categorizedConversations.thisMonth.length > 0 && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>This Month</h4>
                                        <div className="space-y-2">
                                            {categorizedConversations.thisMonth.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    onClick={() => loadConversation(conversation.id)}
                                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                        }`}
                                                >
                                                    <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{conversation.title}</h4>
                                                    {conversation.last_message && (
                                                        <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conversation.last_message}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Last Month */}
                                {categorizedConversations.lastMonth.length > 0 && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Month</h4>
                                        <div className="space-y-2">
                                            {categorizedConversations.lastMonth.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    onClick={() => loadConversation(conversation.id)}
                                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                        }`}
                                                >
                                                    <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{conversation.title}</h4>
                                                    {conversation.last_message && (
                                                        <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conversation.last_message}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Older */}
                                {categorizedConversations.older.length > 0 && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Older</h4>
                                        <div className="space-y-2">
                                            {categorizedConversations.older.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    onClick={() => loadConversation(conversation.id)}
                                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${currentConversationId === conversation.id
                                                        ? darkMode ? 'bg-purple-900/50 border-purple-500' : 'bg-purple-50 border-purple-200'
                                                        : darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                        }`}
                                                >
                                                    <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{conversation.title}</h4>
                                                    {conversation.last_message && (
                                                        <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conversation.last_message}</p>
                                                    )}
                                                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {new Date(conversation.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {conversations.length === 0 && (
                                    <p className={`text-sm font-semibold text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        No conversations yet. <br /> Start a new chat!
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col transition-all z-50 duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
                {/* Chat Header */}
                <div className={`shadow-sm border-b px-6 py-4 transition-colors ${darkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 border-gray-200/50'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className={`p-2 rounded-lg transition-colors ${darkMode
                                    ? 'hover:bg-gray-700 text-gray-400'
                                    : 'hover:bg-white/80 text-gray-600'
                                    }`}
                                title="Toggle Sidebar"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Hello {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}!
                            </span>
                            <div className="relative profile-dropdown">
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200"
                                >
                                    <span className="text-white font-medium text-sm">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </span>
                                </button>

                                {/* Profile Dropdown */}
                                {profileDropdownOpen && (
                                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                        }`}>
                                        <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}
                                            </p>
                                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setDarkMode(!darkMode);
                                                setProfileDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {darkMode ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                )}
                                            </svg>
                                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setProfileDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'
                                                }`}
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 overflow-y-auto shadow-sm px-6 py-4 transition-colors ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50'}`}>
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        {/* Welcome Message */}
                        {messages.length === 0 && (
                            <div className="flex flex-col justify-between items-center py-16">
                                <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Hi {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}! I'm your virtual support
                                </h2>

                                {/* Feature Cards */}
                                <div className="mt-12 mb-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                                        {/* Enhanced Accuracy */}
                                        <div className="text-center">
                                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-green-100 to-blue-100'}`}>
                                                <svg className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Enhanced Accuracy
                                            </h4>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Our advanced AI delivers answers with unparalleled accuracy
                                            </p>
                                        </div>

                                        {/* Smart Assistance */}
                                        <div className="text-center">
                                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-purple-100 to-pink-100'}`}>
                                                <svg className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Smart Assistance
                                            </h4>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Get intelligent help with coding, writing, and problem-solving
                                            </p>
                                        </div>

                                        {/* Seamless Experience */}
                                        <div className="text-center">
                                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-100 to-cyan-100'}`}>
                                                <svg className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Seamless Experience
                                            </h4>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Offering a smooth and intuitive experience from start to finish
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Messages */}
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-xs lg:max-w-2xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user'
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                                                : 'bg-gradient-to-r from-green-400 to-blue-500'
                                                }`}>
                                                {message.type === 'user' ? (
                                                    <span className="text-white font-medium text-sm">
                                                        {user?.username?.charAt(0).toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`px-4 py-3 rounded-2xl ${message.type === 'user'
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                            : darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white shadow-sm border border-gray-200 text-gray-900'
                                            }`}>
                                            <div className={`text-sm leading-relaxed ${message.type === 'ai' ? '' : 'whitespace-pre-wrap'}`}>
                                                {message.type === 'ai' ? (
                                                    <span dangerouslySetInnerHTML={{
                                                        __html: formatAIMessage(message.content)
                                                    }} />
                                                ) : (
                                                    message.content
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex">
                                        <div className="mr-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className={`bg-white shadow-sm border border-gray-200 rounded-2xl px-4 py-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                            }`}>
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex space-x-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                {slowResponse && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        This is taking longer than usual... Please wait.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className={`shadow-sm px-6 py-4 transition-colors ${darkMode
                    ? 'bg-gray-800'
                    : 'bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50'}`}>
                    <div className="max-w-4xl mx-auto">
                        <div className={`flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-200 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                            }`}>
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Message TSF Chat..."
                                rows="1"
                                className={`flex-1 bg-transparent border-none outline-none resize-none py-1 min-h-[24px] max-h-[120px] ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                                    }`}
                                style={{
                                    lineHeight: '1.5',
                                    overflowY: 'auto'
                                }}
                            />
                            <div className="flex items-center space-x-2 ml-3">
                                <button
                                    type="button"
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Attach file"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                <button
                                    onClick={sendMessage}
                                    disabled={!inputMessage.trim() || loading}
                                    className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${!inputMessage.trim() || loading
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105'
                                        }`}
                                >
                                    {loading ? (
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-4">
                            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                © TSF Chat | All rights reserved
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
